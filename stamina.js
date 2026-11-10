/* Contador de stamina (energia) segun las reglas del juego: max. 240, +1 cada 6 min (datos del juego: EnergyMaxLimit=240, EnergyGain=6).
   Se guarda en el telefono: cuanta stamina tenias y a que hora. El jugador lo actualiza cuando entra al juego. */
(function(){
const KEY="ssv_stamina",MAX=240,MIN_PER=6,MS=MIN_PER*60000;
const load=()=>{try{const j=JSON.parse(localStorage.getItem(KEY)||"null");if(j&&typeof j.b==="number"&&typeof j.t==="number")return j}catch(e){}return null};
const save=s=>{try{localStorage.setItem(KEY,JSON.stringify(s))}catch(e){}};
function calc(s,now){if(!s)return null;now=now||Date.now();const el=Math.max(0,now-s.t),gain=Math.floor(el/MS),cur=Math.min(MAX,s.b+gain),full=cur>=MAX;
  const nextIn=full?0:MS-(el%MS),fullAt=full?null:now+nextIn+(MAX-cur-1)*MS;return{cur,full,nextIn,fullAt}}
const p2=n=>String(n).padStart(2,"0");
function dur(ms){const m=Math.max(0,Math.round(ms/60000)),h=Math.floor(m/60);return h?h+" h "+p2(m%60)+" min":m+" min"}
function hora(ts){const d=new Date(ts),hoy=new Date(),mañ=new Date(Date.now()+864e5);const t=d.toLocaleTimeString("es-MX",{hour:"numeric",minute:"2-digit"});
  return d.toDateString()===hoy.toDateString()?"hoy "+t:d.toDateString()===mañ.toDateString()?"mañana "+t:d.toLocaleDateString("es-MX",{weekday:"short",day:"numeric",month:"short"})+" "+t}
(function css(){const s=document.createElement("style");s.textContent=`
.stbar{display:flex;align-items:center;gap:10px;width:calc(100% - 24px);margin:6px 12px;padding:10px 14px;border-radius:16px;border:1px solid #3a3560;background:linear-gradient(135deg,rgba(123,108,255,.22),rgba(92,225,230,.12));color:#e8e4ff;font:inherit;cursor:pointer;text-align:left}
.stbar .sb-i{width:34px;height:34px;border-radius:50%;background:rgba(255,255,255,.1);display:flex;align-items:center;justify-content:center;flex:none}
.stbar b{display:block;font-size:.92rem}.stbar small{display:block;color:#b9b3e8;font-size:.74rem;margin-top:1px}.stbar .sb-a{margin-left:auto;color:#9d93ff;font-size:1.3rem}
.stbar.full{border-color:#5CE1E6;box-shadow:0 0 14px rgba(92,225,230,.35)}
.st-wrap{padding:6px 2px 30px}
.st-card{border-radius:22px;padding:22px 16px 18px;background:radial-gradient(120% 90% at 50% 0%,#2a2255 0%,#14102f 60%,#0d0a22 100%);border:1px solid #3a3560;text-align:center;position:relative;overflow:hidden}
.st-card:before{content:"";position:absolute;inset:0;background-image:radial-gradient(rgba(157,147,255,.16) 1px,transparent 1.3px);background-size:18px 18px;opacity:.6;pointer-events:none}
.st-ring{position:relative;width:min(70vw,260px);aspect-ratio:1;margin:4px auto 10px}
.st-ring>svg{width:100%;height:100%;transform:rotate(-90deg);overflow:visible}
.st-ring .tr{fill:none;stroke:rgba(255,255,255,.1);stroke-width:12}
.st-ring .pg{fill:none;stroke:url(#stg);stroke-width:12;stroke-linecap:round;filter:drop-shadow(0 0 8px rgba(92,225,230,.6));transition:stroke-dashoffset .8s}
.st-mid{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center}
.st-mid .n{font-size:3.1rem;font-weight:900;line-height:1;color:#fff;text-shadow:0 0 18px #7B6CFF}.st-mid .m{font-size:.9rem;color:#b9b3e8;margin-top:2px}.st-mid .z{margin-top:6px;color:#ffd76a}
.st-info{position:relative;display:grid;gap:8px;margin:8px 0 14px}
.st-row{display:flex;justify-content:space-between;align-items:center;padding:10px 14px;border-radius:14px;background:rgba(255,255,255,.06);font-size:.88rem;color:#cfc8ff}
.st-row b{color:#fff}
.st-set{position:relative;margin-top:6px;text-align:left}
.st-set h3{font-size:.95rem;margin:0 0 8px;color:#fff}
.st-in{display:flex;gap:8px}.st-in input{flex:1;min-width:0;padding:12px;border-radius:12px;border:1px solid #3a3560;background:#0d0a22;color:#fff;font:inherit;font-size:1.05rem}
.st-q{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
.st-nt{display:flex;align-items:center;gap:12px;cursor:pointer}.st-nt>div{flex:1}.st-nt b{display:block;font-size:.95rem}.st-nt small{display:block;color:#9a95c4;font-size:.76rem;margin-top:2px}.st-sw{flex:none;width:44px;height:26px;border-radius:13px;background:#2a2748;position:relative}.st-sw:after{content:"";position:absolute;top:3px;left:3px;width:20px;height:20px;border-radius:50%;background:#9a96c4;transition:left .15s}.st-nt.on .st-sw{background:#5b4fe0}.st-nt.on .st-sw:after{left:21px;background:#fff}
.st-note{font-size:.72rem;color:#9a95c4;margin-top:10px;line-height:1.45}
`;document.head.appendChild(s)})();
const NK="ssv_stn";
const nOn=()=>{try{return localStorage.getItem(NK)==="1"}catch(e){return false}};
let nMsg="";
/* avisa cuando se llene: se programa en el Worker; GitHub lo envia (puede tardar unos minutos) */
async function sched(){
  const P=window.ssvPush;if(!P||!nOn()||!P.on()||!P.worker())return;
  const sub=await P.sub();if(!sub)return;
  const s=load(),c=calc(s);
  const post=(u,b)=>fetch(P.worker()+u,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(b)}).catch(()=>{});
  if(!c||c.full){post("/cancel",{endpoint:sub.endpoint,kind:"stamina"});return}
  post("/timer",{sub,kind:"stamina",at:c.fullAt,title:"Stamina llena",body:"Tu stamina llegó a "+MAX+". ¡Ya puedes entrar al juego!",url:"#stamina"});
}
window.stSched=sched;
async function nToggle(){
  const P=window.ssvPush;nMsg="";
  if(nOn()){try{localStorage.setItem(NK,"0")}catch(e){};if(P&&P.on()){const sub=await P.sub();if(sub)fetch(P.worker()+"/cancel",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({endpoint:sub.endpoint,kind:"stamina"})}).catch(()=>{})}}
  else{
    if(!P){nMsg="No disponible."}
    else if(!(await P.enable())){nMsg=P.msg()||"No se pudo activar las notificaciones."}
    else{try{localStorage.setItem(NK,"1")}catch(e){};if(!load())nMsg="Primero guarda cuánta stamina tienes.";else await sched()}
  }
  const r=document.getElementById("stamina-root");if(r){delete r.dataset.built;paint()}
}
let tm=0;
function ring(cur){const R=96,C=2*Math.PI*R;return `<svg viewBox="0 0 220 220"><defs><linearGradient id="stg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7B6CFF"/><stop offset="1" stop-color="#5CE1E6"/></linearGradient></defs><circle class="tr" cx="110" cy="110" r="${R}"/><circle class="pg" cx="110" cy="110" r="${R}" stroke-dasharray="${C}" stroke-dashoffset="${C*(1-cur/MAX)}"/></svg>`}
function paint(){
  const root=document.getElementById("stamina-root");if(!root||!root.isConnected)return;
  const s=load(),c=calc(s);
  const bolt='<svg viewBox="0 0 24 24" width="30" height="30" fill="#ffd76a" stroke="#fff" stroke-width="1.2" stroke-linejoin="round"><path d="M13 2 4 14h6l-1 8 9-12h-6z"/></svg>';
  if(!root.dataset.built){
    root.dataset.built=1;
    root.innerHTML=`<div class="st-wrap"><div class="st-card"><div class="st-ring" id="st-ring"></div><div class="st-info" id="st-info"></div></div>
     <div class="st-card" style="margin-top:12px"><div class="st-set"><div class="st-nt${nOn()&&window.ssvPush&&ssvPush.on()?" on":""}" id="st-nt"><div><b>Avisarme cuando se llene</b><small>Te llega una notificación push. Puede tardar unos minutos.</small></div><span class="st-sw"></span></div>${nMsg?`<p class="st-note">${nMsg}</p>`:""}</div></div>
     <div class="st-card" style="margin-top:12px"><div class="st-set"><h3>Actualizar desde el juego</h3>
      <div class="st-in"><input id="st-v" type="number" inputmode="numeric" min="0" max="${MAX}" placeholder="¿Cuánta stamina te queda?"><button class="btn" id="st-ok" style="width:auto;padding:0 18px">Guardar</button></div>
      <div class="st-q"><button class="chip" data-v="0">Gasté todo (0)</button><button class="chip" data-v="60">60</button><button class="chip" data-v="120">120</button><button class="chip" data-v="180">180</button><button class="chip" data-v="240">Llena (240)</button></div>
      <p class="st-note">Entra al juego, gasta tu stamina y escribe aquí cuánta te quedó. Desde ese momento el contador sube solo: 1 punto cada ${MIN_PER} minutos, hasta ${MAX}. Dentro del juego puede haber pequeñas diferencias (compras, recompensas), por eso conviene volver a guardar el número cuando entres.</p></div></div></div>`;
    const set=v=>{v=Math.max(0,Math.min(MAX,Math.round(+v)));if(isNaN(v))return;save({b:v,t:Date.now()});paint();if(window.stBar)window.stBar();sched()};
    root.querySelector("#st-nt").onclick=nToggle;
    root.querySelector("#st-ok").onclick=()=>{const i=root.querySelector("#st-v");if(i.value!==""){set(i.value);i.value=""}};
    root.querySelectorAll(".st-q [data-v]").forEach(b=>b.onclick=()=>set(b.dataset.v));
  }
  const ring_=root.querySelector("#st-ring"),info=root.querySelector("#st-info");
  if(!s){ring_.innerHTML=ring(0)+`<div class="st-mid">${bolt}<div class="m" style="margin-top:6px">Sin datos todavía</div></div>`;info.innerHTML=`<div class="st-row">Escribe abajo cuánta stamina tienes ahora para empezar a contar.</div>`;return}
  ring_.innerHTML=ring(c.cur)+`<div class="st-mid">${bolt}<div class="n">${c.cur}</div><div class="m">/ ${MAX}</div>${c.full?'<div class="z">¡Llena!</div>':""}</div>`;
  info.innerHTML=c.full?`<div class="st-row"><span>Estado</span><b>Llena, ya puedes entrar</b></div>`
    :`<div class="st-row"><span>Siguiente punto en</span><b>${Math.floor(c.nextIn/60000)}:${p2(Math.floor(c.nextIn/1000)%60)}</b></div><div class="st-row"><span>Llena en</span><b>${dur(c.fullAt-Date.now())}</b></div><div class="st-row"><span>Se llena</span><b>${hora(c.fullAt)}</b></div>`;
}
function tick(){clearInterval(tm);paint();sched();tm=setInterval(()=>{const r=document.getElementById("stamina-root");if(!r||!r.isConnected||!r.closest(".screen.on")){clearInterval(tm);return}paint()},1000)}
window.staminaShow=tick;
function bar(){
  const b=document.getElementById("stbar");if(!b)return;const s=load(),c=calc(s);
  b.classList.toggle("full",!!(c&&c.full));
  const t=b.querySelector("b");if(t)t.textContent=c?c.cur+"/"+MAX:"Stamina";
}
window.stBar=bar;
function init(){const b=document.getElementById("stbar");if(!b)return;b.addEventListener("click",()=>{if(typeof nav==="function")nav("stamina")});bar();setInterval(bar,30000);document.addEventListener("visibilitychange",()=>{if(!document.hidden)bar()})}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();
