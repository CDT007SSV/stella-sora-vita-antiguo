/* Ilustraciones animadas (Live2D): tarjeta en la ficha y lista en la Galería de arte.
   Los modelos vienen de srpg-kr/l2d-assets; el motor se descarga solo al abrir uno. */
(function(){
const RUTA="Resources/StellarSora/assets/assetbundles/actor2d/";
const FUENTES=["https://srpg-kr.github.io/l2d-assets/"+RUTA,"https://cdn.jsdelivr.net/gh/srpg-kr/l2d-assets@main/"+RUTA];
const LIBS=["https://cubism.live2d.com/sdk-web/cubismcore/live2dcubismcore.min.js","https://cdn.jsdelivr.net/npm/pixi.js@6.5.10/dist/browser/pixi.min.js","https://cdn.jsdelivr.net/npm/pixi-live2d-display@0.4.0/dist/cubism4.min.js"];
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const activo=()=>{try{return localStorage.getItem("ssv_l2d")!=="0"}catch(e){return true}};
window.l2dActivo=activo;
let IDX=null;const indice=()=>IDX||(IDX=fetch("l2d.json").then(r=>r.ok?r.json():{}).catch(()=>({})));
const cargaJs=u=>new Promise((ok,ko)=>{const s=document.createElement("script");s.src=u;s.onload=ok;s.onerror=()=>ko(new Error("No se pudo cargar "+u));document.head.appendChild(s)});
let LP=null;const libs=()=>LP||(LP=(async()=>{for(const u of LIBS)await cargaJs(u)})().catch(e=>{LP=null;throw e}));
const st=document.createElement("style");
st.textContent=".l2d-card .nota{margin:4px 0 10px}.l2d-stage{position:relative;width:100%;height:440px;border-radius:16px;margin-top:10px;overflow:hidden;background:radial-gradient(circle at 50% 35%,rgba(123,108,255,.25),rgba(10,10,18,.2) 70%);border:1px solid rgba(123,108,255,.3);touch-action:none;-webkit-user-select:none;user-select:none}.l2d-stage canvas{width:100%;height:100%;display:block;touch-action:none}.l2d-stage.fs{position:fixed;inset:0;z-index:9000;height:100%;border-radius:0;border:0;margin:0;background:#0b0a16}.l2d-tb{position:absolute;right:8px;top:8px;display:flex;gap:6px;z-index:3}.l2d-tb button{width:40px;height:40px;border-radius:50%;border:1px solid rgba(255,255,255,.25);background:rgba(15,12,35,.75);color:#fff;font-size:1.1rem;font-weight:700;cursor:pointer}"+
".l2d-ov{position:fixed;inset:0;z-index:100000;background:#0b0a16;display:flex;flex-direction:column}.l2d-oh{display:flex;align-items:center;gap:10px;padding:calc(10px + env(safe-area-inset-top)) 12px 10px;border-bottom:1px solid rgba(123,108,255,.25)}.l2d-oh b{flex:1;font-size:1.05rem}.l2d-oh button{width:42px;height:42px;border-radius:50%;border:1px solid rgba(255,255,255,.25);background:rgba(123,108,255,.15);color:#fff;font-size:1.1rem;cursor:pointer}.l2d-ob{flex:1;overflow:auto;padding:12px}.l2d-gr{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.l2d-it{display:flex;flex-direction:column;align-items:center;gap:6px;padding:10px 6px;border-radius:16px;border:1px solid rgba(123,108,255,.3);background:linear-gradient(160deg,rgba(123,108,255,.12),rgba(255,255,255,.02));color:inherit;font:inherit;cursor:pointer}.l2d-it img{width:84px;height:84px;border-radius:50%;object-fit:cover;object-position:top;background:#1a1730;border:2px solid rgba(123,108,255,.5)}.l2d-it span{font-size:.8rem;font-weight:600;text-align:center}.l2d-it small{font-size:.68rem;color:var(--t2)}.l2d-ov .l2d-stage{flex:1;height:auto;margin:0;border-radius:0;border:0}.l2d-ov .skin3d{padding:8px 10px calc(10px + env(safe-area-inset-bottom));margin:0}";
document.head.appendChild(st);
let app=null,mdl=null,tok=0,Z=1,PX=0,PY=0;
function ajusta(){
  if(!app)return;const w=app.screen.width,h=app.screen.height;
  if(mdl){const k=Math.min(w/mdl.internalModel.width,h/mdl.internalModel.height)*.95;mdl.scale.set(k);mdl.position.set(w/2,h/2)}
  const s=app.stage;s.pivot.set(w/2,h/2);s.position.set(w/2+PX,h/2+PY);s.scale.set(Z);
}
function zoom(f){Z=Math.max(1,Math.min(5,Z*f));if(Z===1){PX=0;PY=0}ajusta()}
function reset(){Z=1;PX=0;PY=0;ajusta()}
function gestos(stg){
  const P=new Map();let d0=0;
  const dist=()=>{const a=[...P.values()];return Math.hypot(a[0][0]-a[1][0],a[0][1]-a[1][1])};
  const fuera=e=>e.target.closest&&e.target.closest(".l2d-tb");
  stg.addEventListener("wheel",e=>{e.preventDefault();zoom(e.deltaY<0?1.15:1/1.15)},{passive:false,capture:true});
  stg.addEventListener("pointerdown",e=>{if(fuera(e))return;P.set(e.pointerId,[e.clientX,e.clientY]);try{stg.setPointerCapture(e.pointerId)}catch(x){}if(P.size===2)d0=dist()},true);
  stg.addEventListener("pointermove",e=>{
    if(!P.has(e.pointerId))return;const o=P.get(e.pointerId);
    if(P.size>=2){P.set(e.pointerId,[e.clientX,e.clientY]);const d=dist();if(d0)zoom(d/d0);d0=d}
    else if(Z>1){PX+=e.clientX-o[0];PY+=e.clientY-o[1];P.set(e.pointerId,[e.clientX,e.clientY]);ajusta()}
    else P.set(e.pointerId,[e.clientX,e.clientY]);
  },true);
  const fin=e=>{P.delete(e.pointerId);d0=0};
  ["pointerup","pointercancel","lostpointercapture"].forEach(n=>stg.addEventListener(n,fin,true));
  stg.addEventListener("dblclick",reset,true);
}
function limpia(){try{if(mdl){mdl.destroy();mdl=null}}catch(e){}}
function cierra(){document.body.style.overflow="";limpia();try{if(app){app.destroy(false,{children:true});app=null}}catch(e){}tok++}
async function pon(p,msg){
  const my=++tok;msg("Cargando modelo…");
  const L=PIXI.live2d.Live2DModel;let m=null;
  for(const f of FUENTES){try{m=await L.from(f+p+".model3.json");break}catch(e){}}
  if(my!==tok||!app){try{m&&m.destroy()}catch(e){}return}
  if(!m){msg("No se pudo cargar este modelo. Prueba con otra versión o revisa tu conexión.");return}
  limpia();mdl=m;app.stage.addChild(m);m.anchor.set(.5,.5);reset();
  msg("Pellizca o usa ＋ / － para acercar, arrastra para mover. Doble toque: restablecer.");
}
/* crea el canvas y los botones dentro de stg; devuelve true si pudo */
function arranca(stg,conFs){
  cierra();stg.hidden=false;
  if(!stg.querySelector("canvas"))stg.insertAdjacentHTML("afterbegin","<canvas></canvas>");
  if(!stg.querySelector(".l2d-tb")){
    stg.insertAdjacentHTML("beforeend",'<div class="l2d-tb"><button type="button" data-z="in" aria-label="Acercar">＋</button><button type="button" data-z="out" aria-label="Alejar">－</button>'+(conFs?'<button type="button" data-z="fs" aria-label="Pantalla completa">⛶</button>':'')+'</div>');
    stg.querySelector('[data-z="in"]').onclick=()=>zoom(1.35);stg.querySelector('[data-z="out"]').onclick=()=>zoom(1/1.35);
    const fb=stg.querySelector('[data-z="fs"]');
    if(fb)fb.onclick=()=>{const f=stg.classList.toggle("fs");fb.textContent=f?"✕":"⛶";document.body.style.overflow=f?"hidden":"";setTimeout(()=>{try{app.resize()}catch(e){}reset()},60)};
    gestos(stg);
  }
  try{
    PIXI.live2d.Live2DModel.registerTicker(PIXI.Ticker);
    app=new PIXI.Application({view:stg.querySelector("canvas"),backgroundAlpha:0,resizeTo:stg,antialias:true,autoDensity:true,resolution:Math.min(window.devicePixelRatio||1,2)});
    Z=1;PX=0;PY=0;return true;
  }catch(e){return false}
}
const vistaMsg=el=>t=>{const x=el.querySelector(".l2d-st");if(x)x.textContent=t};
function ligaChips(bar,msg){
  bar.querySelectorAll(".chip").forEach(b=>b.onclick=()=>{bar.querySelectorAll(".chip").forEach(x=>x.classList.toggle("on",x===b));if(app)pon(b.dataset.p,msg)});
}
const chipsHtml=l=>l.map((v,i)=>`<button type="button" class="chip${i?"":" on"}" data-p="${esc(v.p)}">${esc(v.n)}</button>`).join("");
/* ---- tarjeta en la ficha ---- */
async function iniciaCard(el){
  const msg=vistaMsg(el),go=el.querySelector(".l2d-go");go.disabled=true;msg("Descargando el reproductor…");
  try{await libs()}catch(e){go.disabled=false;msg("No se pudo cargar el reproductor (revisa tu conexión).");return}
  go.hidden=true;const stg=el.querySelector(".l2d-stage");
  if(!arranca(stg,true)){msg("Tu navegador no pudo iniciar el reproductor.");go.hidden=false;go.disabled=false;stg.hidden=true;return}
  const bar=el.querySelector(".l2d-bar");ligaChips(bar,msg);
  pon((bar.querySelector(".chip.on")||bar.querySelector(".chip")).dataset.p,msg);
}
window.l2dInit=async function(c,tipo){
  cierra();
  const el=document.getElementById("l2d-box");if(!el||!activo())return;
  const I=await indice(),lista=tipo==="d"?(I&&I._d&&I._d[c.name]):(I&&I[c.name]);if(!lista||!lista.length||!document.getElementById("l2d-box"))return;
  el.innerHTML=`<div class="card l2d-card"><h3 style="margin:0 0 6px;font-size:1rem">✨ Ilustración animada (L2D)</h3><p class="nota">${tipo==="d"?"Animación del disco":"Versión animada de"} ${esc(c.name)}. Se descarga solo cuando la abres (unos MB). Puedes apagarla en Ajustes.</p><div class="skin3d l2d-bar">${chipsHtml(lista)}</div><button type="button" class="btn l2d-go" style="margin-top:6px">▶ Cargar L2D</button><div class="l2d-stage" hidden></div><p class="nota l2d-st"></p></div>`;
  const bar=el.querySelector(".l2d-bar");
  bar.querySelectorAll(".chip").forEach(b=>b.onclick=()=>{bar.querySelectorAll(".chip").forEach(x=>x.classList.toggle("on",x===b));if(app)pon(b.dataset.p,vistaMsg(el))});
  el.querySelector(".l2d-go").onclick=()=>iniciaCard(el);
};
/* ---- lista y visor a pantalla completa (Galería de arte) ---- */
function overlay(titulo,onBack){
  const o=document.createElement("div");o.className="l2d-ov";
  o.innerHTML=`<div class="l2d-oh"><button type="button" data-b aria-label="Volver">‹</button><b>${esc(titulo)}</b></div><div class="l2d-ob"></div>`;
  o.querySelector("[data-b]").onclick=onBack;document.body.appendChild(o);document.body.style.overflow="hidden";return o;
}
function cierraOv(o){cierra();o.remove();document.body.style.overflow=""}
window.l2dVer=async function(name,prev,tipo){
  const I=await indice(),lista=tipo==="d"?(I&&I._d&&I._d[name]):(I&&I[name]);if(!lista)return;
  const o=overlay(name,()=>{cierraOv(o);if(prev)window.l2dLista()});
  const b=o.querySelector(".l2d-ob");b.style.cssText="display:flex;flex-direction:column;padding:0;overflow:hidden";
  b.innerHTML=`<div class="l2d-stage" hidden></div><p class="nota l2d-st" style="margin:6px 12px 0">Descargando el reproductor…</p><div class="skin3d l2d-bar" style="margin:0">${chipsHtml(lista)}</div>`;
  const msg=vistaMsg(b),stg=b.querySelector(".l2d-stage");
  try{await libs()}catch(e){msg("No se pudo cargar el reproductor (revisa tu conexión).");return}
  if(!arranca(stg,false)){msg("Tu navegador no pudo iniciar el reproductor.");return}
  const bar=b.querySelector(".l2d-bar");ligaChips(bar,msg);pon(lista[0].p,msg);
};
/* ¿el capítulo que se lee tiene L2D? devuelve {n:nombre,t:"c"|"d"} o null */
window.l2dDisp=async function(id,en,names){
  if(!activo())return null;const I=await indice();if(!I)return null;
  const m=/^CG_disc(\d+)/.exec(id||"");
  if(m){const n=I._dn&&I._dn[m[1]];return n&&I._d&&I._d[n]?{n:n,t:"d"}:null}
  if(!/^CG_/.test(id||""))return null; /* solo historias de afinidad y recuerdos de disco, no la historia principal */
  for(const k in (names||{})){if(/^avg1_\d+$/.test(k)){const n=(en&&en[k])||names[k];if(I[n])return{n:n,t:"c"}}}
  return null;
};
window.l2dLista=async function(){
  const I=await indice(),nombres=Object.keys(I||{}).filter(k=>k[0]!=="_").sort(),DD=(I&&I._d)||{},discos=Object.keys(DD).sort();
  const o=overlay("L2D de personajes y discos",()=>cierraOv(o));
  const DS=(typeof DISCS!=="undefined"?DISCS:[]),di=n=>{const d=DS.find(x=>x.name===n);return d&&d.imageUrl||""};
  const C=(typeof CHARS!=="undefined"?CHARS:[]),ch=n=>C.find(x=>x.name===n),img=n=>{const c=ch(n);if(!c)return "";return (typeof portC==="function"?portC(c):c.imageUrl)||""},fb=n=>{const c=ch(n);return c&&c.imageUrl||""};
  const it=(n,t,k)=>`<button type="button" class="l2d-it" data-n="${esc(n)}" data-t="${t}"><img src="${esc(t==="d"?di(n):img(n))}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer" data-f="${esc(t==="d"?"":fb(n))}" onerror="if(this.dataset.f&&this.src!==this.dataset.f){this.src=this.dataset.f}else this.style.visibility='hidden'"><span>${esc(n)}</span><small>${k} ${k===1?"versión":"versiones"}</small></button>`;
  o.querySelector(".l2d-ob").innerHTML=nombres.length?`<p class="nota" style="margin:0 0 10px">Toca uno para ver su ilustración animada. Se descarga solo al abrirla.</p><h4 class="fk-h" style="margin:4px 0 8px">Personajes (${nombres.length})</h4><div class="l2d-gr">${nombres.map(n=>it(n,"c",I[n].length)).join("")}</div>${discos.length?`<h4 class="fk-h" style="margin:16px 0 8px">Discos (${discos.length})</h4><div class="l2d-gr">${discos.map(n=>it(n,"d",DD[n].length)).join("")}</div>`:""}`:'<p class="nota">No se pudo cargar la lista.</p>';
  o.querySelectorAll("[data-n]").forEach(b=>b.onclick=()=>{cierraOv(o);window.l2dVer(b.dataset.n,true,b.dataset.t)});
};
})();
