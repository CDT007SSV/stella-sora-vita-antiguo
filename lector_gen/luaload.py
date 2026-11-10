import re
def parse(s):
    i=0;n=len(s)
    def ws():
        nonlocal i
        while i<n:
            if s[i].isspace(): i+=1
            elif s.startswith('--',i):
                j=s.find('\n',i); i=n if j<0 else j
            else: break
    def val():
        nonlocal i
        ws();c=s[i]
        if c=='{':
            i+=1;arr=[];obj={};
            while True:
                ws()
                if s[i]=='}': i+=1;break
                m=re.match(r'([A-Za-z_]\w*)\s*=(?!=)',s[i:])
                if m:
                    i+=m.end();obj[m.group(1)]=val()
                elif s[i]=='[':
                    i+=1;k=val();ws();assert s[i]==']';i+=1;ws();assert s[i]=='=';i+=1;obj[k]=val()
                else: arr.append(val())
                ws()
                if s[i] in ',;': i+=1
            if obj and not arr: return obj
            if obj: obj['_arr']=arr;return obj
            return arr
        if c=='"' or c=="'":
            q=c;i+=1;out=[]
            while s[i]!=q:
                if s[i]=='\\':
                    i+=1;e=s[i]
                    out.append({'n':'\n','t':'\t','"':'"',"'":"'",'\\':'\\'}.get(e,e))
                else: out.append(s[i])
                i+=1
            i+=1;return ''.join(out)
        m=re.match(r'-?\d+(\.\d+)?([eE][-+]?\d+)?',s[i:])
        if m:
            i+=m.end();t=m.group(0)
            return float(t) if ('.' in t or 'e' in t.lower()) else int(t)
        for k,v in (('nil',None),('true',True),('false',False)):
            if s.startswith(k,i): i+=len(k);return v
        raise ValueError(s[i:i+50])
    ws()
    assert s.startswith('return',i); i+=6
    return val()
def load(p): return parse(open(p,encoding='utf-8').read())
