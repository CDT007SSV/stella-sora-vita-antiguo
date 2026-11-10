/* Ficha ampliada de personaje: Habilidades, Potenciales, Afinidad y Stats.
   Lee fichas/<id>.json (generado desde la wiki + traducción). Si el personaje no tiene ficha, no muestra nada. */
(function(){
const FILE="https://stellasora.miraheze.org/wiki/Special:FilePath/";
const e=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const TIPO={auto:"Ataque normal",main:"Habilidad principal",support:"Habilidad de apoyo",ultimate:"Definitiva"};
const CACHE={};
function tpl(s,vals,tier,tn){
  return e(s).replace(/⟦(\d+)⟧/g,(m,i)=>'<b class="fn">'+e(vals&&vals[i]!=null?(Array.isArray(vals[i])?vals[i][Math.min(tn||0,vals[i].length-1)]:vals[i]):"?")+"</b>")
    .replace(/⟪(\d+)⟫/g,(m,i)=>{const t=(tier||[])[i]||[];return '<b class="fn tier" title="Depende del Tier del personaje">'+e(t[0])+'–'+e(t[t.length-1])+'</b>'})
    .replace(/⟨([^⟩]*)⟩/g,'<i class="fk">$1</i>').replace(/\n/g,"<br>");
}
function skill(h,i){
  const max=Math.max(...h.tpl.flatMap(g=>g.l));
  return `<div class="fk-card" data-i="${i}"><div class="fk-top">${h.iu?`<span class="fk-ic"${h.bg?` style="background-image:url(${h.bg})"`:""}><img src="${h.iu}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()">${h.ti?`<img class="fk-ti" src="${h.ti}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()">`:""}</span>`:""}<span class="fk-t">${TIPO[h.tipo]||e(h.tipo)}</span>${h.cd?`<span class="fk-cd">CD ${e(h.cd)} s</span>`:""}</div>
    <h4>${e(h.n)}</h4>${h.ne!==h.n?`<div class="fk-en">${e(h.ne)}</div>`:""}<p class="fk-b">${tpl(h.b)}</p>
    <div class="fk-lv"><button class="fk-st" data-d="-1" aria-label="Bajar nivel">−</button><span>Nivel <b class="fk-n">1</b> / ${max}</span><button class="fk-st" data-d="1" aria-label="Subir nivel">+</button></div>
    <div class="fk-d"></div><div class="fk-m"></div></div>`;
}
function pintaSkill(card,h,l){
  const g=h.tpl.find(g=>g.l.includes(l))||h.tpl[0];
  card.querySelector(".fk-n").textContent=l;
  card.querySelector(".fk-d").innerHTML=tpl(g.s,h.v[l-1],h.tier);
  const m=h.mats[l-1]||[];
  card.querySelector(".fk-m").innerHTML=m.length?`<div class="fk-mh">Para subir al nivel ${l+1}</div><div class="fk-mi">${m.map(x=>`<span>${x.iu?`<img class="fk-mimg" src="${x.iu}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()">`:""}${e(x.n)} <b>×${x.q.toLocaleString("es-MX")}</b></span>`).join("")}</div>`:(l>=Math.max(...h.tpl.flatMap(g=>g.l))?'<div class="fk-mh">Nivel máximo</div>':'');
}
function pot(p,det){
  const lv=p.v.some(a=>a.length>1);
  return `<div class="fk-pot" data-t="${p.t}"><div class="fk-pi">${p.iu?`<img src="${p.iu}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()">`:""}</div>
    <div><h5>${e(p.n)}</h5>${p.ne!==p.n?`<div class="fk-en">${e(p.ne)}</div>`:""}<p class="fk-pb">${tpl(p.b)}</p>
    <details><summary>Detalle${lv?" y niveles":""}</summary>${lv?'<div class="fk-lv sm"><button class="fk-st" data-d="-1">−</button><span>Nivel <b class="fk-n">1</b> / 6</span><button class="fk-st" data-d="1">+</button></div>':""}<p class="fk-pd">${tpl(p.s,p.v,null,0)}</p></details></div></div>`;
}
function panelPot(F,modo,build){
  const T=F.potenciales[modo]||F.potenciales.main, bs=T.builds;
  const b=bs.find(x=>x.id===build)||bs[0], L=T.l.filter(p=>p.g===b.id);
  const nuc=L.filter(p=>p.t<3), com=L.filter(p=>p.t===3);
  return `<div class="fk-sw">${Object.keys(F.potenciales).map(k=>`<button class="chip${k===modo?" on":""}" data-m="${k}">${k==="main"?"Trekker principal":"Trekker de apoyo"}</button>`).join("")}</div>
   <div class="fk-sw">${bs.map(x=>`<button class="chip${x.id===b.id?" on":""}" data-b="${x.id}">${e(/(\d+)\s*$/.test(x.n)?"Build "+x.n.match(/(\d+)\s*$/)[1]:x.n)}</button>`).join("")}</div>
   ${b.d?`<p class="fk-bd">${e(b.d)}</p>`:""}
   ${nuc.length?`<h4 class="fk-h">Potenciales de núcleo (${nuc.length})</h4>${nuc.map(p=>pot(p)).join("")}`:""}
   ${com.length?`<h4 class="fk-h">Potenciales comunes (${com.length})</h4>${com.map(p=>pot(p)).join("")}`:""}
   <p class="nota">Los potenciales comunes se pueden mejorar hasta el nivel 6; usa el control de nivel dentro de cada uno.</p>`;
}
function panelStats(F){
  const r=F.stats&&F.stats.rows; if(!r)return "<p class='nota'>Sin datos de nivel.</p>";
  const max=r[r.length-1][0];
  return `<div class="fk-lv"><button class="fk-st" data-d="-1">−</button><span>Nivel <b class="fk-n">${max}</b> / ${max}</span><button class="fk-st" data-d="1">+</button></div>
   <input type="range" class="fk-rg" min="1" max="${max}" value="${max}"><div class="fk-sv"></div>
   <p class="nota">Valores base del personaje según los datos del juego (sin discos, potenciales ni mejoras). Al ascender (niveles 10, 20, 30…) el valor sube: aquí se muestra el valor tras ascender.</p>`;
}
function pintaStats(box,F,l){
  const rows=F.stats.rows.filter(x=>x[0]===l), x=rows[rows.length-1]||F.stats.rows[0];
  box.querySelector(".fk-n").textContent=l;
  box.querySelector(".fk-sv").innerHTML=`<div class="stats"><div class="stat"><b>${x[1].toLocaleString("es-MX")}</b><span>HP</span></div><div class="stat"><b>${x[2].toLocaleString("es-MX")}</b><span>ATK</span></div><div class="stat"><b>${F.stats.cr}%</b><span>Prob. crítica</span></div><div class="stat"><b>${F.stats.cd}%</b><span>Daño crítico</span></div></div>`;
}
/* Afinidad: archivo del personaje y recuerdos de citas (afinidad/<id>.json + textos/AF_<id>.txt traducido) */
(function(){const st=document.createElement("style");st.textContent=".fk-ar{border:1px solid var(--bd,#35305c);border-radius:12px;margin:0 0 8px;background:rgba(20,16,50,.55);overflow:hidden}.fk-ar>summary{list-style:none;cursor:pointer;display:flex;align-items:center;gap:8px;padding:11px 12px;font-weight:700;font-size:.9rem}.fk-ar>summary::-webkit-details-marker{display:none}.fk-ar>summary::after{content:'▾';margin-left:auto;color:var(--a);transition:transform .2s}.fk-ar[open]>summary::after{transform:rotate(180deg)}.fk-ar .fk-lv{flex:none;font-size:.68rem;padding:2px 8px;border-radius:9px;background:rgba(123,108,255,.28);color:#d8d2ff;font-weight:700}.fk-ar .fk-lv.h{background:rgba(255,200,87,.2);color:#ffd27a}.fk-ar .fk-tx{padding:0 12px 12px;font-size:.85rem;line-height:1.55;color:var(--t2,#cfc8ff)}.fk-ar .fk-tx p{margin:.5em 0}.fk-ar .fk-cg{display:block;width:100%;border-radius:10px;margin:2px 0 8px}.fk-ar .fk-cl{font-size:.75rem;opacity:.75;margin-top:6px}";document.head.appendChild(st)})();
const AFC={},AFT={};
const AFPN="Tirano",afx=s=>e(String(s==null?"":s).replace(/<[^>]*>/g,"").replace(/==PLAYER_NAME==/g,AFPN)).replace(/\n/g,"<br>");
async function afGet(cid){
  if(AFC[cid]===undefined){try{const r=await fetch("afinidad/"+cid+".json");AFC[cid]=r.ok?await r.json():null}catch(x){AFC[cid]=null}}
  if(AFT[cid]===undefined){AFT[cid]={};try{const r=await fetch("textos/AF_"+cid+".txt",{cache:"no-cache"});if(r.ok)(await r.text()).split("\n").forEach(l=>{const m=l.match(/^([ad]\d+\.\w) \| (.*)$/);if(m)AFT[cid][m[1]]=m[2].replace(/\\n/g,"\n")})}catch(x){}}
  return AFC[cid];
}
async function afinidadExtra(box,F){
  const cid=F.id,O=await afGet(cid);if(!O||!box.isConnected)return;
  const T=(k,d)=>{const v=AFT[cid][k];return v!=null&&v!==""?v:d},ES=Object.keys(AFT[cid]).length>0;
  let h="";
  if(O.a&&O.a.length)h+=`<h4 class="fk-h">Archivo del personaje</h4><p class="nota">Se desbloquea al subir la afinidad.${ES?"":" Texto en inglés por ahora."}</p>`+O.a.map(x=>`<details class="fk-ar"><summary><span class="fk-lv${x.tp===3?" h":""}">${x.tp===3?"Historia · ":""}Afinidad ${x.n||1}</span>${afx(T("a"+x.i+".t",x.t))}</summary><div class="fk-tx"><p>${afx(T("a"+x.i+".c",x.c))}</p>${x.u?`<p>${afx(T("a"+x.i+".u",x.u))}</p>`:""}</div></details>`).join("");
  if(O.d&&O.d.length)h+=`<h4 class="fk-h">Recuerdos de citas</h4><p class="nota">Recuerdos que se desbloquean cuando una cita sale bien.</p>`+O.d.map(x=>`<details class="fk-ar"><summary><span class="fk-lv h">Cita</span>${afx(T("d"+x.i+".n",x.n))}</summary><div class="fk-tx">${x.g?`<img class="fk-cg" src="https://raw.githubusercontent.com/AutumnVN/ssassets/main/export/assets/assetbundles/icon/datingeventcg/${e(x.g)}.webp" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()">`:""}${x.m?`<p>${afx(T("d"+x.i+".m",x.m))}</p>`:""}${x.p?`<div class="fk-cl">Cómo desbloquearlo: ${afx(T("d"+x.i+".p",x.p))}</div>`:""}</div></details>`).join("");
  const w=box.querySelector(".fk-afx");if(w)w.innerHTML=h;
}
function panelAfin(F){
  const L=typeof LECTOR!=="undefined"&&F._en&&LECTOR["cs:"+F._en];
  return (L?`<button type="button" class="btn" style="margin:0 0 12px;width:100%" onclick="abrirLector('${L}')">▶ Leer su historia de afinidad en el lector</button><p class="nota" style="margin:-6px 0 12px">✨ Algunas escenas (como las del acto 4) son ilustraciones animadas (Live2D). Si el personaje tiene L2D, lo verás en la parte de arriba de su ficha o en Galería de arte → L2D de personajes.</p>`:"")+`<h4 class="fk-h">Regalos favoritos</h4><div class="fk-gifts">${F.regalos.map(g=>`<div class="fk-gf">${g.iu?`<img class="fk-gi" src="${g.iu}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()">`:""}<div><b>${e(g.n)}</b>${g.ne!==g.n?`<span>${e(g.ne)}</span>`:""}</div></div>`).join("")}</div>
   <h4 class="fk-h">Tareas de afinidad</h4>${F.tareas.map(t=>`<div class="kv"><span>${e(t.t)}</span><b style="flex:0 0 auto;color:var(--a)">+${t.exp} EXP</b></div>`).join("")}<div class="fk-afx"></div>`;
}
function montar(box,F){
  let tab="per",modo="main",build=1,vista="res";
  const out=box.querySelector(".fk-body");
  function pinta(){
    out.className="fk-body";
    box.querySelectorAll(".fk-tabs .chip").forEach(c=>c.classList.toggle("on",c.dataset.t===tab));
    const pb=document.getElementById("perfil-box");
    if(pb)pb.style.display=tab==="per"?"":"none";
    out.style.display=tab==="per"?"none":"";
    if(tab==="per"){out.innerHTML="";return}
    if(tab==="hab"){
      out.innerHTML='<div class="fk-tg"><button data-v="res">Resumido</button><button data-v="det">Detallado</button></div>'+F.habilidades.map(skill).join("");
      out.className="fk-body "+vista;out.querySelectorAll(".fk-tg button").forEach(b=>{b.classList.toggle("on",b.dataset.v===vista);b.onclick=()=>{vista=b.dataset.v;out.className="fk-body "+vista;out.querySelectorAll(".fk-tg button").forEach(x=>x.classList.toggle("on",x===b))}});
      out.querySelectorAll(".fk-card").forEach((c,i)=>{const h=F.habilidades[i],max=Math.max(...h.tpl.flatMap(g=>g.l));let l=1;
        pintaSkill(c,h,l);c.querySelectorAll(".fk-st").forEach(b=>b.onclick=()=>{l=Math.max(1,Math.min(max,l+(+b.dataset.d)));pintaSkill(c,h,l)})});
    }else if(tab==="pot"){
      out.innerHTML=panelPot(F,modo,build);
      out.querySelectorAll("[data-m]").forEach(b=>b.onclick=()=>{modo=b.dataset.m;build=1;pinta()});
      out.querySelectorAll("[data-b]").forEach(b=>b.onclick=()=>{build=+b.dataset.b;pinta()});
      const T=F.potenciales[modo],bb=T.builds.find(x=>x.id===build)||T.builds[0],L=T.l.filter(p=>p.g===bb.id);
      out.querySelectorAll(".fk-pot").forEach((c,i)=>{const nuc=L.filter(p=>p.t<3).concat(L.filter(p=>p.t===3)),p=nuc[i];if(!p)return;
        let l=0;const n=c.querySelector(".fk-n"),d=c.querySelector(".fk-pd");
        c.querySelectorAll(".fk-st").forEach(b=>b.onclick=ev=>{ev.preventDefault();l=Math.max(0,Math.min(5,l+(+b.dataset.d)));n.textContent=l+1;d.innerHTML=tpl(p.s,p.v,null,l)})});
    }else if(tab==="afi"){out.innerHTML=panelAfin(F);afinidadExtra(out,F)}
    else{out.innerHTML=panelStats(F);if(F.stats&&F.stats.rows){const rg=out.querySelector(".fk-rg"),pintar=l=>pintaStats(out,F,l),max=F.stats.rows[F.stats.rows.length-1][0];let l=max;pintar(l);
      rg.oninput=()=>{l=+rg.value;pintar(l)};out.querySelectorAll(".fk-st").forEach(b=>b.onclick=()=>{l=Math.max(1,Math.min(max,l+(+b.dataset.d)));rg.value=l;pintar(l)})}}
  }
  box.querySelectorAll(".fk-tabs .chip").forEach(c=>c.onclick=()=>{tab=c.dataset.t;pinta()});
  pinta();
}
window.fichaCargar=async function(c){
  const box=document.getElementById("ficha-box"); if(!box)return;
  const id=c.id;
  try{
    let F=CACHE[id]; if(F===undefined){const r=await fetch("fichas/"+id+".json");F=r.ok?await r.json():null;CACHE[id]=F}
    if(!F||!document.getElementById("ficha-box"))return;
    F._en=c.name;try{await window.__meta}catch(x){}
    box.innerHTML=`<div class="fk-tabs"><button class="chip on" data-t="per">Perfil</button><button class="chip" data-t="hab">Habilidades</button><button class="chip" data-t="pot">Potenciales</button><button class="chip" data-t="afi">Afinidad</button><button class="chip" data-t="sta">Stats</button></div><div class="fk-body"></div>`;
    montar(box,F);
    const st=document.querySelectorAll("#det .stats .stat");
    if(st.length>=3){
      if(F.cumple&&/^\s*[—-]?\s*$/.test(st[2].querySelector("b").textContent))st[2].querySelector("b").textContent=F.cumple;
      st[0].remove();st[1].remove();const sb=document.querySelector("#det .stats");if(sb)sb.style.gridTemplateColumns="1fr";
    }
  }catch(x){}
};
})();
