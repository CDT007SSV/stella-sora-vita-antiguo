#!/usr/bin/env python3
"""Genera, por personaje, los textos de afinidad del juego:
 - archivo del personaje (se desbloquea al subir de afinidad)
 - recuerdos de citas (eventos especiales de cita)
Salida: afinidad/<id>.json (ingles) y textos/AF_<id>.txt (para traducir; solo se crea si no existe).
Rutas: SSD (datos del juego) y REPO (este repo) por variables de entorno."""
import json,os,re,glob
HERE=os.path.dirname(os.path.abspath(__file__))
REPO=os.environ.get('REPO',HERE+'/').rstrip('/')+'/'
SSD=os.environ.get('SSD','/home/claude/src/ssd/EN/').rstrip('/')+'/'
J=lambda p:json.load(open(p,encoding='utf-8'))
A=J(SSD+'bin/CharacterArchive.json');C=J(SSD+'bin/CharacterArchiveContent.json');TC=J(SSD+'language/en_US/CharacterArchiveContent.json')
D=J(SSD+'bin/DatingCharacterEvent.json');TD=J(SSD+'language/en_US/DatingCharacterEvent.json')
try:PR=J(REPO+'presets.json')
except Exception:PR={}
os.makedirs(REPO+'afinidad',exist_ok=True);os.makedirs(REPO+'textos',exist_ok=True)
tx=lambda T,k:(T.get(k) if isinstance(k,str) else None) or ''
def clean(s,nm):return str(s).replace('==DATING_CHARACTER==',nm).strip()
by={}
for v in A.values():
    if v['ArchType'] in(2,3) and str(v['RecordId']) in C:
        c=C[str(v['RecordId'])]
        by.setdefault(v['CharacterId'],{'a':[],'d':[]})['a'].append({'i':v['RecordId'],'tp':v['ArchType'],'n':v.get('UnlockAffinityLevel') or 0,'s':v['Sort'],
            't':tx(TC,c.get('Title')),'c':tx(TC,c.get('Content')),'u':tx(TC,c.get('UpdateContent1'))})
for v in D.values():
    if v['DatingEventType']==5 and v.get('Name'):
        cid=v['DatingEventParams'][0]
        by.setdefault(cid,{'a':[],'d':[]})['d'].append({'i':v['Id'],'n':tx(TD,v['Name']),'p':tx(TD,v.get('Clue')),'m':tx(TD,v.get('Memory')),
            'x':v.get('Affinity') or 0,'g':v.get('CG') or ''})
nuevos=[]
for cid,o in sorted(by.items()):
    nm=(PR.get(str(cid)) or {}).get('n','')
    o['a'].sort(key=lambda x:(x['n'],x['s']))
    for x in o['a']:x.pop('s',None);x['t']=clean(x['t'],nm);x['c']=clean(x['c'],nm);x['u']=clean(x['u'],nm)
    o['d'].sort(key=lambda x:x['i'])
    for x in o['d']:
        x['n']=clean(x['n'],nm);x['p']=clean(x['p'],nm);x['m']=clean(x['m'],nm)
    json.dump(o,open(REPO+'afinidad/%d.json'%cid,'w',encoding='utf-8'),ensure_ascii=False,separators=(',',':'))
    pt=REPO+'textos/AF_%d.txt'%cid
    if os.path.exists(pt):continue
    L=lambda s:str(s).replace('\r','').replace('\n','\\n')
    with open(pt,'w',encoding='utf-8') as f:
        f.write('# Afinidad de %s: archivo del personaje y recuerdos de citas\n'%(nm or cid))
        f.write('# Traduce solo lo que va después de "|". No cambies la clave de la izquierda (a123.t, d456.m...).\n')
        f.write('# Los saltos de línea van escritos como \\n: déjalos donde van. Respeta ==PLAYER_NAME== y las marcas <...>.\n\n')
        f.write('## Archivo (t = título, c = texto, u = texto extra)\n')
        for x in o['a']:
            f.write('a%d.t | %s\n'%(x['i'],L(x['t'])))
            if x['c']:f.write('a%d.c | %s\n'%(x['i'],L(x['c'])))
            if x['u']:f.write('a%d.u | %s\n'%(x['i'],L(x['u'])))
        f.write('\n## Citas (n = nombre, p = pista, m = recuerdo)\n')
        for x in o['d']:
            f.write('d%d.n | %s\n'%(x['i'],L(x['n'])))
            if x['p']:f.write('d%d.p | %s\n'%(x['i'],L(x['p'])))
            if x['m']:f.write('d%d.m | %s\n'%(x['i'],L(x['m'])))
    nuevos.append('textos/AF_%d.txt'%cid)
if nuevos:
    with open(REPO+'textos/_pendientes.txt','a',encoding='utf-8') as f:
        for x in nuevos:f.write(x+'\n')
print('personajes:',len(by),'textos nuevos:',len(nuevos))
