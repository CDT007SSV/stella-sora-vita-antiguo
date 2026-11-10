# Genera ranking.json a partir de la hoja "Stella Sora Team Rankings" (por ZiLenTz).
# Uso:  python3 generar_ranking.py [archivo.xlsx]   (sin argumento descarga la hoja publica de Google).
# Si la descarga falla, no toca el ranking.json existente.
import sys, json, re, os, urllib.request, tempfile, time

SHEET = "1eGTh38V1VD-1O-yyMBB5gnlZw_ykt-WfFmE0Lg4XS8w"
URL = "https://docs.google.com/spreadsheets/d/%s/export?format=xlsx" % SHEET
# La hoja abrevia algunos nombres: se convierten al nombre completo que usa la app.
ALIAS = {"F. Noya": "Firstlight Noya", "S. Willow": "Suntide Willow", "S. Coronis": "Springseek Coronis", "S. Laru": "Snowish Laru"}

def descarga():
    r = urllib.request.Request(URL, headers={"User-Agent": "Mozilla/5.0"})
    d = urllib.request.urlopen(r, timeout=60).read()
    if d[:2] != b"PK": raise RuntimeError("la hoja no es publica (no devolvio un xlsx)")
    f = os.path.join(tempfile.mkdtemp(), "r.xlsx"); open(f, "wb").write(d); return f

def talento(v):
    if v is None or v == "": return ""
    if isinstance(v, (int, float)): return "T%d" % int(v)
    s = str(v).strip(); return "T" + s if re.match(r"^\d", s) else s

def main():
    import openpyxl
    ruta = sys.argv[1] if len(sys.argv) > 1 else descarga()
    V = openpyxl.load_workbook(ruta, data_only=True)["Raw Data"]
    H = openpyxl.load_workbook(ruta)["Raw Data"]
    def link(r, c):
        x = H.cell(row=r, column=c + 1)
        return x.hyperlink.target if x.hyperlink and x.hyperlink.target else ""
    out = []
    for i, row in enumerate(V.iter_rows(min_row=2, max_col=17, values_only=True), start=2):
        if not row[1] or not isinstance(row[2], (int, float)) or row[2] < 1e9: continue   # salta filas de relleno o de broma
        def slot(n, t, rl): 
            nm = row[n]
            if not nm or str(nm) == "None": return None
            nm = str(nm).strip()
            return {"n": ALIAS.get(nm, nm), "t": talento(row[t]) if t else talento(row[t]), "r": row[rl] or ""}
        s = [slot(3, 4, 5), slot(6, 7, 8), slot(9, 10, 11)]
        if not all(s): continue
        code = row[15] if isinstance(row[15], str) and re.match(r"^[A-Za-z0-9+/]{36}$", row[15].strip()) else ""
        out.append({"el": row[0], "team": str(row[1]).strip(), "dmg": float(row[2]), "s": s, "auto": row[12] or "",
                    "guide": link(i, 13) or (row[13] if isinstance(row[13], str) and row[13].startswith("http") else ""),
                    "src": link(i, 14) or (row[14] if isinstance(row[14], str) and row[14].startswith("http") else ""),
                    "code": code.strip() if code else ""})
    if len(out) < 5: raise RuntimeError("muy pocos equipos (%d): no se actualiza" % len(out))
    out.sort(key=lambda x: -x["dmg"])
    top = out[0]["dmg"]
    for x in out: x["pct"] = round(x["dmg"] / top, 4)
    meta = {"fuente": "Stella Sora Team Rankings · ZiLenTz", "url": "https://docs.google.com/spreadsheets/d/%s/htmlview" % SHEET,
            "kofi": "https://ko-fi.com/zilentz_penguin", "generado": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "supuestos": ["Discos: C1 para los limitados y del pase de batalla, C6 para los gratuitos (principal y apoyos).",
                          "Emblemas: las dos mejores estadísticas (1 rara y 1 genérica), o tres a nivel 70 (2 raras y 1 genérica).",
                          "Talentos: T0 para limitados, T3 para estándar y T5 para personajes de 4 estrellas, para comparar de forma justa."]}
    prev = {}
    try: prev = json.load(open("ranking.json", encoding="utf-8"))
    except Exception: pass
    if prev.get("equipos") == out:
        print("Sin cambios (%d equipos)." % len(out)); return
    json.dump({"meta": meta, "equipos": out}, open("ranking.json", "w", encoding="utf-8"), ensure_ascii=False, indent=0)
    print("ranking.json: %d equipos." % len(out))

if __name__ == "__main__":
    try: main()
    except Exception as e:
        print("No se actualizó el ranking:", e); sys.exit(0)
