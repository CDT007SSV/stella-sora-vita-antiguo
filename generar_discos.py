#!/usr/bin/env python3
"""Genera discos/<id>.json (ficha de cada disco) desde los datos del juego (Hiro420/StellaSoraData).
Textos en ingles; se traducen con traducciones_discos.json. Lo que falte se queda en ingles y se lista en discos/pendientes.json.
Uso: STELLA_REPO=/ruta/a/StellaSoraData python3 generar_discos.py   (sin STELLA_REPO clona el repo)"""
import json, os, re, subprocess, tempfile, collections

SS = "https://raw.githubusercontent.com/AutumnVN/ssassets/main/export/assets/assetbundles/icon/"
ELEM = {1: "Neutral", 2: "Ignis", 3: "Aqua", 4: "Terra", 5: "Lux", 6: "Umbra", 7: "Ventus"}  # aprox.; la app usa su propio elemento

def repo():
    r = os.environ.get("STELLA_REPO")
    if r: return r
    d = tempfile.mkdtemp()
    subprocess.run(["git", "clone", "--depth", "1", "-q", "https://github.com/Hiro420/StellaSoraData.git", d], check=True, timeout=900)
    return d

def J(p): return json.load(open(p, encoding="utf-8"))
def rows(p):
    d = J(p); return list(d.values()) if isinstance(d, dict) else d

def plantilla(s):
    """{n} -> ⟦n-1⟧, quita las etiquetas de color, \x0b -> salto de linea"""
    s = re.sub(r"</?color[^>]*>", "", s or "")
    s = re.sub(r"##([^#]+)#\d+#", r"⟨\1⟩", s)
    s = re.sub(r"\{(\d+)\}", lambda m: "⟦%d⟧" % (int(m.group(1)) - 1), s)
    return s.replace("\x0b", "\n").replace("\\n", "\n")

