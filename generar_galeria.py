#!/usr/bin/env python3
"""Genera galeria.json: todas las ilustraciones (CG) que usan las historias del lector, agrupadas por capitulo/evento.
Lee lector-*.json (que ya se actualizan solos) y los titulos de lector-meta.json / lector.js. Solo usa la red para ver qué cumpleaños ya están en la wiki."""
import json, glob, re, os, datetime, urllib.parse, urllib.request

def chof(i):
    p = i.split("_")
    if p[0] == "CG" and len(p) > 1 and p[1].startswith("disc"): return "CGD_" + p[1]
    return p[0] + "_" + p[1] if p[0] in ("STev", "STsp", "CG") else p[0]

HEADS = {}
js = open("lector.js", encoding="utf-8").read()
for m in re.finditer(r'"([A-Za-z0-9_]+)":\s*\["([^"]+)"', js):
    if re.match(r"^(STm|STev|STsp|CG)", m.group(1)): HEADS[m.group(1)] = m.group(2)
meta = json.load(open("lector-meta.json", encoding="utf-8"))
for k, v in meta.get("CAPS", {}).items(): HEADS[k] = v[0]

def orden(k):
    n = [int(x) if x.isdigit() else 0 for x in re.findall(r"\d+", k)]
    return ({"STm": 0, "STev": 1, "STsp": 2, "CG": 3, "CGD": 4}.get(re.match(r"[A-Za-z]+", k).group(0), 5), n)

def flat(a, o):
    for s in a or []:
        o.append(s)
        if s and s[0] == "choice":
            for b in s[2]: flat(b, o)
    return o

def en_wiki(nombres):
    """Conjunto de archivos que existen en la wiki, o None si la consulta falla."""
    hay = set()
    try:
        for i in range(0, len(nombres), 50):
            q = urllib.parse.urlencode({"action": "query", "format": "json", "prop": "imageinfo", "titles": "|".join("File:" + n for n in nombres[i:i + 50])})
            req = urllib.request.Request("https://stellasora.miraheze.org/w/api.php?" + q, headers={"User-Agent": "StellaSoraWikiES-fanapp/1.0 (https://github.com/CDT007SSV/stella-sora-vita)"})
            with urllib.request.urlopen(req, timeout=60) as r: pags = json.load(r)["query"]["pages"]
            for p in pags.values():
                if "imageinfo" in p: hay.add(p["title"].split(":", 1)[1].replace(" ", "_"))
    except Exception as e:
        print("No se pudo consultar la wiki:", type(e).__name__)
        return None
    return hay

vistos, grupos = set(), {}
for fn in sorted(glob.glob("lector-*.json")):
    if "meta" in fn: continue
    aid = fn[len("lector-"):-5]
    try: d = json.load(open(fn, encoding="utf-8"))
    except Exception: continue
    ch = chof(aid)
    for s in flat(d.get("steps"), []):
        if s[0] not in ("bg", "obj") or not isinstance(s[1], str): continue
        n = s[1]
        if s[0] == "bg" and not re.match(r"(?i)^story_", n): continue
        if s[0] == "obj" and not re.match(r"(?i)^qstory_", n): continue
        key = ("b" if s[0] == "bg" else "o") + n.lower()
        if key in vistos: continue
        vistos.add(key)
        grupos.setdefault(ch, []).append({"n": n, "k": "b" if s[0] == "bg" else "o"})
out = []
for ch in sorted(grupos, key=orden):
    t = HEADS.get(ch) or ch
    cat = {"STm": "Historia principal", "STev": "Eventos", "STsp": "Nova Times", "CG": "Historias de personaje", "CGD": "Recuerdos de disco"}.get(re.match(r"[A-Za-z]+", ch).group(0), "Otros")
    out.append({"id": ch, "cat": cat, "titulo": t, "imgs": grupos[ch]})
# --- recuerdos de citas (arte de afinidad) ---
for fn in sorted(glob.glob("afinidad/*.json"), key=lambda f: int(re.sub(r"\D", "", f) or 0)):
    cid = os.path.basename(fn)[:-5]
    try: dd = json.load(open(fn, encoding="utf-8")).get("d", [])
    except Exception: continue
    imgs = [{"n": x["g"], "k": "d"} for x in dd if x.get("g")]
    if not imgs: continue
    nm = cid
    try:
        m = re.search(r"# Afinidad de (.+?):", open("textos/AF_%s.txt" % cid, encoding="utf-8").readline())
        if m: nm = m.group(1)
    except Exception: pass
    out.append({"id": "AFD_" + cid, "cat": "Recuerdos de cita", "titulo": nm, "imgs": imgs})
