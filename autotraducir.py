#!/usr/bin/env python3
"""Traduce automaticamente (traductor gratuito de Google) lo que sigue en ingles:
 - textos/*.txt listados en textos/_pendientes.txt (lineas "clave | texto"; los nombres N: no se tocan)
 - textos de fichas y discos listados en fichas/pendientes.json y discos/pendientes.json
Todo lo traducido asi se anota en textos/_auto.txt y traducciones_auto.json para que una persona lo revise.
Para dar una traduccion por revisada: quitar su linea de _auto.txt / su clave de traducciones_auto.json."""
import json, os, re, time, urllib.parse, urllib.request

TOK = re.compile(r"(==[A-Za-z_]+==|<[^>]*>|\[[^\]]*\]|\\n|\n|⟦\d+⟧|[⟨⟩]|https?://\S+|\{[^}]*\})")
CACHE = {}
BLOQUEADO = [False]

def gtx(s):
    """prueba varios servidores gratuitos y reintenta con pausa si responden 429"""
    q = urllib.parse.urlencode({"client": "gtx", "sl": "auto", "tl": "es", "dt": "t", "q": s})
    q2 = urllib.parse.urlencode({"client": "dict-chrome-ex", "sl": "auto", "tl": "es", "dt": "t", "q": s})
    urls = ["https://translate.googleapis.com/translate_a/single?" + q,
            "https://clients5.google.com/translate_a/t?" + q2,
            "https://translate.google.com/translate_a/single?" + q]
    if BLOQUEADO[0]: raise RuntimeError("traductor bloqueado")
    err = None
    for ronda in range(2):
        for u in urls:
            try:
                r = urllib.request.Request(u, headers={"User-Agent": "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36"})
                with urllib.request.urlopen(r, timeout=20) as f:
                    d = json.loads(f.read().decode())
                time.sleep(0.4)
                if d and isinstance(d[0], list) and d[0] and isinstance(d[0][0], list):
                    return "".join(x[0] for x in d[0] if x and x[0])
                if d and isinstance(d[0], str): return d[0]
                if d and all(isinstance(x, list) and x and isinstance(x[0], str) for x in d): return "".join(x[0] for x in d)
            except Exception as ex:
                err = ex
        time.sleep(15)
    BLOQUEADO[0] = True
    raise err or RuntimeError("sin respuesta")

def trozo(s):
    if not re.search(r"[A-Za-z]{3}", s): return s
    lead, core, tail = re.match(r"^(\s*)(.*?)(\s*)$", s, re.S).groups()
    if core not in CACHE: CACHE[core] = gtx(core)
    return lead + CACHE[core] + tail

def traduce(t):
    """traduce solo lo que esta entre marcas (==X==, <..>, [..], \\n, ⟦n⟧...), que se dejan igual"""
    return "".join(p if TOK.fullmatch(p) or not p else trozo(p) for p in TOK.split(t))

def archivo(ruta):
    out, n = [], 0
    for l in open(ruta, encoding="utf-8").read().split("\n"):
        if l.startswith("#") or " | " not in l or l.startswith("N:"):
            out.append(l); continue
        k, v = l.split(" | ", 1)
        nv = traduce(v) if v.strip() else v
        n += nv != v
        out.append(k + " | " + nv)
    open(ruta, "w", encoding="utf-8").write("\n".join(out))
    return n

def main():
    auto = []
    pf = "textos/_pendientes.txt"
    if os.path.exists(pf):
        lista = [x.strip() for x in open(pf, encoding="utf-8") if x.strip()]
        resto = []
        for r in lista:
            if not os.path.exists(r): continue
            try:
                n = archivo(r); auto.append(r); print("Traducido", r, n, "lineas")
            except Exception as ex:
                print("FALLO", r, type(ex).__name__, getattr(ex, "code", ""), str(ex)[:120]); resto.append(r)
        open(pf, "w", encoding="utf-8").write("".join(x + "\n" for x in resto))
        if auto:
            af = "textos/_auto.txt"
            ya = [x.strip() for x in open(af, encoding="utf-8")] if os.path.exists(af) else []
            open(af, "w", encoding="utf-8").write("".join(x + "\n" for x in sorted(set(ya + auto))))
    registro = json.load(open("traducciones_auto.json", encoding="utf-8")) if os.path.exists("traducciones_auto.json") else {}
    for pend, mem, clave in (("fichas/pendientes.json", "traducciones.json", "fichas"), ("discos/pendientes.json", "traducciones_discos.json", "discos")):
        if not os.path.exists(pend): continue
        P = json.load(open(pend, encoding="utf-8")); P = list(P) if not isinstance(P, list) else P
        if not P: continue
        M = json.load(open(mem, encoding="utf-8")); hechos = []
        for k in P:
            if k in M and M[k] != k: continue
            try: M[k] = traduce(k); hechos.append(k)
            except Exception as ex: print("FALLO texto", type(ex).__name__)
        if hechos:
            json.dump(M, open(mem, "w", encoding="utf-8"), ensure_ascii=False, indent=0)
            registro[clave] = sorted(set(registro.get(clave, []) + hechos)); print(clave, len(hechos), "textos traducidos")
    if registro: json.dump(registro, open("traducciones_auto.json", "w", encoding="utf-8"), ensure_ascii=False, indent=0)

main()
