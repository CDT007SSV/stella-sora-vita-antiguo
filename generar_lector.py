#!/usr/bin/env python3
"""Genera el lector de historias a partir de los guiones del juego.
- Crea lector-<acto>.json y textos/<acto>.txt SOLO si faltan (nunca pisa traducciones).
- Regenera siempre lector-meta.json (mapas de capitulos, siguiente acto, nombres, botones del lector).
Rutas por variables de entorno: LUA (guiones), SSD (datos del juego), REPO (este repo).
Uso: python3 generar_lector.py [--force]   (--force vuelve a crear los lector-*.json aunque existan; los textos nunca)"""
import json,glob,os,re,sys,unicodedata
HERE=os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0,os.path.join(HERE,'lector_gen'))
import luaload,conv
REPO=os.environ.get('REPO',HERE+'/').rstrip('/')+'/'
LUA=os.environ.get('LUA','/home/claude/src/sslua/Lua/Game/UI/Avg/_en/Config/').rstrip('/')+'/'
PRE=os.environ.get('PRESET',os.path.join(os.path.dirname(LUA.rstrip('/')),'Preset')+'/')
SSD=os.environ.get('SSD','/home/claude/src/ssd/EN/').rstrip('/')+'/'
FORCE='--force' in sys.argv
AC={c['id']:c for c in luaload.load(PRE+'AvgCharacter.lua')}
def J(p):return json.load(open(p,encoding='utf-8'))
S=J(SSD+'bin/Story.json');T=J(SSD+'language/en_US/Story.json')
COND={v['ConditionId']:v.get('StoryId_a',[]) for v in J(SSD+'bin/StoryCondition.json').values()}
for v in S.values():
    if not v.get('ParentStoryId') and v.get('ConditionId') in COND: v['ParentStoryId']=COND[v['ConditionId']]
tr=lambda k:T.get(k,k) if isinstance(k,str) else k
A=J(SSD+'bin/ActivityStory.json');AT=J(SSD+'language/en_US/ActivityStory.json')
C=J(SSD+'bin/ActivityStoryChapter.json');CT=J(SSD+'language/en_US/ActivityStoryChapter.json')
atr=lambda k:AT.get(k,k) if isinstance(k,str) else k
# ---- datos de la app (data.js + auto.json) ----
dj=open(REPO+'data.js',encoding='utf-8').read()
def jsconst(name):
    m=re.search(r'^const %s\s*=\s*'%name,dj,re.M)
    if not m:return []
    dec=json.JSONDecoder();return dec.raw_decode(dj[m.end():])[0]
EV=jsconst('EVENTS');NT=jsconst('NOVA_TIMES');CS=jsconst('CHAR_STORIES')
try:AUTO=J(REPO+'auto.json')
except Exception:AUTO={}
H=AUTO.get('historias',{})
TES={m.group(1):m.group(2) for m in re.finditer(r'"number": "([0-9.]+)",\s*"titleEs": "([^"]*)"',dj)}
TEN={str(x['number']):x['titleEn'] for x in H.get('principal',[])}
slug=lambda t:re.sub(r'[^a-z0-9]','',unicodedata.normalize('NFKD',t.lower()))[:25]
evid=lambda n:re.sub(r'^-|-$','',re.sub(r'[^a-z0-9]+','-',n.lower())[:40])
evby={slug(e['name']):e for e in EV}
nts={int(n['number']):n for n in NT}
for x in H.get('novaTimes',[]):nts.setdefault(int(x['number']),{'number':x['number'],'name':x['name']})
try:PRS=J(REPO+'presets.json')
except Exception:PRS={}
PN={v['n']:k for k,v in PRS.items()}
chars={x['name']:str(x['cid']) for x in AUTO.get('personajes',[]) if x.get('cid') is not None}
for n,i in PN.items():chars.setdefault(n,i)
csn=[c['name'] for c in CS]+[n for n in chars if n not in {c['name'] for c in CS}]
# nombres ya traducidos (de los lectores existentes 0-3)
OLDN={}
for jf in sorted(glob.glob(REPO+'lector_gen/nombres.json')):
    OLDN=J(jf)
