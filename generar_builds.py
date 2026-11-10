# Lee la base de datos de builds de Notion (API oficial) y la guarda en builds.json para mostrarla dentro de la app.
# Necesita el secreto NOTION_TOKEN en GitHub. Si no esta, no hace nada y no rompe el resto del flujo.
import json, os, re, sys, time, hashlib, urllib.request, urllib.error

TOKEN = os.environ.get("NOTION_TOKEN", "").strip()
ROOT = re.sub(r"[^0-9a-fA-F]", "", os.environ.get("NOTION_ROOT_ID", "795d71674a0c82fe849b01d5ce9e848d"))
PUBLIC = os.environ.get("NOTION_PUBLIC_URL", "https://gray-smell-445.notion.site/795d71674a0c82fe849b01d5ce9e848d")
MAX_PAGINAS = 400        # limite de filas que se leen
MAX_IMAGENES = 300       # limite de imagenes que se descargan al repositorio
IMG_DIR = "builds_img"
API = "https://api.notion.com/v1"
_img_count = [0]


# ---- Reducir el peso de las imagenes (el despliegue de GitHub Pages se volvia muy lento con ~75 MB) ----
MAX_LADO = 1600
def _pillow():
    try:
        from PIL import Image
        return Image
    except Exception:
        try:
            import subprocess
            subprocess.run([sys.executable, "-m", "pip", "install", "--quiet", "pillow"], check=True)
            from PIL import Image
            return Image
        except Exception as e:
            print("Pillow no disponible, no se comprimen imagenes:", e)
            return None

def reducir(ruta, Image=None):
    """Reduce una imagen EN SU LUGAR (mismo nombre). Sin transparencia real -> JPEG; con transparencia -> PNG de 256 colores.
    El navegador reconoce el formato por el contenido, asi que el nombre no cambia. Solo reemplaza si queda mas liviana."""
    Image = Image or _pillow()
    if not Image or not os.path.exists(ruta): return 0
    antes = os.path.getsize(ruta)
    ext = ruta.rsplit(".", 1)[-1].lower()
    if ext not in ("jpg", "jpeg", "png", "webp") or antes < 150 * 1024: return 0
    try:
        im = Image.open(ruta); im.load()
        im.thumbnail((MAX_LADO, MAX_LADO))
        tmp = ruta + ".tmp"
        alfa = False
        if im.mode in ("RGBA", "LA", "P"):
            rgba = im.convert("RGBA")
            h = rgba.getchannel("A").histogram()
            alfa = sum(h[:128]) > 0.01 * rgba.width * rgba.height   # transparencia real (mas del 1 % de la imagen)
            if not alfa:
                fondo = Image.new("RGB", rgba.size, (18, 16, 28)); fondo.paste(rgba, mask=rgba.getchannel("A")); rgba = fondo
            im = rgba
        if alfa:
            im.save(tmp, "PNG", optimize=True)
            if os.path.getsize(tmp) > 700 * 1024:
                im.quantize(256, method=Image.FASTOCTREE).save(tmp, "PNG", optimize=True)
        else:
            im.convert("RGB").save(tmp, "JPEG", quality=80, optimize=True, progressive=True)
        if os.path.getsize(tmp) < antes:
            os.replace(tmp, ruta)
            return antes - os.path.getsize(ruta)
        os.remove(tmp)
    except Exception as e:
        print("   no se pudo reducir", ruta, e)
    return 0

def reducir_todas():
    if not os.path.isdir(IMG_DIR): return
    Image = _pillow()
    if not Image: return
    ahorro = 0
    for n in sorted(os.listdir(IMG_DIR)):
        ahorro += reducir(os.path.join(IMG_DIR, n), Image)
    print("Imagenes comprimidas: se liberaron %.1f MB." % (ahorro / 1048576))

def api(metodo, ruta, cuerpo=None):
    for intento in range(5):
        req = urllib.request.Request(API + ruta, method=metodo,
            data=json.dumps(cuerpo).encode() if cuerpo is not None else None,
            headers={"Authorization": "Bearer " + TOKEN, "Notion-Version": "2025-09-03", "Content-Type": "application/json"})
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                return json.loads(r.read().decode("utf-8"))
        except urllib.error.HTTPError as e:
            if e.code == 429 or e.code >= 500:
                time.sleep(2 + intento * 2); continue
            return {"object": "error", "status": e.code, "message": e.read().decode("utf-8", "ignore")[:300]}
        except Exception as e:
            time.sleep(2)
    return {"object": "error", "status": 0, "message": "sin respuesta"}

