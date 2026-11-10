# Genera las fichas ampliadas (fichas/<id>.json) de TODOS los personajes de data.js.
# Baja el texto de cada personaje de la wiki, lo separa en habilidades/potenciales/afinidad, rellena stats y
# imagenes con los datos del juego y traduce con la memoria traducciones.json. Lo que aun no esta traducido
# se deja en ingles y se anota en fichas/pendientes.json. Un personaje que falla NO detiene a los demas.
# Solo usa la libreria estandar de Python. Se ejecuta con GitHub Actions (fichas.yml).
import json, os, re, sys, time, glob, hashlib, subprocess, tempfile, urllib.request, urllib.parse
UA = {"User-Agent": "StellaSoraWikiES-fanapp/1.0 (https://github.com/CDT007SSV/stella-sora-vita)"}
WIKI_RAW = "https://stellasora.miraheze.org/w/index.php?action=raw&title="
WIKI_FILES = "https://static.wikitide.net/stellasorawiki/"
SS = "https://raw.githubusercontent.com/AutumnVN/ssassets/main/"
LIMITE = int(os.environ.get("FICHAS_LIMITE", "0") or 0)       # para pruebas: solo los N primeros
SOLO = [x for x in os.environ.get("FICHAS_SOLO", "").split(",") if x.strip()]  # para pruebas: ids concretos

# ---- lector de la wiki
# Convierte el texto de una pagina de personaje de la wiki (wikitexto) en un JSON ordenado.
# Uso: python3 parse_wiki.py entrada.wikitext salida.json
# Los numeros de las habilidades/potenciales se separan del texto: asi se traduce UNA vez la plantilla
# y los valores de cada nivel se rellenan solos.
import json, re, sys

def plantillas(t):
    """Plantillas {{...}} de primer nivel: [(nombre, [(clave|None, valor)], inicio, fin)]"""
    out, i, n = [], 0, len(t)
    while i < n:
        if t.startswith("{{", i):
            d, j = 0, i
            while j < n:
                if t.startswith("{{", j): d += 1; j += 2
                elif t.startswith("}}", j):
                    d -= 1; j += 2
                    if d == 0: break
                else: j += 1
            cuerpo = t[i + 2:j - 2]
            partes, cur, dd, k = [], "", 0, 0
            while k < len(cuerpo):
                if cuerpo.startswith("{{", k) or cuerpo.startswith("[[", k): dd += 1; cur += cuerpo[k:k + 2]; k += 2
                elif cuerpo.startswith("}}", k) or cuerpo.startswith("]]", k): dd -= 1; cur += cuerpo[k:k + 2]; k += 2
                elif cuerpo[k] == "|" and dd == 0: partes.append(cur); cur = ""; k += 1
                else: cur += cuerpo[k]; k += 1
            partes.append(cur)
            nombre, params = partes[0].strip(), []
            for p in partes[1:]:
                m = re.match(r"^\s*([A-Za-z_][\w ]*?)\s*=\s*(.*)$", p, re.S)
                params.append((m.group(1), m.group(2).strip()) if m and not p.lstrip().startswith("{{") else (None, p.strip()))
            out.append((nombre, params, i, j)); i = j
        else: i += 1
    return out

def pd(params):
    return {k: v for k, v in params if k}

def limpia(s):
    """Quita marcas de la wiki. Numeros -> ⟦..⟧, palabras clave -> ⟨..⟩."""
    s = re.sub(r"\{\{color\|[^|]*\|([^}]*)\}\}", lambda m: "⟦" + m.group(1) + "⟧", s)
    s = re.sub(r"\{\{word\|([^|}]*)\|?[^}]*\}\}", lambda m: "⟨" + m.group(1) + "⟩", s)
    s = re.sub(r"\{\{SkillLevelHint\|[^|}]*\|([^}]*)\}\}", lambda m: "⟪" + m.group(1) + "⟫", s)   # valores segun el Tier (avance)
    s = re.sub(r"<br\s*/?>", "\n", s)
    s = re.sub(r"'''|''", "", s)
    s = re.sub(r"\[\[(?:[^\]|]*\|)?([^\]]*)\]\]", r"\1", s)
    return re.sub(r"[ \t]+\n", "\n", s).strip()

