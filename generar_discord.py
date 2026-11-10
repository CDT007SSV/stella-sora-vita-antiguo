# Lee el canal de Discord (el que sigue los anuncios oficiales) y lo guarda en discord.json
# para que la app lo muestre en Novedades. Necesita 2 secretos en GitHub:
#   DISCORD_TOKEN       (token del bot)      DISCORD_CANAL   (ID del canal que sigue los anuncios)
# Opcional: DISCORD_LINK (enlace del servidor oficial, para el botón "Ver en Discord" si el mensaje no trae enlace).
# Las imagenes de Discord caducan a las 24 h, por eso se guardan reducidas en discord_img/.
import json, os, re, sys, time, urllib.request, urllib.error, urllib.parse, io

MAX_ITEMS = 30
API = "https://discord.com/api/v10"
TOKEN = os.environ.get("DISCORD_TOKEN", "").strip()
CANAL = os.environ.get("DISCORD_CANAL", "").strip()
LINK = os.environ.get("DISCORD_LINK", "").strip()
IMGDIR = "discord_img"

def http(url, binario=False):
    h = {"User-Agent": "StellaSoraVita-fanapp (https://github.com/CDT007SSV/stella-sora-vita, 1.0)"}
    if url.startswith(API): h["Authorization"] = "Bot " + TOKEN       # el token solo viaja a la API de Discord
    elif not re.match(r"https://(cdn\.discordapp\.com|media\.discordapp\.net)/", url): raise ValueError("dominio no permitido")
    req = urllib.request.Request(url, headers=h)
    with urllib.request.urlopen(req, timeout=30) as r:
        d = r.read()
    return d if binario else json.loads(d.decode("utf-8"))

def limpia(t):
    """Quita el formato de Discord y deja texto plano."""
    t = t or ""
    t = re.sub(r"<a?:\w+:\d+>", "", t)                 # emojis personalizados
    t = re.sub(r"<@&?\d+>|<#\d+>|@everyone|@here", "", t)   # menciones
    t = re.sub(r"<t:\d+(?::\w)?>", "", t)               # marcas de tiempo
    t = re.sub(r"\[([^\]]+)\]\((https?://[^)\s]+)\)", r"\1", t)  # [texto](enlace) -> texto
    t = re.sub(r"^\s*#{1,3}\s*", "", t, flags=re.M)     # titulos markdown
    t = re.sub(r"(\*\*|__|\*|~~|`)", "", t)
    t = re.sub(r"\\([\\`*_{}\[\]()#+\-.!~|>:])", r"\1", t)     # quita los escapes con barra invertida
    t = re.sub(r"[ \t]+\n", "\n", t)
    t = re.sub(r"\n{3,}", "\n\n", t)
    return t.strip()

def primer_enlace(*textos):
    for t in textos:
        for u in re.findall(r"https?://[^\s)>\]]+", t or ""):
            return u.rstrip(".,;")
    return ""

def seguro(u):
    return u if isinstance(u, str) and u.startswith("https://") and len(u) < 1000 else ""

def mensaje_a_item(m):
    """Convierte un mensaje de Discord en un item de novedades (o None si no sirve)."""
    emb = (m.get("embeds") or [{}])
    e0 = emb[0] if emb else {}
    partes = [m.get("content") or ""]
    for e in m.get("embeds") or []:
        partes += [e.get("title") or "", e.get("description") or ""]
    crudo = "\n".join(p for p in partes if p)
    texto = limpia(crudo)
    if not texto and not (m.get("attachments") or e0.get("image")):
        return None
    lineas = [l.strip() for l in texto.split("\n") if l.strip()]
    titulo = limpia(e0.get("title") or "") or (lineas[0] if lineas else "Anuncio de Stella Sora")
    resto = texto
    if lineas and titulo == lineas[0]:
        resto = "\n".join(lineas[1:]).strip()
    if re.match(r"^https?://\S+$", titulo):          # el mensaje es solo un enlace: usa la primera linea de texto como titulo
        sin = [l for l in lineas if not re.match(r"^https?://\S+$", l)]
        titulo = sin[0] if sin else "Publicación en X"
        resto = "\n".join(sin[1:]).strip()
    if len(titulo) > 110: titulo = titulo[:107].rstrip() + "…"
    if len(resto) > 700: resto = resto[:697].rstrip() + "…"
    ref = m.get("message_reference") or {}
    orig = ""
    if ref.get("guild_id") and ref.get("channel_id") and ref.get("message_id"):
        orig = "https://discord.com/channels/%s/%s/%s" % (ref["guild_id"], ref["channel_id"], ref["message_id"])
    url = primer_enlace(m.get("content"), e0.get("url"), *(e.get("description") for e in m.get("embeds") or [])) or orig or LINK
    img = ""
    for a in m.get("attachments") or []:
        if str(a.get("content_type", "")).startswith("image/"): img = a.get("url"); break
    if not img:
        for e in m.get("embeds") or []:
            for k in ("image", "thumbnail"):
                if (e.get(k) or {}).get("url"): img = e[k]["url"]; break
            if img: break
    return {"id": "dc:" + m["id"], "tipo": "discord", "titulo": titulo, "texto": resto,
            "url": seguro(url), "_img": seguro(img), "fecha": m.get("timestamp") or ""}

