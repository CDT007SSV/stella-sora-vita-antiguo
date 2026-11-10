#!/usr/bin/env python3
"""Genera cumples_voz.json: la linea de voz de cumpleaños de cada Trekker (archivo de audio JP/CN + texto + traduccion al ingles),
leida de la subpagina de audio de cada personaje en la wiki (plantilla AudioRow, fila "Trekker birthday").
Los nombres de los personajes salen de presets.json. Si una pagina no se encuentra, se omite (la app usa el nombre de archivo estandar sin subtitulo)."""
import json, re, urllib.request, urllib.parse, time
RAW = "https://stellasora.miraheze.org/w/index.php?action=raw&title="
SUF = ["/audio", "/Audio", "/Voice", "/Voicelines", "/Voice_Lines", "/Quotes", "/Voice_lines"]

UA = {"User-Agent": "Mozilla/5.0 (compatible; StellaSoraVita-fanapp/1.0)"}
API = "https://stellasora.miraheze.org/w/api.php"

EXPORT = {}   # titulo -> wikitexto, de wiki_voces.xml (Special:Export de la wiki), porque la wiki bloquea las descargas automaticas
BLOQUEADA = False

def carga_export(ruta="wiki_voces.xml"):
    import os, xml.etree.ElementTree as ET
    if not os.path.exists(ruta): return
    for _, el in ET.iterparse(ruta):
        if el.tag.split("}")[-1] == "page":
            t = x = None
            for h in el.iter():
                k = h.tag.split("}")[-1]
                if k == "title": t = h.text
                elif k == "text": x = h.text
            if t and x: EXPORT[t.strip().replace("_", " ")] = x
            el.clear()
    print("Paginas leidas de %s: %d" % (ruta, len(EXPORT)))

def raw(t):
    global BLOQUEADA
    if EXPORT: return EXPORT.get(t.replace("_", " "), "")
    if BLOQUEADA: return ""
    try:
        req = urllib.request.Request(RAW + urllib.parse.quote(t), headers=UA)
        return urllib.request.urlopen(req, timeout=30).read().decode("utf-8")
    except Exception as ex:
        if "403" in str(ex):
            BLOQUEADA = True
            print("La wiki bloquea las descargas automaticas (403). Sube wiki_voces.xml (Special:Export de las paginas de audio).")
        return ""

def subpaginas(base):
    if EXPORT: return sorted(t.replace(" ", "_") for t in EXPORT if t.replace(" ", "_").startswith(base + "/"))
    if BLOQUEADA: return []
    """Lista las subpaginas de un personaje (Nombre/...) para encontrar la de audio sin adivinar el nombre."""
    try:
        q = urllib.parse.urlencode({"action": "query", "list": "allpages", "apprefix": base + "/", "aplimit": "50", "format": "json"})
        d = json.loads(urllib.request.urlopen(urllib.request.Request(API + "?" + q, headers=UA), timeout=30).read().decode("utf-8"))
        return [p["title"].replace(" ", "_") for p in d["query"]["allpages"]]
    except Exception as ex:
        if "403" in str(ex): globals()["BLOQUEADA"] = True
        return []

def fila(txt, titulo):
    for m in re.finditer(r"\{\{AudioRow\|(.*?)\}\}\s*(?=\{\{|\n|$)", txt, re.S):
        s = m.group(1)
        parts = re.split(r"\|(?=\w+=)", s)
        d = {}
        for p in parts:
            k, _, v = p.partition("=")
            d[k.strip()] = v.strip()
        if d.get("title", "").lower() == titulo.lower():
            return d
    return None

def limpia(t): return re.sub(r"<br\s*/?>", "\n", t or "").strip()

def main():
    carga_export()
    P = json.load(open("presets.json", encoding="utf-8"))
    try: prev = json.load(open("cumples_voz.json", encoding="utf-8"))
    except Exception: prev = {}
    out = {}
    for p in P.values():
        n = p["n"]; base = n.replace(" ", "_")
        cands = [base + s for s in SUF]
        for t in subpaginas(base):
            if t not in cands: cands.append(t)
        for t in cands:
            txt = raw(t)
            if "AudioRow" not in txt: continue
            d = fila(txt, "Trekker birthday")
            if d and d.get("file_jp"):
                out[n] = {"f": d.get("file_jp"), "fc": d.get("file_cn", ""), "tj": limpia(d.get("text_jp")), "tc": limpia(d.get("text_cn")), "en": limpia(d.get("trans_en"))}
                o = prev.get(n) or {}
                if o.get("es") and o.get("en") == out[n]["en"]: out[n]["es"] = o["es"]   # conserva la traduccion al espanol ya hecha
                break
        else:
            print("Sin pagina de audio:", n)
            if prev.get(n): out[n] = prev[n]   # conserva lo que ya habia
        if not EXPORT and not BLOQUEADA: time.sleep(0.4)
    json.dump(out, open("cumples_voz.json", "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    print("Voces de cumpleaños:", len(out))

if __name__ == "__main__": main()