def materiales(s):
    return [{"n": m.group(1), "q": int(m.group(2) or 1)} for m in re.finditer(r"\{\{Item\|([^|}]*)(?:\|quantity=(\d+))?\}\}", s)]

def sin_materiales(s):
    return re.split(r"<br\s*/?>\s*Upgrade materials:", s)[0]

def plantilla_numeros(textos):
    """Convierte N textos (uno por nivel) en una plantilla + lista de valores por nivel.
    Devuelve (plantillas, valores): plantillas = [{tpl, niveles:[..]}], valores[nivel] = [v0,v1,...]"""
    vals, tpls, hints = [], [], []
    for t in textos:
        v, h = [], []
        def r(m): v.append(m.group(1)); return "⟦%d⟧" % (len(v) - 1)
        def rh(m): h.append(m.group(1).split("/")); return "⟪%d⟫" % (len(h) - 1)
        tpls.append(re.sub(r"⟪([^⟫]*)⟫", rh, re.sub(r"⟦([^⟧]*)⟧", r, t))); vals.append(v); hints.append(h)
    grupos = []
    for i, t in enumerate(tpls):
        for g in grupos:
            if g["tpl"] == t: g["niveles"].append(i + 1); break
        else: grupos.append({"tpl": t, "niveles": [i + 1]})
    return grupos, vals, hints

def parsea_pestana(chunk):
    """Una pestana (Main o Support): builds con su descripcion y la lista de potenciales por grupo."""
    res = {"builds": [], "lista": []}
    for nombre, params, a, b in plantillas(chunk):
        if nombre != "PotentialBuild": continue
        for k, v in params:
            if k and re.match(r"name\d+$", k): res["builds"].append({"id": int(k[4:]), "nombre": v, "desc": ""})
        for k, v in params:
            if k and re.match(r"desc\d+$", k):
                for bd in res["builds"]:
                    if bd["id"] == int(k[4:]): bd["desc"] = v
    for m in re.finditer(r"^\| (\d+) = (\{\{TrekkerPotential.*?)(?=^\| \d+ = |\Z|^\}\}\s*$)", chunk, re.S | re.M):
        grupo = int(m.group(1))
        for nombre, params, a, b in plantillas(m.group(2)):
            if nombre != "TrekkerPotential": continue
            p = pd(params)
            desc = limpia(p.get("desc", ""))
            vals = []
            def r(mm):
                vals.append(mm.group(1).split("/")); return "⟦%d⟧" % (len(vals) - 1)
            tpl = re.sub(r"⟦([^⟧]*)⟧", r, desc)
            res["lista"].append({"grupo": grupo, "nombre": p.get("name"), "tipo": int(p.get("type", 0) or 0),
                "breve": limpia(p.get("brief", "")), "plantilla": tpl, "valores": vals, "icono": p.get("icon"), "forma": p.get("shape")})
    return res