def guarda_imagen(url, mid):
    """Descarga y reduce la imagen (JPEG, max 720 px). Devuelve la ruta o ''."""
    try:
        from PIL import Image
        d = http(url, binario=True)
        im = Image.open(io.BytesIO(d)).convert("RGB")
        im.thumbnail((720, 720))
        os.makedirs(IMGDIR, exist_ok=True)
        ruta = "%s/%s.jpg" % (IMGDIR, mid)
        im.save(ruta, "JPEG", quality=72, optimize=True)
        return ruta
    except Exception as ex:
        print("Imagen no guardada (%s): %s" % (mid, ex)); return ""

# ---- traduccion automatica al espanol (Google Translate, endpoint publico; si falla, se deja en ingles) ----
CJK = re.compile(r"[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]")  # japones / chino
COLA = re.compile(r"((?:\s+(?:https?://\S+|[#@][\w]+))+)\s*$")
def trad_linea(l):
    if not l.strip() or re.match(r"^https?://\S+$", l.strip()): return l
    pre = ""
    m = re.match(r"^(>\s*)+", l)
    if m: pre, l = m.group(0), l[m.end():]
    cola = ""
    c = COLA.search(l)
    if c: cola, l = c.group(1), l[:c.start()]
    lim = re.sub(r"[#@]\w+|https?://\S+", "", l)
    if not (re.search(r"[A-Za-z]{3}", lim) or CJK.search(lim)): return pre + l + cola
    return pre + gtx(l) + cola

def gtx(l):
    q = urllib.parse.urlencode({"client": "gtx", "sl": "auto", "tl": "es", "dt": "t", "q": l})
    q2 = urllib.parse.urlencode({"client": "dict-chrome-ex", "sl": "auto", "tl": "es", "dt": "t", "q": l})
    urls = ["https://translate.googleapis.com/translate_a/single?" + q,
            "https://clients5.google.com/translate_a/t?" + q2,
            "https://translate.google.com/translate_a/single?" + q]
    err = None
    for ronda in range(2):
        for u in urls:
            try:
                r = urllib.request.Request(u, headers={"User-Agent": "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36"})
                with urllib.request.urlopen(r, timeout=20) as f:
                    d = json.loads(f.read().decode())
                if d and isinstance(d[0], list) and d[0] and isinstance(d[0][0], list):
                    return "".join(x[0] for x in d[0] if x and x[0])
                if d and isinstance(d[0], str): return d[0]
                if d and all(isinstance(x, list) and x and isinstance(x[0], str) for x in d): return "".join(x[0] for x in d)
            except Exception as ex:
                err = ex
        time.sleep(5)
    raise err or RuntimeError("sin respuesta")

def traduce(t):
    if not t: return ""
    try:
        return "\n".join(trad_linea(l) for l in t.split("\n"))
    except Exception as ex:
        print("Traduccion fallida:", type(ex).__name__); return None

def con_traduccion(it):
    """Agrega titulo_es / texto_es. Devuelve True si cambio algo."""
    if "titulo_es" in it:
        # japones/chino que quedo sin traducir en una corrida anterior: se reintenta
        if not ((CJK.search(it.get("titulo") or "") and CJK.search(it.get("titulo_es") or "")) or (CJK.search(it.get("texto") or "") and CJK.search(it.get("texto_es") or ""))): return False
    a, b = traduce(it.get("titulo")), traduce(it.get("texto"))
    if a is None or b is None: return False
    it["titulo_es"], it["texto_es"] = a, b
    return True

def main():
    if not TOKEN or not CANAL:
        print("Falta DISCORD_TOKEN o DISCORD_CANAL: no se hace nada."); return
    try:
        msgs = http("%s/channels/%s/messages?limit=40" % (API, CANAL))
    except urllib.error.HTTPError as ex:
        print("Discord respondió %s: %s" % (ex.code, ex.read()[:200])); sys.exit(0 if ex.code in (429, 500, 502, 503) else 1)
    prev = {}
    try: prev = json.load(open("discord.json", encoding="utf-8"))
    except Exception: pass
    viejos = {x["id"]: x for x in prev.get("items", [])}
    items = []
    for m in msgs:
        it = mensaje_a_item(m)
        if not it: continue
        if it["id"] in viejos:
            items.append(viejos[it["id"]]); it.pop("_img", None); continue
        u = it.pop("_img", "")
        it["img"] = guarda_imagen(u, m["id"]) if u else ""
        items.append(it)
    items.sort(key=lambda x: x.get("fecha") or "", reverse=True)
    items = items[:MAX_ITEMS]
    cambio_tr = False
    for it in items[:12]:                       # traduce los recientes que aun no tienen traduccion
        if con_traduccion(it): cambio_tr = True
    if prev.get("items") is None: items = items[:10]   # primera vez: no inundar
    en_uso = {x["img"].split("/")[-1] for x in items if x.get("img")}
    if os.path.isdir(IMGDIR):
        for f in os.listdir(IMGDIR):
            if f not in en_uso: os.remove(os.path.join(IMGDIR, f))
    if [x["id"] for x in items] == [x["id"] for x in prev.get("items", [])] and prev and not cambio_tr:
        print("Sin mensajes nuevos."); return
    json.dump({"generado": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()), "items": items}, open("discord.json", "w", encoding="utf-8"), ensure_ascii=False)
    print("discord.json: %d items." % len(items))

if __name__ == "__main__":
    main()
