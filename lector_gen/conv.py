import luaload,json,re
def em(v):
    if v is None or v in('none','close'): return None
    return v[10:] if v.startswith('avg_emoji_') else v
def clean(t):
    t=re.sub(r'<[^>]*>','',t or '').replace('==RT==',' ')
    return re.sub(r'  +',' ',t).strip()
def nn(v): return None if v=='none' else v
def conv(L):
    root=[];out=root;stack=[]
    def W(t):
        if not t: return
        if out and out[-1][0]=='w': out[-1][1]=round(out[-1][1]+t,4)
        else: out.append(['w',t])
    skip=0
    for x in L:
        c=x['cmd'];p=x.get('param') or []
        if c=='CheckBECase': skip=0 if p[1]==1 else 1;continue
        if c=='CheckBEEnd': skip=0;continue
        if c=='IfUnlockElse': skip=1;continue
        if c=='IfUnlockEnd': skip=0;continue
        if skip: continue
        if c=='SetIntro': out.append(['intro',p[1],p[2],p[3]])
        elif c=='SetBg':
            out.append(['bg',p[1],p[0],p[4]])
            if p[5]: W(p[4])
        elif c=='CtrlBg':
            if not(p[3] is None and p[4] is None and p[5] is None and nn(p[10]) is None):
                out.append(['cbg',p[0],p[3],p[4],p[5],p[11],p[12],None,None,nn(p[10])])
            if p[13] and p[12]: W(p[12])
        elif c=='SetSceneHeading':
            out.append(['head',', '.join([p[0],p[1]+' '+p[2]]+[q for q in p[3:] if q])])
        elif c=='SetBGM': out.append(['bgm',p[3] if p[0]==0 else ''])
        elif c=='Wait': W(p[0])
        elif c=='SetAudio': out.append(['se',p[1]])
        elif c=='SetFrontObj':
            out.append(['obj',p[2],p[1],p[3],p[4]] if p[0]==0 else ['objx'])
            if p[6] and p[5]: W(p[5])
        elif c=='SetTalk': out.append(['say',p[1],clean(p[7]),p[0],p[4]])
        elif c=='SetGoOn': out.append(['goon'])
        elif c=='SetChar':
            if p[0]==0: out.append(['show',p[3],p[4],p[5],p[8],p[9],p[10],p[1],em(p[6]) if em(p[6]) else (em(p[16]) if isinstance(p[16],str) else None),p[13]])
            else: out.append(['hide',p[3]])
        elif c=='CtrlChar':
            out.append(['ctl',p[0],p[1],p[2],em(p[3]),p[5],p[6],p[7],p[10],nn(p[11]),p[13],p[17]])
            if p[16]: out.append(['hide',p[0],p[17] or 0])
            if p[18] and p[17]: W(p[17])
        elif c=='SetTrans':
            out.append(['trn',p[0],p[1],p[4],p[5],p[6]])
            if p[7]: W(p[6])
        elif c=='SetFx': out.append(['fx',p[0],p[1],p[2],p[3]])
        elif c=='SetCharHead': out.append(['chd',p[0],p[1],p[5],p[6],p[7],em(p[8])])
        elif c=='CtrlStage':
            if p[12] and p[11]: W_after=p[11]
            else: W_after=0
            if p[3] is None and p[4] is None and p[5] is None and nn(p[9]) is None:
                W(W_after);continue
            out.append(['stg',p[0],p[3],p[4],p[5],p[10],p[11],None,None,nn(p[9])]);W(W_after)
        elif c=='SetMainRoleTalk': out.append(['mrt',p[0],p[5],p[2],em(p[3]),nn(p[4])])
        elif c=='SetStage': out.append(['stage',p[0]+1,p[1]%2,p[1]])
        elif c=='Clear': out.append(['clear',1 if p[0] else 0,p[1] or 0,1 if p[3] else 0])
        elif c=='SetFilm': out.append(['film',p[0]])
        elif c=='End': out.append(['end'])
        elif c=='SetTalkShake':
            if nn(p[1]): out.append(['tsk',p[1]])
        elif c in('SetChoiceBegin','SetPersonalityChoice','SetMajorChoice'):
            if c=='SetChoiceBegin': opts=[o for o in p[12] if o]
            elif c=='SetPersonalityChoice': opts=[o for o in p[2:5] if o]
            else: opts=[p[k+2] for k in range(1,len(p)-2) if isinstance(p[k],str) and p[k].startswith('AvgChoice_') and p[k+2]]
            ch=['choice',opts,[[] for _ in opts]];out.append(ch);stack.append((out,ch));out=[]
        elif c in('SetChoiceJumpTo','SetPersonalityChoiceJumpTo','SetMajorChoiceJumpTo'):
            ch=stack[-1][1];k=int(p[1])-1;out=ch[2][k]
        elif c in('SetChoiceRollover','SetPersonalityChoiceRollover','SetMajorChoiceRollover'):
            out=[]
        elif c in('SetChoiceEnd','SetPersonalityChoiceEnd','SetMajorChoiceEnd'):
            out=stack.pop()[0]
        elif c=='SetPhoneMsg': out.append(['say',p[1],clean(p[7]),0,''])
        elif c=='SetPhoneThinking': out.append(['say','avg3_100',p[3],2,''])
        elif c=='SetWordTrans': out.append(['say','0',p[0],8,''])
        elif c=='PlayVideo': out.append(['vid',p[0] if p else ''])
    assert not stack
    return root