def parsea(texto):
    tp = plantillas(texto)
    ficha = {"datos": {}, "habilidades": [], "potenciales": {}, "regalos": [], "tareas": []}
    for nombre, params, a, b in tp:
        p = pd(params)
        if nombre == "TrekkerData":
            ficha["datos"] = p
        elif nombre == "TrekkerSkill":
            niveles = sorted((int(k.split("_")[1]), v) for k, v in p.items() if k.startswith("desc_"))
            textos = [limpia(sin_materiales(v)) for _, v in niveles]
            grupos, vals, hints = plantilla_numeros(textos)
            ficha["habilidades"].append({
                "tipo": p.get("type"), "nombre": p.get("name"), "breve": limpia(sin_materiales(p.get("brief", ""))),
                "enfriamiento": p.get("cooldown"), "plantillas": grupos, "valores": vals, "tiers": hints[0] if hints else [],
                "materiales": [materiales(v) for _, v in niveles]})
    ficha["potenciales"] = {}
    for m in re.finditer(r"\|-\|(Main|Support)=(.*?)(?=\|-\||</tabber>|\Z)", texto, re.S):
        ficha["potenciales"][m.group(1).lower()] = parsea_pestana(m.group(2))
    for nombre, params, a, b in tp:
        p = pd(params)
        if nombre == "TrekkerGifts":
            ficha["regalos"] = [v for k, v in params if k is None and v]
        elif nombre == "TrekkerAffinityTasks":
            i = 1
            while "text%d" % i in p:
                ficha["tareas"].append({"texto": p["text%d" % i], "exp": int(p.get("exp%d" % i, 0) or 0)}); i += 1
    m = re.search(r"==\s*Profile\s*==\s*\n(.*?)\n\s*==", texto, re.S)
    if m: ficha["perfil"] = limpia(m.group(1)).strip('"')
    return ficha


# ---- textos
# Lista los textos en ingles de una ficha, SIN repetir, en orden fijo. La traduccion es una lista del mismo tamano y orden.
import json, sys
def textos(f):
    out = []
    def add(s):
        if s and s not in out: out.append(s)
    add(f.get("perfil"))
    for h in f["habilidades"]:
        add(h["nombre"]); add(h["breve"])
        for g in h["plantillas"]: add(g["tpl"])
    for tab in ("main", "support"):
        t = f["potenciales"].get(tab) or {}
        for b in t.get("builds", []): add(b["nombre"]); add(b["desc"])
        for p in t.get("lista", []): add(p["nombre"]); add(p["breve"]); add(p["plantilla"])
    return out

# ---- glosario
# Glosario compartido por todas las fichas. Nombres provisionales: el juego no trae textos en español.
ITEMS = {
 "Dorra": "Dorra",
 "Radiant Feather Crown": "Corona de plumas radiantes",
 "Chess Piece of Skill": "Pieza de ajedrez de habilidad",
 "Kung Fu Game Cartridge": "Cartucho de juego de kung-fu",
 "Fighting Game Cartridge": "Cartucho de juego de lucha",
 "Phantom Game Cartridge": "Cartucho de juego fantasma",
 "Love Candle": "Vela del amor",
 "Blazing Wings": "Alas ardientes",
 "Fiery Honeypot": "Tarro de miel ardiente",
 "Star Eclipse": "Eclipse estelar",
 "Moonlit Companion": "Compañero a la luz de la luna",
 "Cosmic Form": "Forma cósmica",
 "Chill Crushed Ice": "Hielo picado helado",
 "Fragrant Ice Delight": "Delicia helada fragante",
 "Sweet Ice Furry": "Dulce helado peludo",
}
# Tareas de afinidad: texto en ingles con {n} (nombre) y # (numero) -> espanol
TAREAS = [
 (r"^Complete (\d+) Ascension with {n}$", "Completa {0} Ascensión con {n}"),
 (r"^{n} has completed (\d+) Ascensions?$", "Completa {0} Ascensión con {n}"),
 (r"^Invite(?:d)? and hung? out with {n} (\d+) times?$", "Invita a {n} a salir {0} {veces}"),
 (r"^{n} (?:reaches|has reached) Tier (\d+)$", "{n} alcanza el Tier {0}"),
 (r"^Upgrade(?:d)? {n}'s skills (\d+) times?$", "Mejora las habilidades de {n} {0} {veces}"),
 (r"^Save (\d+) Records? with a Rating of (\d+) with {n}$", "Guarda {0} {records} con una calificación de {1} con {n}"),
 (r"^{n} has saved (\d+) records? with a rating level of (\d+)$", "Guarda {0} {records} con una calificación de {1} con {n}"),
 (r"^All {n}'s skills ≥ ?(?:Lv\.)? ?(\d+)$", "Todas las habilidades de {n} ≥ Nv. {0}"),
 (r"^All of {n}'s skills are at (?:Lv\.|Level) ?(\d+) or higher$", "Todas las habilidades de {n} ≥ Nv. {0}"),
 (r"^Invite and hang out with {n} (\d+) times?$", "Invita a {n} a pasar el rato {0} {veces}"),
 (r"^Collect {n}'s Potentials? ×(\d+)$", "Reúne ×{0} potenciales de {n}"),
 (r"^Obtained (\d+) {n}'s Potentials$", "Reúne ×{0} potenciales de {n}"),
]
import re
def tarea(txt, nombre):
    t = txt.strip().rstrip(".").replace(nombre, "{n}")
    for pat, es in TAREAS:
        m = re.match(pat, t)
        if m:
            g = m.groups(); out = es
            for i, v in enumerate(g): out = out.replace("{%d}" % i, v)
            n1 = int(g[0])
            out = out.replace("{veces}", "vez" if n1 == 1 else "veces").replace("{records}", "récord" if n1 == 1 else "récords")
            return out.replace("{n}", nombre), True
    return txt, False

