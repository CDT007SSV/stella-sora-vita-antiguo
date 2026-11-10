#!/usr/bin/env python3
"""Revisión diaria: JSON válidos, archivos del SHELL del sw.js, enlaces externos.
Escribe revision.md con los problemas (vacío si todo está bien)."""
import json, re, glob, os, urllib.request, concurrent.futures as cf

prob = []

# 1) todos los .json deben abrir
for f in sorted(glob.glob("*.json")):
    try:
        json.load(open(f, encoding="utf-8"))
    except Exception as x:
        prob.append(f"JSON dañado: `{f}` ({x})")

# 2) archivos de la lista SHELL del service worker
sw = open("sw.js", encoding="utf-8").read()
m = re.search(r"const SHELL\s*=\s*\[(.*?)\];", sw, re.S)
for n in re.findall(r'"([^"]+)"', m.group(1) if m else ""):
    if n != "./" and not os.path.exists(n):
        prob.append(f"Falta el archivo `{n}` (está en la lista del sw.js)")

# 3) enlaces externos de ranking.json y novedades.json
urls = set()
for f in ("ranking.json", "novedades.json"):
    if os.path.exists(f):
        urls |= set(re.findall(r'https?://[^\s"\\<>)]+', open(f, encoding="utf-8").read()))
urls = {u for u in urls if "miraheze" not in u}

def chk(u):
    """Solo cuenta como roto un 404/410 real; fallos de red se ignoran."""
    for met in ("HEAD", "GET"):
        try:
            rq = urllib.request.Request(u, method=met, headers={"User-Agent": "Mozilla/5.0 (revision-ssv)"})
            with urllib.request.urlopen(rq, timeout=20) as r:
                return u, 200
        except urllib.error.HTTPError as e:
            if e.code in (404, 410) and met == "GET":
                return u, e.code
        except Exception:
            pass
    return u, 200

with cf.ThreadPoolExecutor(8) as ex:
    for u, s in ex.map(chk, sorted(urls)):
        if s != 200:
            prob.append(f"Enlace roto ({s}): {u}")

# 4) imágenes de la wiki: solo si el runner puede entrar
try:
    urllib.request.urlopen(urllib.request.Request("https://stellasora.miraheze.org/wiki/Main_Page", headers={"User-Agent": "Mozilla/5.0"}), timeout=20)
    nota = "La wiki respondió: las imágenes de la wiki sí se pueden revisar (aún no está implementado)."
except Exception:
    nota = "La wiki bloquea a GitHub, así que sus imágenes no se pueden revisar desde aquí."

open("revision.md", "w", encoding="utf-8").write(
    ("\n".join("- " + p for p in prob) + f"\n\n_{nota}_\n") if prob else "")
print("\n".join(prob) or "Todo bien"); print(nota)