if not OLDN:
    for jf in sorted(glob.glob(REPO+'lector-STm0[0-3]*.json')):
        dd=J(jf)
        for k,v in dd['names'].items():
            e=dd.get('en',{}).get(k,'')
            if v and e and v!=e and not re.search(r'[A-Z]{2}',v): OLDN[e]=v
    OLDN.pop('Poisoned UH Employee A',None)
    json.dump(OLDN,open(REPO+'lector_gen/nombres.json','w',encoding='utf-8'),ensure_ascii=False,indent=0)
os.makedirs(REPO+'textos',exist_ok=True)
NEW=[]
def slots(steps,out):
    for s in steps:
        k=s[0]
        if k=='intro': out+= [(s,1),(s,2),(s,3)]
        elif k=='head': out.append((s,1))
        elif k=='say': out.append((s,2))
        elif k=='choice':
            for i in range(len(s[1])): out.append((s[1],i))
            for b in s[2]: slots(b,out)
    return out
def speakers(steps,acc):
    for s in steps:
        if s[0]=='say': acc.add(s[1])
        if s[0] in('show','ctl','hide'): acc.add(s[1])
        if s[0]=='chd': acc.add(s[3])
        if s[0]=='choice':
            for b in s[2]: speakers(b,acc)
    return acc
def label(ix,title):
    ix=tr(ix)
    m=re.fullmatch(r'0*(\d+)([A-Z]?)',ix)
    if m: return m.group(1)+m.group(2)+' · '+title
    if ix=='The End': return 'Final: '+title
    if ix=='The True End': return 'Final verdadero · '+title
    if ix.startswith('Interlude'):
        n={'I':'1','Ⅰ':'1','Ⅱ':'2','II':'2'}.get(ix.split()[-1],'') if ' ' in ix else ''
        return ('Interludio '+n).strip()+' · '+title
    if ix=='Epilogue': return 'Epílogo · '+title
    if ix=='Reminiscence': return 'Recuerdo · '+title
    return ix+' · '+title
NUMW={'One':1,'Two':2,'Three':3,'Four':4,'Five':5,'Six':6,'Seven':7,'Eight':8,'Nine':9,'Ten':10,'Eleven':11,'Twelve':12}
def elabel(ix,title):
    m=re.fullmatch(r'Act (\w+)',ix)
    if m and m.group(1) in NUMW: return '%d · %s'%(NUMW[m.group(1)],title)
    if ix=='EX': return 'EX · '+title
    return label(ix,title)
def dispname(nm):return OLDN.get(nm) or OLDN.get(re.sub(r' [A-Z]$','',nm)) or re.sub(r' [A-Z]$','',nm)
def emit_act(sid,head,nomb):
    """crea lector-<sid>.json y textos/<sid>.txt si faltan"""
    pj=REPO+'lector-%s.json'%sid;pt=REPO+'textos/%s.txt'%sid
    if not os.path.exists(LUA+sid+'.lua'):print('SIN GUION',sid);return
    if os.path.exists(pj) and os.path.exists(pt) and not FORCE:return
    steps=conv.conv(luaload.load(LUA+sid+'.lua'))
    ids=sorted(i for i in speakers(steps,set()) if i)
    names={};en={}
    for i in ids:
        cc=AC.get(i);n=(cc['name'] if cc else i);en[i]=n;names[i]=dispname(n)
    if FORCE or not os.path.exists(pj):
        json.dump({'id':sid,'names':names,'en':en,'tx':1,'steps':steps},open(pj,'w',encoding='utf-8'),ensure_ascii=False,separators=(',',':'))
    if os.path.exists(pt):return
    sl=slots(steps,[])
    with open(pt,'w',encoding='utf-8') as f:
        f.write('# %s · %s\n'%(head,nomb))
        f.write('# Traduce solo lo que va después de "|". No cambies el número ni lo que está entre [corchetes].\n')
        f.write('# Respeta las marcas como ==W==, ==PLAYER_NAME== o ==SEX==.\n\n## Nombres\n')
        for i in ids:
            if names[i] and i not in('0','1'): f.write('N:%s | %s\n'%(i,names[i]))
        f.write('\n## Texto\n')
        for q,(arr,ix) in enumerate(sl,1):
            txt=str(arr[ix]).replace('\n',' ')
            if arr and arr[0]=='say':
                sp=arr[1];tag='['+('Narración' if sp=='0' else ('Tú' if sp=='avg3_100' else names.get(sp,sp) or sp))+']'
            elif arr and arr[0]=='intro': tag='[Intro]'
            elif arr and arr[0]=='head': tag='[Lugar y hora]'
            else: tag='[Opción]'
            f.write('%04d %s | %s\n'%(q,tag,txt))
    NEW.append('textos/%s.txt'%sid)