# ---- stats
# Saca HP/ATK por nivel de las tablas del juego (Character.json -> AttributeId -> Attribute.json).
import json
def _l(p):
    d = json.load(open(p)); return list(d.values()) if isinstance(d, dict) else d
def stats(char_id, bin_dir, nivel_max=90):
    ch = [x for x in _l(bin_dir + "/Character.json") if x["Id"] == char_id]
    if not ch: return None
    g = str(ch[0]["AttributeId"])
    rows = [x for x in _l(bin_dir + "/Attribute.json") if str(x["GroupId"]) == g and x["lvl"] <= nivel_max]
    if not rows: return None
    return {"cr": rows[0]["CritRate"] / 100, "cd": rows[0]["CritPower"] / 100, "rows": [[x["lvl"], x["Hp"], x["Atk"]] for x in rows]}


# ---------------------------------------------------------------- generador
def wurl(n):
    n = n.replace(" ", "_"); h = hashlib.md5(n.encode()).hexdigest()
    return WIKI_FILES + h[0] + "/" + h[:2] + "/" + n

EXPORT = {}            # titulo -> wikitexto, leido de wiki_export.xml (Special:Export de la wiki)
RED_BLOQUEADA = False  # si la wiki responde 403 una vez, no se insiste con las demas

def carga_export(ruta="wiki_export.xml"):
    if not os.path.exists(ruta): return
    import xml.etree.ElementTree as ET
    for _, el in ET.iterparse(ruta):
        if el.tag.endswith("}page") or el.tag == "page":
            t = x = None
            for h in el.iter():
                if h.tag.split("}")[-1] == "title": t = h.text
                elif h.tag.split("}")[-1] == "text": x = h.text
            if t and x: EXPORT[t.strip()] = x
            el.clear()
    print("Paginas leidas de %s: %d" % (ruta, len(EXPORT)))

def bajar(titulo, nivel=0):
    t = EXPORT.get(titulo) or EXPORT.get(titulo.replace("_", " ")) or _bajar(titulo)
    m = re.match(r"\s*#REDIRECT\s*\[\[([^\]|#]+)", t or "", re.I)
    return bajar(m.group(1).strip(), nivel + 1) if m and nivel < 3 else t

def _bajar(titulo):
    global RED_BLOQUEADA
    d = os.environ.get("STELLA_WIKI_DIR")           # pruebas sin red
    if d:
        p = os.path.join(d, titulo + ".wikitext")
        return open(p, encoding="utf-8").read() if os.path.exists(p) else None
    if RED_BLOQUEADA or EXPORT: return None
    for i in range(2):
        try:
            req = urllib.request.Request(WIKI_RAW + urllib.parse.quote(titulo.replace(" ", "_")), headers=UA)
            with urllib.request.urlopen(req, timeout=60) as r:
                return r.read().decode("utf-8")
        except Exception as e:
            print("   no se pudo bajar", titulo, e)
            if "403" in str(e): RED_BLOQUEADA = True; print("   La wiki bloquea las descargas automaticas: usa wiki_export.xml"); return None
            time.sleep(3)
    return None

