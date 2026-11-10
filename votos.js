/* Ranking de la comunidad: cada persona marca con corazon los personajes y discos que le gustan;
   el ranking ordena por votos de todos. Datos en un Worker de Cloudflare (votos-config.js). */
(function(){
"use strict";
const e=t=>String(t==null?"":t).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const norm=s=>String(s||"").normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase();
const EC={Aqua:"#1e90d6",Ignis:"#e5533d",Lux:"#e0a82a",Terra:"#a9783a",Umbra:"#8b5cf6",Ventus:"#2fb585"};
const css=document.createElement("style");css.textContent=`
.vt-ovw{padding-bottom:60px}
.vt-t{display:flex;gap:8px;margin:0 0 10px}.vt-t .chip{flex:1;text-align:center}
.vt-h{text-align:center;margin:0 0 12px}.vt-h b{display:block;font-size:1.25rem;color:#ffd98a}.vt-h span{font-size:.78rem;color:var(--t2)}
.vt-r{display:flex;align-items:center;gap:10px;padding:8px 10px;margin:0 0 8px;border-radius:16px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1)}
.vt-r.p1{background:linear-gradient(90deg,rgba(255,206,92,.22),rgba(255,255,255,.05));border-color:rgba(255,206,92,.6)}
.vt-r.p2{border-color:rgba(200,206,225,.55)}.vt-r.p3{border-color:rgba(205,140,90,.55)}
.vt-n{width:30px;text-align:center;font-weight:800;font-size:1rem;color:#cfc8ff;flex:none}
.vt-r img{width:48px;height:48px;border-radius:12px;object-fit:cover;object-position:top;flex:none;background:#1a1733}
.vt-i{flex:1;min-width:0}.vt-i b{display:block;font-size:.92rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.vt-i small{font-size:.72rem;color:var(--t2)}
.vt-b{height:6px;border-radius:6px;background:rgba(255,255,255,.1);margin-top:5px;overflow:hidden}.vt-b i{display:block;height:100%;border-radius:6px;background:linear-gradient(90deg,#f6d77a,#e0a93a)}
.vt-l{flex:none;min-width:54px;border:1px solid #3a3560;background:rgba(123,108,255,.14);color:#cfc8ff;border-radius:999px;padding:7px 10px;font-size:.85rem;cursor:pointer;font-family:inherit}
.vt-l.on{background:linear-gradient(90deg,#f6d77a,#e0a93a);color:#2a1d00;border-color:transparent;font-weight:700}
.vt-note{font-size:.72rem;color:var(--t2);text-align:center;margin:14px 0 0}
.cu-ic.vt-ic{font-size:1.1rem}
`;document.head.appendChild(css);
const cfg=()=>(window.SSV_VOTOS&&window.SSV_VOTOS.worker||"").replace(/\/+$/,"");
function dev(){let d="";try{d=localStorage.getItem("ssv_dev")||""}catch(x){}
  if(!/^[0-9a-f]{32}$/.test(d)){const a=new Uint8Array(16);crypto.getRandomValues(a);d=[...a].map(b=>b.toString(16).padStart(2,"0")).join("");try{localStorage.setItem("ssv_dev",d)}catch(x){}}
  return d}
let tab="pj",DATA=null,busq="";
const items=()=>tab==="pj"
  ?(typeof CHARS!=="undefined"?CHARS:[]).map(c=>({id:c.id,name:c.name,el:c.element,r:c.rarity,img:c.imageUrl,pt:(typeof portC==="function"?portC(c):c.imageUrl)}))
  :(typeof DISCS!=="undefined"?DISCS:[]).map(d=>({id:d.name,name:d.name,el:d.element,r:d.rarity,img:d.imageUrl,pt:d.imageUrl}));
async function cargar(){
  const r=await fetch(cfg()+"/votos?dev="+dev(),{cache:"no-store"});if(!r.ok)throw 0;DATA=await r.json();
  DATA.m={pj:new Set(DATA.mios.pj),ds:new Set(DATA.mios.ds)};}
function pinta(root){
  const T=DATA.tot[tab]||{},M=DATA.m[tab],q=norm(busq);
  const L=items().map(x=>Object.assign({n:T[x.id]||0},x)).sort((a,b)=>b.n-a.n||a.name.localeCompare(b.name));
  const top=L.length?L[0].n:0;
  const total=Object.values(T).reduce((s,n)=>s+n,0);
  let pos=0;const H=L.map(x=>{pos++;return{x,pos}}).filter(o=>!q||norm(o.x.name).includes(q));
  root.innerHTML=`<div class="vt-h"><b>👑 Ranking de la comunidad</b><span>Marca ♥ los que te gusten. ${total?total+" votos en total.":"Sé la primera persona en votar."}</span></div>
  <div class="vt-t"><button type="button" class="chip${tab==="pj"?" on":""}" data-tb="pj">Personajes</button><button type="button" class="chip${tab==="ds"?" on":""}" data-tb="ds">Discos</button></div>
  <input class="search" id="vt-q" type="search" placeholder="Buscar..." value="${e(busq)}" style="margin-bottom:10px"/>
  <div id="vt-ls">${H.map(({x,pos})=>`<div class="vt-r${x.n&&pos<=3?" p"+pos:""}" data-id="${e(x.id)}">
    <div class="vt-n">${x.n&&pos===1?"👑":pos}</div>
    <img src="${e(x.pt)}" data-img="${e(x.img)}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="if(!this.dataset.f){this.dataset.f=1;this.src=this.dataset.img}else this.style.visibility='hidden'">
    <div class="vt-i"><b>${e(x.name)}</b><small style="color:${EC[x.el]||"inherit"}">${e(x.el||"")} · ${x.r?x.r+"★":""} · <span class="vt-c">${x.n}</span> ${x.n===1?"voto":"votos"}</small><div class="vt-b"><i style="width:${top?Math.round(x.n/top*100):0}%"></i></div></div>
    <button type="button" class="vt-l${M.has(x.id)?" on":""}" data-v="${e(x.id)}" aria-label="Me gusta">${M.has(x.id)?"♥":"♡"}</button></div>`).join("")||'<p class="nota">Sin resultados.</p>'}</div>
  <p class="vt-note">Ranking de la comunidad de Vita, no oficial del juego. El orden se actualiza al volver a abrir esta pantalla.</p>`;
}
function montar(root){
  pinta(root);
  root.onclick=async ev=>{
    const t=ev.target.closest("[data-tb]");if(t){tab=t.dataset.tb;busq="";pinta(root);return}
    const b=ev.target.closest("[data-v]");if(!b)return;
    const id=b.dataset.v,M=DATA.m[tab],T=DATA.tot[tab]||(DATA.tot[tab]={}),on=!M.has(id),tp=tab;
    on?M.add(id):M.delete(id);T[id]=Math.max(0,(T[id]||0)+(on?1:-1));
    b.classList.toggle("on",on);b.textContent=on?"♥":"♡";
    const row=b.closest(".vt-r"),c=row.querySelector(".vt-c");if(c)c.textContent=T[id];
    try{
      const r=await fetch(cfg()+"/votar",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({dev:dev(),tipo:tp,id,on})});
      if(!r.ok)throw 0;const j=await r.json();if(typeof j.n==="number")T[id]=j.n;
    }catch(x){ /* sin conexion: se revierte */
      on?DATA.m[tp].delete(id):DATA.m[tp].add(id);T[id]=Math.max(0,(T[id]||0)+(on?-1:1));if(tp===tab)pinta(root);}
  };
  root.oninput=ev=>{if(ev.target.id==="vt-q"){busq=ev.target.value;const p=ev.target.selectionStart;pinta(root);const i=root.querySelector("#vt-q");i.focus();try{i.setSelectionRange(p,p)}catch(x){}}};
}
window.votosAbrir=async function(t){
  if(t)tab=t;
  const o=window.ssvOverlay(`<div class="ovh"><span class="ntype t-cumple">👑 Ranking</span><button class="ovx" data-ovx aria-label="Cerrar">✕</button></div><div id="vt-root"><p class="nota">Cargando…</p></div>`,"vt-ovw");
  const root=o.querySelector("#vt-root");
  if(!cfg()){root.innerHTML='<p class="nota">El ranking de la comunidad aún no está activado.</p>';return}
  try{await cargar();montar(root)}catch(x){root.innerHTML='<p class="nota">No se pudo cargar el ranking. Revisa tu conexión e inténtalo de nuevo.</p>'}
};
document.addEventListener("click",ev=>{const b=ev.target.closest&&ev.target.closest("[data-vt]");if(b)window.votosAbrir(b.dataset.vt)});
})();