# --- arte de discos (por elemento) ---
try:
    dj = open("data.js", encoding="utf-8").read()
    a = dj.index("const DISCS = ") + len("const DISCS = "); b = dj.index("];", a) + 1
    discos = json.loads(dj[a:b])
    por = {}
    for d in discos:
        if d.get("imageUrl"): por.setdefault(d.get("element") or "Otros", []).append({"n": d["name"], "k": "u", "u": d["imageUrl"]})
    for el in sorted(por):
        out.append({"id": "DSC_" + el, "cat": "Discos", "titulo": "Discos " + el, "imgs": por[el]})
except Exception as ex:
    print("Discos no incluidos:", type(ex).__name__)
# --- ilustracion de afinidad (Memory Snapshot) y skins de cada personaje (nombres de la wiki, igual que en la ficha) ---
try:
    ex = json.load(open("extras.json", encoding="utf-8")).get("skins", {})
    W = "https://stellasora.miraheze.org/wiki/Special:FilePath/"
    afi = []
    for nm in sorted(ex):
        f = nm.replace(" ", "_")
        if ex[nm].get("cg"): afi.append({"n": nm, "k": "u", "u": W + urllib.parse.quote(f + "_Memory_Snapshot.png")})
        n = 0; sk = []
        for q in ex[nm].get("skins", []):
            if q.get("t") != 3: continue
            n += 1
            u = lambda v: W + urllib.parse.quote("%s_skin%d_%s.png" % (f, n, v))
            sk.append({"n": q["n"], "k": "u", "u": u("02"), "f": [u("01"), u("03")]})
        if sk: out.append({"id": "SKN_" + f, "cat": "Skins", "titulo": nm, "imgs": sk})
    tal = [{"n": nm, "k": "u", "u": W + urllib.parse.quote(nm.replace(" ", "_") + "_Talent.png")} for nm in sorted(ex)]
    if tal: out.append({"id": "TAL_all", "cat": "Talentos", "titulo": "Ilustraciones de talentos", "imgs": tal})
    cum = []
    arch = lambda nm, y: "%s_Birthday_Log_%d.jpg" % (nm.replace(" ", "_"), y)
    hay = en_wiki([arch(nm, y) for nm in ex for y in (2027, 2026, 2025)])  # None = no se pudo consultar: se dejan todas
    faltan = []
    for nm in sorted(ex):
        l = [(y, arch(nm, y)) for y in (2027, 2026, 2025) if hay is None or arch(nm, y) in hay]
        if not l: faltan.append(nm); continue
        for y, ar in l: cum.append({"n": nm + " " + str(y), "k": "u", "u": W + urllib.parse.quote(ar)})
    if faltan: print("Cumpleaños que aún no están en la wiki (%d): %s" % (len(faltan), ", ".join(faltan)))
    if cum: out.append({"id": "CUM_all", "cat": "Cumpleaños", "titulo": "Ilustraciones de cumpleaños", "imgs": cum})
    if afi: out.append({"id": "AFI_all", "cat": "Ilustraciones de afinidad", "titulo": "Ilustraciones de afinidad (fin del acto 3)", "imgs": afi})
except Exception as ex_:
    print("Skins no incluidas:", type(ex_).__name__)
ORD = ["Historia principal", "Eventos", "Nova Times", "Ilustraciones de afinidad", "Skins", "Talentos", "Cumpleaños", "Discos", "Historias de personaje", "Recuerdos de cita", "Recuerdos de disco"]
out.sort(key=lambda g: ORD.index(g["cat"]) if g["cat"] in ORD else 99)
nuevo = {"grupos": out}
try:
    ant = json.load(open("galeria.json", encoding="utf-8"))
    if ant.get("grupos") == out: print("Sin cambios (%d ilustraciones)" % sum(len(g["imgs"]) for g in out)); raise SystemExit
except FileNotFoundError: pass
nuevo["generado"] = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
json.dump(nuevo, open("galeria.json", "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
print("Galeria: %d grupos, %d ilustraciones" % (len(out), sum(len(g["imgs"]) for g in out)))