def emit_chapfile(pre,head,lines):
    pt=REPO+'textos/%s.txt'%pre
    if os.path.exists(pt):return
    with open(pt,'w',encoding='utf-8') as f:
        f.write('# %s — nombres de los actos y batallas\n'%head)
        f.write('# Traduce solo lo que va después de "|". No cambies lo de la izquierda.\n\n')
        for k,t in sorted(lines,key=lambda x:(x[0].startswith('@'),x[0])): f.write('%s | %s\n'%(k,t))
    NEW.append('textos/%s.txt'%pre)
CAPS={};SIG={};NOMB={};ALT={};LECT={}
# ---------- 1) Historia principal (capitulos 4 en adelante) ----------
bych={}
for v in S.values():
    if v.get('Chapter',0)>=4 and v.get('AvgLuaName','').startswith('STm') or (v.get('Chapter',0)>=4 and v.get('IsBattle')):bych.setdefault(v['Chapter'],[]).append(v)
for chn in sorted(bych):
    st=[v for v in bych[chn] if (v.get('IsBattle') and tr(v['Title'])!='Stay tuned') or (v.get('AvgLuaName') and os.path.exists(LUA+v['AvgLuaName']+'.lua'))];lua=[v['AvgLuaName'] for v in st if v.get('AvgLuaName')]
    if not lua:continue
    pre=sorted(lua)[0].split('_')[0];m=re.fullmatch(r'STm(\d+)(x5)?',pre)
    if not m:continue
    dg=int(m.group(1));esp=m.group(2) or dg>=1000
    dg=dg//1000-1 if dg>=1000 else dg;num=str(dg)+('.5' if esp else '')  # los especiales de historia principal (STm10001...) son el capitulo anterior + .5
    ttl=TES.get(num) or TEN.get(num) or ''
    head=('Capítulo '+num if '.' not in num else 'Especial '+num)+(' · '+ttl if ttl else '')
    byid={v['StoryId']:v for v in st};chap_lines=[]
    def nodeid(v):
        if v.get('IsBattle'): return '@'+tr(v['Index'])+'|'+tr(v['Title'])
        return ('!' if v.get('IsBranch') else '')+v['StoryId']
    plain=lambda t:t.lstrip('!')
    dep={}
    def d(sid):
        if sid in dep: return dep[sid]
        v=byid[sid];ps=[p for p in v.get('ParentStoryId',[]) if p in byid]
        dep[sid]=0;dep[sid]=1+max([d(p) for p in ps]) if ps else 0;return dep[sid]
    for sid in byid: d(sid)
    cols=[[] for _ in range(max(dep.values())+1)]
    for v in sorted(st,key=lambda v:v['Id']): cols[dep[v['StoryId']]].append(nodeid(v))
    edges=[];kids={}
    for v in sorted(st,key=lambda v:v['Id']):
        for p in v.get('ParentStoryId',[]):
            if p in byid:
                edges.append([plain(nodeid(byid[p])) if not byid[p].get('IsBattle') else nodeid(byid[p]), plain(nodeid(v)) if not v.get('IsBattle') else nodeid(v)])
                kids.setdefault(p,[]).append(v)
    CAPS[pre]=[head,cols,edges]
    def nxt(sid):
        out=[]
        for k in kids.get(sid,[]):
            if k.get('IsBattle'): out+= [x for x in nxt(k['StoryId'])]
            else: out.append(k)
        return out
    for v in st:
        if v.get('IsBattle'): continue
        sid=v['StoryId'];title=tr(v['Title']);NOMB[sid]=label(v['Index'],title);chap_lines.append((sid,title))
        ks=nxt(sid)
        if v.get('IsBranch'):
            ps=[p for p in v.get('ParentStoryId',[]) if p in byid]
            if ps: SIG[sid]=ps[0]
            continue
        main=[k for k in ks if not k.get('IsBranch')]
        if ks:
            SIG[sid]=(main or ks)[0]['StoryId']
            alts=[k for k in ks if k['StoryId']!=SIG[sid]]
            if alts: ALT[sid]=[[k['StoryId'],('Final alternativo: ' if k.get('IsBranch') else 'Ruta alterna: ')] for k in alts]
    for v in st:
        if v.get('IsBattle'): chap_lines.append(('@'+tr(v['Index']),tr(v['Title'])))
    emit_chapfile(pre,head,chap_lines)
    for v in sorted(st,key=lambda v:v['Id']):
        sid=v.get('AvgLuaName')
        if sid: emit_act(sid,head,NOMB.get(sid,sid))
    LECT['ch:'+num]=sorted(lua)[0] if False else [v for v in sorted(st,key=lambda v:v['Id']) if v.get('AvgLuaName')][0]['AvgLuaName']
