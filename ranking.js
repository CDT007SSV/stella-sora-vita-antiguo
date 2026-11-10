/* Ranking de equipos por daño. Datos: hoja "Stella Sora Team Rankings" de ZiLenTz, en ranking.json. */
(function(){
const EC={Aqua:"#1e90d6",Ignis:"#e5533d",Lux:"#e0a82a",Terra:"#a9783a",Umbra:"#8b5cf6",Ventus:"#2fb585"};
const esc=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const norm=s=>String(s||"").normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase();
const RN={DPS:"DPS","Sub-DPS":"Sub-DPS",Support:"Apoyo"};
let D=null,fe="",q="",cp=0,open=null,fm=0,pm=0; /* fm: filtro "puedo armarlo"; pm: panel de mis personajes */
const MK="ssv_mine";
const mine=()=>{try{return new Set(JSON.parse(localStorage.getItem(MK)||"[]"))}catch(e){return new Set()}};
const saveMine=S=>{try{localStorage.setItem(MK,JSON.stringify([...S]))}catch(e){}};
const falta=(x,S)=>x.s.filter(m=>!S.has(m.n)).map(m=>m.n);
(function css(){const s=document.createElement("style");s.textContent=`
#rk-root .rk-mi{display:flex;align-items:center;gap:10px;width:100%;padding:12px 14px;margin:0 0 10px;border-radius:14px;border:1px solid #5b4fe0;background:rgba(91,79,224,.2);color:#e9e5ff;font:inherit;font-weight:700;cursor:pointer;text-align:left}#rk-root .rk-mi small{display:block;font-weight:500;color:#b9b3e8;font-size:.72rem}
#rk-root .rk-gr{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:10px 0}#rk-root .rk-gc{position:relative;border:2px solid #2c2850;border-radius:12px;background:rgba(20,16,50,.7);padding:6px 2px;text-align:center;font-size:.68rem;color:#cfc8ff;cursor:pointer;font:inherit}#rk-root .rk-gc img,#rk-root .rk-gc .av{width:100%;aspect-ratio:1;object-fit:cover;border-radius:8px;display:block;opacity:.45}#rk-root .rk-gc b{display:block;margin-top:3px;font-size:.66rem;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}#rk-root .rk-gc.on{border-color:#5ce1e6;background:rgba(92,225,230,.14)}#rk-root .rk-gc.on img,#rk-root .rk-gc.on .av{opacity:1}#rk-root .rk-gc.on:after{content:"✓";position:absolute;top:3px;right:5px;color:#5ce1e6;font-weight:900}
#rk-root .rk-fl{margin:6px 0 0;font-size:.74rem;color:#ffb3c0}#rk-root .rk-ok{margin:6px 0 0;font-size:.74rem;color:#8ff0c3}
#rk-root .rk-h{padding:14px;border-radius:16px;border:1px solid #3a3560;background:linear-gradient(135deg,rgba(123,108,255,.2),rgba(92,225,230,.08));margin-bottom:10px}
#rk-root .rk-h h3{margin:0 0 4px}#rk-root .rk-h p{margin:4px 0;font-size:.82rem;color:#cfc8ff;line-height:1.4}
#rk-root .rk-cr{font-size:.76rem;color:#b9b3e8}#rk-root .rk-cr a{color:#9d93ff}
#rk-root details{margin-top:6px;font-size:.78rem;color:#b9b3e8}#rk-root details summary{cursor:pointer;color:#cfc8ff}
#rk-root .rk-f{display:flex;gap:6px;overflow-x:auto;padding:2px 0 8px;scrollbar-width:none}#rk-root .rk-f::-webkit-scrollbar{display:none}
#rk-root .rk-c{--tc:#7B6CFF;border:1px solid #2c2850;border-left:4px solid var(--tc);border-radius:14px;background:rgba(20,16,50,.7);padding:10px 12px;margin-bottom:8px}
#rk-root .rk-t{display:flex;align-items:center;gap:8px}#rk-root .rk-n{flex:none;width:26px;height:26px;border-radius:8px;background:rgba(255,255,255,.08);display:flex;align-items:center;justify-content:center;font-size:.8rem;font-weight:800;color:#ffd76a}
#rk-root .rk-t b{font-size:.92rem;line-height:1.25;flex:1;min-width:0}
#rk-root .rk-p{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:8px 0}
#rk-root .rk-m{text-align:center;font-size:.72rem;color:#cfc8ff;min-width:0}
#rk-root .rk-m .av{display:block;width:100%;aspect-ratio:1;max-width:64px;margin:0 auto 3px;border-radius:12px;border:2px solid var(--mc,#3a3560);background:#15122a;object-fit:cover;object-position:top}
#rk-root .rk-m .av.x{display:flex;align-items:center;justify-content:center;font-weight:800;color:#9a95c4}
#rk-root .rk-m b{display:block;color:#fff;font-size:.74rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#rk-root .rk-m i{font-style:normal;color:#9a95c4}
#rk-root .rk-b{height:8px;border-radius:5px;background:rgba(255,255,255,.08);overflow:hidden}#rk-root .rk-b span{display:block;height:100%;background:linear-gradient(90deg,#7B6CFF,#5CE1E6)}
#rk-root .rk-d{display:flex;justify-content:space-between;font-size:.76rem;color:#b9b3e8;margin:4px 0 6px}
#rk-root .rk-a{display:flex;flex-wrap:wrap;gap:6px}
#rk-root .rk-a a,#rk-root .rk-a button{font:inherit;font-size:.76rem;padding:6px 10px;border-radius:10px;border:1px solid #3a3560;background:rgba(123,108,255,.14);color:#e9e5ff;text-decoration:none;cursor:pointer}
#rk-root .rk-a .rk-nc{flex:1 0 100%;font-size:.74rem;color:var(--t2);padding:2px 2px 4px}
#rk-root .rk-a .go{background:#5b4fe0;border-color:#5b4fe0;font-weight:700}
#rk-root .rk-g{font-size:.7rem;padding:2px 7px;border-radius:8px;background:rgba(255,255,255,.08);color:#cfc8ff}
#rk-root .rk-h{padding:12px 14px;background:linear-gradient(135deg,rgba(123,108,255,.28),rgba(92,225,230,.1))}
#rk-root .rk-h h3{font-size:1.1rem}
#rk-root .rk-bar{padding:2px 0}
#rk-root .rk-mi{padding:10px 12px;margin:0 0 8px;background:linear-gradient(135deg,rgba(232,196,106,.2),rgba(232,196,106,.06));border-color:rgba(232,196,106,.55)}
#rk-root .rk-mi .st{font-size:1.5rem}
#rk-root .rk-f{gap:6px;padding:4px 0 8px}
#rk-root .rk-f .chip{flex:none;padding:6px 12px;font-size:.78rem;min-height:0;height:auto;line-height:1.2;white-space:nowrap}
#rk-root .rk-f .chip i{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:5px;background:var(--ec,#7b6cff)}
#rk-root .rk-c{padding:12px;border-radius:16px;margin-bottom:12px;background:linear-gradient(180deg,rgba(28,22,66,.85),rgba(16,13,40,.85));box-shadow:0 4px 14px rgba(0,0,0,.25)}
#rk-root .rk-t{gap:10px}
#rk-root .rk-n{width:34px;height:34px;border-radius:10px;font-size:1rem;font-weight:800}
#rk-root .rk-n.g1{background:linear-gradient(135deg,#f3d98a,#c99a2e);color:#3a2800}#rk-root .rk-n.g2{background:linear-gradient(135deg,#e4e8f0,#9aa3b5);color:#1d2230}#rk-root .rk-n.g3{background:linear-gradient(135deg,#e6b184,#a9693a);color:#2d1700}
#rk-root .rk-t b{font-size:1rem}
#rk-root .rk-p{gap:8px;margin:12px 0 8px}
#rk-root .rk-m{position:relative;padding:8px 4px 6px;border-radius:12px;background:rgba(255,255,255,.04)}
#rk-root .rk-m .av{max-width:78px;border-radius:14px}
#rk-root .rk-m.no .av{opacity:.35;filter:grayscale(.7)}
#rk-root .rk-m.no:after{content:"No lo tienes";position:absolute;top:4px;left:50%;transform:translateX(-50%);font-size:.56rem;background:rgba(255,90,120,.9);color:#fff;border-radius:6px;padding:1px 5px;white-space:nowrap}
#rk-root .rk-m b{font-size:.8rem;margin-top:2px}
#rk-root .rk-m i{display:inline-block;margin-top:2px;padding:1px 7px;border-radius:8px;background:rgba(255,255,255,.07);font-size:.64rem}
#rk-root .rk-m i.dps{background:rgba(255,107,157,.22);color:#ffb3c9}
#rk-root .rk-fl,#rk-root .rk-ok{padding:6px 10px;border-radius:10px;font-size:.76rem;margin:4px 0 8px}
#rk-root .rk-fl{background:rgba(255,90,120,.12)}#rk-root .rk-ok{background:rgba(47,191,122,.14)}
#rk-root .rk-b{height:10px;border-radius:6px}
#rk-root .rk-d{font-size:.78rem;margin:6px 0 10px}#rk-root .rk-d span:first-child{font-weight:700;color:#e9e5ff}
#rk-root .rk-a a,#rk-root .rk-a button{padding:8px 12px;border-radius:12px}
#rk-root .rk-a .go{flex:1 1 100%;text-align:center;padding:10px;font-size:.84rem}
#rk-root .rk-a a{flex:1;text-align:center}
#rk-root .rk-gc.on:after{content:"⭐"}
`;document.head.appendChild(s)})();
function chOf(n){return typeof CHARS!=="undefined"?CHARS.find(c=>c.name===n):null}
function card(x,i,S){
  const fl=S&&S.size?falta(x,S):null;
  const col=EC[x.el]||"#7B6CFF";
  const mem=x.s.map(m=>{const c=chOf(m.n),mc=c?(EC[c.element]||"#3a3560"):"#3a3560";
    return `<div class="rk-m${S&&S.size&&!S.has(m.n)?" no":""}" style="--mc:${mc}">${c&&c.imageUrl?`<img class="av" src="${esc(c.imageUrl)}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.style.visibility='hidden'">`:`<span class="av x">${esc(m.n[0])}</span>`}<b>${esc(m.n)}</b><i class="${m.r==="DPS"?"dps":""}">${esc(RN[m.r]||m.r)}${m.t?" · "+esc(m.t):""}</i></div>`}).join("");
  const au=x.auto==="Yes"?"Auto ✓":x.auto==="Decent"?"Auto ~":x.auto==="No"?"Auto ✗":"";
  return `<div class="rk-c" style="--tc:${col}"><div class="rk-t"><span class="rk-n${i<3?" g"+(i+1):""}">${i+1}</span><b>${esc(x.team)}</b>${au?`<span class="rk-g">${au}</span>`:""}</div>
   <div class="rk-p">${mem}</div>
   ${fl?(fl.length?`<div class="rk-fl">Te falta: ${fl.map(esc).join(", ")}</div>`:`<div class="rk-ok">✓ Lo puedes armar con tus personajes</div>`):""}
   <div class="rk-b"><span style="width:${Math.max(2,Math.round(x.pct*100))}%"></span></div>
   <div class="rk-d"><span>${(x.pct*100).toFixed(1)}% del mejor</span><span>${(x.dmg/1e9).toFixed(1)} mil M de daño</span></div>
   <div class="rk-a">${x.code?`<button class="go" data-rk="${D.equipos.indexOf(x)}">Abrir en el armador</button>`:`<span class="rk-nc">Sin preset disponible</span>`}${x.guide?`<a href="${esc(x.guide)}" target="_blank" rel="noopener noreferrer">▶ Guía</a>`:""}${x.src?`<a href="${esc(x.src)}" target="_blank" rel="noopener noreferrer">📊 Cálculo</a>`:""}</div></div>`;
}
function paint(){
  const r=document.getElementById("rk-root");if(!r)return;
  const els=[...new Set(D.equipos.map(x=>x.el))];
  const n=norm(q);
  const S=mine();
  if(pm){const nombres=[...new Set([...(typeof CHARS!=="undefined"?CHARS.map(c=>c.name):[]),...D.equipos.flatMap(x=>x.s.map(m=>m.n))])].sort((a,b)=>a.localeCompare(b));
    r.innerHTML=`<div class="rk-h"><h3>Mis personajes</h3><p>Toca los personajes que tienes. Se guardan en tu teléfono y el ranking te dirá qué equipos puedes armar y qué te falta.</p><p class="rk-cr">${S.size} marcados de ${nombres.length}</p></div>
     <div class="rk-f"><button class="chip" data-all="1">Marcar todos</button><button class="chip" data-none="1">Ninguno</button><button class="chip on" data-done="1">Listo</button></div>
     <div class="rk-gr">${nombres.map(nm=>{const c=chOf(nm);return `<button type="button" class="rk-gc${S.has(nm)?" on":""}" data-m="${esc(nm)}">${c&&c.imageUrl?`<img src="${esc(c.imageUrl)}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.style.visibility='hidden'">`:`<span class="av" style="background:#2c2850;display:flex;align-items:center;justify-content:center;font-size:1.4rem">${esc(nm[0])}</span>`}<b>${esc(nm)}</b></button>`}).join("")}</div>`;return}
  const cuenta=x=>falta(x,S).length;
  let R=D.equipos.filter(x=>(!fe||x.el===fe)&&(!cp||x.code)&&(!fm||(S.size&&cuenta(x)<=fm-1))&&(!n||norm(x.team+" "+x.s.map(m=>m.n).join(" ")).includes(n)));
  const dt=D.meta.generado?new Date(D.meta.generado).toLocaleDateString("es",{day:"numeric",month:"short"}):"";
  r.innerHTML=`<div class="rk-h"><h3>Ranking de equipos</h3><p>Los equipos con más daño según la comunidad. Toca “Abrir en el armador” para guardarlo.</p>
   <p class="rk-cr">Datos: <b>Stella Sora Team Rankings</b> de ZiLenTz. <a href="${esc(D.meta.url)}" target="_blank" rel="noopener noreferrer">Ver la hoja original</a> · <a href="${esc(D.meta.kofi)}" target="_blank" rel="noopener noreferrer">☕ Apoyar al autor</a>${dt?` · actualizado ${dt}`:""}</p>
   <details><summary>Cómo se compararon los equipos</summary><ul>${D.meta.supuestos.map(s=>`<li>${esc(s)}</li>`).join("")}</ul><p>Tu daño real puede variar según tu cuenta, tus discos y tus emblemas.</p></details></div>
   <div class="rk-bar"><button type="button" class="rk-mi" data-pm="1"><span class="st">⭐</span><span>Mis personajes<small>${S.size?S.size+" marcados · toca para cambiar":"Márcalos para ver qué equipos puedes armar"}</small></span></button>
   <input class="tm-in" id="rk-q" type="search" placeholder="Buscar equipo o personaje…" value="${esc(q)}" style="margin-bottom:8px">
   <div class="rk-f"><button class="chip${fe?"":" on"}" data-e="">Todos</button>${els.map(e=>`<button class="chip${fe===e?" on":""}" data-e="${e}" style="--ec:${EC[e]||"#7b6cff"}"><i></i>${e}</button>`).join("")}<button class="chip${cp?" on":""}" data-cp="1">Con preset</button>${S.size?`<button class="chip${fm===1?" on":""}" data-fm="1">Puedo armarlo</button><button class="chip${fm===2?" on":""}" data-fm="2">Me falta 1</button>`:""}</div></div>
   ${R.length?R.map(x=>card(x,D.equipos.indexOf(x),S)).join(""):'<p class="nota">${fm?"Ningún equipo cumple con tus personajes marcados. Prueba con “Me falta 1” o marca más personajes.":"Sin resultados."}</p>'}`;
  const i=r.querySelector("#rk-q");if(open){i.focus();i.setSelectionRange(q.length,q.length)}
}
window.rankShow=async function(){
  const r=document.getElementById("rk-root");if(!r)return;
  if(!r._ok){r._ok=1;
    r.addEventListener("click",async ev=>{
      if(ev.target.closest("[data-pm]")){pm=1;paint();window.scrollTo(0,0);return}
      if(ev.target.closest("[data-done]")){pm=0;paint();window.scrollTo(0,0);return}
      const mm=ev.target.closest("[data-m]");if(mm){const S=mine();S.has(mm.dataset.m)?S.delete(mm.dataset.m):S.add(mm.dataset.m);saveMine(S);const y=window.scrollY;paint();window.scrollTo(0,y);return}
      if(ev.target.closest("[data-all]")){const S=new Set([...r.querySelectorAll("[data-m]")].map(b=>b.dataset.m));saveMine(S);paint();return}
      if(ev.target.closest("[data-none]")){saveMine(new Set());paint();return}
      const fb=ev.target.closest("[data-fm]");if(fb){fm=fm===+fb.dataset.fm?0:+fb.dataset.fm;open=0;paint();return}
      const e=ev.target.closest("[data-e]");if(e){fe=e.dataset.e;open=0;paint();return}
      if(ev.target.closest("[data-cp]")){cp=cp?0:1;open=0;paint();return}
      const b=ev.target.closest("[data-rk]");if(b){const x=D.equipos[+b.dataset.rk];b.disabled=true;
        const ok=window.teamsOpen?await window.teamsOpen({code:x.code,alias:"ZiLenTz · Team Rankings",title:x.team}):false;b.disabled=false;
        if(!ok)alert("No se pudo abrir este equipo en el armador.")}
    });
    r.addEventListener("input",ev=>{if(ev.target.id==="rk-q"){q=ev.target.value;open=1;paint()}});
  }
  if(!D){r.innerHTML='<p class="nota">Cargando…</p>';
    try{const x=await fetch("ranking.json",{cache:"no-cache"});D=await x.json()}catch(e){r.innerHTML='<p class="nota">No se pudo cargar el ranking. Revisa tu conexión.</p>';return}}
  open=0;pm=0;paint();
};
})();
