/* Heartlink: el telefono del juego. Conversaciones por personaje (heartlink/<id>.json + textos/HL_<id>.txt traducido). */
(function(){
const e=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const PN="Tirano",SS="https://raw.githubusercontent.com/AutumnVN/ssassets/main/export/assets/assetbundles/icon/";
const emo=id=>SS+"avgphoneemojimsg/"+id+".webp",pic=id=>SS+"avgphoneimagemsg/"+id+".webp";
const tx=s=>e(String(s||"").replace(/==PLAYER_NAME==/g,PN).replace(/<[^>]*>/g,"")).replace(/\\n/g,"<br>");
let IDX=null,PR=null;const DC={},TR={};
(function css(){const s=document.createElement("style");s.textContent=`

.hl{max-width:520px;margin:0 auto;padding:4px 0 30px}
.hl-ph{border-radius:26px;border:3px solid #3b5bb5;background:linear-gradient(180deg,#eef4ff,#dfe9ff);color:#24366b;overflow:hidden;box-shadow:0 8px 30px rgba(20,30,90,.45)}
.hl-h{display:flex;align-items:center;gap:10px;padding:14px 16px 8px}
.hl-h h3{margin:0;font-size:1.25rem;font-weight:800;color:#24366b;flex:1}
.hl-h .hl-sub{font-size:.7rem;letter-spacing:.14em;color:#7d92d4;font-weight:700}
.hl-li{padding:6px 10px 14px;display:grid;gap:4px}
.hl-ct{display:flex;align-items:center;gap:12px;padding:9px 10px;border-radius:14px;cursor:pointer;border:0;background:transparent;text-align:left;font:inherit;color:inherit;width:100%}
.hl-ct:active,.hl-ct:hover{background:rgba(59,102,216,.12)}
.hl-av{width:50px;height:50px;border-radius:50%;object-fit:cover;background:#cfdcff;border:2px solid #fff;flex:none}
.hl-ct b{display:block;font-size:1rem;color:#24366b}.hl-ct small{display:block;color:#7d92d4;font-size:.78rem;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:60vw}
.hl-n{margin-left:auto;flex:none;min-width:26px;height:26px;padding:0 7px;border-radius:13px;background:#3b66d8;color:#fff;font-size:.78rem;font-weight:800;display:flex;align-items:center;justify-content:center}
.hl-cv{display:flex;flex-direction:column;height:min(78vh,640px)}
.hl-ch{display:flex;align-items:center;gap:10px;padding:10px 12px;background:rgba(255,255,255,.55);border-bottom:1px solid rgba(59,102,216,.2)}
.hl-bk{border:0;background:rgba(59,102,216,.15);color:#3b66d8;border-radius:12px;width:34px;height:34px;font-size:1.2rem;cursor:pointer;flex:none}
.hl-ch .hl-t{flex:1;min-width:0}.hl-ch b{display:block;font-size:1rem;color:#24366b}.hl-ch small{display:block;font-size:.72rem;color:#6a7fc0}
.hl-lb{border:1.5px solid #3b66d8;background:#fff;color:#3b66d8;border-radius:16px;padding:5px 12px;font:inherit;font-weight:700;font-size:.8rem;cursor:pointer;flex:none}
.hl-ms{flex:1;overflow-y:auto;padding:12px 12px 6px;display:flex;flex-direction:column;gap:9px}
.hl-r{display:flex;align-items:flex-end;gap:7px;animation:hlin .25s ease}
.hl-r.p{flex-direction:row-reverse}
@keyframes hlin{from{opacity:0;transform:translateY(8px)}}
.hl-r .hl-av{width:34px;height:34px}
.hl-b{max-width:74%;padding:9px 13px;border-radius:16px;font-size:.92rem;line-height:1.4;word-break:break-word}
.hl-r.c .hl-b{background:#fff;color:#24366b;border-bottom-left-radius:5px}
.hl-r.p .hl-b{background:#3b66d8;color:#fff;border-bottom-right-radius:5px;font-weight:600}
.hl-em{width:92px;height:92px;object-fit:contain}.hl-pic{max-width:62%;border-radius:14px;border:3px solid #fff}
.hl-w{font-size:.68rem;color:#6a7fc0;margin:0 0 2px 41px}
.hl-sy{align-self:center;font-size:.74rem;color:#7d92d4;background:rgba(255,255,255,.6);padding:3px 12px;border-radius:12px}
.hl-ft{padding:10px 12px 14px;border-top:1px solid rgba(59,102,216,.2);background:rgba(255,255,255,.6);display:grid;gap:7px}
.hl-op{border:2px solid #3b66d8;background:#fff;color:#2a4cae;border-radius:14px;padding:10px 12px;font:inherit;font-weight:700;font-size:.9rem;cursor:pointer;text-align:left}
.hl-nx{border:0;background:#3b66d8;color:#fff;border-radius:14px;padding:11px;font:inherit;font-weight:800;cursor:pointer}
.hl-sk{border:0;background:transparent;color:#6a7fc0;font:inherit;font-size:.78rem;cursor:pointer;text-decoration:underline}
.hl-fin{text-align:center;color:#6a7fc0;font-size:.82rem;padding:4px}
.hl-pop{position:absolute;right:10px;top:54px;z-index:5;background:#fff;border-radius:14px;box-shadow:0 8px 24px rgba(20,30,90,.35);padding:6px;width:min(300px,86%);max-height:60%;overflow:auto}
.hl-pop button{display:flex;gap:8px;align-items:center;width:100%;border:0;background:transparent;text-align:left;padding:10px;border-radius:10px;font:inherit;font-size:.86rem;color:#24366b;cursor:pointer}
.hl-pop button.on{background:#3b66d8;color:#fff}.hl-pop button i{font-style:normal;flex:none;width:22px;height:22px;border-radius:50%;background:rgba(59,102,216,.18);display:flex;align-items:center;justify-content:center;font-size:.7rem;font-weight:800}
.hl-pop button.on i{background:rgba(255,255,255,.3)}.hl-pop span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.hl-nota{font-size:.75rem;color:#9d98c4;text-align:center;margin:10px 6px 0}
`;document.head.appendChild(s)})();
const avUrl=cid=>PR&&PR[cid]&&PR[cid].im||SS+"head/head_"+cid+"01_XL.webp";
async function getIdx(){if(IDX)return IDX;try{const r=await fetch("heartlink/indice.json");IDX=r.ok?await r.json():[]}catch(x){IDX=[]}try{const r=await fetch("presets.json");PR=r.ok?await r.json():{}}catch(x){PR={}}return IDX}
async function getChar(cid){
  if(DC[cid]===undefined){try{const r=await fetch("heartlink/"+cid+".json");DC[cid]=r.ok?await r.json():null}catch(x){DC[cid]=null}}
  if(TR[cid]===undefined){TR[cid]={};try{const r=await fetch("textos/HL_"+cid+".txt",{cache:"no-cache"});if(r.ok)(await r.text()).split("\n").forEach(l=>{const m=l.match(/^(\w+\.\d+) \[[^\]]*\] \| (.*)$/);if(m)TR[cid][m[1]]=m[2]})}catch(x){}}
  return DC[cid];
}
/* aplica traducciones en el mismo orden que generar_heartlink.py: opciones de la eleccion y luego cada rama */
function prep(cid,g){
  if(g._p)return g;let n=0;const T=TR[cid],t=s=>{n++;const v=T[g.id+"."+String(n).padStart(4,"0")];return v!=null&&v!==""?v:s};
  const walk=ms=>ms.map(m=>{if(m.t==="ch"){const o=m.o.map(t),b=m.b.map(walk);return{t:"ch",o,b,r:m.r}}return "x" in m?Object.assign({},m,{x:t(m.x)}):m});
  g.m2=walk(g.m);g._p=1;return g;
}
function firstText(ms){for(const m of ms){if(m.t==="ch")return m.o[0];if(m.x)return m.x}return""}
const root=()=>document.getElementById("hl-root");
async function vList(){
  const R=root();if(!R)return;R.innerHTML='<p class="nota" style="text-align:center">Cargando…</p>';
  const I=await getIdx();
  R.innerHTML=`<div class="hl"><div class="hl-ph"><div class="hl-h"><h3>Chat</h3><span class="hl-sub">HEARTLINK</span></div><div class="hl-li">${I.map(x=>`<button class="hl-ct" data-c="${x.id}"><img class="hl-av" src="${e(avUrl(x.id))}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.style.visibility='hidden'"><div><b>${e(x.n)}</b><small>${x.c} conversaciones</small></div><span class="hl-n">${x.c}</span></button>`).join("")}</div></div><p class="hl-nota">Las conversaciones del teléfono del juego. Elige un personaje para leerlas; algunas te dejan elegir qué responder.</p></div>`;
  R.querySelectorAll("[data-c]").forEach(b=>b.onclick=()=>{if(typeof nav==="function")nav("heartlink/"+b.dataset.c+"/0");else vChat(+b.dataset.c,0)});
}
function swap(cid,i){try{history.replaceState(null,"","#heartlink/"+cid+"/"+i)}catch(x){}vChat(cid,i)}
async function vChat(cid,gi){
  const R=root();if(!R)return;
  await getIdx();const D=await getChar(cid);if(!D){vList();return}
  const G=D.g,g=prep(cid,G[gi]),I=IDX||[];
  const pre=firstText(g.m2);
  R.innerHTML=`<div class="hl"><div class="hl-ph hl-cv" style="position:relative"><div class="hl-ch"><button class="hl-bk" data-k="back" aria-label="Contactos">‹</button><img class="hl-av" style="width:42px;height:42px" src="${e(avUrl(cid))}" alt="" referrerpolicy="no-referrer" onerror="this.style.visibility='hidden'"><div class="hl-t"><b>${e(D.n)}</b><small>${tx(pre).replace(/<br>/g," ").slice(0,70)}</small></div><button class="hl-lb" data-k="list">☰ Lista</button></div><div class="hl-ms"></div><div class="hl-ft"></div></div></div>`;
  const ms=R.querySelector(".hl-ms"),ft=R.querySelector(".hl-ft"),ph=R.querySelector(".hl-ph");
  R.querySelector("[data-k=back]").onclick=()=>{if(typeof depth!=="undefined"&&depth>0)history.back();else location.replace("#heartlink")};
  R.querySelector("[data-k=list]").onclick=()=>{
    const old=ph.querySelector(".hl-pop");if(old){old.remove();return}
    const p=document.createElement("div");p.className="hl-pop";
    p.innerHTML=G.map((x,i)=>{const q=prep(cid,x);return `<button data-i="${i}" class="${i===gi?"on":""}"><i>${i+1}</i><span>${tx(firstText(q.m2)).replace(/<br>/g," ")}</span></button>`}).join("");
    ph.appendChild(p);p.querySelectorAll("[data-i]").forEach(b=>b.onclick=()=>swap(cid,+b.dataset.i));
  };
  const ava=`<img class="hl-av" src="${e(avUrl(cid))}" alt="" referrerpolicy="no-referrer" onerror="this.style.visibility='hidden'">`;
  const add=m=>{
    let h="";
    if(m.t==="s")h=`<div class="hl-sy">${tx(m.x)}</div>`;
    else{const who=m.t==="c"?"c":"p";
      const body=m.e?(m.i?`<img class="hl-pic" src="${pic(m.e)}" alt="" onerror="this.outerHTML='<div class=hl-b>📷</div>'">`:`<img class="hl-em" src="${emo(m.e)}" alt="" onerror="this.outerHTML='<div class=hl-b>🙂</div>'">`):`<div class="hl-b">${tx(m.x)}</div>`;
      const nm=m.w&&D.w&&D.w[m.w]?`<div class="hl-w">${e(D.w[m.w])}</div>`:"";
      h=nm+`<div class="hl-r ${who}">${who==="c"?ava:""}${body}</div>`}
    ms.insertAdjacentHTML("beforeend",h);ms.scrollTop=ms.scrollHeight;
  };
  /* cola de mensajes por reproducir */
  let Q=g.m2.slice(),busy=0;
  function step(all){
    if(!Q.length){const nx=gi+1<G.length;ft.innerHTML=`<div class="hl-fin">Fin de la conversación</div>${nx?'<button class="hl-nx" data-k="nx">Siguiente conversación ›</button>':""}`;const b=ft.querySelector("[data-k=nx]");if(b)b.onclick=()=>swap(cid,gi+1);return}
    const m=Q.shift();
    if(m.t==="ch"){
      ft.innerHTML=m.o.map((o,i)=>`<button class="hl-op" data-o="${i}">${tx(o)}</button>`).join("");
      ft.querySelectorAll("[data-o]").forEach(b=>b.onclick=()=>{const i=+b.dataset.o;add({t:"p",x:m.o[i]});Q=m.b[i].concat(Q);ft.innerHTML="";run()});
      return;
    }
    add(m);
    if(all)step(true);else run();
  }
  function run(){
    if(!Q.length){step();return}
    if(Q[0].t==="ch"){step();return}
    ft.innerHTML='<button class="hl-nx" data-k="n">Continuar</button><button class="hl-sk" data-k="all">Mostrar todo hasta la siguiente elección</button>';
    ft.querySelector("[data-k=n]").onclick=()=>step();
    ft.querySelector("[data-k=all]").onclick=()=>{while(Q.length&&Q[0].t!=="ch"){add(Q.shift())}run()};
  }
  /* el primer mensaje aparece solo */
  step();
}
window.hlShow=function(){const m=decodeURIComponent(location.hash).match(/^#heartlink\/(\d+)(?:\/(\d+))?/);if(m)vChat(+m[1],+(m[2]||0));else vList()};
const b=document.getElementById("hlbar");if(b)b.onclick=()=>{if(typeof nav==="function")nav("heartlink")};
})();
