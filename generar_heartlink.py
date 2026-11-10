#!/usr/bin/env python3
"""Genera las conversaciones de Heartlink (el telefono del juego) por personaje.
Salida: heartlink/<id>.json, heartlink/indice.json (ingles) y textos/HL_<id>.txt (para traducir; solo si no existe).
Rutas: LUA (guiones), SSD (datos del juego), REPO por variables de entorno."""
import json,os,glob,re,sys
HERE=os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0,os.path.join(HERE,'lector_gen'))
import luaload
REPO=os.environ.get('REPO',HERE+'/').rstrip('/')+'/'
LUA=os.environ.get('LUA','/home/claude/src/sslua/Lua/Game/UI/Avg/_en/Config/').rstrip('/')+'/'
PRE=os.environ.get('PRESET',os.path.join(os.path.dirname(LUA.rstrip('/')),'Preset')+'/')
SSD=os.environ.get('SSD','/home/claude/src/ssd/EN/').rstrip('/')+'/'
J=lambda p:json.load(open(p,encoding='utf-8'))
CH=J(SSD+'bin/Chat.json')
AC={c['id']:c for c in luaload.load(PRE+'AvgCharacter.lua')}
try:PR=J(REPO+'presets.json')
except Exception:PR={}
book={}
for v in CH.values():book.setdefault(v['AVGId'],v['AddressBookId'])
PLAYER='avg3_100'
os.makedirs(REPO+'heartlink',exist_ok=True);os.makedirs(REPO+'textos',exist_ok=True)
def parse(path,cid):
    """-> grupos [{id, m:[msg]}]; msg = {t,x,w?} | {t:'ch',o:[..],b:[[msgs]..]}"""
    cmds=luaload.load(path);groups=[];cur=None;stack=[]
    def out():return stack[-1]['cur'] if stack else cur['m']
    for c in cmds:
        k=c['cmd'];p=c.get('param') or []
        if k=='SetGroupId':cur={'id':str(p[0]),'m':[]};groups.append(cur);stack=[]
        elif k=='SetPhoneMsg' and cur is not None:
            ty,sp,em,isimg=p[0],p[1],p[2],p[3];tx=p[7] if len(p)>7 else ''
            mine=sp==PLAYER
            if ty==5:m={'t':'s','x':tx}
            elif ty in(3,4):m={'t':'p' if mine else 'c','e':em,'i':1 if str(isimg)=='1' else 0}
            else:m={'t':'p' if mine else 'c','x':tx}
            if not mine and sp!=('avg1_%s'%cid) and ty!=5:m['w']=sp
            if m['t'] in('c','p') and 'x' in m and m['x']=='' :continue
            out().append(m)
        elif k=='SetPhoneMsgChoiceBegin' and cur is not None:
            opts=[x for x in p[1:7] if x]
            ch={'t':'ch','o':opts,'b':[[] for _ in opts]};out().append(ch);stack.append({'ch':ch,'cur':None,'i':-1})
            stack[-1]['cur']=[]  # mensajes antes del primer salto se descartan
        elif k=='SetPhoneMsgChoiceJumpTo' and stack:
            s=stack[-1];i=int(p[1])-1
            if 0<=i<len(s['ch']['b']):s['cur']=s['ch']['b'][i]
        elif k=='SetPhoneMsgChoiceEnd' and stack:stack.pop()
    for g in groups:
        def dd(ms):
            for m in ms:
                if m['t']=='ch':
                    for i,b in enumerate(m['b']):
                        if b and b[0]['t']=='p' and b[0].get('x')==m['o'][i]:b.pop(0);m.setdefault('r',[0]*len(m['o']))[i]=1
                        dd(b)
        dd(g['m'])
    return groups
def strings(msgs,acc):
    for m in msgs:
        if m['t']=='ch':
            for o in m['o']:acc.append(o)
            for b in m['b']:strings(b,acc)
        elif 'x' in m:acc.append(m['x'])
    return acc
def put(msgs,tr,it):
    """aplica traducciones en el mismo orden que strings()"""
    for m in msgs:
        if m['t']=='ch':
            m['o']=[next(it) for _ in m['o']]
            for b in m['b']:put(b,tr,it)
        elif 'x' in m:m['x']=next(it)
by={}
for f in sorted(glob.glob(LUA+'PM*.lua')):
    aid=os.path.basename(f)[:-4];cid=book.get(aid)
    if cid is None:continue
    gs=parse(f,cid);k=len(by.get(cid,[]))  # k solo para ordenar
    letra=chr(ord('A')+len({x['id'][0] for x in by.get(cid,[])}))
    for g in gs:g['id']=letra+g['id']
    by.setdefault(cid,[]).extend(gs)
idx=[]
L=lambda s:str(s).replace('\r','').replace('\n','\\n')
for cid,groups in sorted(by.items()):
    names={}
    for g in groups:
        def walk(ms):
            for m in ms:
                if m['t']=='ch':
                    for b in m['b']:walk(b)
                elif m.get('w'):names[m['w']]=(AC.get(m['w']) or {}).get('name',m['w'])
        walk(g['m'])
    nm=(PR.get(str(cid)) or {}).get('n') or (AC.get('avg1_%s'%cid) or {}).get('name') or str(cid)
    json.dump({'id':cid,'n':nm,'w':names,'g':groups},open(REPO+'heartlink/%d.json'%cid,'w',encoding='utf-8'),ensure_ascii=False,separators=(',',':'))
    idx.append({'id':cid,'n':nm,'c':len(groups)})
    pt=REPO+'textos/HL_%d.txt'%cid
    if os.path.exists(pt):continue
    with open(pt,'w',encoding='utf-8') as f:
        f.write('# Heartlink de %s: conversaciones del telefono\n'%nm)
        f.write('# Traduce solo lo que va después de "|". No cambies la clave de la izquierda (01.0001).\n')
        f.write('# Los saltos de línea van escritos como \\n. Respeta ==PLAYER_NAME==. [Tú] = tus mensajes y opciones.\n')
        f.write('# Las opciones [Opción] son lo que el jugador puede elegir responder.\n')
        for g in groups:
            f.write('\n## Conversación %s\n'%g['id']);n=0
            def w(ms,f=f,g=g):
                global n
                for m in ms:
                    if m['t']=='ch':
                        for o in m['o']:
                            n+=1;f.write('%s.%04d [Opción] | %s\n'%(g['id'],n,L(o)))
                        for b in m['b']:w(b)
                    elif 'x' in m:
                        n+=1;tag='Sistema' if m['t']=='s' else ('Tú' if m['t']=='p' else nm)
                        f.write('%s.%04d [%s] | %s\n'%(g['id'],n,tag,L(m['x'])))
            w(g['m'])
    with open(REPO+'textos/_pendientes.txt','a',encoding='utf-8') as pf:pf.write('textos/HL_%d.txt\n'%cid)
json.dump(idx,open(REPO+'heartlink/indice.json','w',encoding='utf-8'),ensure_ascii=False,separators=(',',':'))
print('personajes:',len(idx),'conversaciones:',sum(x['c'] for x in idx))
