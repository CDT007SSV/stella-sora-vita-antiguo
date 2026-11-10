/* Ficha ampliada de disco: Ficha (arte, musica, historia) / Habilidades / Estadisticas.
   Lee discos/indice.json y discos/<id>.json (generados con generar_discos.py desde los datos del juego). */
(function(){
const e=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const CACHE={};let IDX;
const n=x=>Number(x).toLocaleString("es-MX");
function tpl(s,vals){
  return e(s).replace(/⟦(\d+)⟧/g,(m,i)=>'<b class="fn">'+e(vals&&vals[i]!=null?vals[i]:"?")+"</b>")
    .replace(/⟨([^⟩]*)⟩/g,'<i class="fk">$1</i>').replace(/\n/g,"<br>");
}
const ico=(h)=>h.ic?`<span class="fk-ic"${h.bg?` style="background-image:url(${h.bg})"`:""}><img src="${h.ic}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()"></span>`:"";
const lvl=(max,min)=>`<div class="fk-lv"><button class="fk-st" data-d="-1" aria-label="Bajar nivel">−</button><span>Nivel <b class="fk-n">${min||1}</b> / ${max}</span><button class="fk-st" data-d="1" aria-label="Subir nivel">+</button></div>`;
const NT=(F,k)=>{const r=(IDX&&IDX.notas[k])||{};return r.n||k};
const NI=k=>{const r=(IDX&&IDX.notas[k])||{};return r.ic?`<img class="fk-mimg" src="${r.ic}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()">`:""};
function skillCard(h,tipo,max,extra){
  return `<div class="fk-card dk-card" data-tipo="${tipo}"><div class="fk-top">${ico(h)}<span class="fk-t">${e(tipo==="mel"?"Melodía":"Armonía")}</span></div>
    <h4>${e(h.n)}</h4>${h.ne!==h.n?`<div class="fk-en">${e(h.ne)}</div>`:""}${lvl(max)}<div class="fk-d dk-d"></div>${extra?'<div class="dk-req"></div>':""}</div>`;
}
function pintaSkill(c,h,l,notas){
  c.querySelector(".fk-n").textContent=l;
  c.querySelector(".dk-d").innerHTML=tpl((h.ts&&h.ts[l-1])||h.t,h.v[l-1]);
  const q=c.querySelector(".dk-req");
  if(q&&h.nt){const r=h.nt[l-1]||{};
    q.innerHTML=`<div class="fk-mh">Para activarla necesitas</div><div class="fk-mi">${Object.keys(r).map(k=>`<span>${NI(k)}${e(NT(null,k))} <b>×${r[k]}</b></span>`).join("")}</div>${h.pt&&h.pt[l-1]?`<div class="nota">Puntaje requerido: ${n(h.pt[l-1])}</div>`:""}`}
}
function panelHab(F){
  let h="";
  if(F.mel)h+=`<h4 class="fk-h">Habilidad de melodía</h4>`+skillCard(F.mel,"mel",F.mel.v.length);
  if(F.arm&&F.arm.length)h+=`<h4 class="fk-h">Habilidades de armonía</h4>`+F.arm.map(a=>skillCard(a,"arm",a.v.length,true)).join("");
  const nf=(F.nf||[]).filter(x=>Object.keys(x.n).length);
  if(nf.length)h+=`<h4 class="fk-h">Notas por ascensión</h4><div class="card dk-nf">${nf.map(x=>`<div class="kv"><span>${x.f===0?"Sin ascender":"Ascensión "+x.f}</span><b style="flex:0 0 auto;text-align:right">${Object.keys(x.n).map(k=>NI(k)+e(NT(null,k).replace(/^Melodía de /,""))+" ×"+x.n[k]).join(" · ")}</b></div>`).join("")}</div><p class="nota">Las notas son las que aporta el disco al subir de ascensión; con ellas se activan los niveles de las habilidades de armonía.</p>`;
  return h||"<p class='nota'>Sin datos de habilidades.</p>";
}
function panelSta(F){
  const ph=Object.keys(F.st);
  return `<div class="fk-sw dk-ph">${ph.map(p=>`<button class="chip${p==="8"?" on":""}" data-p="${p}">${p==="0"?"Sin ascender":"Asc. "+p}</button>`).join("")}</div>
   ${lvl(1)}<input type="range" class="fk-rg" min="1" max="1" value="1"><div class="fk-sv"></div>
   <h4 class="fk-h">Bonus de ATK extra</h4><div class="fk-sw dk-ex">${Object.keys(F.ex||{}).length?['0'].concat(Object.keys(F.ex)).map(k=>`<button class="chip${k==="0"?" on":""}" data-x="${k}">${k==="0"?"Ninguno":"Nivel "+k}</button>`).join(""):""}</div>
   <div class="dk-asc"></div>
   <p class="nota">Valores base del disco según los datos del juego. Cada ascensión sube el nivel máximo; el bonus de ATK extra se suma al ATK base.</p>`;
}
function montarSta(out,F){
  let p="8",x="0",l=0;
  const rows=()=>F.st[p]||[];
  const pinta=()=>{
    const R=rows();if(!R.length)return;const mn=R[0][0],mx=R[R.length-1][0];if(!l||l<mn||l>mx)l=mx;
    const r=R.find(a=>a[0]===l)||R[R.length-1],ex=(F.ex&&F.ex[x])||0;
    out.querySelector(".fk-n").textContent=l;out.querySelector(".fk-lv span").innerHTML=`Nivel <b class="fk-n">${l}</b> / ${mx}`;
    const g=out.querySelector(".fk-rg");g.min=mn;g.max=mx;g.value=l;
    out.querySelector(".fk-sv").innerHTML=`<div class="stats"><div class="stat"><b>${n(r[1])}</b><span>HP</span></div><div class="stat"><b>${n(r[2]+ex)}</b><span>ATK${ex?" (+"+n(ex)+")":""}</span></div></div>`;
    const a=(F.asc||[]).find(z=>String(z.f)===p);
    out.querySelector(".dk-asc").innerHTML=p==="0"?"":(a?`<h4 class="fk-h">Para ascender a la fase ${p}</h4><div class="fk-mi">${a.m.map(m=>`<span>${m.iu?`<img class="fk-mimg" src="${m.iu}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()">`:""}${e(m.n)} <b>×${n(m.q)}</b></span>`).join("")}<span>Dorra <b>×${n(a.o)}</b></span></div>`:"");
  };
  out.querySelectorAll("[data-p]").forEach(b=>b.onclick=()=>{p=b.dataset.p;l=0;out.querySelectorAll("[data-p]").forEach(z=>z.classList.toggle("on",z===b));pinta()});
  out.querySelectorAll("[data-x]").forEach(b=>b.onclick=()=>{x=b.dataset.x;out.querySelectorAll("[data-x]").forEach(z=>z.classList.toggle("on",z===b));pinta()});
  out.querySelector(".fk-rg").oninput=ev=>{l=+ev.target.value;pinta()};
  out.querySelectorAll(".fk-st").forEach(b=>b.onclick=()=>{const R=rows();l=Math.max(R[0][0],Math.min(R[R.length-1][0],(l||R[R.length-1][0])+(+b.dataset.d)));pinta()});
  l=0;pinta();
}
function montar(box,F){
  let tab="fic";const out=box.querySelector(".fk-body"),fic=document.getElementById("dficha-tab");
  function pinta(){
    box.querySelectorAll(".fk-tabs .chip").forEach(c=>c.classList.toggle("on",c.dataset.t===tab));
    if(fic)fic.style.display=tab==="fic"?"":"none";
    out.style.display=tab==="fic"?"none":"";
    if(tab==="fic"){out.innerHTML="";return}
    if(tab==="hab"){
      out.innerHTML=panelHab(F);
      out.querySelectorAll(".dk-card").forEach(c=>{const h=c.dataset.tipo==="mel"?F.mel:F.arm[[...out.querySelectorAll('.dk-card[data-tipo="arm"]')].indexOf(c)];if(!h)return;let l=1;const mx=h.v.length;
        pintaSkill(c,h,l);c.querySelectorAll(".fk-st").forEach(b=>b.onclick=()=>{l=Math.max(1,Math.min(mx,l+(+b.dataset.d)));pintaSkill(c,h,l)})});
    }else{out.innerHTML=panelSta(F);montarSta(out,F)}
  }
  box.querySelectorAll(".fk-tabs .chip").forEach(c=>c.onclick=()=>{tab=c.dataset.t;pinta()});
  pinta();
}
window.discoCargar=async function(d){
  const box=document.getElementById("disco-box");if(!box)return;
  try{
    if(!IDX){const r=await fetch("discos/indice.json");IDX=r.ok?await r.json():{ids:{},notas:{}}}
    const id=IDX.ids[d.name];if(!id)return;
    let F=CACHE[id];if(F===undefined){const r=await fetch("discos/"+id+".json");F=r.ok?await r.json():null;CACHE[id]=F}
    if(!F||!document.getElementById("disco-box"))return;
    box.innerHTML=`<div class="fk-tabs"><button class="chip on" data-t="fic">Ficha</button><button class="chip" data-t="hab">Habilidades</button><button class="chip" data-t="sta">Estadísticas</button></div><div class="fk-body" style="display:none"></div>`;
    montar(box,F);
    try{await window.__meta}catch(x){}
    const L=typeof LECTOR!=="undefined"&&LECTOR["disc:"+d.name];
    if(L&&document.getElementById("disco-box")&&!box.querySelector(".dk-lec"))box.insertAdjacentHTML("afterbegin",`<button type="button" class="btn dk-lec" style="margin:0 0 10px;width:100%" onclick="abrirLector('${L}')">▶ Leer la historia de este disco en el lector</button>`);
  }catch(x){}
};
})();
