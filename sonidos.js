/* Sonidos de la app: "vita" al abrir la app. Los archivos van en la carpeta audio/ (ver audio/LEEME.txt).
   Si un archivo no existe, no pasa nada. Se puede silenciar con el boton del encabezado. */
(function(){
const K="ssv_snd",WIKI="https://stellasora.miraheze.org/wiki/Special:FilePath/";
/* Sonidos del propio juego (los mismos "se_NNN" que usa el lector). Para cambiar uno, cambia el numero.
   click = sonido al presionar; vita = el sonido con el que habla Vita en el juego. Prueba otros en prueba-sonidos.html */
const SE={vita:["se_398"]}, /* se prueba el primero y, si no existe en la wiki, el siguiente */
FILES={vita:SE.vita.map(x=>WIKI+x+".ogg")},VOL={vita:.07};
let on=true;try{on=localStorage.getItem(K)!=="0"}catch(e){}
const buf={};
function get(n){if(!buf[n]){const L=FILES[n],a=new Audio();let i=0;a.preload="auto";a.onerror=()=>{if(++i<L.length)a.src=L[i];else a._bad=1};a.src=L[0];buf[n]=a}return buf[n]}
function play(n){if(!on)return false;try{const a=get(n);if(a._bad)return false;const c=a.cloneNode();c.volume=VOL[n]||.5;const p=c.play();if(p&&p.catch)p.catch(()=>{});return true}catch(e){return false}}
let vs=0; /* 0 = no ha sonado, 1 = sonando/sono */
function vita(){if(vs===1||!on)return false;try{const a=get("vita");if(a._bad)return false;const c=a.cloneNode();c.volume=VOL.vita;const p=c.play();vs=1;if(p&&p.catch)p.catch(()=>{vs=0});return true}catch(e){return false}}
/* el navegador solo deja sonar tras un toque: se intenta al cargar y, si no deja, en la primera interaccion */
addEventListener("pointerdown",()=>{vita()},{capture:true});
function icon(){const b=document.getElementById("nsnd");if(!b)return;b.innerHTML=on?'<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/></svg>':'<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="m16 9 5 6M21 9l-5 6"/></svg>';b.setAttribute("aria-label",on?"Silenciar sonidos":"Activar sonidos")}
function init(){const b=document.getElementById("nsnd");if(b){icon();b.addEventListener("click",ev=>{ev.stopPropagation();on=!on;try{localStorage.setItem(K,on?"1":"0")}catch(e){}icon();if(on)vs=0,vita()})}
  get("vita");setTimeout(vita,700)}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
function set(v){on=!!v;try{localStorage.setItem(K,on?"1":"0")}catch(e){}if(on)vs=0,vita()}
window.ssvSnd={play,vita,set,get:()=>on};
})();
