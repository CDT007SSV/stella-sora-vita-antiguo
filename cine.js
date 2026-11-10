/* Cinemáticas del juego dentro del lector. Los videos NO están en Vita: se enlazan desde el repositorio
   jhon1466/StellaSoraData y, si un enlace falla, se prueba el siguiente. Subtítulos en español: carpeta cine/ (sin letras de canciones). */
(function(){
"use strict";
const e=t=>String(t==null?"":t).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const R="jhon1466/StellaSoraData",D="01_Cinematicas_Videos/";
/* orden de enlaces: jsDelivr (hasta 50 MB) -> GitHub directo -> GitHub LFS. lfs:1 = archivo LFS (solo el último sirve) */
const urls=(f,mb,lfs)=>lfs?[`https://media.githubusercontent.com/media/${R}/main/${D}${f}`]
  :(mb<=48?[`https://cdn.jsdelivr.net/gh/${R}@main/${D}${f}`]:[]).concat([`https://raw.githubusercontent.com/${R}/main/${D}${f}`,`https://media.githubusercontent.com/media/${R}/main/${D}${f}`]);
/* f = mismo video para los dos protagonistas; fp/mp = versión ella / él. sub = subtítulos (por protagonista si son sub:{fp,mp}) */
const CINE=[
 {id:"prologo",t:"Prólogo",antes:"STm00_01",partes:[
  {f:"Prologue-Prologue_P1.mp4",mb:11},{f:"Prologue-Prologue_P2.mp4",mb:27},{f:"Prologue-Prologue_P3.mp4",mb:20},
  {f:"Prologue-Prologue_P4.mp4",mb:75,sub:"prologo-p4.vtt"}]},
 {id:"ed4",t:"Final del capítulo 4",despues:"STm04_11",partes:[{fp:"CH04ED-CH04ED_FP.mp4",mp:"CH04ED-CH04ED_MP.mp4",mb:93}]},
 {id:"ed6",t:"Final del capítulo 6",despues:"STm06_13",partes:[{f:"CH06ED-CH06ED.mp4",mb:86}]},
 {id:"ed9",t:"Final del capítulo 9",despues:"STm09_07_a",partes:[{fp:"CH09ED-CH09ED_FP.mp4",mp:"CH09ED-CH09ED_MP.mp4",mb:81}]},
 {id:"i95",t:"Especial 9.5 · Introducción",antes:"STm10001_01",partes:[
  {fp:"CH10001Intro1-CH10001Intro1_FP.mp4",mp:"CH10001Intro1-CH10001Intro1_MP.mp4",lfs:1,sub:{fp:"i10-intro1-fp.vtt"}},
  {fp:"CH10001Intro2-CH10001Intro2_FP.mp4",mp:"CH10001Intro2-CH10001Intro2_MP.mp4",mb:26,sub:{fp:"i10-intro2-fp.vtt",mp:"i10-intro2-mp.vtt"}}]}
];
const css=document.createElement("style");css.textContent=`
.cn-ov{position:fixed;inset:0;z-index:100001;background:#000;display:flex;flex-direction:column;align-items:center;justify-content:center}
.cn-ov video{width:100%;max-height:calc(100% - 96px);background:#000}
.cn-bar{position:absolute;top:0;left:0;right:0;display:flex;justify-content:space-between;align-items:center;gap:10px;padding:calc(env(safe-area-inset-top,0px) + 10px) 12px 10px;background:linear-gradient(#000c,#0000);color:#fff;font-size:.85rem;z-index:2}
.cn-bar button{border:1px solid #3a3560;background:rgba(20,16,50,.85);color:#fff;border-radius:999px;padding:8px 14px;font:inherit;cursor:pointer}
.cn-msg{position:absolute;bottom:16px;left:12px;right:12px;text-align:center;color:#cfc8ff;font-size:.8rem}
.cn-msg b{color:#fff}
.rd-cn{display:inline-block;margin-top:10px}
`;document.head.appendChild(css);
const prot=()=>{try{return localStorage.getItem("rdg")==="0"?"fp":"mp"}catch(x){return"mp"}}; /* rdg: 1 = él */
const para=(id,tipo)=>CINE.find(c=>c[tipo]===id)||null;
window.cineDe=para;
window.cineVer=function(id,i0){
  const C=CINE.find(c=>c.id===id);if(!C)return;
  const pr=prot();let i=i0||0;
  const o=document.createElement("div");o.className="cn-ov";
  o.innerHTML=`<div class="cn-bar"><span>🎬 ${e(C.t)}${C.partes.length>1?" · "+(i+1)+"/"+C.partes.length:""}</span><button type="button" data-x>✕ Cerrar</button></div><video controls playsinline preload="metadata"></video><div class="cn-msg"></div>`;
  document.body.appendChild(o);
  const v=o.querySelector("video"),msg=o.querySelector(".cn-msg");
  const cierra=()=>{try{v.pause();v.removeAttribute("src");v.load()}catch(x){}o.remove()};
  o.querySelector("[data-x]").onclick=cierra;
  const carga=()=>{
    const P=C.partes[i],f=P.f||P[pr]||P.fp,L=urls(f,P.mb||0,P.lfs);let k=0;
    v.querySelectorAll("track").forEach(t=>t.remove());
    const sub=P.sub&&(typeof P.sub==="string"?P.sub:(P.sub[pr]||null));
    if(sub){const t=document.createElement("track");t.kind="subtitles";t.srclang="es";t.label="Español";t.src="cine/"+sub;t.default=true;v.appendChild(t)}
    msg.innerHTML=(P.mb?"Video de unos <b>"+P.mb+" MB</b>: úsalo con Wi‑Fi si puedes. ":"")+(sub?"Subtítulos en español activados.":"Sin subtítulos.");
    v.onerror=()=>{if(k+1<L.length){k++;v.src=L[k];v.load();v.play().catch(()=>{})}else msg.innerHTML="⚠️ No se pudo cargar el video. Revisa tu conexión e inténtalo más tarde."};
    v.src=L[0];v.load();v.play().catch(()=>{});
  };
  v.onended=()=>{if(i+1<C.partes.length){i++;carga()}};
  carga();
};
})();