def main():
    R = repo(); B = R + "/EN/bin"; LG = R + "/EN/language/en_US"
    MEM = J("traducciones_discos.json") if os.path.exists("traducciones_discos.json") else {}
    pend = set()
    def tr(s):
        if not s: return s
        es = MEM.get(s)
        if es: return es
        pend.add(s); return s
    marc = lambda s: sorted(re.findall(r"⟦\d+⟧", s))
    def trt(s):
        es = MEM.get(s)
        if es and marc(es) == marc(s): return es
        pend.add(s); return s

    Item = J(B + "/Item.json"); LI = J(LG + "/Item.json")
    NOMBRES = {LI.get("Item.%d.1" % x["Id"]) for x in rows(B + "/Disc.json")}
    _tr = tr
    def tr(s):
        return s if s in NOMBRES else _tr(s)
    LM = J(LG + "/MainSkill.json"); LS = J(LG + "/SecondarySkill.json"); LN = J(LG + "/SubNoteSkill.json"); LT = J(LG + "/DiscTag.json")
    MS = collections.defaultdict(list)
    for x in rows(B + "/MainSkill.json"): MS[x["GroupId"]].append(x)
    SSK = collections.defaultdict(list)
    for x in rows(B + "/SecondarySkill.json"):
        if x.get("GroupId"): SSK[x["GroupId"]].append(x)
    PG = collections.defaultdict(list)
    for x in rows(B + "/SubNoteSkillPromoteGroup.json"): PG[x["GroupId"]].append(x)
    AT = collections.defaultdict(list)
    for x in rows(B + "/Attribute.json"): AT[str(x["GroupId"])].append(x)
    EX = collections.defaultdict(list)
    for x in rows(B + "/DiscExtraAttribute.json"): EX[x["GroupId"]].append(x)
    PR = collections.defaultdict(list)
    for x in rows(B + "/DiscPromote.json"): PR[x["Id"] // 1000].append(x)
    LIM = collections.defaultdict(dict)
    for x in rows(B + "/DiscPromoteLimit.json"): LIM[x["Rarity"]][int(x["Phase"])] = int(x["MaxLevel"])

    def icon(p): return (SS + "discskill/" + p.split("/")[-1] + ".webp") if p else None
    def itm(i):
        k = str(i); n = LI.get("Item.%s.1" % k) or k
        ic = (Item.get(k) or {}).get("Icon", "")
        es = MEM.get("item:" + n)
        if not es and n != "Dorra": pend.add("item:" + n)
        return {"n": es or n, "ne": n, "iu": SS + "item/" + ic.split("/")[-1] + ".webp" if ic else None}

    notas = {}
    for k, v in LN.items():
        m = re.match(r"SubNoteSkill\.(\d+)\.1$", k)
        if m:
            i = m.group(1); notas[i] = {"n": tr(v), "ne": v, "d": tr(LN.get("SubNoteSkill.%s.2" % i, "")), "ic": SS + "note/note_%s.webp" % i}
    tags = {k.split(".")[1]: tr(v) for k, v in LT.items() if k.endswith(".1")}

    os.makedirs("discos", exist_ok=True)
    idx = {}; imgs = {}
    for D in rows(B + "/Disc.json"):
        did = D["Id"]; it = Item.get(str(did)) or {}
        name = LI.get("Item.%d.1" % did)
        if not name: continue
        grd = it.get("Rarity") or 3; rar = 6 - grd
        f = {"id": did, "ne": name, "r": rar, "tg": [tags.get(str(t), "") for t in D.get("Tags", [])]}
        ms = sorted(MS.get(D["MainSkillGroupId"], []), key=lambda x: x["Level"])
        if ms:
            f["mel"] = {"n": tr(LM.get(ms[0]["Name"], "")), "ne": LM.get(ms[0]["Name"], ""), "ic": icon(ms[0].get("Icon")), "bg": icon(ms[0].get("IconBg")),
                        "t": [trt(plantilla(LM.get(x["Desc"], ""))) for x in ms[:1]][0],
                        "v": [[x.get("Param%d" % i, "") for i in range(1, 9) if x.get("Param%d" % i) is not None] for x in ms]}
            # si la plantilla cambia entre niveles, guardarlas todas
            ts = [plantilla(LM.get(x["Desc"], "")) for x in ms]
            if len(set(ts)) > 1: f["mel"]["ts"] = [trt(t) for t in ts]
        f["arm"] = []
        for g in (D.get("SecondarySkillGroupId1"), D.get("SecondarySkillGroupId2")):
            if not g: continue
            sk = sorted(SSK.get(g, []), key=lambda x: x["Level"])
            if not sk: continue
            ts = [plantilla(LS.get(x["Desc"], "")) for x in sk]
            a = {"n": tr(LS.get(sk[0]["Name"], "")), "ne": LS.get(sk[0]["Name"], ""), "ic": icon(sk[0].get("Icon")), "bg": icon(sk[0].get("IconBg")),
                 "t": trt(ts[0]), "v": [[x.get("Param%d" % i, "") for i in range(1, 9) if x.get("Param%d" % i) is not None] for x in sk],
                 "nt": [json.loads(x.get("NeedSubNoteSkills") or "{}") for x in sk], "pt": [x.get("Score") for x in sk]}
            if len(set(ts)) > 1: a["ts"] = [trt(t) for t in ts]
            f["arm"].append(a)
        f["nf"] = [{"f": x.get("Phase", 0), "n": json.loads(x.get("SubNoteSkills") or "{}")} for x in sorted(PG.get(D["SubNoteSkillGroupId"], []), key=lambda x: x.get("Phase", 0))]
        # estadisticas
        lim = LIM.get(grd) or {}
        st = collections.defaultdict(list)
        for x in AT.get(str(D["AttrBaseGroupId"]), []):
            b = x.get("Break", 0) or 0
            if lim and b in lim and x["lvl"] > lim[b]: continue
            st[b].append([x["lvl"], x.get("Hp", 0), x.get("Atk", 0)])
        f["st"] = {str(b): sorted(v) for b, v in sorted(st.items())}
        f["ex"] = {str(x["Break"]): x.get("Atk", 0) for x in EX.get(D["AttrExtraGroupId"], [])}
        f["lim"] = {str(k): v for k, v in sorted(lim.items())}
        asc = []
        for i, x in enumerate(sorted(PR.get(D["PromoteGroupId"], []), key=lambda x: x["Id"]), 1):
            mats = []
            for n in (1, 2, 3, 4):
                if x.get("ItemId%d" % n): mats.append(dict(itm(x["ItemId%d" % n]), q=x.get("Num%d" % n, 1)))
            asc.append({"f": i, "m": mats, "o": x.get("ExpenseGold", 0)})
        f["asc"] = asc
        json.dump(f, open("discos/%d.json" % did, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
        idx[name] = did
        imgs[name] = SS + "outfit/" + (it.get("Icon") or "").split("/")[-1] + ".webp"
    json.dump({"ids": idx, "img": imgs, "notas": notas}, open("discos/indice.json", "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    json.dump(sorted(pend), open("discos/pendientes.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print("Discos generados:", len(idx), "| textos pendientes de traducir:", len(pend))

if __name__ == "__main__":
    main()