def pausa():
    time.sleep(0.35)  # Notion permite ~3 peticiones por segundo

def texto(rt):
    return "".join(x.get("plain_text", "") for x in (rt or []))

def descargar(url):
    """Las imagenes subidas a Notion caducan en 1 hora: se copian al repositorio."""
    if not url or not url.startswith("http"):
        return url
    if "amazonaws.com" not in url and "notion" not in url.split("/")[2]:
        return url   # imagen externa: se queda con su enlace
    if _img_count[0] >= MAX_IMAGENES:
        return None
    ext = (re.search(r"\.(png|jpe?g|gif|webp|svg)", url.split("?")[0], re.I) or [None, "png"])[1].lower()
    nombre = hashlib.sha1(url.split("?")[0].encode()).hexdigest()[:16] + "." + ext
    ruta = os.path.join(IMG_DIR, nombre)
    if not os.path.exists(ruta):
        try:
            os.makedirs(IMG_DIR, exist_ok=True)
            with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "StellaSoraWikiES"}), timeout=60) as r, open(ruta, "wb") as f:
                f.write(r.read())
            reducir(ruta)
            _img_count[0] += 1
        except Exception as e:
            print("   imagen no descargada:", e)
            return None
    return ruta.replace("\\", "/")

def valor_prop(p):
    t = p.get("type"); v = p.get(t)
    if t == "title" or t == "rich_text": return texto(v)
    if t in ("select", "status"): return (v or {}).get("name")
    if t == "multi_select": return [x.get("name") for x in (v or [])]
    if t in ("number", "checkbox", "url", "email", "phone_number"): return v
    if t == "date": return (v or {}).get("start")
    if t == "files": return [descargar((f.get("file") or f.get("external") or {}).get("url")) for f in (v or [])]
    if t == "formula":
        return valor_prop({"type": (v or {}).get("type"), (v or {}).get("type"): (v or {}).get((v or {}).get("type"))}) if v else None
    if t == "relation": return len(v or [])
    if t == "rollup":
        return None
    if t in ("created_time", "last_edited_time"): return v
    return None

def bloques(id_, nivel=0):
    salida, cursor = [], None
    while True:
        r = api("GET", "/blocks/%s/children?page_size=100%s" % (id_, "&start_cursor=" + cursor if cursor else ""))
        pausa()
        if r.get("object") == "error":
            break
        for b in r.get("results", []):
            t = b.get("type"); d = b.get(t) or {}
            if t in ("paragraph", "quote", "callout"):
                x = texto(d.get("rich_text"))
                if x: salida.append({"t": "q" if t != "paragraph" else "p", "x": x})
            elif t.startswith("heading_"):
                salida.append({"t": "h", "x": texto(d.get("rich_text"))})
            elif t in ("bulleted_list_item", "numbered_list_item", "to_do"):
                salida.append({"t": "li", "x": texto(d.get("rich_text"))})
            elif t == "image":
                u = descargar((d.get("file") or d.get("external") or {}).get("url"))
                if u: salida.append({"t": "img", "u": u, "x": texto(d.get("caption"))})
            elif t == "divider":
                salida.append({"t": "hr"})
            if b.get("has_children") and nivel < 2 and t not in ("child_database", "child_page"):
                salida.extend(bloques(b["id"], nivel + 1))
        if not r.get("has_more"):
            break
        cursor = r.get("next_cursor")
    return salida

def fuentes_de(id_):
    """Dado un id de base de datos, devuelve sus fuentes de datos (data sources)."""
    r = api("GET", "/databases/" + id_)
    if r.get("object") == "database":
        return [(d["id"], d.get("name", "")) for d in r.get("data_sources", [])] or [(id_, "")]
    return []

def hijos_bases(id_, prof=0):
    """Busca bases de datos dentro de una pagina (tambien dentro de columnas)."""
    out = []
    r = api("GET", "/blocks/%s/children?page_size=100" % id_)
    for b in r.get("results", []):
        if b.get("type") == "child_database":
            out.append(b["id"])
        elif b.get("has_children") and prof < 2 and b.get("type") in ("column_list", "column", "toggle", "synced_block"):
            out += hijos_bases(b["id"], prof + 1)
    return out