def personajes():
    s = open("data.js", encoding="utf-8").read()
    m = re.search(r"const CHARS = (\[.*?\]);\n", s, re.S)
    out = []
    for c in json.loads(m.group(1)):
        t = urllib.parse.unquote((c.get("wikiUrl") or "").rstrip("/").split("/wiki/")[-1]).replace("_", " ")
        if t: out.append((c["id"], t))
    return out

def repo_datos():
    r = os.environ.get("STELLA_REPO")
    if r: return r
    try:
        d = tempfile.mkdtemp()
        subprocess.run(["git", "clone", "--depth", "1", "-q", "https://github.com/Hiro420/StellaSoraData.git", d], check=True, timeout=900)
        return d
    except Exception as e:
        print("No se pudo clonar los datos del juego:", e); return None

marc = lambda s: (sorted(re.findall(r"⟦\d+⟧", s)), sorted(re.findall(r"⟪\d+⟫", s)), len(re.findall(r"⟨[^⟩]*⟩", s)))

def construye(f, MEM, pend, G, titulo=""):
    def tr(s):
        if not s: return s
        es = MEM.get(s)
        if es and marc(es) == marc(s): return es
        pend.add(s); return s
    def it(n):
        es = MEM.get("item:" + n) or ITEMS.get(n)
        if not es and n != "Dorra": pend.add("item:" + n)
        return {"n": es or n, "ne": n}
    d = f["datos"]; nombre = d.get("name") or titulo
    cid = int(d.get("id", 0) or 0)
    res = {"id": cid, "nombre": nombre, "perfil": tr(f.get("perfil")), "habilidades": [], "potenciales": {}, "regalos": [it(g) for g in f["regalos"]], "tareas": []}
    for h in f["habilidades"]:
        res["habilidades"].append({"tipo": h["tipo"], "n": tr(h["nombre"]), "ne": h["nombre"], "b": tr(h["breve"]), "cd": h["enfriamiento"],
            "tpl": [{"s": tr(g["tpl"]), "l": g["niveles"]} for g in h["plantillas"]], "v": h["valores"], "tier": h["tiers"],
            "mats": [[dict(it(m["n"]), q=m["q"]) for m in lvl] for lvl in h["materiales"]]})
    for tab, t in f["potenciales"].items():
        res["potenciales"][tab] = {"builds": [{"id": b["id"], "n": tr(b["nombre"]), "d": tr(b["desc"])} for b in t["builds"]],
            "l": [{"g": p["grupo"], "t": p["tipo"], "n": tr(p["nombre"]), "ne": p["nombre"], "b": tr(p["breve"]), "s": tr(p["plantilla"]), "v": p["valores"], "ic": p["icono"]} for p in t["lista"]]}
    for t in f["tareas"]:
        es, ok = tarea(t["texto"], nombre)
        if not ok: pend.add("tarea:" + t["texto"])
        res["tareas"].append({"t": es, "exp": t["exp"]})
    MESES = {"January":"enero","February":"febrero","March":"marzo","April":"abril","May":"mayo","June":"junio","July":"julio","August":"agosto","September":"septiembre","October":"octubre","November":"noviembre","December":"diciembre"}
    m = re.match(r"^(\w+) (\d+)", d.get("birthday", ""))
    if m and m.group(1) in MESES: res["cumple"] = "%s de %s" % (m.group(2), MESES[m.group(1)])
    if G:
        try: res["stats"] = stats(cid, G["bin"])
        except Exception as e: print("   sin stats:", e)
        try: imagenes(res, f, G, cid)
        except Exception as e: print("   sin imagenes:", e)
    return res

