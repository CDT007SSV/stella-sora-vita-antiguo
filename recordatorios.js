/* Recordatorios push: banners por terminar (2 dias antes, 9:00) y cumpleaños (el dia, 9:00).
   Se programan en el Worker (cron de Cloudflare). Se recalculan al abrir la app. Solo corre si las notificaciones estan activadas. */
(function(){
const SK="ssv_recsch";
const on=k=>{try{return localStorage.getItem(k)!=="0"}catch(e){return true}};
const sch=()=>{try{return JSON.parse(localStorage.getItem(SK)||"{}")}catch(e){return{}}};
const put=o=>{try{localStorage.setItem(SK,JSON.stringify(o))}catch(e){}};
function h36(s){let h=7;for(const c of s)h=(h*31+c.charCodeAt(0))>>>0;return h.toString(36)}
function at9(y,m,d){return new Date(y,m,d,9,0,0).getTime()}
async function lista(){
  const out=[],now=Date.now(),H=45*864e5;
  if(on("ssv_rb")&&typeof BANNERS!=="undefined")BANNERS.forEach(b=>{
    let fin=0;
    if(b&&b.end)fin=new Date(b.end).getTime();
    else{const m=String((b&&b.period)||"").match(/(\d{4})-(\d\d)-(\d\d)\s*→\s*(\d{4})-(\d\d)-(\d\d)/);if(m)fin=new Date(+m[4],+m[5]-1,+m[6],23,59,59).getTime()}
    if(!fin||fin<now)return;
    const d=new Date(fin),orig=at9(d.getFullYear(),d.getMonth(),d.getDate()-2);let t=orig;
    if(t<now){if(fin-now>3*36e5)t=-1;else return}          // ya dentro de las ultimas 48 h: un solo aviso ahora
    out.push({k:"b"+h36(b.name+fin),t,orig,title:t<0?"Termina pronto un banner":"Termina el banner en 2 días",body:b.name,url:"#banners"});
  });
  if(on("ssv_rc")&&window.cumplesDatos){
    let L=[];try{L=await window.cumplesDatos()}catch(e){}
    const hoy=new Date();
    L.forEach(x=>{let t=at9(hoy.getFullYear(),x.m-1,x.d);if(t<now)t=at9(hoy.getFullYear()+1,x.m-1,x.d);if(t-now>H)return;
      out.push({k:"c"+h36(x.c.id+x.m+"-"+x.d+new Date(t).getFullYear()),t,orig:t,title:"🎂 Hoy cumple "+x.c.name,body:"Toca para felicitarle",url:"#cumples"})});
  }
  return out;
}
async function sync(){
  const P=window.ssvPush;if(!P||!P.on()||!P.worker())return;
  const sub=await P.sub();if(!sub)return;
  const W=P.worker(),post=(u,b)=>fetch(W+u,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(b)}).catch(()=>{});
  const S=sch(),L=await lista(),now=Date.now(),vivos=new Set();
  for(const r of L){
    vivos.add(r.k);
    if(S[r.k]===r.orig)continue;                            // ya programado (o ya se aviso)
    const at=r.t<0?now+30000:r.t;
    await post("/timer",{sub,kind:r.k,at,title:r.title,body:r.body,url:r.url});S[r.k]=r.orig;
  }
  for(const k of Object.keys(S)){                           // quita lo que ya no aplica (apagado o desaparecio)
    if(!vivos.has(k)){if(S[k]>now)await post("/cancel",{endpoint:sub.endpoint,kind:k});delete S[k]}
  }
  put(S);
}
window.ssvRec={sync};
setTimeout(()=>{sync().catch(()=>{})},5000);
})();