# ---------- 2) Eventos ----------
for c in C.values():
    chid=c['ChapterId'];title=CT.get(c['Title'],c['Title'])
    ev=evby.get(slug(title))
    st=[v for v in A.values() if v['ChapterId']==chid]
    fl=[v for v in st if v.get('AvgLuaName')]
    if not fl:continue
    first=fl[0]['AvgLuaName'];pre='_'.join(first.split('_')[:2]);byid={v['StoryId']:v for v in st}
    nb=0
    for v in sorted(st,key=lambda v:v['Id']):
        if v.get('IsBattle'):
            nb+=1;ix=atr(v['Index']);v['_bt']=ix if re.fullmatch(r'BT\d+',ix) else 'BT%02d'%nb
    def nodeid(v):
        if v.get('IsBattle'): return '@'+v['_bt']+'|'+atr(v['Title'])
        return ('!' if v.get('IsBranch') else '')+v['StoryId']
    dep={}
    def d(sid):
        if sid in dep: return dep[sid]
        ps=[p for p in byid[sid].get('ParentStoryId',[]) if p in byid]
        dep[sid]=0;dep[sid]=1+max([d(p) for p in ps]) if ps else 0;return dep[sid]
    for sid in byid: d(sid)
    cols=[[] for _ in range(max(dep.values())+1)]
    for v in sorted(st,key=lambda v:v['Id']): cols[dep[v['StoryId']]].append(nodeid(v))
    edges=[];kids={}
    tok=lambda v: nodeid(v) if v.get('IsBattle') else nodeid(v).lstrip('!')
    for v in sorted(st,key=lambda v:v['Id']):
        for p in v.get('ParentStoryId',[]):
            if p in byid: edges.append([tok(byid[p]),tok(v)]);kids.setdefault(p,[]).append(v)
    nm=(ev or {}).get('nombre') or title
    head='Evento · '+nm;CAPS[pre]=[head,cols,edges]
    def nxt(sid):
        out=[]
        for k in kids.get(sid,[]):
            out+= nxt(k['StoryId']) if k.get('IsBattle') else [k]
        return out
    chap_lines=[]
    for v in sorted(st,key=lambda v:v['Id']):
        if v.get('IsBattle'): chap_lines.append(('@'+v['_bt'],atr(v['Title'])));continue
        sid=v['StoryId'];t=atr(v['Title'])
        NOMB[sid]=elabel(atr(v['Index']),t);chap_lines.append((sid,t))
        ks=nxt(sid)
        if v.get('IsBranch'):
            ps=[p for p in v.get('ParentStoryId',[]) if p in byid]
            if ps: SIG[sid]=ps[0]
            continue
        main=[k for k in ks if not k.get('IsBranch')]
        if ks:
            SIG[sid]=(main or ks)[0]['StoryId']
            alts=[k for k in ks if k['StoryId']!=SIG[sid]]
            if alts: ALT[sid]=[[k['StoryId'],('Final alternativo: ' if k.get('IsBranch') else 'Ruta alterna: ')] for k in alts]
    emit_chapfile(pre,head,chap_lines)
    LECT['ev:'+(ev['id'] if ev else evid(title))]=first
    for v in sorted(st,key=lambda v:v['Id']):
        sid=v.get('AvgLuaName')
        if sid: emit_act(sid,head,NOMB[sid])
