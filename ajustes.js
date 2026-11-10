/* Configuracion de la app: pantalla "Ajustes" (engrane del encabezado). Se guarda en localStorage (ssv_cfg). */
(function(){
const K="ssv_cfg",D={lite:0,anim:1,splash:1,fotos:1,pre:1,sh:1};
let C=Object.assign({},D);
try{Object.assign(C,JSON.parse(localStorage.getItem(K)||"{}"))}catch(e){}
function save(){try{localStorage.setItem(K,JSON.stringify(C))}catch(e){}}
function ls(k,d){try{const v=localStorage.getItem(k);return v===null?d:v}catch(e){return d}}
function apply(){
  const h=document.documentElement.classList;
  h.toggle("ssv-noanim",!C.anim);h.toggle("ssv-nofotos",!C.fotos);h.toggle("ssv-nosplash",!C.splash);
  if(!C.splash){const s=document.getElementById("splash");if(s)s.remove()}
}
/* para el lector: ssvCfg("pre") -> 1/0 */
window.ssvCfg=k=>C[k];
const css=document.createElement("style");
css.textContent=
"html.ssv-noanim *:not(#rd):not(#rd *){animation-duration:.001ms!important;animation-delay:0s!important;animation-iteration-count:1!important;transition-duration:0s!important;transition-delay:0s!important;scroll-behavior:auto!important}"+
"html.ssv-noanim *:not(#rd):not(#rd *){backdrop-filter:none!important;-webkit-backdrop-filter:none!important}"+
"html.ssv-nofotos .hm img.bg,html.ssv-nofotos .gx img.bg{display:none!important}"+
"html.ssv-nosplash #splash{display:none!important}"+
"#aj-root .aj-sec{font-size:.72rem;letter-spacing:.14em;text-transform:uppercase;color:var(--t2);margin:18px 4px 6px}"+
"#aj-root .aj-r{display:flex;align-items:center;gap:12px;padding:12px 14px;margin-bottom:8px;border:1px solid #2c2850;border-radius:14px;background:rgba(123,108,255,.07);cursor:pointer}"+
"#aj-root .aj-r b{display:block;font-size:.95rem;font-weight:600}#aj-root .aj-r small{display:block;color:var(--t2);font-size:.78rem;margin-top:2px;line-height:1.3}"+
"#aj-root .aj-r>div{flex:1;min-width:0}"+
"#aj-root .aj-sw{flex:none;width:44px;height:26px;border-radius:13px;background:#2a2748;position:relative;transition:background .15s}"+
"#aj-root .aj-sw:after{content:'';position:absolute;top:3px;left:3px;width:20px;height:20px;border-radius:50%;background:#9a96c4;transition:left .15s,background .15s}"+
"#aj-root .aj-r.on .aj-sw{background:#5b4fe0}#aj-root .aj-r.on .aj-sw:after{left:21px;background:#fff}"+
"#aj-root .aj-r.big{border-color:#5b4fe0;background:rgba(91,79,224,.18)}"+
"#aj-root .aj-btn{display:block;width:100%;padding:12px;margin-bottom:8px;border-radius:14px;border:1px solid #3a3560;background:rgba(123,108,255,.12);color:#cfc8ff;font:inherit;font-weight:600;cursor:pointer}"+
"#aj-root .aj-v{text-align:center;color:var(--t2);font-size:.75rem;margin:14px 0}";
document.head.appendChild(css);

const ITEMS=[
 ["Apariencia",
  [["claro","Modo claro","Cambia la app a colores claros. Las ilustraciones y el lector no cambian.",0,0,"ssv_claro"],["l2d","Ilustraciones animadas (L2D)","Muestra el L2D en las fichas de personajes. Apágalo si tu teléfono va lento o quieres ahorrar datos.",0,0,"ssv_l2d"],["a3d","Cargar el modelo 3D automáticamente","Apagado (recomendado): el modelo 3D solo se carga cuando tocas el botón, así la ficha pesa menos. La calidad se elige debajo del visor.",0,0,"ssv_auto3d"]]],
 ["Sonido",
  [["snd","Sonido de Vita","Suena al abrir la app."]]],
 ["Avisos",
  [["push","Notificaciones push","Te avisa de novedades: personajes, banners, builds y Discord. En iPhone solo funciona con la app instalada."],
   ["rb","Recordatorio de banners","Te avisa 2 días antes de que termine un banner (a las 9:00).",0,0,"ssv_rb"],
   ["rc","Cumpleaños de Trekkers","Te avisa el día del cumpleaños (a las 9:00).",0,0,"ssv_rc"]]],
 ["Rendimiento",
  [["lite","Modo ahorro","Activa de un golpe todas las opciones de abajo. Ideal para teléfonos modestos.",1],
   ["anim","Animaciones y transiciones","Desactívalas si la app se siente lenta o va a tirones.",0,1],
   ["splash","Pantalla de inicio animada","Desactívala para entrar directo al menú.",0,1],
   ["fotos","Imágenes decorativas del menú","Apágalas para gastar menos datos y memoria.",0,1]]],
 ["Lector de historias",
  [["pre","Precargar imágenes","Descarga por adelantado fondos y personajes. Apágalo si tu teléfono o tus datos son limitados (puede haber una pausa al cambiar de escena).",0,1],
   ["sh","Sacudidas de pantalla","Efectos de temblor del juego. Apágalos si te marean o van lentos.",0,1],
   ["rde","Emojis y stickers","Muestra los emojis de los chats.",0,0,"rde"],
   ["rdf","Pantalla completa","Oculta la barra del teléfono al leer.",0,0,"rdf"]]]
];
function val(k,ext){
  if(k==="snd")return ls("ssv_snd","1")!=="0";
  if(k==="push")return ls("ssv_push","0")==="1"&&window.Notification&&Notification.permission==="granted";
  if(ext==="ssv_rb"||ext==="ssv_rc")return ls(ext,"1")!=="0"&&ls("ssv_push","0")==="1";
  if(ext==="ssv_claro")return ls("ssv_claro","0")==="1";
  if(ext==="ssv_l2d")return ls("ssv_l2d","1")!=="0";
  if(ext==="ssv_auto3d")return ls("ssv_auto3d","0")==="1";
  if(ext==="rde")return ls("rde","1")!=="0";
  if(ext==="rdf")return ls("rdf","0")==="1";
  if(k==="lite")return !C.anim&&!C.splash&&!C.fotos&&!C.pre&&!C.sh;
  return !!C[k];
}
let MSG="";
const b64=v=>{const p="=".repeat((4-v.length%4)%4),r=atob((v+p).replace(/-/g,"+").replace(/_/g,"/"));return Uint8Array.from(r,c=>c.charCodeAt(0))};
async function pushToggle(){
  const cf=window.SSV_PUSH||{};MSG="";
  if(!cf.worker||!cf.vapid){MSG="Las notificaciones aún no están activadas en esta versión.";return}
  if(!("serviceWorker" in navigator)||!("PushManager" in window)||!window.Notification){MSG="Este navegador no permite notificaciones. En iPhone instala primero la app en la pantalla de inicio.";return}
  try{
    const reg=await navigator.serviceWorker.ready;let sub=await reg.pushManager.getSubscription();
    if(val("push")){
      if(sub){fetch(cf.worker+"/unsub",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({endpoint:sub.endpoint})}).catch(()=>{});await sub.unsubscribe()}
      localStorage.setItem("ssv_push","0");return}
    const pm=await Notification.requestPermission();
    if(pm!=="granted"){MSG="No diste permiso. Puedes activarlo en los ajustes del navegador para este sitio.";return}
    if(!sub)sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:b64(cf.vapid)});
    const r=await fetch(cf.worker+"/sub",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(sub.toJSON())});
    if(!r.ok)throw 0;localStorage.setItem("ssv_push","1");MSG="¡Listo! Recibirás avisos de novedades."
  }catch(e){MSG="No se pudo activar. Intenta de nuevo más tarde."}
}
function render(){
  const r=document.getElementById("aj-root");if(!r)return;
  let h="";
  ITEMS.forEach(s=>{
    h+='<div class="aj-sec">'+s[0]+'</div>';
    s[1].forEach(it=>{
      const k=it[0],on=val(k,it[5]);
      h+='<div class="aj-r'+(on?" on":"")+(it[3]?" big":"")+'" data-k="'+k+'" data-x="'+(it[5]||"")+'"><div><b>'+it[1]+'</b><small>'+it[2]+'</small></div><span class="aj-sw"></span></div>';
    });
  });
  if(MSG)h+='<p class="aj-v" style="color:#cfc8ff">'+MSG+'</p>';
  h+='<div class="aj-sec">Datos</div>'+
   '<button type="button" class="aj-btn" id="aj-clr">Borrar caché y recargar</button>'+
   '<button type="button" class="aj-btn" id="aj-rst">Restablecer ajustes</button>'+
   '<div class="aj-v" id="aj-ver"></div>';
  r.innerHTML=h;
  {const e=document.getElementById("aj-ver"),V=typeof APP_VERSION!=="undefined"?APP_VERSION:"1.0";if(e)e.textContent="Stella Sora Vita · versión "+V;
   fetch("sw.js",{cache:"no-store"}).then(x=>x.text()).then(t=>{const m=t.match(/stella-sora-wiki-v(\d+)/);if(e&&m)e.textContent="Stella Sora Vita · versión "+V+" (compilación "+m[1]+")"}).catch(()=>{})}
}
async function toggle(k,x){
  if(k==="push"){await pushToggle();render();return}
  if(k==="snd"){const n=ls("ssv_snd","1")!=="0";if(window.ssvSnd&&ssvSnd.set)ssvSnd.set(!n);else try{localStorage.setItem("ssv_snd",n?"0":"1")}catch(e){}}
  else if(x==="ssv_rb"||x==="ssv_rc"){try{localStorage.setItem(x,ls(x,"1")!=="0"?"0":"1")}catch(e){};if(window.ssvRec)ssvRec.sync()}
  else if(x==="ssv_claro"){const n=ls("ssv_claro","0")!=="1";try{localStorage.setItem("ssv_claro",n?"1":"0")}catch(e){}document.documentElement.classList.toggle("claro",n);const m=document.querySelector('meta[name="theme-color"]');if(m)m.content=n?"#F3F1FA":"#0A0A12"}
  else if(x==="ssv_l2d"){try{localStorage.setItem("ssv_l2d",ls("ssv_l2d","1")!=="0"?"0":"1")}catch(e){}}
  else if(x==="ssv_auto3d"){try{localStorage.setItem("ssv_auto3d",ls("ssv_auto3d","0")==="1"?"0":"1")}catch(e){}}
  else if(x==="rde"){try{localStorage.setItem("rde",ls("rde","1")!=="0"?"0":"1")}catch(e){}}
  else if(x==="rdf"){try{localStorage.setItem("rdf",ls("rdf","0")==="1"?"0":"1")}catch(e){}}
  else if(k==="lite"){const on=!val("lite");["anim","splash","fotos","pre","sh"].forEach(q=>C[q]=on?0:1);save()}
  else{C[k]=C[k]?0:1;save()}
  apply();render();
}
document.addEventListener("click",e=>{
  const r=e.target.closest&&e.target.closest("#aj-root .aj-r");
  if(r){toggle(r.dataset.k,r.dataset.x);return}
  if(e.target.id==="aj-rst"){C=Object.assign({},D);save();["rde","rdf"].forEach(q=>{try{localStorage.removeItem(q)}catch(x){}});if(window.ssvSnd&&ssvSnd.set)ssvSnd.set(true);apply();render();return}
  if(e.target.id==="aj-clr"){
    const go=()=>location.reload();
    (async()=>{try{if(window.caches){const ks=await caches.keys();await Promise.all(ks.map(k=>caches.delete(k)))}
      if(navigator.serviceWorker){const rs=await navigator.serviceWorker.getRegistrations();await Promise.all(rs.map(x=>x.update().catch(()=>{})))}}catch(x){}go()})();
  }
});
/* si el aviso estaba activado pero el telefono perdio la suscripcion, se vuelve a crear sola */
async function repara(){
  const cf=window.SSV_PUSH||{};
  if(ls("ssv_push","0")!=="1"||!cf.worker||!cf.vapid||!("serviceWorker" in navigator)||!("PushManager" in window)||!window.Notification||Notification.permission!=="granted")return;
  try{const reg=await navigator.serviceWorker.ready;let sub=await reg.pushManager.getSubscription();
    if(!sub)sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:b64(cf.vapid)});
    await fetch(cf.worker+"/sub",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(sub.toJSON())});
    if(window.stSched)window.stSched()}catch(e){}
}
setTimeout(repara,2500);
window.ajShow=render;
window.ssvPush={on:()=>val("push"),worker:()=>(window.SSV_PUSH||{}).worker||"",msg:()=>MSG,
  enable:async()=>{if(!val("push"))await pushToggle();return val("push")},
  sub:async()=>{try{const r=await navigator.serviceWorker.ready,x=await r.pushManager.getSubscription();return x?x.toJSON():null}catch(e){return null}}};
apply();
document.addEventListener("DOMContentLoaded",()=>{apply();const b=document.getElementById("ngear");if(b)b.addEventListener("click",ev=>{ev.stopPropagation();if(window.nav)nav("ajustes")})});
if(document.readyState!=="loading"){const b=document.getElementById("ngear");if(b)b.addEventListener("click",ev=>{ev.stopPropagation();if(window.nav)nav("ajustes")})}
})();