def imagenes(res, f, G, cid):
    cp = G["cp"].get(str(cid))
    pid = {G["L"].get("Item.%s.1" % i): i for k, v in (cp or {}).items() if k != "Id" for i in v}
    for h, w in zip(res["habilidades"], f["habilidades"]):
        ic = (w.get("icono") or {})
        if ic.get("icon"):
            h["iu"] = SS + "export/assets/assetbundles/icon/skill/" + ic["icon"] + ".webp"
            h["bg"] = wurl("Skillbg-" + ic["element"] + ".png"); h["ti"] = wurl("Skilltypeicon-" + ic["type"] + ".png")
        for lvl in h["mats"]:
            for m in lvl:
                i = G["nid"].get(m["ne"])
                if i and str(i) in G["It"]: m["iu"] = SS + "export/assets/assetbundles/icon/item/" + G["It"][str(i)]["Icon"].split("/")[-1] + ".webp"
    for g in res["regalos"]:
        i = G["nid"].get(g["ne"])
        if i and str(i) in G["It"]: g["iu"] = SS + "export/assets/assetbundles/icon/item/" + G["It"][str(i)]["Icon"].split("/")[-1] + ".webp"
    for t in ("main", "support"):
        for p in (res["potenciales"].get(t) or {}).get("l", []):
            i = pid.get(p["ne"])
            if i: p["iu"] = SS + "potential/%d.webp" % i

def datos_juego(R):
    if not R: return None
    L = json.load(open(R + "/EN/language/en_US/Item.json", encoding="utf-8"))
    nid = {}
    for k, v in L.items():
        if k.endswith(".1") and k.count(".") == 2: nid.setdefault(v, k.split(".")[1])
    return {"bin": R + "/EN/bin", "L": L, "nid": nid, "It": json.load(open(R + "/EN/bin/Item.json", encoding="utf-8")),
            "cp": json.load(open(R + "/EN/bin/CharPotential.json", encoding="utf-8"))}

def main():
    MEM = json.load(open("traducciones.json", encoding="utf-8")) if os.path.exists("traducciones.json") else {}
    os.makedirs("fichas", exist_ok=True)
    carga_export()
    G = datos_juego(repo_datos())
    lista = personajes()
    if SOLO: lista = [x for x in lista if x[0] in SOLO]
    if LIMITE: lista = lista[:LIMITE]
    pend, log, ok = set(), [], 0
    for cid, titulo in lista:
        try:
            wt = bajar(titulo)
            if not wt: log.append("%s: no se pudo bajar la pagina '%s'" % (cid, titulo)); continue
            f = parsea(wt)
            if not f["habilidades"]: log.append("%s: la pagina no tiene habilidades (¿otro formato?)" % cid); continue
            # el icono de habilidad se saca del wikitexto original
            for h, ic in zip(f["habilidades"], re.findall(r"TrekkerSkillIcon\|element=([^|]+)\|icon=([^|}]+)\|type=([^|}]+)", wt)):
                h["icono"] = {"element": ic[0].strip(), "icon": ic[1].strip(), "type": ic[2].strip()}
            p = set(); res = construye(f, MEM, p, G, titulo)
            res["pendiente"] = len(p)
            json.dump(res, open("fichas/%s.json" % cid, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
            pend |= p; ok += 1
            log.append("%s: ok (%d textos sin traducir)" % (cid, len(p)))
        except Exception as e:
            log.append("%s: ERROR %s: %s" % (cid, type(e).__name__, e))
        time.sleep(1)
    json.dump({k: "" for k in sorted(pend)}, open("fichas/pendientes.json", "w", encoding="utf-8"), ensure_ascii=False, indent=0)
    open("fichas/registro.txt", "w", encoding="utf-8").write("\n".join(log) + "\n")
    print("\n".join(log)); print("Fichas generadas: %d de %d. Textos pendientes de traducir: %d" % (ok, len(lista), len(pend)))
    if lista and not ok: sys.exit(1)

if __name__ == "__main__":
    main()