# ---------- 3) Nova Times ----------
for num,n in sorted(nts.items()):
    pre='STsp_%02d'%num;files=sorted(glob.glob(LUA+pre+'_*.lua'))
    if not files:continue
    ids_=[os.path.basename(f)[:-4] for f in files];nm=n.get('nombre') or n['name']
    head='Nova Times #%02d · %s'%(num,nm)
    CAPS[pre]=[head,[[i] for i in ids_],[[ids_[k],ids_[k+1]] for k in range(len(ids_)-1)]]
    LECT['nt:%d'%num]=ids_[0]
    for k in range(len(ids_)-1): SIG[ids_[k]]=ids_[k+1]
    chap=[]
    for k,sid in enumerate(ids_):
        it=[s for s in conv.conv(luaload.load(LUA+sid+'.lua')) if s[0]=='intro'] if not (os.path.exists(REPO+'lector-%s.json'%sid) and sid in ()) else []
        try:
            lj=J(REPO+'lector-%s.json'%sid);it=[s for s in lj['steps'] if s[0]=='intro']
        except Exception:pass
        tit=it[0][2] if it else n['name'];NOMB[sid]='%d · %s'%(k+1,tit);chap.append((sid,tit))
    emit_chapfile(pre,head,chap)
    for k,sid in enumerate(ids_):emit_act(sid,head,NOMB[sid])
# ---------- 4) Historias de personaje (CG_<id>_NN) ----------
for nm in csn:
    cid=chars.get(nm)
    if not cid:continue
    pre='CG_%s'%cid;files=sorted(glob.glob(LUA+pre+'_*.lua'))
    if not files:continue
    ids_=[os.path.basename(f)[:-4] for f in files];head='Historia de %s'%nm
    CAPS[pre]=[head,[[i] for i in ids_],[[ids_[k],ids_[k+1]] for k in range(len(ids_)-1)]]
    LECT['cs:%s'%nm]=ids_[0]
    for k in range(len(ids_)-1): SIG[ids_[k]]=ids_[k+1]
    chap=[]
    for k,sid in enumerate(ids_):
        try:
            lj=J(REPO+'lector-%s.json'%sid);it=[s for s in lj['steps'] if s[0]=='intro']
        except Exception:
            it=[s for s in conv.conv(luaload.load(LUA+sid+'.lua')) if s[0]=='intro']
        tit=it[0][2] if it else nm;NOMB[sid]='%d · %s'%(k+1,tit);chap.append((sid,tit))
    emit_chapfile(pre,head,chap)
    for sid in ids_:emit_act(sid,head,NOMB[sid])
# ---------- 5) Recuerdos de disco (CG_disc<N>): se enlazan al disco por el nombre ----------
try:DIDX=J(REPO+'discos/indice.json')['ids']
except Exception:DIDX={}
for f in sorted(glob.glob(LUA+'CG_disc*.lua')):
    sid=os.path.basename(f)[:-4]
    try:it=[x for x in conv.conv(luaload.load(f)) if x[0]=='intro']
    except Exception as ex:print('ERROR',sid,ex);continue
    nm=it[0][2] if it else ''
    if nm not in DIDX:print('DISCO SIN COINCIDENCIA',sid,nm);continue
    pre='CGD_'+sid[3:];head='Recuerdo de disco · '+nm
    CAPS[pre]=[head,[[sid]],[]];NOMB[sid]='1 · '+nm;LECT['disc:'+nm]=sid
    emit_chapfile(pre,head,[(sid,nm)]);emit_act(sid,head,NOMB[sid])
LECT.update({'ev:guild-sweet-guild':'STm03_00_a','ev:beyond-the-dream':'STm04_01','ev:miracle-of-a-flicker':'STm06_00'})
json.dump({'CAPS':CAPS,'SIG':SIG,'NOMB':NOMB,'ALT':ALT,'LECT':LECT},open(REPO+'lector-meta.json','w',encoding='utf-8'),ensure_ascii=False,separators=(',',':'),sort_keys=True)
if NEW:
    with open(REPO+'textos/_pendientes.txt','a',encoding='utf-8') as f:
        for x in NEW:f.write(x+'\n')
print('actos nuevos:',len(NEW));print('\n'.join(NEW[:50]))