def encontrar_base():
    cand = fuentes_de(ROOT)
    if not cand:
        print("El id raiz no es una base de datos. Busco bases dentro de la pagina...")
        for bid in hijos_bases(ROOT):
            cand += fuentes_de(bid)
    if not cand:
        print("Busco en todo lo que la integracion puede ver...")
        r = api("POST", "/search", {"filter": {"property": "object", "value": "data_source"}, "page_size": 50})
        if r.get("object") == "error":
            print("Busqueda:", r.get("message", "")[:200])
        for d in r.get("results", []):
            cand.append((d["id"], texto(d.get("title"))))
    print("Fuentes de datos encontradas:", cand)
    for did, nombre in cand:
        r = api("GET", "/data_sources/" + did)
        if r.get("object") == "data_source":
            return r
        print("No se pudo leer la fuente", did, r.get("message", "")[:200])
    # Plan B: todo lo que la integracion puede ver (para saber que falta compartir)
    print("--- Lo que la integracion puede ver ---")
    vistos = []
    for filtro in (None, "data_source"):
        cuerpo = {"page_size": 50}
        if filtro: cuerpo["filter"] = {"property": "object", "value": filtro}
        r = api("POST", "/search", cuerpo)
        if r.get("object") == "error":
            print("Busqueda:", r.get("message", "")[:200]); continue
        for d in r.get("results", []):
            if filtro is None:
                t = d.get("title") or [x for v in d.get("properties", {}).values() if v.get("type") == "title" for x in v.get("title", [])]
                print(" -", d.get("object"), d.get("id"), "|", texto(t)[:60])
            else:
                vistos.append(d)
    for d in vistos:
        print("Probando fuente visible:", d["id"], texto(d.get("title")))
        r = api("GET", "/data_sources/" + d["id"])
        if r.get("object") == "data_source":
            return r
    return None

def main():
    reducir_todas()
    if not TOKEN:
        print("NOTION_TOKEN no esta configurado: se omiten las builds."); return
    db = encontrar_base()
    if not db:
        print("ERROR: no se pudo leer la base de datos. Revisa que la integracion tenga acceso (menu ... > Conexiones)."); sys.exit(0)
    props = db.get("properties", {})
    print("Base de datos:", texto(db.get("title")), "| columnas:", [(k, v.get("type")) for k, v in props.items()])
    filas, cursor = [], None
    while len(filas) < MAX_PAGINAS:
        r = api("POST", "/data_sources/%s/query" % db["id"], {"page_size": 100, **({"start_cursor": cursor} if cursor else {})})
        pausa()
        if r.get("object") == "error":
            print("ERROR al leer filas:", r.get("message")); sys.exit(0)
        filas += r.get("results", [])
        if not r.get("has_more"): break
        cursor = r.get("next_cursor")
    print("Filas leidas:", len(filas))
    items = []
    for f in filas:
        p = f.get("properties", {})
        titulo = next((valor_prop(v) for v in p.values() if v.get("type") == "title"), "") or "(sin titulo)"
        vals = {}
        for k, v in p.items():
            if v.get("type") == "title": continue
            x = valor_prop(v)
            if x not in (None, "", [], False): vals[k] = x
        icon = (f.get("icon") or {})
        cover = (f.get("cover") or {})
        items.append({"id": f["id"].replace("-", ""), "title": titulo, "props": vals,
                      "icon": icon.get("emoji") if icon.get("type") == "emoji" else descargar((icon.get("file") or icon.get("external") or {}).get("url")),
                      "cover": descargar((cover.get("file") or cover.get("external") or {}).get("url")) if cover else None,
                      "edited": f.get("last_edited_time"), "blocks": bloques(f["id"])})
    cols = [{"n": k, "t": v.get("type")} for k, v in props.items() if v.get("type") != "title"]
    datos = {"title": texto(db.get("title")), "url": PUBLIC, "cols": cols, "items": items}
    previo = None
    if os.path.exists("builds.json"):
        try:
            previo = json.load(open("builds.json", encoding="utf-8")); previo.pop("generado", None)
        except Exception: previo = None
    if previo == datos:
        print("Sin cambios en builds.json."); return
    datos["generado"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    json.dump(datos, open("builds.json", "w", encoding="utf-8"), ensure_ascii=False)
    print("builds.json actualizado: %d filas, %d imagenes nuevas." % (len(items), _img_count[0]))
    for it in items[:2]:
        print("MUESTRA-BUILD", json.dumps(it, ensure_ascii=False)[:600])

if __name__ == "__main__":
    main()
