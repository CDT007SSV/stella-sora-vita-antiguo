/* Armador de equipos: 3 personajes (potenciales con nivel y prioridad) + 3 discos principales + 6 de apoyo/recomendados.
   Se guarda en el telefono (localStorage), con importar/exportar preset del juego. Incluye ficha visual del equipo. */
(function(){
const KEY="ssv_teams";
const e=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const norm=t=>String(t||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const EC={Aqua:"#1e90d6",Ignis:"#e5533d",Lux:"#e0a82a",Terra:"#a9783a",Umbra:"#8b5cf6",Ventus:"#2fb585",Neutral:"#7d8096"};
const ec=el=>EC[el]||"#7B6CFF";
const PRI={c:"Clave",m:"Medio",o:"Opcional"},PORD={c:0,m:1,o:2};
const ROLE=["Trekker principal","Trekker de apoyo 1","Trekker de apoyo 2"];
const NDISC=9;
function load(){try{const j=JSON.parse(localStorage.getItem(KEY)||"null");if(j&&Array.isArray(j.teams))return{v:2,teams:j.teams.map(fix)}}catch(x){}return{v:2,teams:[]}}
/* Emblemas (CharGem del juego): cada Trekker trae 3 emblemas fijos (Púa 70, Rombo 80, Estelar 90); el jugador solo elige las estadísticas (hasta 4 por emblema) */
const EMT={1:{n:"Devoto",c:"#ff7a7a"},2:{n:"Explorador",c:"#4fd6a8"},3:{n:"Defensor",c:"#62aaff"}},EMS={1:"Púa",2:"Rombo",3:"Estelar"};
const EMP={1:[[20,2],[35,36],[20,28],[5,36]],2:[[20,3],[36,20],[20,37],[4,20]],3:[[20,2],[25,15],[38,20],[25,25],[20,38],[15,25],[2,20],[15,15]]};
const EMIC="https://raw.githubusercontent.com/AutumnVN/ssassets/main/export/assets/assetbundles/icon/equipment/",emUrl=m=>EMIC+"chargem_"+"abc"[m.f-1]+"_0"+m.t+".webp";
let EMD=null;
fetch("emblemas.json").then(r=>r.ok?r.json():null).then(d=>{EMD=d}).catch(()=>{});
const emInfo=id=>({id,t:Math.floor(id/100),f:id%100,ic:(id%100)*100+Math.floor(id/100)});
const PIU="https://raw.githubusercontent.com/AutumnVN/ssassets/main/potential/",LVL=[70,80,90],emStat=id=>EMD&&EMD.stats.find(x=>x.id===id);
function emPots(s){const sl=T.slots[s];if(!sl||!sl.c||!PR)return[];const g=gidOf(PR,sl.c),P=g&&PR[g];if(!P)return[];const F=FC[sl.c],ls=F&&F.potenciales?[].concat((F.potenciales.main||{}).l||[],(F.potenciales.support||{}).l||[]):[];
  return (s===0?P.mn:P.an).concat(P.cm||[]).map(id=>{const en=P.names[id]||String(id),x=ls.find(y=>y.ne===en);return{id,n:x?x.n:en,v:EMD.pot,iu:(x&&x.iu)||PIU+id+".webp"}})}
function emItem(s,id){if(id<1000){const x=emStat(id);return x||{n:"?",v:""}}return emPots(s).find(x=>x.id===id)||{n:"Potencial",v:EMD?EMD.pot:"+3"}}
const emImg=(s,id,z)=>{const x=id>=1000?emItem(s,id):null;return x&&x.iu?`<img class="tm-pimg" src="${e(x.iu)}" width="${z}" height="${z}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()">`:""};
const emLabel=(s,id)=>{const x=emItem(s,id);return x.n+" "+x.v};
function emOfSlot(s){const sl=T.slots[s];if(!sl||!sl.c||!EMD||!PR)return null;const g=gidOf(PR,sl.c);return g&&EMD.slots[g]?EMD.slots[g].map(emInfo):null}
function embSvg(m,z){return `<svg viewBox="0 0 40 40" width="${z}" height="${z}"><polygon points="${EMP[m.f].map(p=>p.join(",")).join(" ")}" fill="${EMT[m.t].c}" fill-opacity=".9" stroke="#fff" stroke-width="2" stroke-linejoin="round"/></svg>`}
function embIcon(m,z){return `<span class="tm-ei" style="width:${z}px;height:${z}px"><img src="${emUrl(m)}" width="${z}" height="${z}" alt="" loading="lazy" onerror="this.parentNode.innerHTML=this.dataset.f" data-f="${embSvg(m,z).replace(/"/g,"&quot;")}"></span>`}
function embBlock(s,ed){
  const L=emOfSlot(s);if(!L)return"";const G=T.slots[s].g||[[],[],[]];
  if(!ed&&!G.some(a=>a.length))return"";
  return `<div class="tm-pb"><div class="tm-pbh"><span>Emblemas</span></div><div class="tm-el">${L.map((m,k)=>{const a=G[k]||[];
    return `<div class="tm-er" style="--tc:${EMT[m.t].c}"${ed?` data-a="emb" data-s="${s}" data-k="${k}"`:""}>${embIcon(m,44)}<div class="tm-ex"><b>Nivel ${LVL[k]} · ${EMS[m.f]} · ${EMT[m.t].n}</b>${a.length?a.map(i=>`<span class="tm-ev">${emImg(s,i,26)}${e(emLabel(s,i))}</span>`).join(""):`<small>${ed?"Toca para elegir estadísticas":"—"}</small>`}</div></div>`}).join("")}</div></div>`}
async function embPicker(s,k){
  const L=emOfSlot(s);if(!L||!L[k])return;await getF(T.slots[s].c);const m=L[k],cur=((T.slots[s].g||[[],[],[]])[k]||[]).slice();
  const st=EMD.pool[m.f].map(emStat),gs=[["Estadísticas",st.filter(x=>x.g===1)],["Nivel de habilidad",st.filter(x=>x.g===2)]];
  if(m.f===3)gs.push(["Nivel de potencial (de este Trekker)",emPots(s)]);
  const mo=document.createElement("div");mo.className="tm-md";
  mo.innerHTML=`<div class="tm-mh"><div class="tm-mt"><b>Nivel ${LVL[k]} · ${EMS[m.f]} · ${EMT[m.t].n}</b><button class="chip" data-x="1">Listo</button></div><p class="nota" id="em-n"></p><div class="tm-sel" id="em-sel"></div></div><div class="tm-mb"><p class="nota">Toca una estadística para agregarla (puedes repetir). Se muestra el valor máximo posible. Para quitar una, toca su ✕ arriba.</p>${gs.filter(g=>g[1].length).map(g=>`<h4 class="tm-gh">${e(g[0])}</h4><div class="tm-ch">${g[1].map(x=>x.iu?`<button class="tm-pc" data-id="${x.id}"><img src="${e(x.iu)}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.style.visibility='hidden'"><span>${e(x.n)}</span><small>${e(x.v)}</small></button>`:`<button class="chip" data-id="${x.id}">${e(x.n)} <small>${e(x.v)}</small></button>`).join("")}</div>`).join("")}</div>`;
  openM(mo);
  const draw=()=>{mo.querySelector("#em-n").textContent=cur.length+"/4 estadísticas";const bx=mo.querySelector("#em-sel");bx.innerHTML=cur.length?cur.map((i,q)=>`<button class="tm-sc" data-q="${q}">${emImg(s,i,36)}<span>${e(emLabel(s,i))}</span><i>✕</i></button>`).join(""):'<small>Aún no eliges ninguna</small>';bx.querySelectorAll("[data-q]").forEach(el=>el.onclick=()=>{cur.splice(+el.dataset.q,1);draw()});
    mo.querySelectorAll("[data-id]").forEach(b=>{const n=cur.filter(x=>x===+b.dataset.id).length;b.classList.toggle("on",n>0);b.dataset.n=n>1?"×"+n:""})};
  draw();
  mo.querySelectorAll("[data-id]").forEach(b=>b.onclick=()=>{if(cur.length<4){cur.push(+b.dataset.id);draw()}});
  const done=()=>{closeM(mo);leer();const S=T.slots[s];S.g=(S.g||[[],[],[]]).map(a=>a.slice());S.g[k]=cur;vEdit()};
  mo.querySelector("[data-x]").onclick=done;
}
function fix(t){
  t.slots=[0,1,2].map(i=>{const s=(t.slots||[])[i]||{},p={};
    for(const k in (s.p||{})){const v=s.p[k];if(typeof v==="number"){if(v>0)p[k]={l:v,pr:"m"}}else if(v&&v.l>0)p[k]={l:Math.min(9,+v.l|0),pr:PRI[v.pr]?v.pr:"m"}}
    const g=[0,1,2].map(k=>{const a=Array.isArray(s.g)&&Array.isArray(s.g[k])?s.g[k]:[];return a.map(Number).filter(x=>x>0).slice(0,4)});
    return{c:String(s.c||""),p,g}});
  const d=(t.discs||[]).slice(0,NDISC).map(x=>x&&x.n?{n:String(x.n),a:Math.max(0,Math.min(8,+x.a||0))}:null);while(d.length<NDISC)d.push(null);
  t.discs=d;t.name=String(t.name||"").slice(0,60);t.note=String(t.note||"").slice(0,500);t.score=String(t.score||"").slice(0,20);t.id=t.id||uid();return t}
let ST=load();
function save(){try{localStorage.setItem(KEY,JSON.stringify(ST));return true}catch(x){return false}}
const FC={},DC={};let IDX=null;
async function getF(id){if(FC[id]!==undefined)return FC[id];try{const r=await fetch("fichas/"+id+".json");FC[id]=r.ok?await r.json():null}catch(x){FC[id]=null}return FC[id]}
async function getIdx(){if(IDX)return IDX;try{const r=await fetch("discos/indice.json");IDX=r.ok?await r.json():{ids:{},notas:{}}}catch(x){IDX={ids:{},notas:{}}}return IDX}
async function getD(name){const I=await getIdx(),id=I.ids[name];if(!id)return null;if(DC[id]!==undefined)return DC[id];try{const r=await fetch("discos/"+id+".json");DC[id]=r.ok?await r.json():null}catch(x){DC[id]=null}return DC[id]}
function tpl(s,vals,tn){return e(s).replace(/⟦(\d+)⟧/g,(m,i)=>'<b class="fn">'+e(vals&&vals[i]!=null?(Array.isArray(vals[i])?vals[i][Math.min(tn||0,vals[i].length-1)]:vals[i]):"?")+"</b>").replace(/⟪(\d+)⟫/g,'<b class="fn">?</b>').replace(/⟨([^⟩]*)⟩/g,'<i class="fk">$1</i>').replace(/\n/g,"<br>")}
const chars=()=>typeof CHARS!=="undefined"?CHARS:[],discs=()=>typeof DISCS!=="undefined"?DISCS:[];
/* los modales usan el historial para que el boton "atras" del telefono los cierre en vez de salir de la pantalla */
const MS=[];let selfBack=0;
function openM(m){document.body.appendChild(m);MS.push(m);try{history.pushState({tm:1},"",location.href)}catch(x){}}
function closeM(m){const i=MS.indexOf(m);if(i<0){m.remove();return}MS.splice(i,1);m.remove();if(i===MS.length){selfBack++;try{history.back()}catch(x){selfBack--}}}
window.addEventListener("popstate",()=>{if(selfBack>0){selfBack--;return}const m=MS.pop();if(m){m.remove();if(mode==="edit"&&m._pot)vEdit();return}if(VD>0){VD--;if(activa()){if(mode==="edit"&&T){leer();if(T.name||T.slots.some(x=>x.c)||T.discs.some(Boolean))guardar()}VD>0?vList():vHub()}}});
let VD=0;
const activa=()=>root&&root.closest(".screen")&&root.closest(".screen").classList.contains("on");
function pushV(){try{history.pushState({tmv:1},"",location.href);VD++}catch(x){}}
let fromCom=false,PEND=null;
function toList(){if(fromCom){history.back();return}if(VD>0){history.back()}else vHub()}
let CIM=null;
const imgC=c=>{if(!c)return"";if(!CIM&&PR){CIM={};for(const i in PR)CIM[PR[i].n]=PR[i].im}return(CIM&&CIM[c.name])||c.imageUrl};
const imgD=d=>{if(!d)return"";return(IDX&&IDX.img&&IDX.img[d.name])||d.imageUrl};
const charOf=id=>chars().find(c=>c.id===id),discOf=n=>discs().find(d=>d.name===n);
const star=(n,h)=>typeof estr==="function"?estr(n,h||14):n+"★";
const eli=el=>typeof elIcon==="function"?elIcon(el):"";
let PR=null;
async function getPresets(){if(PR)return PR;try{const r=await fetch("presets.json");PR=r.ok?await r.json():{}}catch(x){PR={}}return PR}
const gidOf=(P,slug)=>{const c=charOf(slug);if(!c)return null;for(const i in P)if(P[i].n===c.name)return +i;return null};
/* Codigo de preset del juego: 3 ids de personaje (uint32 BE) + 40 bits por personaje (4 nucleo + 9x3 normales + 3x3 comunes). Solo personajes y potenciales. */
async function gameCode(){
  const P=await getPresets(),ids=T.slots.map(s=>gidOf(P,s.c));
  if(ids.some(x=>x==null))return null;
  const by=[];ids.forEach(i=>by.push((i>>>24)&255,(i>>>16)&255,(i>>>8)&255,i&255));
  let bits="";
  for(let s=0;s<3;s++){
    const g=P[ids[s]],lv={};
    for(const k in T.slots[s].p){lv[k.split("|").slice(2).join("|")]=T.slots[s].p[k].l}
    const get=id=>Math.max(0,Math.min(7,lv[g.names[id]]||0));
    bits+=(s===0?g.ms:g.as).map(id=>get(id)>0?"1":"0").join("");
    bits+=(s===0?g.mn:g.an).concat(g.cm).map(id=>get(id).toString(2).padStart(3,"0")).join("");
  }
  for(let i=0;i<bits.length;i+=8)by.push(parseInt(bits.slice(i,i+8),2));
  return btoa(String.fromCharCode(...by));
}
async function gameDecode(txt){
  txt=txt.trim();if(!/^[A-Za-z0-9+/]{36}$/.test(txt))return null;
  let b;try{b=atob(txt)}catch(x){return null}
  if(b.length!==27)return null;
  const P=await getPresets(),by=[...b].map(c=>c.charCodeAt(0));
  const ids=[0,1,2].map(i=>((by[4*i]<<24)|(by[4*i+1]<<16)|(by[4*i+2]<<8)|by[4*i+3])>>>0);
  if(ids.some(i=>!P[i]))return null;
  const bits=by.slice(12).map(x=>x.toString(2).padStart(8,"0")).join(""),t=nuevo();t.name="Preset importado";
  for(let s=0;s<3;s++){
    const g=P[ids[s]],c=chars().find(x=>x.name===g.n);if(!c)continue;
    const role=s===0?"main":"support",blk=bits.slice(s*40,s*40+40),F=await getF(c.id),L={};
    (s===0?g.ms:g.as).forEach((id,j)=>{if(blk[j]==="1")L[id]=1});
    (s===0?g.mn:g.an).concat(g.cm).forEach((id,j)=>{const v=parseInt(blk.slice(4+3*j,7+3*j),2);if(v>0)L[id]=v});
    t.slots[s]={c:c.id,p:{}};
    if(F&&F.potenciales){const T2=F.potenciales[role]||F.potenciales.main;
      for(const id in L){const p=T2.l.find(x=>x.ne===g.names[id]);if(p)t.slots[s].p[role+"|"+p.g+"|"+p.ne]={l:L[id],pr:p.t===1?"c":"m"}}}
  }
  return t;
}
const nuevo=()=>fix({id:uid(),name:"",slots:[],discs:[],note:"",score:""});
let root,T=null,mode="list";

(function css(){const s=document.createElement("style");s.textContent=`
#teams-root{--tc:#7B6CFF}
.tm-eg,.tm-eg3{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.tm-et{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;min-height:74px;padding:8px 4px;border-radius:12px;border:2px dashed #4a4670;background:rgba(14,12,30,.5);color:#cfc8ff;cursor:pointer;font:inherit}
.tm-et.f{border:2px solid var(--tc);background:rgba(20,16,50,.8)}
.tm-el{display:flex;flex-direction:column;gap:8px}.tm-er{display:flex;gap:10px;align-items:center;padding:8px;border-radius:12px;border:2px solid var(--tc);background:rgba(20,16,50,.8);cursor:pointer}.tm-ex{display:flex;flex-wrap:wrap;gap:4px;flex:1}.tm-ex b{width:100%;font-size:.78rem}.tm-ex span{font-size:.7rem;padding:2px 7px;border-radius:9px;background:rgba(157,147,255,.2);color:#e8e4ff}.tm-ex small{color:#9d98c4;font-size:.7rem}.tm-ei{display:inline-flex;flex:none}.tm-ch{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:6px}.tm-ch .chip[data-n]:not([data-n=""])::after{content:" " attr(data-n);font-weight:800}.tm-sel{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}.tm-sel small{color:#9d98c4;font-size:.85rem}.tm-sc{display:flex;align-items:center;gap:8px;padding:8px 8px 8px 14px;border-radius:14px;border:2px solid #7B6CFF;background:rgba(123,108,255,.28);color:#fff;font:inherit;font-weight:700;font-size:.9rem}.tm-sc i{font-style:normal;width:26px;height:26px;border-radius:50%;background:#ff5d7a;display:flex;align-items:center;justify-content:center;font-size:.8rem}.tm-ch .chip small{opacity:.7;font-size:.72rem;margin-left:3px}.tm-pimg{border-radius:8px;object-fit:cover;flex:none}.tm-ev{display:inline-flex;align-items:center;gap:5px}.tm-sc .tm-pimg{border-radius:9px}.tm-ch:has(.tm-pc){display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.tm-pc{position:relative;display:flex;flex-direction:column;align-items:center;gap:4px;padding:8px 4px;border-radius:12px;border:1.5px solid #4a4670;background:rgba(20,16,50,.7);color:#e8e4ff;font:inherit;cursor:pointer}.tm-pc img{width:64px;height:64px;border-radius:12px;object-fit:cover;background:rgba(255,255,255,.05)}.tm-pc span{font-size:.7rem;font-weight:700;line-height:1.15;text-align:center}.tm-pc small{font-size:.68rem;color:#9d93ff}.tm-pc.on{border-color:#7B6CFF;background:rgba(123,108,255,.3)}.tm-pc[data-n]:not([data-n=""])::after{content:attr(data-n);position:absolute;top:4px;right:6px;font-weight:800;font-size:.8rem;color:#fff;background:#7B6CFF;border-radius:8px;padding:0 5px}.tm-gh{margin:10px 0 6px;font-size:.8rem;color:#9d93ff}
.tm-et small{font-size:.66rem;font-weight:700;line-height:1.15;text-align:center;color:#e8e4ff}
.tm-eb{font-size:1.5rem;color:var(--a)}
.tm-et .tm-dx{position:absolute;top:3px;right:3px;width:20px;height:20px;border-radius:50%;background:rgba(0,0,0,.65);color:#fff;font-size:.65rem;display:flex;align-items:center;justify-content:center}
.tm-hb{position:relative;display:flex;align-items:center;gap:14px;width:100%;text-align:left;border-radius:18px;padding:18px 16px;margin-bottom:12px;border:1px solid rgba(255,255,255,.1);color:var(--t);cursor:pointer;overflow:hidden;font:inherit;text-decoration:none}
.tm-hb:before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 90% 0,rgba(255,255,255,.18),transparent 55%);pointer-events:none}
.tm-hb>*{position:relative}.tm-hb .hi{flex:0 0 52px;height:52px;border-radius:14px;background:rgba(255,255,255,.14);display:flex;align-items:center;justify-content:center;font-size:1.7rem;font-weight:800}
.tm-hb b{display:block;font-size:1.08rem;margin-bottom:3px}.tm-hb small{display:block;font-size:.8rem;opacity:.85;line-height:1.3}.tm-hb .ar{margin-left:auto;font-size:1.6rem;opacity:.7}
.tm-hb.h1{background:linear-gradient(135deg,#6a55ff,#a24bd8);box-shadow:0 8px 22px rgba(123,108,255,.35)}
.tm-hb.h2{background:linear-gradient(135deg,#1d6f8f,#1b3f7a)}
.tm-hb.h3{background:linear-gradient(135deg,#b5812a,#7a3a52)}
.tm-hb.h4{background:linear-gradient(135deg,#2f9a72,#1d5f86);border-color:rgba(120,240,190,.35)}.tm-hero{position:relative;border-radius:16px;padding:16px;margin-bottom:14px;background:linear-gradient(135deg,#2a2160,#14102c 70%);border:1px solid rgba(123,108,255,.5);overflow:hidden}
.tm-hero:before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 85% 0,rgba(123,108,255,.45),transparent 55%);pointer-events:none}
.tm-hero>*{position:relative}.tm-hero h3{margin:0 0 4px;font-size:1.15rem}.tm-hero p{margin:0 0 12px;font-size:.82rem;color:var(--t2)}
.tm-md .tm-mb button.tm-pub{display:flex;align-items:center;gap:12px;width:100%;text-align:left;margin:0 0 10px;padding:12px;border-radius:16px;border:1px solid color-mix(in srgb,var(--tc) 55%,transparent);background:linear-gradient(120deg,color-mix(in srgb,var(--tc) 38%,#14112a),#14112a 75%);color:var(--t);font:inherit;cursor:pointer;box-shadow:0 3px 12px rgba(0,0,0,.25)}
.tm-pub:active{transform:scale(.98)}
.tm-pub .tm-pav{display:flex;flex:none}.tm-pub .tm-pav img,.tm-pub .tm-pav i{width:38px;height:38px;border-radius:50%;object-fit:cover;object-position:top;background:#221E3A;border:2px solid #14112a;margin-right:-10px}
.tm-pub .tm-pav img:first-child{width:50px;height:50px;border-color:var(--tc);z-index:2;position:relative}
.tm-pub .tm-pi{flex:1;min-width:0;padding-left:12px}.tm-pub .tm-pi b{display:block;font-size:.98rem;line-height:1.25}
.tm-pub .tm-pi small{display:block;font-size:.74rem;color:var(--t2);margin-top:3px;line-height:1.35}
.tm-pub .tm-pg{flex:none;font-size:.78rem;font-weight:800;padding:7px 11px;border-radius:999px;background:var(--tc);color:#fff;text-shadow:0 1px 2px rgba(0,0,0,.4)}
.tm-card{position:relative;border-radius:14px;margin-bottom:12px;cursor:pointer;overflow:hidden;border:1px solid #2a2740;background:var(--sf)}
.tm-ctop{height:8px}.tm-cb{padding:12px 14px}.tm-cb h4{margin:0 0 8px;font-size:1.02rem}
.tm-th{display:flex;align-items:center}.tm-th img,.tm-th i{width:48px;height:48px;border-radius:50%;object-fit:cover;object-position:top;background:#221E3A;border:2px solid var(--sf);margin-right:-10px;flex:0 0 48px}.tm-th i{display:block}
.tm-cm{margin-left:auto;text-align:right;font-size:.76rem;color:var(--t2);line-height:1.5}
.tm-in{width:100%;box-sizing:border-box;padding:11px 13px;border-radius:12px;border:1px solid #3D3A55;background:rgba(14,12,30,.7);color:var(--t);font-size:1rem;margin-bottom:8px;outline:none}
.tm-name{font-size:1.25rem;font-weight:800;border-color:rgba(123,108,255,.5)}
.tm-sl{border-radius:16px;margin-bottom:14px;overflow:hidden;border:1px solid #2a2740;background:var(--sf)}
.tm-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;width:100%;padding:26px 10px;background:none;border:0;color:var(--t2);font-weight:700}
.tm-empty b{display:flex;align-items:center;justify-content:center;width:56px;height:56px;border:2px dashed #4a4670;border-radius:50%;font-size:1.6rem;color:var(--a)}
.tm-lab{font-size:.64rem;font-weight:800;letter-spacing:.09em;text-transform:uppercase;color:var(--t2);padding:8px 12px 0}
.tm-bn{display:flex;align-items:center;gap:12px;padding:12px;color:#fff;background:linear-gradient(120deg,var(--tc),color-mix(in srgb,var(--tc) 35%,#0b0920));position:relative}
.tm-bn img.tm-av{width:66px;height:66px;border-radius:50%;object-fit:cover;object-position:top;border:3px solid rgba(255,255,255,.85);background:#15122a;flex:0 0 66px}
.tm-bn h4{margin:0;font-size:1.15rem;text-shadow:0 1px 4px rgba(0,0,0,.5)}.tm-bn .tm-m{display:flex;gap:6px;align-items:center;margin-top:5px;font-size:.75rem}
.tm-bn .tm-m span{background:rgba(0,0,0,.35);border-radius:8px;padding:2px 8px}
.tm-bx{margin-left:auto;display:flex;flex-direction:column;gap:6px}.tm-bx button{background:rgba(0,0,0,.38);border:1px solid rgba(255,255,255,.35);color:#fff;border-radius:8px;font-size:.72rem;padding:5px 9px}
.tm-pb{padding:10px 12px 12px}.tm-pbh{display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;font-size:.78rem;font-weight:800;letter-spacing:.05em;text-transform:uppercase;color:var(--t2)}
.tm-add{background:var(--tc);border:0;color:#fff;border-radius:10px;padding:8px 14px;font-weight:700;font-size:.82rem}
.tm-pl{display:flex;align-items:center;gap:9px;padding:6px 0;border-top:1px solid #2a2740;font-size:.84rem}
.tm-pl img{width:34px;height:42px;object-fit:contain;flex:0 0 34px}.tm-pl .tm-n{flex:1;min-width:0}
.tm-lvc{background:#221E3A;border-radius:7px;padding:2px 7px;font-size:.7rem;font-weight:800;white-space:nowrap}
.tm-pr-c{background:#ff6ec7;color:#1a0b18}.tm-pr-m{background:#a78bfa;color:#140a2b}.tm-pr-o{background:#4b4870;color:#ddd}
.tm-tg{border-radius:7px;padding:2px 7px;font-size:.66rem;font-weight:800;white-space:nowrap}
.tm-sy{font-size:.88rem;margin:4px 0;line-height:1.35}.tm-sy.ok{color:#5fe0a0}.tm-sy.w{color:#ffcf6a}.tm-sy.i{color:#cfc8ff}.tm-sg{font-size:.82rem;color:var(--t2);margin:3px 0 3px 14px}.tm-sg b{color:#cfc8ff;font-weight:600}
.tm-rc{box-shadow:0 0 0 2px #5fe0a0}.tm-rec{position:absolute;top:0;left:0;right:0;text-align:center;background:#2fbf7a;color:#04210f;font-size:.62rem;font-weight:800;padding:2px 0;z-index:2}.tm-gt.tm-rc .tm-ps{top:26px}.tm-bd{display:block;font-size:.62rem;font-weight:500;color:#cfc8ff;margin-top:1px}
.tm-hint{font-size:.8rem;color:var(--t2);margin:2px 0 4px}
.tm-dh{display:flex;align-items:baseline;justify-content:space-between;padding:12px 12px 6px}.tm-dh b{font-size:1rem}.tm-dh small{color:var(--t2);font-size:.72rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase}
.tm-dg{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;padding:0 12px 10px}
.tm-dt{position:relative;aspect-ratio:1;border-radius:12px;overflow:hidden;border:2px dashed #4a4670;background:rgba(14,12,30,.5);display:flex;align-items:center;justify-content:center;color:var(--a);font-size:1.7rem;cursor:pointer;padding:0}
.tm-dt.f{border:2px solid var(--tc);}.tm-dt img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.tm-dt .tm-dn{position:absolute;left:0;right:0;bottom:0;background:linear-gradient(transparent,rgba(0,0,0,.85));color:#fff;font-size:.62rem;font-weight:700;padding:14px 4px 3px;text-align:center;line-height:1.15}
.tm-dt .tm-dx{position:absolute;top:3px;right:3px;width:22px;height:22px;border-radius:50%;background:rgba(0,0,0,.65);color:#fff;font-size:.7rem;display:flex;align-items:center;justify-content:center;z-index:2}
.tm-dt .tm-da{position:absolute;top:3px;left:3px;z-index:2;background:rgba(0,0,0,.65);border-radius:8px;font-size:.62rem;color:#fff;border:0;padding:2px 3px}
.tm-dt .tm-st{position:absolute;top:26px;left:4px;z-index:2}
.tm-nt{display:flex;flex-wrap:wrap;gap:6px;padding:0 12px 6px}.tm-nt span{font-size:.76rem;background:#221E3A;border-radius:8px;padding:4px 9px}.tm-nt img{width:20px;height:20px;vertical-align:middle;margin-right:4px}
.tm-sec{padding:0 12px 12px}.tm-ta{width:100%;box-sizing:border-box;min-height:90px;padding:10px;border-radius:12px;border:1px solid #3D3A55;background:rgba(14,12,30,.7);color:var(--t);font-size:.9rem}
.tm-md{position:fixed;inset:0;z-index:60;background:#0b0920;display:flex;flex-direction:column}
.tm-mh{padding:12px;border-bottom:1px solid #2a2740;background:linear-gradient(120deg,#241d55,#0b0920)}
.tm-mt{display:flex;align-items:center;gap:8px;margin-bottom:8px}.tm-mt b{flex:1;font-size:1.02rem}
.tm-mb{flex:1;overflow:auto;padding:10px 12px 40px}
.tm-fl{display:flex;gap:6px;overflow-x:auto;padding:2px 0 6px;scrollbar-width:none}.tm-fl::-webkit-scrollbar{display:none}
.tm-fl .chip{flex:0 0 auto;display:flex;align-items:center;white-space:nowrap}
.tm-fl .chip.on{background:var(--a);color:#fff}
.tm-gr{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.tm-gt{position:relative;border-radius:12px;overflow:hidden;background:#15122a;border:2px solid transparent;aspect-ratio:3/4;padding:0;color:#fff;text-align:left}
.tm-gt img.tm-pa{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top}
.tm-gt .tm-pn{position:absolute;left:0;right:0;bottom:0;padding:18px 6px 6px;background:linear-gradient(transparent,rgba(0,0,0,.88));font-size:.74rem;font-weight:700;line-height:1.15}
.tm-gt .tm-pe{position:absolute;top:0;left:0;right:0;height:5px}.tm-gt .tm-ps{position:absolute;top:10px;left:6px;display:flex;align-items:center;gap:3px;background:rgba(0,0,0,.55);border-radius:8px;padding:1px 5px}
.tm-gt.dsq{aspect-ratio:1}
.tm-pk{display:flex;gap:10px;align-items:flex-start;padding:10px;border-radius:12px;border:1px solid #2a2740;background:var(--sf);margin-bottom:8px}
.tm-pk.on{border-color:var(--tc);box-shadow:0 0 0 1px var(--tc) inset}
.tm-pk img.tm-pi{width:46px;height:58px;object-fit:contain;flex:0 0 46px}
.tm-pk .tm-pq{flex:1;min-width:0}.tm-pk h5{margin:0;font-size:.92rem}.tm-pk small{color:var(--t2);font-size:.68rem}
.tm-pk .tm-d{font-size:.78rem;color:var(--t2);line-height:1.45;margin:3px 0 0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.tm-pk .tm-d.x{display:block}
.tm-ck{flex:0 0 28px;height:28px;border-radius:50%;border:2px solid #4a4670;display:flex;align-items:center;justify-content:center;color:transparent;font-weight:900}
.tm-pk.on .tm-ck{background:var(--tc);border-color:var(--tc);color:#fff}
.tm-ctl{display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-top:8px}
.tm-ctl select{background:#221E3A;color:var(--t);border:1px solid #3D3A55;border-radius:8px;padding:6px 8px;font-size:.8rem}
.tm-seg{display:flex;border-radius:8px;overflow:hidden;border:1px solid #3D3A55}.tm-seg button{background:#221E3A;border:0;color:var(--t2);font-size:.74rem;font-weight:700;padding:6px 9px}.tm-seg button.on{background:var(--tc);color:#fff}
.tm-act{display:flex;gap:8px;flex-wrap:wrap}.tm-act .btn{flex:1;min-width:110px;margin-top:8px}
.tm-bk{display:inline-flex;align-items:center;gap:6px;background:rgba(123,108,255,.12);border:1px solid rgba(123,108,255,.4);border-radius:999px;color:#d9d3ff;font-size:.88rem;font-weight:600;padding:8px 14px;margin:0 0 10px;cursor:pointer}
.tm-io{display:flex;gap:8px}.tm-io .btn{margin-top:10px}
.tm-tb{width:100%;box-sizing:border-box;min-height:100px;padding:10px;border-radius:10px;border:1px solid #3D3A55;background:var(--sf);color:var(--t);font-size:.85rem}
.tm-fh{border-radius:16px;padding:16px;margin-bottom:12px;background:linear-gradient(135deg,#2a2160,#14102c 70%);border:1px solid rgba(123,108,255,.5)}
.tm-fh h3{margin:0;font-size:1.3rem}.tm-fh p{margin:6px 0 0;font-size:.85rem;color:var(--t2);white-space:pre-line}
.tm-act .btn,.tm-io .btn{border-radius:999px;padding:12px 14px;font-size:.88rem}
.tm-sl{border-radius:18px;border:1px solid rgba(123,108,255,.28);background:linear-gradient(160deg,rgba(123,108,255,.08),rgba(255,255,255,.02) 60%),var(--sf)}
.tm-in,.tm-tb,.tm-ta{border-radius:999px;border:1px solid rgba(123,108,255,.35);background:rgba(14,12,30,.7)}.tm-tb,.tm-ta{border-radius:16px}
.tm-in:focus,.tm-ta:focus,.tm-tb:focus{border-color:#7B6CFF;box-shadow:0 0 0 3px rgba(123,108,255,.2)}
.tm-add{border-radius:999px}
.tm-seg{border-radius:999px}.tm-ctl select{border-radius:999px}
`;document.head.appendChild(s)})();

/* ---------- selector con filtros (personajes y discos) ---------- */
function picker(titulo,items,onPick,opts){
  opts=opts||{};let fe="",fr=0,q="";
  const m=document.createElement("div");m.className="tm-md";
  const els=[...new Set(items.map(i=>i.el).filter(Boolean))],rs=[...new Set(items.map(i=>i.r).filter(Boolean))].sort((a,b)=>b-a);
  m.innerHTML=`<div class="tm-mh"><div class="tm-mt"><b>${e(titulo)}</b><button class="chip" data-x="1">Cerrar</button></div>
   <input class="tm-in" style="margin-bottom:6px" type="search" placeholder="Buscar…">
   <div class="tm-fl" data-f="e"><button class="chip on" data-v="">Todos</button>${els.map(x=>`<button class="chip" data-v="${e(x)}">${eli(x)}${e(x)}</button>`).join("")}</div>
   <div class="tm-fl" data-f="r"><button class="chip on" data-v="0">Todas</button>${rs.map(x=>`<button class="chip" data-v="${x}">${x}★</button>`).join("")}</div></div><div class="tm-mb"><div class="tm-gr"></div></div>`;
  openM(m);
  const G=m.querySelector(".tm-gr");
  const pint=()=>{const n=norm(q);const R=items.filter(i=>(!n||norm(i.n).includes(n))&&(!fe||i.el===fe)&&(!fr||i.r===fr));
    G.innerHTML=R.map((i,k)=>`<button class="tm-gt${opts.sq?" dsq":""}${i.dim?" tm-dm":""}${i.rec?" tm-rc":""}" data-k="${k}" style="--tc:${ec(i.el)}"><span class="tm-pe" style="background:${ec(i.el)}"></span>${i.img?`<img class="tm-pa" src="${e(i.img)}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.style.visibility='hidden'">`:""}<span class="tm-ps">${i.r?star(i.r,12):""}</span>${i.rec?`<span class="tm-rec">👍 Recomendado</span>`:""}<span class="tm-pn">${e(i.n)}${i.bd?`<small class="tm-bd">${e(i.bd)}</small>`:""}</span></button>`).join("")||"<p class='nota' style='grid-column:1/-1'>Sin resultados.</p>";
    G.querySelectorAll(".tm-gt").forEach(b=>b.onclick=()=>{const it=R[+b.dataset.k];closeM(m);onPick(it)})};
  m.querySelector("input").oninput=ev=>{q=ev.target.value;pint()};
  m.querySelectorAll(".tm-fl").forEach(f=>f.onclick=ev=>{const b=ev.target.closest("[data-v]");if(!b)return;f.querySelectorAll(".chip").forEach(c=>c.classList.toggle("on",c===b));if(f.dataset.f==="e")fe=b.dataset.v;else fr=+b.dataset.v;pint()});
  m.querySelector("[data-x]").onclick=()=>closeM(m);pint();
}
let RK=null;
fetch("ranking.json").then(r=>r.ok?r.json():null).then(j=>{RK=j&&j.equipos||null}).catch(()=>{});
const charItems=sl=>{
  const base=chars().map(c=>({n:c.name,el:c.element,r:c.rarity,img:imgC(c),id:c.id,ro:c.role}));
  const ot=T.slots.filter((x,i)=>i!==sl).map(x=>charOf(x.c)).filter(Boolean);if(!ot.length)return base.map(i=>(i.bd=RN[i.ro]||"",i));
  const on=ot.map(c=>c.name),bst={};
  if(RK)RK.forEach(t=>{const m=t.s.map(x=>x.n);if(on.every(n=>m.includes(n)))m.forEach(n=>{if(!on.includes(n)&&(bst[n]||0)<t.pct)bst[n]=t.pct})});
  const cn={};ot.forEach(c=>cn[c.element]=(cn[c.element]||0)+1);
  let dom=ot[0].element;for(const k in cn)if(cn[k]>cn[dom])dom=k;
  const mono=cn[dom]>=2||ot.length===1,have=ot.filter(c=>c.element===dom).map(c=>c.role),miss=RO.filter(r=>!have.includes(r));
  base.forEach(i=>{const rol=RN[i.ro]||"";
    if(ot.some(c=>c.id===i.id)){i.sc=0;i.bd="En el equipo";return}
    const nm=base.find(z=>z===i)&&(charOf(i.id)||{}).name;
    if(bst[nm]){i.sc=4+bst[nm];i.bd="Del ranking";i.rec=1;return}
    if(!mono){i.sc=0;i.bd=rol;return}
    if(i.el===dom&&miss.includes(i.ro)){i.sc=3;i.bd=rol;i.rec=1}
    else if(i.el===dom){i.sc=2;i.bd=rol+" (repetido)"}
    else{i.sc=1;i.bd=rol}});
  return base.map((x,k)=>[x,k]).sort((a,b)=>(b[0].sc||0)-(a[0].sc||0)||a[1]-b[1]).map(x=>x[0]);
};
const discItems=()=>{
  const base=discs().map(d=>({n:d.name,el:d.element,r:d.rarity,img:imgD(d)}));
  const ot=T.slots.map(x=>charOf(x.c)).filter(Boolean);if(!ot.length)return base;
  const cn={};ot.forEach(c=>cn[c.element]=(cn[c.element]||0)+1);
  let dom=ot[0].element;for(const k in cn)if(cn[k]>cn[dom])dom=k;
  if(cn[dom]<2&&ot.length>1)return base;
  const used=T.discs.filter(Boolean).map(x=>x.n);
  base.forEach(i=>{if(used.includes(i.n)){i.sc=0;i.bd="En el equipo";return}
    if(i.el===dom){i.sc=2+(i.r||0)/10;i.bd="Mismo elemento";i.rec=1}else i.sc=1});
  return base.map((x,k)=>[x,k]).sort((a,b)=>(b[0].sc||0)-(a[0].sc||0)||a[1]-b[1]).map(x=>x[0]);
};

/* ---------- modal de potenciales ---------- */
async function potModal(s){
  const S=T.slots[s],c=charOf(S.c);if(!c)return;
  const F=await getF(S.c);
  if(!F||!F.potenciales){alert("Este personaje aún no tiene datos de potenciales.");return}
  const role=s===0?"main":"support",Tt=F.potenciales[role]||F.potenciales.main;
  const bn=b=>/\b(\d+)\b/.test(b.n)?"Build "+b.n.match(/\b(\d+)\b/)[1]:b.n;
  const keyOf=p=>role+"|"+p.g+"|"+p.ne;
  let tab=String(Tt.builds[0].id),open=null;
  const m=document.createElement("div");m.className="tm-md";m.style.setProperty("--tc",ec(c.element));m._pot=true;
  m.innerHTML=`<div class="tm-mh"><div class="tm-mt"><b>${e(c.name)} · Potenciales</b><button class="chip" data-x="1">Listo</button></div><div class="tm-hint" id="tm-cnt"></div>
   <div class="tm-fl">${Tt.builds.map(b=>`<button class="chip" data-t="${b.id}">${e(bn(b))}</button>`).join("")}<button class="chip" data-t="sel">Elegidos</button></div></div><div class="tm-mb"></div>`;
  openM(m);
  const B=m.querySelector(".tm-mb");
  const pk=p=>{const k=keyOf(p),v=S.p[k],mx=Math.max(1,...p.v.map(a=>a.length));
    return `<div class="tm-pk${v?" on":""}" data-k="${e(k)}"><img class="tm-pi" src="${e(p.iu||"")}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.style.visibility='hidden'">
     <div class="tm-pq"><h5>${e(p.n)}</h5><small>${p.t<3?"Núcleo":"Común"}${mx>1?" · hasta nivel "+mx:""}</small>
     <p class="tm-d${open===k?" x":""}" data-a="ex">${open===k?tpl(p.s,p.v,(v?v.l:1)-1):tpl(p.b)}</p>
     ${v?`<div class="tm-ctl">${mx>1?`<select data-a="lv" aria-label="Nivel">${Array.from({length:mx},(_, i)=>`<option value="${i+1}"${v.l===i+1?" selected":""}>Nivel ${i+1}</option>`).join("")}</select>`:""}<div class="tm-seg">${["c","m","o"].map(x=>`<button data-a="pr" data-v="${x}" class="${v.pr===x?"on":""}">${PRI[x]}</button>`).join("")}</div></div>`:""}</div>
     <div class="tm-ck" data-a="tg">✓</div></div>`};
  const pint=()=>{
    const y=B.scrollTop,nsel=Object.keys(S.p).length;
    m.querySelector("#tm-cnt").textContent=nsel?nsel+" elegido(s). Toca un potencial para elegirlo; luego define su nivel y prioridad.":"Toca un potencial para elegirlo; luego define su nivel y prioridad.";
    m.querySelectorAll("[data-t]").forEach(b=>b.classList.toggle("on",b.dataset.t===tab));
    let h="";
    if(tab==="sel"){const L=Tt.l.filter(p=>S.p[keyOf(p)]);h=L.length?L.map(pk).join(""):"<p class='nota'>Aún no eliges ninguno.</p>"}
    else{const L=Tt.l.filter(p=>String(p.g)===tab),b=Tt.builds.find(x=>String(x.id)===tab);
      if(b&&b.d)h+=`<p class="fk-bd">${e(b.d)}</p>`;
      const nu=L.filter(p=>p.t<3),co=L.filter(p=>p.t===3);
      if(nu.length)h+=`<h4 class="fk-h">Núcleo</h4>`+nu.map(pk).join("");
      if(co.length)h+=`<h4 class="fk-h">Comunes</h4>`+co.map(pk).join("")}
    B.innerHTML=h;B.scrollTop=y};
  m.onclick=ev=>{
    if(ev.target.closest("[data-x]")){closeM(m);if(mode==="edit")vEdit();return}
    const t=ev.target.closest("[data-t]");if(t){tab=t.dataset.t;B.scrollTop=0;pint();return}
    const row=ev.target.closest(".tm-pk");if(!row)return;const k=row.dataset.k,a=ev.target.closest("[data-a]"),act=a&&a.dataset.a;
    if(act==="lv")return;
    const p=Tt.l.find(x=>keyOf(x)===k);
    if(act==="pr"){S.p[k].pr=a.dataset.v}
    else if(act==="ex"){open=open===k?null:k}
    else{if(S.p[k])delete S.p[k];else S.p[k]={l:1,pr:p.t===1?"c":"m"}}
    pint()};
  m.onchange=ev=>{const a=ev.target.closest("[data-a=lv]");if(!a)return;const k=a.closest(".tm-pk").dataset.k;S.p[k].l=+a.value;pint()};
  pint();
}

/* ---------- inicio de la seccion ---------- */
function vHub(){
  mode="hub";T=null;const n=ST.teams.length;
  root.innerHTML=`<div class="tm-hero"><h3>Equipos y builds</h3><p>Arma tu equipo de 3 Trekkers, guárdalo y descubre las builds de otros jugadores.</p></div>
   <button class="tm-hb h1" data-a="new"><span class="hi">+</span><span><b>Crear equipo</b><small>Elige Trekkers, potenciales y discos</small></span><span class="ar">›</span></button>
   <button class="tm-hb h2" data-a="mine"><span class="hi">★</span><span><b>Mis equipos</b><small>${n?n+(n===1?" equipo guardado":" equipos guardados"):"Aquí se guardan los equipos que crees"}</small></span><span class="ar">›</span></button>
   <a class="tm-hb h4" href="#ranking" data-nav="ranking"><span class="hi">🏆</span><span><b>Ranking de equipos</b><small>Los equipos con más daño, con guía y preset</small></span><span class="ar">›</span></a>
   <a class="tm-hb h3" href="#builds" data-nav="builds"><span class="hi">☷</span><span><b>Builds de la comunidad</b><small>Builds enviadas por jugadores y la guía completa</small></span><span class="ar">›</span></a>`;
  window.scrollTo(0,0);
}

function myCard(tm){
  const cs=tm.slots.map(s=>charOf(s.c)),c0=cs.find(Boolean),nd=tm.discs.filter(Boolean).length;
  const av=cs.map(c=>c?`<div class="cm-m" style="--mc:${ec(c.element)}"><img src="${e(imgC(c))}" alt="${e(c.name)}" loading="lazy" referrerpolicy="no-referrer" onerror="this.style.visibility='hidden'"><b>${e(c.name)}</b></div>`:`<div class="cm-m"><i></i><b style="opacity:.5">Vacío</b></div>`).join("");
  return `<div class="cm-c" data-a="view" data-id="${tm.id}"><div class="cm-hd" style="--c1:${c0?ec(c0.element):"#7b6cff"};--bgi:url('${c0?e(imgC(c0)):""}')"><h4>${e(tm.name||"Equipo sin nombre")}</h4><div class="cm-av">${av}</div></div>
   <div class="cm-ft"><span class="cm-t">💿 ${nd} ${nd===1?"disco":"discos"}</span>${tm.score?`<span class="cm-t rc">⏱ ${e(tm.score)}</span>`:""}<span class="cm-go">Abrir ›</span></div></div>`;
}
/* ---------- lista ---------- */
function vList(){
  mode="list";T=null;const A=ST.teams;
  root.innerHTML=`<div class="tm-hero"><h3>Mis equipos</h3><p>Los equipos que guardaste en este dispositivo.</p><button class="btn" data-a="new" style="margin:0">+ Nuevo equipo</button></div>`+
  (A.length?A.map(myCard).join(""):`<p class="nota">Aún no tienes equipos guardados.</p>`)+
  `<div class="tm-io"><button class="btn out" data-a="imp">Importar preset del juego</button></div><div id="tm-io-box"></div>
   <p class="nota" style="margin-top:12px">Tus equipos se guardan solo en este dispositivo. Para llevar la selección al juego usa el botón “Preset del juego” de cada equipo.</p>`;
}
const code=t=>"SSV2:"+btoa(unescape(encodeURIComponent(JSON.stringify(t))));
function parse(txt){
  txt=txt.trim();let j;
  try{j=JSON.parse(txt)}catch(x){const m=txt.replace(/^SSV\d:/,"").trim();try{j=JSON.parse(decodeURIComponent(escape(atob(m))))}catch(y){return null}}
  const a=Array.isArray(j)?j:(j&&j.teams)?j.teams:[j];
  return a.filter(t=>t&&Array.isArray(t.slots)).map(t=>{t=fix(JSON.parse(JSON.stringify(t)));t.id=uid();return t});
}
/* Codigo compacto v3: ids de potenciales/discos en vez de nombres (mas corto para compartir y para el formulario) */
const b64=o=>btoa(unescape(encodeURIComponent(JSON.stringify(o))));
const unb64=t=>JSON.parse(decodeURIComponent(escape(atob(t))));
async function codeV3(t){
  const P=await getPresets(),I=await getIdx();
  try{
    const c=[],p=[],em=[];
    for(let s=0;s<3;s++){
      const S=t.slots[s],g=gidOf(P,S.c);c.push(S.c);em.push((S.g||[[],[],[]]).map(a=>a.join('-')).join('.'));
      const by={};if(g)for(const id in P[g].names)if(!(P[g].names[id] in by))by[P[g].names[id]]=id;
      const arr=[];for(const k in S.p){const ne=k.split("|").slice(2).join("|"),id=by[ne];if(id)arr.push(id+"."+S.p[k].l+S.p[k].pr)}
      p.push(arr.join(","));
    }
    const d=t.discs.map(D=>D&&I.ids[D.n]?I.ids[D.n]+"."+D.a:0);
    return "SSV3:"+b64({v:3,n:t.name,t:t.score,o:t.note,c,p,d,e:em});
  }catch(x){return code(t)}
}
async function decodeV3(j){
  const P=await getPresets(),I=await getIdx(),t=nuevo();
  t.name=String(j.n||"").slice(0,60);t.score=String(j.t||"").slice(0,20);t.note=String(j.o||"").slice(0,500);
  const nameOf={};for(const n in I.ids)nameOf[I.ids[n]]=n;
  (j.d||[]).slice(0,NDISC).forEach((x,i)=>{if(!x)return;const m=String(x).match(/^(\d+)\.(\d)$/);if(m&&nameOf[m[1]])t.discs[i]={n:nameOf[m[1]],a:+m[2]}});
  for(let s=0;s<3;s++){
    const slug=(j.c||[])[s];if(!slug)continue;t.slots[s]={c:String(slug),p:{},g:String((j.e||[])[s]||"..").split(".").slice(0,3).map(x=>x?x.split("-").map(Number).filter(n=>n>0).slice(0,4):[])};
    const g=gidOf(P,slug),F=await getF(slug),role=s===0?"main":"support";
    if(!g||!F||!F.potenciales)continue;
    const T2=F.potenciales[role]||F.potenciales.main;
    String((j.p||[])[s]||"").split(",").forEach(it=>{
      const m=it.match(/^(\d+)\.(\d)([cmo])$/);if(!m)return;
      const nm=P[g].names[m[1]],p=T2.l.find(x=>x.ne===nm);
      if(p)t.slots[s].p[role+"|"+p.g+"|"+p.ne]={l:+m[2],pr:m[3]};
    });
  }
  return fix(t);
}
function peek(txt){
  try{
    const m=String(txt).trim().replace(/\s+/g,"");
    const j=unb64(m.replace(/^SSV\d:/,""));
    if(/^SSV3:/.test(m))return{n:j.n,c:j.c||[],d:(j.d||[]).filter(Boolean).length,t:j.t,k:JSON.stringify([j.c||[],j.p||[],j.d||[]])};
    return{n:j.name,c:(j.slots||[]).map(x=>x.c),d:(j.discs||[]).filter(Boolean).length,t:j.score};
  }catch(x){return null}
}
async function parseAny(txt){
  txt=String(txt||"").trim();
  const g=await gameDecode(txt);if(g)return[g];
  if(/^SSV3:/.test(txt.replace(/\s+/g,""))){try{return[await decodeV3(unb64(txt.replace(/\s+/g,"").slice(5)))]}catch(x){return null}}
  return parse(txt);
}
async function copiar(txt,box,msg){let ok=false;try{await navigator.clipboard.writeText(txt);ok=true}catch(x){}
  box.innerHTML=`<p class="nota">${ok?msg+" Copiado al portapapeles.":"No pude copiar solo; selecciona el texto y cópialo."}</p><textarea class="tm-tb" readonly>${e(txt)}</textarea>`}
function descarga(txt,nombre){try{const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([txt],{type:"application/json"}));a.download=nombre;document.body.appendChild(a);a.click();a.remove()}catch(x){}}

/* ---------- piezas compartidas editor / ficha ---------- */
const sortedPots=(S,F)=>{
  if(!F||!F.potenciales)return[];const role=S.__r,Tt=F.potenciales[role]||F.potenciales.main,out=[];
  for(const p of Tt.l){const v=S.p[role+"|"+p.g+"|"+p.ne];if(v)out.push({p,v})}
  return out.sort((a,b)=>PORD[a.v.pr]-PORD[b.v.pr]||a.p.t-b.p.t)};
function potLines(list){return list.map(({p,v})=>`<div class="tm-pl">${p.iu?`<img src="${e(p.iu)}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()">`:""}<div class="tm-n"><b>${e(p.n)}</b></div><span class="tm-lvc">LV ${v.l}</span><span class="tm-tg tm-pr-${v.pr}">${PRI[v.pr]}</span></div>`).join("")}
function banner(s,ed){
  const S=T.slots[s],c=charOf(S.c);
  return `<div class="tm-bn" style="--tc:${ec(c.element)}"><img class="tm-av" src="${e(imgC(c))}" alt="" referrerpolicy="no-referrer" onerror="this.style.visibility='hidden'"><div><h4>${e(c.name)}</h4><div class="tm-m"><span>${star(c.rarity,13)}</span><span>${eli(c.element)}${e(c.element)}</span></div></div>${ed?`<div class="tm-bx"><button data-a="char" data-s="${s}">Cambiar</button><button data-a="cx" data-s="${s}">Quitar</button></div>`:""}</div>`;
}
function discTile(i,ed){
  const D=T.discs[i],d=D&&discOf(D.n);
  if(!D)return ed?`<button class="tm-dt" data-a="disc" data-i="${i}" aria-label="Elegir disco">+</button>`:"";
  return `<div class="tm-dt f" style="--tc:${ec(d&&d.element)}"${ed?` data-a="disc" data-i="${i}"`:""}>${d?`<img src="${e(imgD(d))}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.style.visibility='hidden'">`:""}<span class="tm-dn">${e(D.n)}</span>${ed?`<span class="tm-dx" data-a="dx" data-i="${i}">✕</span><select class="tm-da" data-a="asc" data-i="${i}" aria-label="Ascensión">${[0,1,2,3,4,5,6,7,8].map(a=>`<option value="${a}"${a===D.a?" selected":""}>${a===0?"Asc 0":"Asc "+a}</option>`).join("")}</select>`:`<span class="tm-da" style="position:absolute;top:3px;left:3px;padding:2px 6px">Asc ${D.a}</span>`}</div>`;
}
/* ---------- imagen vertical para compartir ---------- */
function loadImg(u){return new Promise(r=>{if(!u)return r(null);const i=new Image();i.crossOrigin="anonymous";i.referrerPolicy="no-referrer";const t=setTimeout(()=>r(null),9000);i.onload=()=>{clearTimeout(t);r(i)};i.onerror=()=>{clearTimeout(t);r(null)};i.src=u})}
function rr(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()}
function cover(c,im,x,y,w,h,top){const k=Math.max(w/im.width,h/im.height),dw=im.width*k,dh=im.height*k;c.drawImage(im,x+(w-dw)/2,top?y:y+(h-dh)/2,dw,dh)}
function wrapT(c,t,mw,ml){const w=String(t||"").split(/\s+/),L=[];let l="";for(const x of w){const n=l?l+" "+x:x;if(c.measureText(n).width>mw&&l){L.push(l);l=x}else l=n}if(l)L.push(l);if(ml&&L.length>ml){L.length=ml;L[ml-1]=L[ml-1].replace(/.{0,2}$/,"…")}return L}
async function imagen(){
  try{await imagen2()}catch(err){const ib=document.querySelector("#tm-ib");if(ib)ib.innerHTML='<p class="nota">No se pudo generar la imagen ("'+e(err&&err.message||err)+'"). Cierra y vuelve a intentarlo, o haz una captura de pantalla de la ficha del equipo.</p>'}
}
async function imagen2(){
  const m=document.createElement("div");m.className="tm-md";
  m.innerHTML='<div class="tm-mh"><div class="tm-mt"><b>Imagen para compartir</b><button class="chip" data-x="1">Cerrar</button></div></div><div class="tm-mb" id="tm-ib"><p class="nota">Dibujando la imagen… puede tardar unos segundos.</p></div>';
  openM(m);m.querySelector("[data-x]").onclick=()=>closeM(m);
  const W=2000,P=40,G=24,CW=Math.floor((W-2*P-2*G)/3),RH=84,GH=46,PRIc={c:"#ff6ec7",m:"#a78bfa",o:"#6b6890"};
  const F=[];for(let s=0;s<3;s++){T.slots[s].__r=s===0?"main":"support";F.push(T.slots[s].c?await getF(T.slots[s].c):null)}
  const PL=[0,1,2].map(s=>sortedPots(T.slots[s],F[s]));
  const grp=s=>["c","m","o"].map(k=>({k,L:PL[s].filter(x=>x.v.pr===k)})).filter(g=>g.L.length);
  const emL=[0,1,2].map(s=>emOfSlot(s)),emG=s=>T.slots[s].g||[[],[],[]];
  const EHs=s=>{const L=emL[s];if(!L||!emG(s).some(a=>a.length))return 0;return 44+L.reduce((q,m,k)=>q+46+Math.max(1,emG(s)[k].length)*30,0)};
  const potH=s=>160+(grp(s).reduce((a,g)=>a+GH+g.L.length*RH,0)||60)+20,maxPot=Math.max(potH(0),potH(1),potH(2)),colH=s=>maxPot+Math.max(EHs(0),EHs(1),EHs(2));
  const dm=T.discs.slice(0,3).map((d,i)=>d&&{d,i}).filter(Boolean),ds=T.discs.slice(3).map((d,i)=>d&&{d,i:i+3}).filter(Boolean);
  const tmp=document.createElement("canvas").getContext("2d");tmp.font="28px sans-serif";
  const nt=T.note?wrapT(tmp,T.note,W-2*P-40,4):[];
  const hHead=236,hCols=Math.max(colH(0),colH(1),colH(2)),hDisc=(dm.length||ds.length)?320:0,hNote=nt.length?40+nt.length*38+30:0;
  const H=hHead+hCols+hDisc+hNote+90;
  const cv=document.createElement("canvas");cv.width=W;cv.height=H;const c=cv.getContext("2d");
  const urls=new Set();[0,1,2].forEach(s=>{const ch=charOf(T.slots[s].c);if(ch)urls.add(imgC(ch));PL[s].forEach(x=>urls.add(x.p.iu))});T.discs.forEach(D=>{const d=D&&discOf(D.n);if(d)urls.add(imgD(d))});[0,1,2].forEach(s=>{const L=emL[s];if(L&&emG(s).some(a=>a.length))L.forEach(m=>urls.add(emUrl(m)))});
  const IM={};await Promise.all([...urls].map(async u=>{IM[u]=await loadImg(u)}));
  let g=c.createLinearGradient(0,0,W,H);g.addColorStop(0,"#1c1650");g.addColorStop(.5,"#0f0c2a");g.addColorStop(1,"#0a0820");c.fillStyle=g;c.fillRect(0,0,W,H);
  c.fillStyle="rgba(123,108,255,.08)";for(let y=0;y<H;y+=32)for(let x=(y/32%2)*16;x<W;x+=32){c.beginPath();c.arc(x,y,2,0,7);c.fill()}
  c.textBaseline="alphabetic";c.textAlign="left";
  c.fillStyle="#9d93ff";c.font="bold 26px sans-serif";c.fillText("STELLA SORA VITA · EQUIPO",P,66);
  c.fillStyle="#fff";let fs=84;c.font="bold "+fs+"px sans-serif";const nm=T.name||"Equipo";while(c.measureText(nm).width>W-2*P-560&&fs>40){fs-=4;c.font="bold "+fs+"px sans-serif"}c.fillText(nm,P,150);
  /* leyenda y récord (derecha) */
  c.textAlign="right";if(T.score){c.fillStyle="#ffd76a";c.font="bold 40px sans-serif";c.fillText("Récord: "+T.score,W-P,80)}
  c.font="bold 24px sans-serif";let lx=W-P;[["o","Opcional"],["m","Medio"],["c","Clave"]].forEach(([k,l])=>{c.fillStyle="#e8e4ff";c.fillText(l,lx,150);const w=c.measureText(l).width;c.fillStyle=PRIc[k];rr(c,lx-w-38,130,26,26,8);c.fill();lx-=w+66});c.textAlign="left";
  {let cx=P;[0,1,2].forEach(s=>{const ch=charOf(T.slots[s].c);if(!ch)return;const l=ch.name+" · "+ch.element;c.font="bold 22px sans-serif";const w=c.measureText(l).width+36;c.fillStyle=ec(ch.element);c.globalAlpha=.3;rr(c,cx,176,w,34,17);c.fill();c.globalAlpha=1;c.strokeStyle=ec(ch.element);c.lineWidth=2;rr(c,cx,176,w,34,17);c.stroke();c.fillStyle="#fff";c.fillText(l,cx+18,200);cx+=w+12})}
  for(let s=0;s<3;s++){
    const S=T.slots[s],ch=charOf(S.c),col=ec(ch&&ch.element),x0=P+s*(CW+G),y0=hHead,h=hCols-20;
    g=c.createLinearGradient(0,y0,0,y0+h);g.addColorStop(0,"rgba(30,24,72,.96)");g.addColorStop(1,"rgba(14,11,38,.96)");c.fillStyle=g;rr(c,x0,y0,CW,h,28);c.fill();c.save();c.shadowColor=col;c.shadowBlur=18;c.strokeStyle=col;c.globalAlpha=.7;c.lineWidth=3;c.stroke();c.restore();
    c.save();rr(c,x0,y0,CW,140,28);c.clip();g=c.createLinearGradient(x0,0,x0+CW,0);g.addColorStop(0,col);g.addColorStop(1,"#0d0a26");c.fillStyle=g;c.fillRect(x0,y0,CW,140);c.restore();
    c.fillStyle="rgba(255,255,255,.8)";c.font="bold 20px sans-serif";c.fillText(ROLE[s].toUpperCase(),x0+160,y0+34);
    if(ch){
      const im=IM[imgC(ch)];c.save();c.beginPath();c.arc(x0+80,y0+70,54,0,7);c.clip();c.fillStyle="#15122a";c.fillRect(x0+26,y0+16,108,108);if(im)cover(c,im,x0+26,y0+16,108,108,true);c.restore();
      c.strokeStyle="#fff";c.lineWidth=5;c.beginPath();c.arc(x0+80,y0+70,54,0,7);c.stroke();
      c.fillStyle="#fff";c.font="bold 46px sans-serif";c.fillText(ch.name,x0+160,y0+88);
      c.font="bold 26px sans-serif";c.fillStyle="#ffd76a";c.fillText("★".repeat(ch.rarity),x0+160,y0+124);c.fillStyle="#fff";c.fillText(ch.element,x0+160+ch.rarity*28+16,y0+124);
    }else{c.fillStyle="#fff";c.font="bold 38px sans-serif";c.fillText("Sin personaje",x0+160,y0+88)}
    c.fillStyle="#cfc8ff";c.font="bold 22px sans-serif";c.textAlign="right";c.fillText(PL[s].length+" potenciales",x0+CW-20,y0+34);c.textAlign="left";
    if(EHs(s)){let ey=y0+maxPot+16;c.fillStyle="#9d93ff";c.font="bold 22px sans-serif";c.fillText("EMBLEMAS",x0+24,ey);ey+=12;
      emL[s].forEach((m,k)=>{const a=emG(s)[k],h=34+Math.max(1,a.length)*30,tx=x0+20,tw=CW-40;c.fillStyle="rgba(255,255,255,.06)";rr(c,tx,ey,tw,h,14);c.fill();c.strokeStyle=EMT[m.t].c;c.lineWidth=3;rr(c,tx,ey,tw,h,14);c.stroke();
        const eim=IM[emUrl(m)];if(eim)c.drawImage(eim,tx+10,ey+6,48,48);else{const z=.8,ox=tx+14,oy=ey+8;c.beginPath();EMP[m.f].forEach((p,i)=>{const X=ox+p[0]*z,Y=oy+p[1]*z;i?c.lineTo(X,Y):c.moveTo(X,Y)});c.closePath();c.fillStyle=EMT[m.t].c;c.fill();c.strokeStyle="#fff";c.lineWidth=2;c.lineJoin="round";c.stroke()}
        c.fillStyle="#fff";c.font="bold 20px sans-serif";c.fillText("Nivel "+LVL[k]+" · "+EMS[m.f]+" · "+EMT[m.t].n,tx+56,ey+30);
        c.font="20px sans-serif";c.fillStyle="#cfc8ff";if(!a.length)c.fillText("—",tx+56,ey+58);a.forEach((id,q)=>c.fillText("• "+emLabel(s,id),tx+56,ey+58+q*30));
        ey+=h+8})}
    let py=y0+160;const gs=grp(s);
    if(!gs.length){c.fillStyle="#8a85b5";c.font="28px sans-serif";c.fillText("Sin potenciales elegidos",x0+24,py+34)}
    gs.forEach(gr=>{
      c.fillStyle=PRIc[gr.k];c.beginPath();c.arc(x0+34,py+20,9,0,7);c.fill();c.fillStyle="#9d93ff";c.font="bold 22px sans-serif";c.fillText(PRI[gr.k].toUpperCase()+" · "+gr.L.length,x0+54,py+28);py+=GH;
      gr.L.forEach(x=>{
        const im=IM[x.p.iu],ix=x0+20,iy=py+6;
        c.save();rr(c,ix,iy,54,70,10);c.clip();c.fillStyle=x.p.t===1?"#6b2f78":x.p.t===2?"#3b2f7a":"#7a5a14";c.fillRect(ix,iy,54,70);if(im)cover(c,im,ix,iy,54,70,false);c.restore();
        c.fillStyle="#fff";c.font="bold 28px sans-serif";const lw=100;let t=x.p.n;while(c.measureText(t).width>CW-90-lw-44&&t.length>4)t=t.slice(0,-2);if(t!==x.p.n)t=t.trim()+"…";c.fillText(t,x0+90,py+50);
        g=c.createLinearGradient(x0+CW-lw-20,0,x0+CW-20,0);g.addColorStop(0,"#8a7bff");g.addColorStop(1,"#5b4de0");c.fillStyle=g;rr(c,x0+CW-lw-20,py+16,lw,46,23);c.fill();c.fillStyle="#fff";c.font="bold 26px sans-serif";c.textAlign="center";c.fillText("LV "+x.v.l,x0+CW-lw/2-20,py+48);c.textAlign="left";
        py+=RH;
      });
    });
  }
  /* discos */
  let y=hHead+hCols;
  if(hDisc){
    const n=dm.length+ds.length,gap=14,sep=60,tw=Math.floor((W-2*P-(n-1)*gap-(dm.length&&ds.length?sep:0))/Math.max(n,9)),th=Math.round(tw*.72),ty=y+96;
    const tile=(o,x0)=>{const d=discOf(o.d.n),im=d&&IM[imgD(d)];c.save();rr(c,x0,ty,tw,th,14);c.clip();c.fillStyle="#241d55";c.fillRect(x0,ty,tw,th);if(im)cover(c,im,x0,ty,tw,th,true);
      const gg=c.createLinearGradient(0,ty+th-60,0,ty+th);gg.addColorStop(0,"rgba(0,0,0,0)");gg.addColorStop(1,"rgba(0,0,0,.9)");c.fillStyle=gg;c.fillRect(x0,ty+th-60,tw,60);c.restore();
      c.strokeStyle=ec(d&&d.element);c.lineWidth=4;rr(c,x0,ty,tw,th,14);c.stroke();
      c.fillStyle="#fff";c.textAlign="center";c.font="bold 17px sans-serif";wrapT(c,o.d.n,tw-10,2).forEach((l,i,A)=>c.fillText(l,x0+tw/2,ty+th-10-(A.length-1-i)*20));
      c.fillStyle="rgba(0,0,0,.7)";rr(c,x0+6,ty+6,70,26,8);c.fill();c.fillStyle="#fff";c.textAlign="left";c.font="bold 16px sans-serif";c.fillText("Asc "+o.d.a,x0+13,ty+25)};
    c.fillStyle="#fff";c.font="bold 34px sans-serif";c.fillText("Discos",P,y+34);c.fillStyle="rgba(123,108,255,.35)";c.fillRect(P+140,y+24,W-2*P-140,3);
    let x=P;c.font="bold 20px sans-serif";
    if(dm.length){c.fillStyle="#9d93ff";c.fillText("PRINCIPALES",x,ty-12);dm.forEach(o=>{tile(o,x);x+=tw+gap});x+=sep-gap}
    if(ds.length){c.fillStyle="#9d93ff";c.font="bold 20px sans-serif";c.fillText("DE APOYO Y RECOMENDADOS",x,ty-12);ds.forEach(o=>{tile(o,x);x+=tw+gap})}
    y+=hDisc;
  }
  if(nt.length){c.fillStyle="rgba(20,16,50,.92)";rr(c,P,y,W-2*P,40+nt.length*38,20);c.fill();c.fillStyle="#e8e4ff";c.font="28px sans-serif";nt.forEach((l,i)=>c.fillText(l,P+20,y+46+i*38))}
  g=c.createLinearGradient(W/2-330,0,W/2+330,0);g.addColorStop(0,"#8a7bff");g.addColorStop(1,"#5CE1E6");c.fillStyle=g;rr(c,W/2-330,H-78,660,50,25);c.fill();c.fillStyle="#0b0a1f";c.font="bold 24px sans-serif";c.textAlign="center";c.fillText("Stella Sora Vita · fan site no oficial",W/2,H-45);
  const ib=m.querySelector("#tm-ib");
  const blob=await new Promise(r=>{try{cv.toBlob(r,"image/png")}catch(x){r(null)}});
  let url="";if(blob)url=URL.createObjectURL(blob);else{try{url=cv.toDataURL("image/png")}catch(x){}}
  if(!url){ib.innerHTML='<p class="nota">El navegador no dejó exportar la imagen porque algunas imágenes externas no lo permiten. Haz una captura de pantalla de la ficha del equipo.</p>';return}
  const miss=Object.values(IM).filter(x=>!x).length;
  ib.innerHTML=`<img src="${url}" alt="Equipo" style="width:100%;border-radius:12px;display:block">${miss?`<p class="nota">${miss} imagen(es) no se pudieron cargar y salen como recuadro de color.</p>`:""}<div class="tm-act"><button class="btn" id="tm-dl">Descargar PNG</button><button class="btn out" id="tm-sh">Compartir…</button></div><p class="nota">También puedes mantener presionada la imagen para guardarla.</p><p class="nota" id="tm-sm"></p>`;
  const fn=(T.name||"equipo").replace(/[^\w-]+/g,"_")+".png",msg=t=>{const x=ib.querySelector("#tm-sm");if(x)x.textContent=t};
  ib.querySelector("#tm-dl").onclick=()=>{const a=document.createElement("a");a.href=url;a.download=fn;document.body.appendChild(a);a.click();a.remove();msg("Si no se descargó, mantén presionada la imagen y elige guardar.")};
  ib.querySelector("#tm-sh").onclick=async()=>{
    try{
      if(blob&&navigator.canShare){const f=new File([blob],fn,{type:"image/png"});if(navigator.canShare({files:[f]})){await navigator.share({files:[f],title:T.name||"Equipo"});return}}
      msg("Tu navegador no permite compartir imagen directo: usa Descargar o mantén presionada la imagen para guardarla y luego súbela a la red social.");
    }catch(x){if(x&&x.name!=="AbortError")msg("No se pudo abrir el menú de compartir: usa Descargar o mantén presionada la imagen.")}
  };
}


/* ---------- sinergia: mono-elemental + Vanguard / Versatil / Apoyo ---------- */
const RN={Vanguard:"Vanguard",Versatile:"Versátil",Support:"Apoyo"},RO=["Vanguard","Versatile","Support"];
function synergy(){
  const ch=T.slots.map(x=>charOf(x.c)).filter(Boolean);if(!ch.length)return"";
  const cnt={};ch.forEach(c=>cnt[c.element]=(cnt[c.element]||0)+1);
  let dom=ch[0].element;for(const k in cnt)if(cnt[k]>cnt[dom])dom=k;
  const L=[],full=ch.length===3,mono=cnt[dom]===ch.length;
  if(mono&&full)L.push(["ok",`Equipo mono-elemental (${dom})`]);
  else if(mono)L.push(["ok",`Todos son ${dom}: buen camino a mono-elemental`]);
  else{const f=ch.filter(c=>c.element!==dom).map(c=>`${c.name} (${c.element})`).join(", ");L.push(["w",`No es mono-elemental. Fuera de ${dom}: ${f}`])}
  const on=ch.filter(c=>c.element===dom),have=on.map(c=>c.role),miss=RO.filter(r=>!have.includes(r));
  if(full&&!miss.length&&mono)L.push(["ok","Composición completa: Vanguard + Versátil + Apoyo"]);
  else{
    const dup=RO.filter(r=>have.filter(x=>x===r).length>1);
    if(dup.length)L.push(["w","Repetido: "+dup.map(r=>RN[r]).join(", ")]);
    
    if(miss.length)L.push(["i","Te falta: "+miss.map(r=>RN[r]).join(" / ")]);
  }
  const inT=new Set(ch.map(c=>c.id)),sug=[];
  if(miss.length)miss.forEach(r=>{
    const o=chars().filter(c=>c.element===dom&&c.role===r&&!inT.has(c.id)).sort((a,b)=>b.rarity-a.rarity).slice(0,3);
    if(o.length)sug.push(`<div class="tm-sg"><b>${RN[r]} de ${dom}:</b> ${o.map(c=>e(c.name)).join(", ")}</div>`)});
  return `<div class="tm-sl tm-syn"><div class="tm-dh"><b>Sinergia</b><small>${e(dom)}</small></div>`+
    L.map(x=>`<div class="tm-sy ${x[0]}">${x[0]==="ok"?"✓":x[0]==="w"?"⚠":"•"} ${x[1]}</div>`).join("")+sug.join("")+
    `<p class="tm-hint">Recomendado: equipo de un solo elemento con un Vanguard, un Versátil y un Apoyo.</p></div>`;
}

/* ---------- editor ---------- */
function slotHtml(s){
  const S=T.slots[s],c=charOf(S.c);S.__r=s===0?"main":"support";
  return `<div class="tm-sl" data-s="${s}"><div class="tm-lab">${ROLE[s]}</div>`+(c?banner(s,true)+`<div class="tm-pb"><div class="tm-pbh"><span>Potenciales · <span id="tm-pc${s}">0</span></span><button class="tm-add" style="--tc:${ec(c.element)}" data-a="pots" data-s="${s}">Editar</button></div><div id="tm-pl${s}"><p class="tm-hint">Cargando…</p></div></div>${embBlock(s,true)}`
   :`<button class="tm-empty" data-a="char" data-s="${s}"><b>+</b>Elegir Trekker</button>`)+`</div>`;
}
async function pintaPots(s,esVista){
  const S=T.slots[s],box=root.querySelector("#tm-pl"+s),cnt=root.querySelector("#tm-pc"+s);if(!S.c||!box)return;
  const F=await getF(S.c);if(!box.isConnected)return;
  const L=sortedPots(S,F);if(cnt)cnt.textContent=L.length;
  box.innerHTML=L.length?potLines(L):`<p class="tm-hint">${esVista?"Sin potenciales.":"Aún sin potenciales. Toca “Editar” para elegirlos (opcional)."}</p>`;
}
function vEdit(){
  mode="edit";const y=window.scrollY;
  root.innerHTML=`<button class="tm-bk" data-a="back">‹ Mis equipos</button>
   <input class="tm-in tm-name" id="tm-name" placeholder="Ponle nombre a tu equipo" maxlength="60" value="${e(T.name)}">
   ${[0,1,2].map(slotHtml).join("")}
   ${synergy()}
   <div class="tm-sl"><div class="tm-dh"><b>Discos principales</b><small>${T.discs.slice(0,3).filter(Boolean).length}/3</small></div><div class="tm-dg">${[0,1,2].map(i=>discTile(i,true)).join("")}</div>
    <div class="tm-dh"><b>De apoyo y recomendados</b><small>${T.discs.slice(3).filter(Boolean).length}/6</small></div><div class="tm-dg">${[3,4,5,6,7,8].map(i=>discTile(i,true)).join("")}</div></div>
   <div class="tm-sl"><div class="tm-dh"><b>Récord y notas</b><small>opcional</small></div><div class="tm-sec"><input class="tm-in" id="tm-score" inputmode="numeric" placeholder="Tu récord (puntaje)" maxlength="20" value="${e(T.score)}"><textarea class="tm-ta" id="tm-note" placeholder="Cómo se juega, qué tomar si no sale un potencial, rotación…" maxlength="500">${e(T.note)}</textarea></div></div>
   <button class="btn" data-a="save">Guardar equipo</button>
   <div class="tm-act"><button class="btn out" data-a="vv">Ver ficha</button></div><div class="tm-act"><button class="btn out" data-a="img">Imagen para compartir</button><button class="btn out" data-a="gcode">Preset del juego</button></div><div id="tm-io-box"></div>`;
  [0,1,2].forEach(s=>pintaPots(s));window.scrollTo(0,y);
}
function leer(){if(mode!=="edit")return;const a=root.querySelector("#tm-name");if(!a)return;T.name=a.value.trim();T.score=root.querySelector("#tm-score").value.trim();T.note=root.querySelector("#tm-note").value}
function clean(){const cp=JSON.parse(JSON.stringify(T));cp.slots.forEach(s=>delete s.__r);return cp}
function guardar(){
  leer();const i=ST.teams.findIndex(x=>x.id===T.id),cp=clean();
  if(!cp.name)cp.name="Equipo "+(ST.teams.length+(i<0?1:0));
  if(i<0)ST.teams.unshift(cp);else ST.teams[i]=cp;T.name=cp.name;return save();
}
function flash(t){const b=root.querySelector("[data-a=save]");if(!b)return;const o=b.textContent;b.textContent=t;setTimeout(()=>{b.textContent=o},1500)}

/* ---------- ficha (vista) ---------- */
function vView(){
  mode="view";
  root.innerHTML=`<button class="tm-bk" data-a="back">${fromCom?"‹ Builds de la comunidad":"‹ Mis equipos"}</button>
   <div class="tm-fh"><div class="nota" style="margin:0">${T.__ro?"BUILD DE LA COMUNIDAD":"FICHA DE EQUIPO"}</div><h3>${e(T.name||"Equipo sin nombre")}</h3>${T.__al?`<p>Por <b>${e(T.__al)}</b></p>`:""}${T.score?`<p>Récord: <b>${e(T.score)}</b></p>`:""}${T.note?`<p>${e(T.note)}</p>`:""}</div>
   ${[0,1,2].map(s=>{T.slots[s].__r=s===0?"main":"support";const c=charOf(T.slots[s].c);return `<div class="tm-sl"><div class="tm-lab">${ROLE[s]}</div>`+(c?banner(s,false)+`<div class="tm-pb"><div class="tm-pbh"><span>Potenciales · <span id="tm-pc${s}">0</span></span></div><div id="tm-pl${s}"></div></div>${embBlock(s,false)}`:`<p class="tm-hint" style="padding:12px">Sin personaje.</p>`)+`</div>`}).join("")}
   ${synergy()}
   <div class="tm-sl"><div class="tm-dh"><b>Discos principales</b></div><div class="tm-dg">${[0,1,2].map(i=>discTile(i,false)||"").join("")}</div>
    ${T.discs.slice(3).some(Boolean)?`<div class="tm-dh"><b>De apoyo y recomendados</b></div><div class="tm-dg">${[3,4,5,6,7,8].map(i=>discTile(i,false)).join("")}</div>`:""}</div>
   ${T.__ro?`<button class="btn" data-a="savecopy">Guardar en mis equipos</button>
   <div class="tm-act"><button class="btn" data-a="img" style="flex:1 0 100%">Imagen para compartir</button><button class="btn out" data-a="gcode">Preset del juego</button></div><div id="tm-io-box"></div>`
   :`<button class="btn" data-a="edit">Editar equipo</button>
   <div class="tm-act"><button class="btn" data-a="img" style="flex:1 0 100%">Imagen para compartir</button>${cfgC().form?`<button class="btn" data-a="pub" style="flex:1 0 100%">Publicar en la comunidad</button>`:""}<button class="btn out" data-a="gcode">Preset del juego</button><button class="btn out" data-a="dup">Duplicar</button><button class="btn out" data-a="del">Eliminar</button></div><div id="tm-io-box"></div>`}`;
  [0,1,2].forEach(s=>pintaPots(s,true));window.scrollTo(0,0);
}

function onClick(ev){
  const el=ev.target.closest("[data-a]");if(!el)return;const a=el.dataset.a;
  if(a==="asc")return;
  if(a==="mine"){pushV();vList()}
  else if(a==="new"){T=nuevo();pushV();vEdit()}
  else if(a==="view"){T=fix(JSON.parse(JSON.stringify(ST.teams.find(x=>x.id===el.dataset.id))));pushV();vView()}
  else if(a==="edit"){vEdit()}
  else if(a==="vv"){guardar();vView()}
  else if(a==="back"){toList()}
  else if(a==="save"){flash(guardar()?"✓ Guardado":"No se pudo guardar")}
  else if(a==="del"){if(confirm("¿Eliminar este equipo?")){ST.teams=ST.teams.filter(x=>x.id!==T.id);save();toList()}}
  else if(a==="dup"){const c=clean();c.id=uid();c.name=(c.name||"Equipo")+" (copia)";ST.teams.unshift(c);save();toList()}
  else if(a==="img"){leer();imagen()}
  else if(a==="savecopy"){const c=clean();delete c.__ro;delete c.__al;c.id=uid();ST.teams.unshift(c);save();el.textContent="✓ Guardado en tus equipos"}
  else if(a==="pub"){publicar(clean())}
  else if(a==="gcode"){leer();const bx=root.querySelector("#tm-io-box");bx.innerHTML='<p class="nota">Generando…</p>';gameCode().then(c=>{if(!c)bx.innerHTML='<p class="nota">Elige los 3 personajes para generar el código de preset del juego.</p>';else copiar(c,bx,"Código de preset del juego (incluye los 3 personajes y sus potenciales; no incluye discos).")})}
  else if(a==="imp"){const b=root.querySelector("#tm-io-box");b.innerHTML=`<p class="nota">Pega aquí un código de preset del juego.</p><textarea class="tm-tb" id="tm-imp-t"></textarea><button class="btn" data-a="imp2">Importar</button><p class="nota" id="tm-imp-m"></p>`}
  else if(a==="imp2"){const txt=root.querySelector("#tm-imp-t").value,m=root.querySelector("#tm-imp-m");
    gameDecode(txt.trim()).then(g=>{
      if(!g){m.textContent="No reconocí ese código de preset del juego.";return}
      ST.teams=[g].concat(ST.teams);save();vList()})}
  else if(a==="char"){const s=+el.dataset.s;picker("Elegir Trekker",charItems(s),it=>{leer();const old=T.slots[s];T.slots[s]={c:it.id,p:old&&old.c===it.id?old.p:{},g:old&&old.c===it.id?old.g:[[],[],[]]};vEdit()})}
  else if(a==="cx"){leer();T.slots[+el.dataset.s]={c:"",p:{},g:[[],[],[]]};vEdit()}
  else if(a==="emb"){embPicker(+el.dataset.s,+el.dataset.k)}
  else if(a==="pots"){leer();potModal(+el.dataset.s)}
  else if(a==="disc"){const i=+el.dataset.i;picker("Elegir disco",discItems(),it=>{leer();T.discs[i]={n:it.n,a:(T.discs[i]&&T.discs[i].a)||8};vEdit()},{sq:true})}
  else if(a==="dx"){ev.stopPropagation();leer();T.discs[+el.dataset.i]=null;vEdit()}
}
function onChange(ev){const el=ev.target;if(el.dataset&&el.dataset.a==="asc"){T.discs[+el.dataset.i].a=+el.value}}
const cfgC=()=>window.SSV_COMUNIDAD||{};
function csvParse(t){const R=[];let r=[],f="",q=false;for(let i=0;i<t.length;i++){const ch=t[i];
  if(q){if(ch==='"'){if(t[i+1]==='"'){f+='"';i++}else q=false}else f+=ch}
  else if(ch==='"')q=true;else if(ch===","){r.push(f);f=""}else if(ch==="\n"){r.push(f);R.push(r);r=[];f=""}else if(ch!=="\r")f+=ch}
  if(f||r.length){r.push(f);R.push(r)}return R}
async function cmLoad(){
  const cfg=cfgC();if(!cfg.csv)return null;
  const r=await fetch(cfg.csv,{cache:"no-cache"});if(!r.ok)throw new Error("HTTP "+r.status);
  const R=csvParse(await r.text());if(R.length<2)return[];
  const H=R[0].map(h=>norm(h)),ix=re=>H.findIndex(h=>re.test(h));
  const ic=ix(/codigo|code/),ia=ix(/alias|autor|author|nombre/),ip=ix(/aprob|approved/),it=ix(/marca|timestamp|fecha/);
  if(ic<0)return[];
  const ok=v=>/^(si|yes|true|1|x|ok|aprobado)$/.test(norm(v).trim());
  const out=[],vistos=new Set();
  R.slice(1).forEach((row,k)=>{
    if(ip>=0&&!ok(row[ip]||""))return;
    const code=(row[ic]||"").trim(),pk=peek(code);if(!pk)return;
    const kk=pk.k||code;if(vistos.has(kk))return;vistos.add(kk);
    out.push({code,alias:String(ia>=0?row[ia]:"").trim().slice(0,40)||"Anónimo",title:String(pk.n||"Build").slice(0,60),pk,k});
  });
  return out.reverse();
}
let CMD=null;
let cmEl="";
(function(){const s=document.createElement("style");s.textContent=`
.cm-c{position:relative;border-radius:18px;margin-bottom:14px;cursor:pointer;overflow:hidden;border:1px solid #2c2850;background:linear-gradient(180deg,rgba(28,22,66,.9),rgba(16,13,40,.92));box-shadow:0 4px 14px rgba(0,0,0,.28)}
.cm-c:active{transform:scale(.99)}
.cm-hd{position:relative;padding:14px 14px 10px;overflow:hidden}
.cm-hd:before{content:"";position:absolute;inset:0;background:var(--bgi) center 18%/cover;opacity:.22;filter:blur(2px)}
.cm-hd:after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,var(--c1,#7b6cff)55%,transparent) ,linear-gradient(180deg,transparent 40%,rgba(16,13,40,.95));opacity:.28}
.cm-hd>*{position:relative;z-index:1}
.cm-hd h4{margin:0 0 10px;font-size:1.08rem;line-height:1.25}
.cm-av{display:flex;gap:10px}
.cm-m{flex:1;min-width:0;text-align:center}
.cm-m img,.cm-m i{display:block;width:100%;aspect-ratio:1;max-width:84px;margin:0 auto;border-radius:16px;object-fit:cover;object-position:top;background:#221E3A;border:2px solid var(--mc,#3a3660);box-shadow:0 3px 10px rgba(0,0,0,.4)}
.cm-m b{display:block;margin-top:4px;font-size:.72rem;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cm-ft{display:flex;flex-wrap:wrap;align-items:center;gap:6px;padding:10px 14px 12px}
.cm-t{font-size:.72rem;padding:4px 9px;border-radius:9px;background:rgba(255,255,255,.08);color:#d8d2ff}
.cm-t.au{background:rgba(92,225,230,.16);color:#8ff0f3}.cm-t.rc{background:rgba(232,196,106,.18);color:#f3d98a}
.cm-go{margin-left:auto;font-size:.78rem;font-weight:800;color:#b7acff}
.cm-f{display:flex;gap:6px;overflow-x:auto;padding:2px 0 10px;scrollbar-width:none}.cm-f::-webkit-scrollbar{display:none}
.cm-f .chip{flex:none;padding:6px 12px;font-size:.78rem;white-space:nowrap}.cm-f .chip i{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:5px;background:var(--ec,#7b6cff)}
.cm-n{font-size:.78rem;color:var(--t2);margin:0 2px 8px}
`;document.head.appendChild(s)})();
function cmCard(x){
  const cs=(x.pk.c||[]).slice(0,3).map(sl=>charOf(sl)),c0=cs[0];
  const av=cs.map(c=>c?`<div class="cm-m" style="--mc:${ec(c.element)}"><img src="${e(imgC(c))}" alt="${e(c.name)}" loading="lazy" referrerpolicy="no-referrer" onerror="this.style.visibility='hidden'"><b>${e(c.name)}</b></div>`:`<div class="cm-m"><i></i></div>`).join("");
  return `<div class="cm-c" data-c="open" data-k="${x.k}"><div class="cm-hd" style="--c1:${c0?ec(c0.element):"#7b6cff"};--bgi:url('${c0?e(imgC(c0)):""}')"><h4>${e(x.title)}</h4><div class="cm-av">${av}</div></div>
   <div class="cm-ft"><span class="cm-t au">👤 ${e(x.alias)}</span><span class="cm-t">💿 ${x.pk.d||0} discos</span>${x.pk.t?`<span class="cm-t rc">⏱ ${e(x.pk.t)}</span>`:""}<span class="cm-go">Ver build ›</span></div></div>`;
}
window.communityShow=async function(){
  const box=document.getElementById("cm-root");if(!box)return;
  const cfg=cfgC();
  box.innerHTML=`<div class="tm-hero"><h3>Builds de la comunidad</h3><p>Equipos compartidos por otros jugadores. Toca uno para ver la ficha completa y guardarlo.</p>${cfg.form?`<button class="btn" data-c="pub" style="margin:0">Publicar una build</button>`:""}</div>`+
   (cfg.csv?`<input class="tm-in" id="cm-q" type="search" placeholder="Buscar por título, autor o personaje…"><div class="cm-f" id="cm-f"></div><div id="cm-list"><p class="nota">Cargando…</p></div>`:`<p class="nota">La sección de la comunidad aún no está activada.</p>`);
  if(!box._ok){box._ok=1;box.addEventListener("click",async ev=>{
    const el=ev.target.closest("[data-c]");if(!el)return;
    if(el.dataset.c==="pub")pubPicker();
    else if(el.dataset.c==="open"){const x=CMD&&CMD.find(y=>String(y.k)===el.dataset.k);if(x){el.style.opacity=.6;const ok=await window.teamsOpen(x);el.style.opacity=1;if(!ok)alert("No se pudo abrir esta build.")}}
  });box.addEventListener("input",ev=>{if(ev.target.id==="cm-q")cmPaint()})}
  if(!cfg.csv)return;
  try{CMD=await cmLoad();await getPresets();cmPaint()}catch(x){const l=document.getElementById("cm-list");if(l)l.innerHTML='<p class="nota">No se pudieron cargar las builds de la comunidad. Revisa tu conexión e inténtalo de nuevo.</p>'}
};
function cmPaint(){
  const l=document.getElementById("cm-list");if(!l||!CMD)return;
  const q=norm((document.getElementById("cm-q")||{}).value||"");
  const el1=x=>{const c=charOf((x.pk.c||[])[0]);return c?c.element:""};
  const els=[...new Set(CMD.map(el1).filter(Boolean))].sort(),fb=document.getElementById("cm-f");
  if(fb){fb.innerHTML=`<button type="button" class="chip${cmEl?"":" on"}" data-ce="">Todos</button>`+els.map(z=>`<button type="button" class="chip${cmEl===z?" on":""}" data-ce="${z}" style="--ec:${ec(z)}"><i></i>${z}</button>`).join("");
    fb.onclick=ev=>{const b=ev.target.closest("[data-ce]");if(b){cmEl=b.dataset.ce;cmPaint()}}}
  const R=CMD.filter(x=>(!cmEl||el1(x)===cmEl)&&(!q||norm(x.title+" "+x.alias+" "+(x.pk.c||[]).map(s=>{const c=charOf(s);return c?c.name:s}).join(" ")).includes(q)));
  l.innerHTML=(R.length?`<p class="cm-n">${R.length} ${R.length===1?"build":"builds"}</p>`:"")+(R.length?R.slice(0,200).map(cmCard).join(""):`<p class="nota">${CMD.length?"Sin resultados.":"Todavía no hay builds publicadas. ¡Sé la primera persona en publicar una!"}</p>`);
}
function pubPicker(){
  const m=document.createElement("div");m.className="tm-md";
  const A=load().teams;
  m.innerHTML=`<div class="tm-mh"><div class="tm-mt"><b>Publicar una build</b><button class="chip" data-x="1">Cerrar</button></div></div><div class="tm-mb"><p class="nota" style="margin-bottom:12px">Elige uno de tus equipos guardados. Se abrirá un formulario con el código ya puesto; solo tienes que enviarlo. Las builds se revisan antes de aparecer.</p>${A.length?A.map((t,i)=>{const cs=t.slots.map(s=>charOf(s.c)),c0=cs.find(Boolean);return `<button type="button" class="tm-it tm-pub" data-i="${i}" style="--tc:${ec(c0?c0.element:"")}"><span class="tm-pav">${cs.map(c=>c?`<img src="${e(imgC(c))}" alt="" referrerpolicy="no-referrer" onerror="this.style.visibility='hidden'">`:"<i></i>").join("")}</span><span class="tm-pi"><b>${e(t.name||"Equipo sin nombre")}</b><small>${c0?eli(c0.element)+" ":""}${cs.map(c=>c?e(c.name):"—").join(" · ")}</small></span><span class="tm-pg">Publicar</span></button>`}).join(""):'<p class="nota">Aún no tienes equipos guardados. Arma uno en “Armador de equipos” y vuelve aquí.</p>'}</div>`;
  openM(m);m.querySelector("[data-x]").onclick=()=>closeM(m);
  m.querySelectorAll(".tm-it").forEach(b=>b.onclick=()=>{const t=A[+b.dataset.i];closeM(m);setTimeout(()=>publicar(t),50)});
}
function publicar(t){
  const cfg=cfgC();if(!cfg.form){alert("La publicación aún no está activada.");return}
  const m=document.createElement("div");m.className="tm-md";
  let al="";try{al=localStorage.getItem("ssv_alias")||""}catch(x){}
  m.innerHTML=`<div class="tm-mh"><div class="tm-mt"><b>Publicar en la comunidad</b><button class="chip" data-x="1">Cerrar</button></div></div><div class="tm-mb"><p class="nota">“${e(t.name||"Equipo")}” se enviará con el nombre que elijas. No uses datos personales. Las builds se revisan antes de aparecer.</p><input class="tm-in" id="pb-al" maxlength="40" placeholder="Tu alias" value="${e(al)}"><button class="btn" id="pb-go">Abrir formulario</button><p class="nota" id="pb-m"></p></div>`;
  openM(m);m.querySelector("[data-x]").onclick=()=>closeM(m);
  m.querySelector("#pb-go").onclick=async()=>{
    const a=m.querySelector("#pb-al").value.trim()||"Anónimo";try{localStorage.setItem("ssv_alias",a)}catch(x){}
    const c=await codeV3(t);
    const u=cfg.form.replace("ALIAS_AQUI",encodeURIComponent(a)).replace("CODIGO_AQUI",encodeURIComponent(c));
    window.open(u,"_blank");m.querySelector("#pb-m").textContent="Se abrió el formulario con tu equipo ya puesto. Solo envíalo.";
  };
}
window.teamsOpen=async function(item){
  const r=await parseAny(item.code);if(!r||!r[0])return false;
  PEND=r[0];PEND.__ro=true;PEND.__al=item.alias;PEND.name=PEND.name||item.title;location.hash="teams";return true};
window.teamsShow=function(){
  root=document.getElementById("teams-root");if(!root)return;
  if(!root._ok){root._ok=1;root.addEventListener("click",onClick);root.addEventListener("change",onChange)}
  VD=0;fromCom=false;
  const tb=document.querySelector("#s-teams [data-back]");
  if(tb&&!tb._tm){tb._tm=1;tb.addEventListener("click",ev=>{if(mode!=="hub"){ev.stopPropagation();ev.preventDefault();toList()}})}
  if(PEND){T=PEND;PEND=null;fromCom=true;ST=load();vView();return}
  ST=load();Promise.all([getPresets(),getIdx()]).then(()=>{CIM=null;if(mode==="hub")vHub()});vHub();
};
})();
