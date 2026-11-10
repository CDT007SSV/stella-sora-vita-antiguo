/* Lector de historias (prueba). Abre con abrirLector("STm01_01"). */
(function(){
const FILE="https://stellasora.miraheze.org/wiki/Special:FilePath/";
const SEX={"==SEX==":["ella","él"],"==SEX1==":["Ella","Él"],"==SEX2==":["Su","Su"],"==SEX3==":["su","su"],"==SEX4==":["ella","él"],"==SEX5==":["suya","suyo"],"==SEX6==":["Sra.","Sr."],"==SEX7==":["Srta.","Sr."],"==SEX8==":["sí misma","sí mismo"],"==SEX9==":["chica","chico"],"==SEX10==":["hermanas","hermanos"],"==SEX11==":["señora","señor"],"==SEX12==":["Señora","Señor"],"==SEX13==":["dama","caballero"],"==SEX14==":["cabello blanco","cabello negro"],"==SEX15==":["mujer","hombre"],"==SEX16==":["bruja","brujo"],"==SEX17==":["Señorita","Señor"],"==SEX18==":["falda","pantalón"],"==SEX19==":["criada","mayordomo"],"==SEX20==":["camisa","camiseta"],"==SEX21==":["dama","caballero"]};
const cap=s=>s.charAt(0).toUpperCase()+s.slice(1);
const css=`#rd{touch-action:manipulation;position:fixed;inset:0;z-index:99999;background:#000;display:none;flex-direction:column;user-select:none;-webkit-user-select:none;-webkit-tap-highlight-color:transparent;--u:7px;font-family:"Nunito","Segoe UI",system-ui,sans-serif;font-size:calc(var(--u)*3.6)}
#rd.rot{inset:auto;top:0;left:0;width:100vh;height:100vw;width:100dvh;height:100dvw;transform-origin:top left;transform:rotate(90deg) translateY(-100%)}
#rd.on{display:flex}
#rd .rd-st{position:relative;flex:1;overflow:hidden;background:#0a0818}
#rd .rd-sg{position:absolute;inset:0;overflow:hidden;pointer-events:none}
#rd .rd-sg[data-s="0"]{background:#000}
#rd .rd-sg:not([data-s="0"]){opacity:0;transition:opacity .3s}
#rd .rd-sg.on{opacity:1!important}
#rd .rd-sg[data-s="3"] .rd-sgi{right:auto;width:calc(var(--u)*111.11)}
#rd .rd-sg[data-s="4"] .rd-sgi{left:auto;right:0;width:calc(var(--u)*111.11)}
#rd .rd-sl{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:1}
#rd .rd-sl line{stroke:#fff;stroke-width:calc(var(--u)*.8);vector-effect:non-scaling-stroke;opacity:0;transition:opacity .3s;filter:drop-shadow(0 0 4px rgba(255,255,255,.7))}
#rd .rd-sl line.on{opacity:.95}
#rd .rd-sg[data-s="5"]{clip-path:inset(17.8% 0 46% 0)}
#rd .rd-sg[data-s="6"]{clip-path:inset(46% 0 17.8% 0)}
#rd .rd-sgi{position:absolute;inset:0;transform-origin:50% 50%;will-change:transform}
#rd .rd-bgi{position:absolute;inset:0;background-size:cover;background-position:center;transform-origin:50% 50%;will-change:transform}
#rd .rd-chars{position:absolute;inset:0}
#rd .rd-film i{position:absolute;left:0;right:0;height:12.6%;background:#000;display:none;z-index:2}
#rd .rd-film i:first-child{top:0}#rd .rd-film i:last-child{bottom:0}
#rd .rd-film.on i{display:block}
#rd .rd-box.cg{left:0;right:0;bottom:0;height:46%;min-height:0;border:0;border-radius:0;box-shadow:none;background:linear-gradient(180deg,rgba(6,10,20,0),rgba(6,10,20,.93) 30%);padding:0 16% 0 15.5%;display:flex;flex-direction:column;justify-content:flex-end;padding-bottom:calc(var(--u)*9)}
#rd .rd-box.cg .rd-nm{position:static;min-width:0;text-align:left;background:none;color:#fff;box-shadow:none;border:0;border-bottom:1px solid rgba(255,255,255,.28);border-radius:0;font-weight:700;font-size:calc(var(--u)*3.5);padding:0 0 calc(var(--u)*1.2);margin-bottom:calc(var(--u)*2);display:block}
#rd .rd-box.cg .rd-nm:empty{display:none}
#rd .rd-box.cg .rd-tx{color:#fff;font-size:calc(var(--u)*4)}
#rd .rd-box.cg .rd-nx{right:16%;bottom:calc(var(--u)*5)}#rd .rd-box.cg .rd-nx svg{fill:#fff}
#rd .rd-sp{position:absolute;bottom:-42%;height:128%;transform:translateX(-50%);animation:rdIn .35s;pointer-events:none;transition:left var(--d,0s) var(--e,linear),bottom var(--d,0s) var(--e,linear),height var(--d,0s) var(--e,linear),opacity var(--d,0s) var(--e,linear)}
#rd .rd-sp img{height:100%;width:auto;display:block;transition:opacity var(--d,0s) var(--e,linear)}
#rd .rd-emo,#rd .rd-memo{position:absolute;font-size:calc(var(--u)*8);line-height:1;animation:rdPop .45s;pointer-events:none;filter:drop-shadow(0 1px 3px rgba(0,0,0,.5));z-index:3}
#rd .rd-emo.img,#rd .rd-memo.img{font-size:0}
#rd .rd-emo.img img{height:calc(var(--u)*13);width:auto;display:block}
#rd .rd-memo.img img{height:calc(var(--u)*11);width:auto;display:block}
#rd .rd-emo{top:3%;left:57%}#rd .rd-emo.tx,#rd .rd-memo.tx{background:#fff;color:#1f2a4d;border-radius:50%;min-width:1.5em;text-align:center;padding:.15em .2em;font-weight:800;box-shadow:0 1px 4px rgba(0,0,0,.35)}#rd .rd-emo.out,#rd .rd-memo.out{opacity:0;transition:opacity .3s}
#rd .rd-memo{left:21%;top:calc(var(--u)*-9)}
@keyframes rdPop{0%{transform:scale(.2);opacity:0}60%{transform:scale(1.25);opacity:1}100%{transform:scale(1)}}
#rd .rd-hd{position:absolute;bottom:calc(var(--u)*30);width:calc(var(--u)*24);height:calc(var(--u)*30);overflow:hidden;border:2px solid #fff;border-radius:calc(var(--u)*3);background:rgba(250,250,255,.86);z-index:3;animation:rdIn .3s}
#rd .rd-hd img{width:170%;margin-left:-35%;display:block}
#rd .rd-hd[data-p="0"]{left:3%}#rd .rd-hd[data-p="3"]{left:15%}#rd .rd-hd[data-p="1"]{left:50%;margin-left:calc(var(--u)*-12)}#rd .rd-hd[data-p="2"]{right:3%}#rd .rd-hd[data-p="4"]{right:15%}
#rd .rd-hd .rd-emo{top:2%;left:auto;right:4%;font-size:calc(var(--u)*6)}
@keyframes rdIn{from{opacity:0}to{opacity:1}}
#rd .rd-out{position:absolute;top:calc(var(--u)*2.6);left:calc(var(--u)*3 + env(safe-area-inset-left));z-index:5;color:#fff;font-weight:800;font-size:calc(var(--u)*3.6);text-shadow:0 1px 4px rgba(0,0,0,.7);background:none;border:0;padding:0}
#rd .rd-gear{position:absolute;top:calc(var(--u)*2);right:calc(var(--u)*2.5 + env(safe-area-inset-right));z-index:6;width:calc(var(--u)*7);height:calc(var(--u)*7);border-radius:50%;padding:0;display:flex;align-items:center;justify-content:center;background:rgba(18,14,44,.72);border:1px solid rgba(123,108,255,.45);box-shadow:0 2px 8px rgba(0,0,0,.4);color:#fff}
#rd .rd-gear svg{width:calc(var(--u)*4);height:calc(var(--u)*4);fill:none;stroke:#fff;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
#rd .rd-gear.on{background:rgba(123,108,255,.85)}
#rd .rd-menu{position:absolute;top:calc(var(--u)*10);right:calc(var(--u)*2.5 + env(safe-area-inset-right));z-index:6;display:none;flex-direction:column;min-width:calc(var(--u)*38);background:rgba(18,14,44,.95);border:1px solid rgba(123,108,255,.45);border-radius:calc(var(--u)*2.5);box-shadow:0 4px 16px rgba(0,0,0,.5);overflow:hidden}
#rd .rd-menu.on{display:flex;animation:rdIn .15s}
#rd .rd-menu button{background:none;border:0;color:#fff;font:inherit;font-weight:700;font-size:calc(var(--u)*3.2);padding:calc(var(--u)*2.2) calc(var(--u)*3.6);text-align:left;border-bottom:1px solid rgba(255,255,255,.1);display:flex;align-items:center;gap:calc(var(--u)*1.5)}
#rd .rd-menu button:last-child{border-bottom:0}
#rd .rd-menu svg{width:calc(var(--u)*3.6);height:calc(var(--u)*3.6);fill:none;stroke:#fff;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
#rd .rd-box{position:absolute;left:19%;right:19%;bottom:calc(var(--u)*4);min-height:calc(var(--u)*24);background:rgba(250,250,255,.86);border:2px solid #fff;border-radius:calc(var(--u)*3);box-shadow:0 3px 12px rgba(0,0,0,.25);padding:calc(var(--u)*3.6) calc(var(--u)*4.4) calc(var(--u)*3.2);color:#1f2a4d;z-index:4;box-sizing:border-box}
#rd .rd-nm{position:absolute;top:calc(var(--u)*-6.2);left:calc(var(--u)*-3);min-width:calc(var(--u)*32);text-align:center;background:#e9e7f6;color:#1f2a4d;font-weight:800;font-size:calc(var(--u)*3.9);padding:calc(var(--u)*1.2) calc(var(--u)*4);border-radius:calc(var(--u)*1) calc(var(--u)*1) 0 0;border-bottom:calc(var(--u)*.8) solid #a99be8;box-shadow:calc(var(--u)*.8) 0 0 #a99be8}
#rd .rd-nm:empty{display:none}
#rd .rd-tx{font-size:calc(var(--u)*4.1);line-height:1.5;font-weight:700;white-space:pre-wrap;letter-spacing:.01em}
#rd .rd-tx.nar{color:#2b3566}
#rd .rd-cur{position:absolute;inset:0;background:#000;opacity:0;pointer-events:none;z-index:3}
#rd .rd-fxl{position:absolute;inset:0;pointer-events:none;z-index:2;overflow:hidden}
#rd .fx{position:absolute;inset:0}
#rd .fx-reminiscence_loop{backdrop-filter:sepia(.7) saturate(.65) contrast(.95);-webkit-backdrop-filter:sepia(.7) saturate(.65);background:radial-gradient(ellipse at center,transparent 45%,rgba(70,45,20,.55))}
#rd .fx-dream_loop{backdrop-filter:brightness(1.08);-webkit-backdrop-filter:brightness(1.08);background:radial-gradient(ellipse at center,rgba(255,255,255,.12),rgba(180,160,255,.3))}
#rd .fx-noise{opacity:.22;background:repeating-linear-gradient(0deg,rgba(255,255,255,.5) 0 1px,transparent 1px 4px);animation:rdNz .25s steps(3) infinite}
@keyframes rdNz{to{transform:translateY(6px)}}
#rd .fx-speedline_center,#rd .fx-speedline_center_w{background:repeating-conic-gradient(from 0deg at 50% 50%,transparent 0 3deg,rgba(255,255,255,.55) 3deg 3.6deg,transparent 3.6deg 7deg);-webkit-mask-image:radial-gradient(circle,transparent 28%,#000 85%);mask-image:radial-gradient(circle,transparent 28%,#000 85%);animation:rdSp .18s steps(2) infinite}
@keyframes rdSp{to{transform:rotate(2deg) scale(1.03)}}
#rd .fx-fog_2_lp,#rd .fx-sand_lp,#rd .fx-dust_heave,#rd .fx-wind_attack{background:linear-gradient(100deg,transparent,rgba(255,255,255,.28),transparent 60%,rgba(255,255,255,.2),transparent);background-size:200% 100%;animation:rdFg 9s linear infinite}
#rd .fx-sand_lp,#rd .fx-dust_heave{background-image:linear-gradient(100deg,transparent,rgba(190,150,90,.35),transparent 60%,rgba(190,150,90,.25),transparent)}
#rd .fx-wind_attack{animation-duration:1.2s}
@keyframes rdFg{to{background-position:-200% 0}}
#rd .fx-fire_attack{background:linear-gradient(0deg,rgba(255,110,20,.55),transparent 55%);animation:rdFi .3s steps(2) infinite alternate}
@keyframes rdFi{to{opacity:.6}}
#rd .fx-avg_star_lp{background-image:radial-gradient(circle,#fff 0 1.5px,transparent 2.5px),radial-gradient(circle,#ffe9a8 0 1px,transparent 2px);background-size:90px 90px,60px 60px;background-position:0 0,30px 40px;animation:rdTw 2.4s ease-in-out infinite alternate}
@keyframes rdTw{from{opacity:.25}to{opacity:.95}}
#rd .fx-avg_magic_ice{background:radial-gradient(circle at 50% 50%,rgba(170,230,255,.75),transparent 60%);animation:rdIce 1.2s ease-out forwards}
@keyframes rdIce{from{opacity:1;transform:scale(.6)}to{opacity:0;transform:scale(1.6)}}
#rd .rd-bgo{position:absolute;inset:0;transition:opacity var(--d,.5s) linear;pointer-events:none;z-index:1}
#rd .rd-dim{position:absolute;inset:0;background:rgba(0,0,0,.45);display:none}
#rd .rd-dim.on{display:block}
#rd .rd-obj{position:absolute;left:50%;top:46%;height:37%;transform:translate(-50%,-50%);border-radius:calc(var(--u)*2.5);box-shadow:0 4px 18px rgba(0,0,0,.5);display:none;animation:rdIn .3s}
#rd .rd-face{position:absolute;left:0;bottom:0;width:27%;height:calc(var(--u)*36);overflow:hidden;border-radius:0 0 0 calc(var(--u)*3);display:none;pointer-events:none}
#rd .rd-face img{width:100%;height:auto;object-fit:cover;object-position:top;display:block}
#rd .rd-box.face{padding-left:30%}
#rd .rd-box.face .rd-face{display:block}
#rd .rd-box.think{background:rgba(26,32,45,.93);border-color:rgba(255,255,255,.12);border-radius:calc(var(--u)*6)}
#rd .rd-box.think .rd-tx{color:#f1f4f6}
/* el punteado va en su propia capa: al cambiar el texto no se vuelve a pintar (evita el parpadeo al tocar) */
#rd .rd-box:not(.sub):not(.cg):not(.ctr):after{content:"";position:absolute;left:0;top:0;right:0;bottom:0;border-radius:inherit;background:radial-gradient(rgba(120,120,170,.10) 1px,transparent 1.2px) 0 0/4px 4px;pointer-events:none;z-index:-1;will-change:transform}
#rd .rd-box.think:after{background:radial-gradient(rgba(255,255,255,.07) 1px,transparent 1.2px) 0 0/4px 4px}
#rd .rd-box.think:before{content:"";position:absolute;left:calc(var(--u)*24);top:calc(var(--u)*-3.4);width:calc(var(--u)*4.4);height:calc(var(--u)*3);border-radius:50%;background:#fff;border:2px solid #1f2a4d;z-index:2}
#rd .rd-box.sub{left:6%;right:6%;bottom:calc(var(--u)*5);min-height:0;background:none;border:0;box-shadow:none;text-align:center;padding:calc(var(--u)*2)}
#rd .rd-box.sub:after{content:"";position:absolute;left:-6%;right:-6%;bottom:calc(var(--u)*-5);top:calc(var(--u)*-8);background:linear-gradient(0deg,rgba(0,0,0,.7),transparent);z-index:-1}
#rd .rd-box.sub .rd-tx{color:#fff;text-shadow:0 1px 5px #000;font-size:calc(var(--u)*4.4)}
#rd .rd-box.sub .rd-nx,#rd .rd-box.ctr .rd-nx{display:none!important}
#rd .rd-box.ctr{left:10%;right:10%;bottom:auto;top:50%;transform:translateY(-50%);min-height:0;background:none;border:0;box-shadow:none;text-align:center}
#rd .rd-box.ctr .rd-tx{color:#fff;text-shadow:0 1px 6px #000;font-size:calc(var(--u)*5)}
#rd .rd-nx{position:absolute;right:calc(var(--u)*3);bottom:calc(var(--u)*1.6);width:calc(var(--u)*3.4);height:calc(var(--u)*3.4);animation:rdBl 1s infinite}
#rd .rd-nx svg{width:100%;height:100%;fill:#16b6bf}
@keyframes rdBl{50%{opacity:.25}}
#rd .rd-map{width:100%;height:100%;display:flex;flex-direction:column;text-align:left}
#rd .rd-mt{display:flex;align-items:center;justify-content:space-between;gap:calc(var(--u)*3);padding-bottom:calc(var(--u)*1.5)}
#rd .rd-mt h2{margin:0;font-size:calc(var(--u)*4);line-height:1.2}
#rd .rd-cont{margin:0 0 calc(var(--u)*1.5);align-self:flex-start}
#rd .rd-ms{flex:1;overflow:auto;position:relative;border-radius:calc(var(--u)*2);background:linear-gradient(180deg,#14112f,#2a2260);border:1px solid #2f2a52}
#rd .rd-mg{position:relative;display:flex;align-items:center;gap:calc(var(--u)*7);padding:calc(var(--u)*4) calc(var(--u)*4);min-height:100%;width:max-content;box-sizing:border-box}
#rd .rd-mc{display:flex;flex-direction:column;gap:calc(var(--u)*3);justify-content:center;position:relative;z-index:1}
#rd .rd-ml{position:absolute;left:0;top:0;pointer-events:none;z-index:0}
#rd .rd-ml path{fill:none;stroke:#7B6CFF;stroke-width:2.5}
#rd .rd-nd{display:flex;flex-direction:column;gap:2px;width:calc(var(--u)*27);min-height:calc(var(--u)*10);padding:calc(var(--u)*1.2) calc(var(--u)*1.8);border:2px solid transparent;border-radius:calc(var(--u)*1);background:#201b4a;color:#fff;border-color:rgba(123,108,255,.4);font:inherit;text-align:left;cursor:pointer;box-sizing:border-box}
#rd .rd-nd b{font-size:calc(var(--u)*3.8);line-height:1.1}
#rd .rd-nd span{font-size:calc(var(--u)*2.6);line-height:1.2;font-weight:700}
#rd .rd-nd.leido{background:#2f2872}
#rd .rd-nd.act,#rd .rd-nd.cur{border-color:#13d6d6;box-shadow:0 0 0 2px rgba(19,214,214,.35)}
#rd .rd-nd.fin{background:#4a2f9a;color:#fff;min-height:calc(var(--u)*7)}
#rd .rd-nd.bt{background:#13c9cf;color:#04282b;cursor:default;opacity:.85}
#rd .rd-card{position:absolute;inset:0;z-index:6;background:rgba(8,6,22,.985);display:none;flex-direction:column;justify-content:center;align-items:center;padding:calc(var(--u)*4) calc(var(--u)*10);text-align:center;color:#fff;overflow:auto}
#rd .rd-card.on{display:flex}
#rd .rd-card h2{font-size:calc(var(--u)*5.5);margin:6px 0 calc(var(--u)*2)}
#rd .rd-card p{line-height:1.55;color:#e3e0f5;max-width:60em;font-size:calc(var(--u)*3.8);font-weight:600}
#rd .rd-card small{letter-spacing:.2em;text-transform:uppercase;color:#f3c969;font-size:calc(var(--u)*3);font-weight:800}
#rd .rd-ch{display:flex;flex-direction:column;gap:calc(var(--u)*1.8);width:100%;max-width:64%;margin-top:6px}
#rd .rd-ch button{background:linear-gradient(135deg,#7B6CFF,#5b4de0);border:1px solid rgba(255,255,255,.28);color:#fff;font:inherit;font-weight:800;border-radius:calc(var(--u)*2.4);padding:calc(var(--u)*2.2);font-size:calc(var(--u)*3.9);box-shadow:0 2px 8px rgba(0,0,0,.3)}
#rd .rd-card .rd-b{background:linear-gradient(135deg,#7B6CFF,#5b4de0);border:1px solid rgba(255,255,255,.28);color:#fff;box-shadow:0 4px 14px rgba(91,77,224,.4);font:inherit;font-weight:800;border-radius:calc(var(--u)*2.4);padding:calc(var(--u)*1.8) calc(var(--u)*8);font-size:calc(var(--u)*3.8)}
#rd .rd-log{align-items:stretch;justify-content:flex-start;text-align:left;overflow:auto}
#rd .rd-log div{margin-bottom:calc(var(--u)*1.6);line-height:1.45;font-size:calc(var(--u)*3.6);font-weight:600}#rd .rd-log b{color:#f3c969;display:block;font-size:calc(var(--u)*2.9)}`;
let el=null,S=null;
/* ---------- audio ---------- */
const BG=new Audio();BG.loop=true;BG.preload="none";let bgCur="",fT=0;
function fadeTo(v,ms,done){
  clearInterval(fT);const a=BG.volume,st=Math.max(1,ms/40);let n=0;
  fT=setInterval(()=>{n++;BG.volume=Math.max(0,Math.min(1,a+(v-a)*n/st));if(n>=st){clearInterval(fT);done&&done()}},40);
}
function bgm(code){
  if(S&&S.mute)return;
  if(!code){bgCur="";fadeTo(0,1200,()=>BG.pause());return}
  const m=/^m(\d+)$/.exec(code);if(!m)return;
  const u=FILE+"Bgm"+m[1]+".ogg";if(bgCur===u)return;bgCur=u;
  fadeTo(0,250,()=>{BG.src=u;BG.play().then(()=>fadeTo(.5,900)).catch(e=>{if(e&&e.name==="NotAllowedError")bgPend=1;else sinAudio()})});
}
/* si el navegador bloquea el sonido automático, se reintenta en el siguiente toque; si el archivo no carga, se avisa una vez */
let bgPend=0,avisoAu=0;
function sinAudio(){if(avisoAu)return;avisoAu=1;try{aviso("🔇 No se pudo cargar el audio")}catch(e){}}
BG.addEventListener("error",()=>{if(BG.src)sinAudio()});
document.addEventListener("pointerdown",()=>{if(bgPend&&bgCur&&S&&!S.mute){bgPend=0;BG.play().then(()=>fadeTo(.5,900)).catch(()=>{})}},true);
function se(n){
  if(!S||S.mute)return;
  try{const a=new Audio(FILE+n+".ogg");a.volume=.6;a.play().catch(()=>{})}catch(e){}
}
function mute(){
  S.mute=S.mute?0:1;try{localStorage.setItem("rdm",S.mute)}catch(e){}
  if(S.mute){clearInterval(fT);BG.pause();bgCur=""}
  btnM();
}
function btnM(){const b=el.querySelector('[data-a="m"]');if(b)b.innerHTML=S.mute?"Sonido: no":"Sonido: sí"}
const VO=new Audio();
function voz(c){
  try{VO.pause()}catch(e){}
  if(!c||!S||S.mute)return;
  const b=cap(c),l=[b+"_jp.ogg",b+"_en.ogg",b+"_cn.ogg",b+"_kr.ogg",b+".ogg"];let i=0;
  const t=()=>{if(i>=l.length)return;VO.src=FILE+l[i++];VO.volume=1;VO.play().catch(()=>{})};
  VO.onerror=t;t();
}
function pararAudio(){clearInterval(fT);BG.pause();bgCur="";try{VO.pause()}catch(e){}}
/* ---------- interfaz ---------- */
function build(){
  if(el)return;
  const st=document.createElement("style");st.textContent=css;document.head.appendChild(st);
  const fl=document.createElement("link");fl.rel="stylesheet";fl.href="https://fonts.googleapis.com/css2?family=Nunito:wght@600;700;800&display=swap";document.head.appendChild(fl);
  el=document.createElement("div");el.id="rd";
  el.innerHTML=`<div class="rd-st">${[0,1,2,3,4,5,6].map(i=>'<div class="rd-sg'+(i?'':' on')+'" data-s="'+i+'"><div class="rd-sgi"><div class="rd-bgi"></div><div class="rd-chars"></div></div></div>').join("")}<svg class="rd-sl" viewBox="0 0 100 100" preserveAspectRatio="none"><line x1="58" y1="0" x2="42" y2="100"/><line x1="30" y1="0" x2="14" y2="100"/><line x1="86" y1="0" x2="70" y2="100"/></svg><div class="rd-fxl"></div><div class="rd-film"><i></i><i></i></div><div class="rd-cur"></div><div class="rd-dim"></div><img class="rd-obj" alt="" referrerpolicy="no-referrer">
   <button class="rd-out" data-a="x">✕ Salir</button>
   <button class="rd-gear" data-a="cfg" aria-label="Ajustes"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg></button>
   <div class="rd-menu"><button data-a="ac">Actos</button><button data-a="l2d" hidden></button><button data-a="cn" hidden></button><button data-a="z"></button><button data-a="e"></button><button data-a="m"></button><button data-a="f"></button><button data-a="g"></button><button data-a="bk">🔖 Marcar aquí</button><button data-a="l"><svg viewBox="0 0 24 24"><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4h6v3H9zM8.5 12h7M8.5 16h5"/></svg>Registro</button></div>
   <div class="rd-box"><div class="rd-face"><img alt="" referrerpolicy="no-referrer"></div><span class="rd-nm"></span><div class="rd-tx"></div><span class="rd-nx"><svg viewBox="0 0 24 24"><path d="M12 2a7 7 0 0 0-7 7c0 5 7 11 7 11s7-6 7-11a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/></svg></span></div>
   <div class="rd-card" id="rd-c"></div></div>`;
  document.body.appendChild(el);
  el.addEventListener("click",e=>{
    const a=e.target.closest("[data-a]"),mn=el.querySelector(".rd-menu"),gr=el.querySelector(".rd-gear");
    const cierraMn=()=>{mn.classList.remove("on");gr.classList.remove("on")};
    if(a&&a.dataset.a==="cfg"){mn.classList.toggle("on");gr.classList.toggle("on");return}
    if(mn.classList.contains("on")&&!e.target.closest(".rd-menu")){cierraMn();return}   // tocar fuera solo cierra el menu, no avanza el dialogo
    if(a){const k=a.dataset.a;if(k==="ac"||k==="l"||k==="x"||k==="nx"||k==="bk")cierraMn();
      if(k==="x")cierra();else if(k==="bk")marca();else if(k==="g")gen();else if(k==="l2d"){cierraMn();if(S&&S.l2d&&window.l2dVer)window.l2dVer(S.l2d.n,false,S.l2d.t)}else if(k==="cnv"){if(S&&S.cnp)window.cineVer(S.cnp.c.id,S.cnp.i,true)}else if(k==="cn"){cierraMn();const c=S&&window.cineDe&&window.cineDe(S.id);if(c)window.cineVer(c.id)}else if(k==="l")log();else if(k==="m")mute();else if(k==="f"){try{localStorage.setItem("rdf",fsOn()?"0":"1")}catch(e){}btnF();aplicaFs()}else if(k==="e"){S.em=S.em?0:1;try{localStorage.setItem("rde",S.em)}catch(e){}btnE();if(!S.em)el.querySelectorAll(".rd-emo,.rd-memo").forEach(x=>x.remove())}else if(k==="nx"){const n=a.dataset.n||SIG[S.id],pv=S;pararAudio();iniciar(n,pv)}else if(k==="lx"){card(false);}else if(k==="ac")actos();else if(k==="z"){S.zs=S.zs<1?1:S.zs>1?.85:1.15;if(S.zs===1.15&&false)S.zs=1;try{localStorage.setItem("rdz",S.zs)}catch(e){}btnZ();Object.keys(S.chars).forEach(k=>lay(S.chars[k]))}else if(k==="ay"){card(false);if(S.hold){S.hold=0;avanza()}}
      else if(k==="c"){pick(+a.dataset.i)}else if(k==="ok"){card(false);avanza()}
      return}
    if(e.target.closest(".rd-card"))return;
    avanza();
  });
}
function fit(){
  if(!el)return;
  const por=window.innerHeight>window.innerWidth;
  el.classList.toggle("rot",por);
  const h=por?window.innerWidth:window.innerHeight;
  el.style.setProperty("--u",(h/100)+"px");if(S)S.u=h/100;
  geo();
}
/* geometría de escenarios, tomada de Avg_0_Stage.lua (máscara girada -20°, lienzo de 1080 de alto) */
function geo(){
  const st=el.querySelector(".rd-st");if(!st)return;
  const w=st.offsetWidth,h=st.offsetHeight;if(!w||!h)return;
  const Wu=1080*w/h,T=Math.tan(20*Math.PI/180),pc=x=>(50+x/Wu*100).toFixed(2);
  const L=(ex,ey)=>[ex+T*(540-ey),ex+T*(-540-ey)];            /* x arriba, x abajo (unidades) */
  const c=Math.cos(20*Math.PI/180),s=Math.sin(20*Math.PI/180);
  const hv=L(0,0),le=L(-1115.467+720*c,-186.3497-720*s),re=L(1115.467-720*c,-186.3497+720*s);
  const P=(i,v)=>{const a=pc(v[0]),b=pc(v[1]);
    const q=i===1?"polygon(0 0,"+a+"% 0,"+b+"% 100%,0 100%)":i===2?"polygon("+a+"% 0,100% 0,100% 100%,"+b+"% 100%)":i===3?"polygon(0 0,"+a+"% 0,"+b+"% 100%,0 100%)":"polygon("+a+"% 0,100% 0,100% 100%,"+b+"% 100%)";
    const e=sg(i);if(e)e.style.clipPath=q};
  P(1,hv);P(2,hv);P(3,le);P(4,re);
  const ln=el.querySelectorAll(".rd-sl line");
  [hv,le,re].forEach((v,i)=>{const e=ln[i];if(e){e.setAttribute("x1",pc(v[0]));e.setAttribute("y1",0);e.setAttribute("x2",pc(v[1]));e.setAttribute("y2",100)}});
}
window.addEventListener("resize",()=>{if(el&&el.classList.contains("on"))fit()});
function cierra(){if(S){clearInterval(S.timer);clearTimeout(S.wt);clearTimeout(S.at)}pararAudio();try{if(S&&S.vp){document.querySelector('meta[name=viewport]').content=S.vp}}catch(e){}el.classList.remove("on");S=null;
  try{if(screen.orientation&&screen.orientation.unlock)screen.orientation.unlock()}catch(e){}
  try{if(document.fullscreenElement)document.exitFullscreen()}catch(e){}}
function gen(){S.g=S.g?0:1;try{localStorage.setItem("rdg",S.g)}catch(e){}btnG()}
const fsOn=()=>{try{return localStorage.getItem("rdf")==="1"}catch(e){return false}};
function btnF(){const b=el.querySelector('[data-a="f"]');if(b)b.textContent="Pantalla completa: "+(fsOn()?"sí":"no")}
async function aplicaFs(){try{if(fsOn()){const de=document.documentElement;if(de.requestFullscreen&&!document.fullscreenElement)await de.requestFullscreen({navigationUI:"hide"});try{if(screen.orientation&&screen.orientation.lock)await screen.orientation.lock("landscape")}catch(e){}}else if(document.fullscreenElement)await document.exitFullscreen()}catch(e){}}
function btnE(){const b=el.querySelector('[data-a="e"]');if(b)b.textContent="Emojis: "+(S.em?"sí":"no")}
function btnZ(){const b=el.querySelector('[data-a="z"]');if(b)b.textContent="Sprites: "+(S.zs<1?"chicos":S.zs>1?"grandes":"normales")}
function btnG(){el.querySelector('[data-a="g"]').textContent="Protagonista: "+(S.g?"él":"ella")}
function card(h){const c=el.querySelector("#rd-c");if(h==null||h===false){c.classList.remove("on");c.innerHTML="";S.card=0;return}c.innerHTML=h;c.classList.add("on");S.card=1}
const PN="Tirano"; /* nombre del protagonista en el lector (en el juego es "Sylar", pero los demás lo llaman Tyrant) */
function fx(t){return t.replace(/_NOT_IN_LOG_/g,"").replace(/==PLAYER_NAME==/g,PN).replace(/==SEX\d*==/g,m=>SEX[m]?SEX[m][S.g]:"").replace(/==(?:P|B|Off|A-?[\d.]+)==/g,"")}
function esc(t){return String(t).replace(/[&<>]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[c]))}
function log(){
  card('<div class="rd-log" style="display:block;width:100%;max-height:100%;overflow:auto"><h2>Registro</h2>'+(S.log.map(l=>"<div><b>"+esc(l[0])+"</b>"+esc(l[1])+"</div>").join("")||"<p>Aún no hay nada.</p>")+(S.miss&&Object.keys(S.miss).length?"<p style=\"font-size:.8em;opacity:.8\">Imágenes no encontradas en la wiki: "+Object.keys(S.miss).map(esc).join(", ")+"</p>":"")+'<button class="rd-b" data-a="lx" style="margin-top:12px">Volver</button></div>');
}
const SH={"CharShakeType":{"none":0,"stop":1,"still":2,"JuGong":[0.0,-50.0,0.7,1.0,0,0],"LianTiao":[0.0,-100.0,1.0,3.0,0,1],"Tiao":[0.0,50.0,0.7,1.0,0,0],"2TiaoYue":[0.0,50.0,0.35,2.0,0,1],"ChanDou":[20.0,0.0,0.2,1.0,0,1],"lengzhan":[5.0,0.0,0.1,2.0,0,1],"chijing":[-15.0,0.0,0.15,2.0,0,1],"huanxin":[0.0,25.0,0.22,2.0,0,1],"jingxia":[-15.0,15.0,0.17,2.0,0,1],"jinzhang":[25.0,0.0,0.2,3.0,0,1],"jushou":[0.0,50.0,0.3,1.0,0,0],"manbu":[0.0,20.0,0.5,3.0,0,1],"tiao2":[0.0,20.0,0.4,2.0,0,0],"diantou":[0.0,-20.0,0.3,1.0,0,0],"youzai":[10.0,0.0,0.9,2.0,0,1],"lengzhan2":[10.0,0.0,0.2,4.0,0,1],"shouji":[30.0,0.0,0.15,3.0,0,1],"chijing2":[-35.0,0.0,0.15,2.0,0,1],"buman":[0.0,60.0,0.25,3.0,0,0],"yaobai":[0.0,0.0,0.5,4.0,0,1],"xiangpu1":[-20.0,0.0,1.0,1.0,0,1],"xiangpu2":[-10.0,0.0,1.0,1.0,0,1],"manbu2":[0.0,-10.0,0.4,2.0,0,0],"jingxia2":[0.0,15.0,0.23,2.0,0,0],"daintou":[0.0,-30.0,0.3,2.0,0,0],"diantou2":[0.0,-30.0,0.3,2.0,0,1],"huanxin2":[0.0,25.0,0.22,3.0,0,1],"zuochupeng":[-40.0,0.0,0.25,2.0,0,0],"youchupeng":[40.0,0.0,0.25,2.0,0,0],"niunie":[-20.0,0.0,0.5,2.0,0,1],"niunie1":[-14.0,0.0,0.7,2.0,0,1],"jushou0":[0.0,20.0,0.3,1.0,0,0],"JuGong1":[0.0,-80.0,0.5,1.0,0,0],"jushou2":[0.0,40.0,0.3,2.0,0,1],"JuGong2":[0.0,-45.0,0.35,1.0,0,0],"jushou1":[0.0,20.0,0.2,1.0,0,0],"ChanDou1":[9.0,0.0,0.1,2.0,0,1],"jump1":[0.0,100.0,0.45,1.0,0,0],"youzaiLp":[10.0,0.0,0.9,2.0,1,1],"dabian":[50,50,0.2,2.2,0,1],"xiangjiao":[50,30,0.2,2.2,0,1],"guodongtiao1":[0,50,0,0,0,1],"shilaimu1":[0,100,0,0,0,1],"shilaimu2":[-150,90,0.35,1,0,0],"manbu_loop":[0,5,0,0,1,1],"xuanyun":[0,0,0,0,0,1],"lengzhanLP":[5.0,0.0,0.3,2.0,1,1],"loopLite":[0.0,2.0,0.4,1.0,1,0.5],"paishou":[0.0,-50.0,0.4,3.0,0,0]},"BgShakeType":{"none":0,"stop":1,"still":2,"Xiao":[0.0,10.0,0.1,5.0,0,1],"Zhong":[0.0,20.0,0.1,5.0,0,1],"Da":[0.0,20.0,0.1,1000.0,0,1],"1ZhenDong":[0.0,-50.0,0.4,1.0,0,1],"xiaozhen":[20.0,20.0,0.15,3.0,0,1],"hengbo":[50.0,0.0,0.2,5.0,0,1],"loop":[0.0,4.0,0.3,50000.0,0,1],"loopda":[0.0,37.0,0.1,50000.0,0,1],"zongbo":[0.0,50.0,0.2,5.0,0,1],"chijing":[-15.0,0.0,0.15,2.0,0,1],"jushou":[0.0,-15.0,0.3,1.0,0,0],"zhenjing":[50,35,0.2,1,0,1],"youchupeng":[-80,0,0.4,1,0,0],"zuochupeng":[80,0,0.4,1,0,0],"DaZhenDong":[0.0,40.0,0.1,5.0,0,1],"ChanDou":[40,0,0.12,4,0,1],"xingshi":[-3,6,0.4,1,1,0],"niunie1":[-14.0,0.0,0.7,2.0,0,1],"ChaoDaZhenDong":[0.0,60.0,0.1,5.0,0,1],"JingTouYaoHuang":[10,5,4,2,1,1],"XiaoLP":[0.0,10.0,0.1,5.0,1,1],"hengboLP":[20,5,2,5,1,1],"wind":[40,20,4.0,2.0,1,1],"loopLite":[0.0,2.0,0.4,1.0,1,0.5],"diantou":[0.0,15.0,0.3,1.0,0,0],"loopHeng":[3.0,0.0,0.2,1.0,1,0.5]}};
const EM={speechless:"…",attention:"❗",exclamation:"❗",happy:"😄",question:"❓",sigh:"💨",music:"🎵",flurry:"💦",vexation:"💢",think:"💭",star:"⭐",shock:"😱",sweaty:"💧",symbol:"⁉️",idea:"💡",angry:"💢",awkward:"😅",love:"💗",resentful:"😒",flower:"🌸",shy:"😳",sleepy:"💤"};
function miss(n){if(S){S.miss=S.miss||{};S.miss[n]=1}}
function sg(st){return el.querySelector('.rd-sg[data-s="'+(st||0)+'"]')}
function layer(st){return sg(st).querySelector(".rd-bgi")}
function tf(st,o,k0){
  const e=k0==="s"?sg(st).querySelector(".rd-sgi"):layer(st);if(!e)return;
  const key=k0+st,T=S.tr[key]||(S.tr[key]={x:0,y:0,s:1});
  if(o.x!=null)T.x=o.x;if(o.y!=null)T.y=o.y;if(o.s!=null)T.s=o.s;
  const k=S.u/10.8;
  if(o.px!=null||o.py!=null)e.style.transformOrigin=(o.px==null?.5:o.px)*100+"% "+(o.py==null?.5:1-o.py)*100+"%";
  const d=o.d||0;
  e.style.transition=d>0?"transform "+d+"s "+ease(o.e):"none";
  const bx=k0==="s"?(st===1?-300:st===2?300:0)*(S.wu||2400)/1200*k:0;
  e.style.transform="translate("+(T.x*k+bx)+"px,"+(-T.y*k)+"px) scale("+T.s+")";
  if(o.sh)shake(e,o.sh,"BgShakeType");
}
function stopShakes(){try{el.getAnimations({subtree:true}).forEach(a=>{if(a.id==="rds")a.cancel()})}catch(x){}}
function shake(e,n,k){
  try{e.getAnimations().forEach(a=>{if(a.id==="rds")a.cancel()})}catch(x){}
  if(!n||n==="stop"||n==="still"||(window.ssvCfg&&ssvCfg("sh")===0))return;
  const p=(SH[k]||{})[n];if(!(p instanceof Array)||!e.animate)return;
  const sx=p[0]||0,sy=p[1]||0,du=p[2]||.3,vb=p[3]||2,lp=p[4],u=S.u/10.8,N=Math.max(2,Math.round(vb*2)),f=[];
  for(let i=0;i<=N;i++){const d=lp?1:1-i/N,g=i%2?-1:1;f.push({translate:(g*sx*d*u)+"px "+(g*sy*d*u)+"px"})}
  f.push({translate:"0 0"});
  const a=e.animate(f,{duration:Math.max(150,du*1000),iterations:lp?Infinity:1});a.id="rds";
}
function ease(n){n=n||"Linear";return n==="Linear"?"linear":/^InOut/.test(n)?"ease-in-out":/^In/.test(n)?"ease-in":"ease-out"}
function setBg(n,st,d){
  st=st||0;const bg=layer(st);if(!bg)return;try{bg.getAnimations().forEach(a=>{if(a.id==="rds")a.cancel()})}catch(x){}
  let o=null; /* copia del fondo anterior que se desvanece; empieza a desvanecerse cuando el nuevo ya esta decodificado (evita el parpadeo) */
  if(d>0){o=bg.cloneNode(false);o.className="rd-bgo";o.style.setProperty("--d",d+"s");o.style.transition="opacity "+d+"s linear";try{o.style.transform=getComputedStyle(bg).transform}catch(x){}o.style.opacity=1;bg.parentNode.insertBefore(o,bg.nextSibling)}
  const fin=()=>{if(!o)return;const x=o;o=null;requestAnimationFrame(()=>requestAnimationFrame(()=>{x.style.opacity=0}));setTimeout(()=>x.remove(),d*1000+150)};
  S.tr["b"+st]={x:0,y:0,s:1};bg.style.transition="none";bg.style.transform="none";bg.style.transformOrigin="50% 50%";
  if(/^(BG_)?Black/i.test(n)){bg.style.backgroundImage="none";bg.style.background="#000";bg._u=null;fin();return}
  if(/^(BG_)?White$/i.test(n)){bg.style.backgroundImage="none";bg.style.background="#fff";bg._u=null;fin();return}
  const tk=bg._tk=(bg._tk||0)+1;
  const poner=u=>{if(bg._tk!==tk){fin();return} /* un fondo más nuevo ya se pidió: este llegó tarde */
    if(!u){miss(n);bg.style.backgroundImage="none";bg.style.background="radial-gradient(circle at 50% 30%,#2a1f55,#0a0818)";bg._u=null;fin();return}
    const ap=()=>{if(bg._tk!==tk){fin();return}
      const w=im.naturalWidth,h=im.naturalHeight,k=S.u*100/1080;
      const nat=w&&h&&w/h<1.5; /* imagen casi cuadrada o vertical (p. ej. el telefono de Vita): el juego la muestra a su tamano real, no ampliada a pantalla completa */
      const prev=bg._u&&!bg._nat?bg._u:null;
      bg.style.background="";bg.style.backgroundPosition="center";bg.style.backgroundRepeat="no-repeat";
      if(nat){bg.style.backgroundSize=Math.round(w*k)+"px "+Math.round(h*k)+"px"+(prev?",cover":"");bg.style.backgroundImage="url('"+u+"')"+(prev?",url('"+prev+"')":"")}
      else{bg.style.backgroundSize="cover";bg.style.backgroundImage="url('"+u+"')"}
      bg._u=u;bg._nat=nat;fin()};
    const im=new Image();im.referrerPolicy="no-referrer";im.src=u;
    if(im.decode)im.decode().then(ap,ap);else ap()};
  const c=bgUrl(n);if(typeof c==="string"||c===null)poner(c);else c.then(poner);
}
const BGC={};
function bgUrl(n){ /* devuelve la URL ya conocida (string), null si no existe, o una promesa si aún se está buscando */
  if(n in BGC)return BGC[n];
  const lo=n.toLowerCase(),l=[FILE+cap(n)+".png",FILE+cap(lo)+".png",FILE+"BG_"+lo+".png",FILE+"BG_"+n+".png",FILE+cap(n)+".jpg",FILE+cap(lo)+".jpg",FILE+"BG_"+lo+".jpg"].filter((v,i,a)=>a.indexOf(v)===i);
  const p=new Promise(res=>{const probar=i=>{
    if(i>=l.length){BGC[n]=null;res(null);return}
    const im=new Image();im.referrerPolicy="no-referrer";
    im.onload=()=>{BGC[n]=l[i];res(l[i])};im.onerror=()=>probar(i+1);im.src=l[i]};probar(0)});
  return BGC[n]=p}
function precargaBg(steps){if(window.ssvCfg&&ssvCfg("pre")===0)return;const v=new Set();(function r(a){for(const s of a||[]){if(!(s instanceof Array))continue;if(s[0]==="bg"&&typeof s[1]==="string"&&!/^(BG_)?(Black|White)/i.test(s[1]))v.add(s[1]);if(s[0]==="choice"&&s[2])s[2].forEach(r)}})(steps);[...v].slice(0,60).forEach(n=>bgUrl(n))}
function stage(i,io){
  const e=sg(i);if(!e||!i)return;
  e.classList.toggle("on",io===0);
  if(io===0){S.wu=1080*e.offsetWidth/e.offsetHeight;tf(i,{},"s")}
  const on=i=>sg(i).classList.contains("on"),L=el.querySelectorAll(".rd-sl line");
  L[0].classList.toggle("on",on(1)||on(2));L[1].classList.toggle("on",on(3));L[2].classList.toggle("on",on(4));
  if(io!==0)setTimeout(()=>{if(S&&!e.classList.contains("on")){e.querySelector(".rd-chars").innerHTML="";for(const k in S.chars)if(S.chars[k].st===i)delete S.chars[k]}},400);
}
function spriteList(id,pose,expr){
  const base0=id==="avg3_100"?(S.g?"Male":"Female")+"_tyrant":((S.en&&S.en[id])||S.names[id]||"").trim();
  if(!base0||base0==="???")return null;
  const base=base0.replace(/ /g,"_"),p=pose||"a",out=[];
  const n=parseInt(expr,10);
  if(!isNaN(n))out.push(FILE+base+"_"+p+"_"+String(n).padStart(2,"0")+".png");
  out.push(FILE+base+"_"+p+"_02.png");
  if(id!=="avg3_100"){let c=null;try{c=CHARS.find(x=>x.name===base0)}catch(e){}out.push(c&&c.imageUrl?c.imageUrl:FILE+base+".png")}
  return out;
}
/* cambia la imagen de un sprite SIN dejarlo en blanco: se precarga y decodifica la nueva y solo entonces se cambia (evita el parpadeo al cambiar de expresion) */
function pon(im,l){
  im.dataset.q=JSON.stringify(l.slice(1));
  if(!im.getAttribute("src")){im.src=l[0];return}
  const u=l[0];im.dataset.want=u;
  if(im.src===new URL(u,location.href).href)return;
  const t=new Image();t.referrerPolicy="no-referrer";
  const go=()=>{if(im.dataset.want===u)im.src=u};
  t.onload=()=>{if(t.decode)t.decode().then(go,go);else go()};
  t.onerror=go;t.src=u;
}
function faceSet(pose,expr){
  const l=spriteList("avg3_100",pose,expr);if(!l)return;
  const im=el.querySelector(".rd-face img");
  im.onerror=()=>{const q=JSON.parse(im.dataset.q||"[]");if(q.length){im.src=q.shift();im.dataset.q=JSON.stringify(q)}else im.removeAttribute("src")};
  pon(im,l);S.mc=1;
}
/* Reglas del juego (AvgPreset.CharEmoji / Avg_2_L2DCtrl._SetEmoji): "none"=sin cambio, "close"=quitar;
   los emojis normales desaparecen solos a los 5 s; solo los "loop" se quedan hasta que se reemplazan o se cierran. */
/* sonido de cada emoji (AvgPreset.CharEmoji del juego: nombre -> efecto "se_xxx"). Suena al aparecer el emoji, aunque sea de los que solo se ve en la cara */
const EMSE={angry:"se_046",attention:"se_047",exclamation:"se_048",happy:"se_049",love:"se_050",music:"se_051",question:"se_052",shock:"se_053",shy:"se_054",speechless:"se_055",star:"se_056",sweaty:"se_057",symbol:"se_058",vexation:"se_059",awkward:"se_122",idea:"se_123",flurry:"se_124",sigh:"se_125",think:"se_055",flower:"se_305",resentful:"se_237",sleepy:"se_306"};
const EMLOOP={angry:1,shock:1,speechless:1,think:1,sleepy:1};
/* emojis de cara: el sprite ya muestra la emoción, no se dibujan */
const EMFACE={happy:1,shy:1,awkward:1,shock:1,resentful:1};
/* emojis con imagen real de la wiki comprobada; añadir un nombre aquí para probar otros (Avg_emoji_<nombre>_<n>.png) */
const EMIMG={attention:1,exclamation:1,star:1};
/* el emoji espera a que su sprite ya esté cargado (si no, aparecía flotando antes que el personaje) */
function emoji(host,n,cls,wait){
  if(n==="none")return;
  const k=host._ek=(host._ek||0)+1;
  if(!wait||(wait.complete&&wait.naturalWidth)){emojiNow(host,n,cls);return}
  host.querySelectorAll("."+cls).forEach(x=>{clearTimeout(x._o);clearInterval(x._t);x.remove()});
  let hecho=0;const go=()=>{if(hecho||host._ek!==k||!host.isConnected)return;hecho=1;emojiNow(host,n,cls)};
  wait.addEventListener("load",go,{once:true});setTimeout(go,4000);
}
const EMF={}; /* cuadros ya descargados de cada emoji con imagen */
function posEmo(e){ /* mantiene el emoji dentro de la pantalla (si el sprite es muy grande, el emoji quedaba fuera) */
  requestAnimationFrame(()=>{try{if(!e.isConnected||!el)return;const r=el.getBoundingClientRect(),b=e.getBoundingClientRect(),m=r.height*.03;
    const ph=e.offsetParent?e.offsetParent.getBoundingClientRect():null;if(!ph)return;
    let dy=0,dx=0;if(b.top<r.top+m)dy=r.top+m-b.top;else if(b.bottom>r.bottom-m)dy=r.bottom-m-b.bottom;
    if(b.left<r.left+m)dx=r.left+m-b.left;else if(b.right>r.right-m)dx=r.right-m-b.right;
    if(dy||dx){e.style.right="auto";e.style.top=(b.top-ph.top+dy)+"px";e.style.left=(b.left-ph.left+dx)+"px"}}catch(x){}});
}
function emojiNow(host,n,cls){
  if(n==="none")return;
  if(n&&n!=="close"&&EMSE[n])se(EMSE[n]);
  host.querySelectorAll("."+cls).forEach(x=>{clearTimeout(x._o);clearInterval(x._t);x.remove()});
  if(!n||n==="close"||(S&&S.em===0)||EMFACE[n])return;
  const e=document.createElement("span");e.className=cls+(n==="speechless"||n==="think"?" tx":"");e.textContent=EM[n]||"";host.appendChild(e);
  if(!EMLOOP[n])e._o=setTimeout(()=>{e.classList.add("out");setTimeout(()=>{clearInterval(e._t);e.remove()},350)},5000);
  if(!EMIMG[n]){posEmo(e);return}
  e.style.visibility="hidden"; /* no se muestra el emoji de texto: solo el del juego cuando su imagen esta lista (antes salian los dos, uno tras otro) */
  const go=fr=>{
    if(!e.isConnected)return;
    if(fr&&fr.length){
      e.textContent="";e.classList.add("img");
      const im=document.createElement("img");im.alt="";im.src=fr[0];e.appendChild(im);
      if(fr.length>1){let k=0;e._t=setInterval(()=>{if(!e.isConnected){clearInterval(e._t);return}k=(k+1)%fr.length;im.src=fr[k]},150)}
    }
    e.style.visibility="";e.style.animation="none";void e.offsetWidth;e.style.animation="";posEmo(e);
  };
  if(EMF[n]){go(EMF[n]);return}
  const fr=[];let i=1;
  const fin=()=>{EMF[n]=fr;go(fr)};
  const nx=()=>{const m=new Image();m.referrerPolicy="no-referrer";
    m.onload=()=>{fr.push(m.src);i++;if(i<=12)nx();else fin()};
    m.onerror=fin;m.src=FILE+"Avg_emoji_"+n+"_"+i+".png"};
  nx();
}
function lay(w){
  const K=(S&&S.zs)||1,yy=+(w.dataset.y||0),ss=+(w.dataset.s||1),h=120*ss*K;let b=-42+yy*100;
  if(b+h>96)b=96-h;
  w.style.bottom=Math.round(b*10)/10+"%";w.style.height=Math.round(h*10)/10+"%";
}
function place(w,x,y,sc,al,d,ez){
  if(d>0)void w.offsetWidth; /* aplica el estado inicial antes de animar (si el sprite se acaba de crear) */
  if(d!=null){w.style.setProperty("--d",d+"s");w.style.setProperty("--e",ease(ez))}
  if(x!=null)w.style.left=Math.round(x*1000)/10+"%";
  if(y!=null||sc!=null){
    if(y!=null)w.dataset.y=y;if(sc!=null)w.dataset.s=Math.abs(sc);
    lay(w);
    if(sc!=null)w.firstChild.style.transform=sc<0?"scaleX(-1)":"";
  }
  if(al!=null){if(d>0)void w.firstChild.offsetWidth;w.firstChild.style.opacity=al}
}
function setChar(id,pose,expr,x,y,sc,st,em,al){
  const l=spriteList(id,pose,expr);if(!l)return;
  const old=S.chars[id];if(old&&old.st!==st){old.remove();delete S.chars[id]}
  let w=S.chars[id];
  if(!w){w=document.createElement("div");w.className="rd-sp";w.st=st;
    const im=document.createElement("img");im.referrerPolicy="no-referrer";
    im.onerror=()=>{const q=JSON.parse(im.dataset.q||"[]");if(q.length){im.src=q.shift();im.dataset.q=JSON.stringify(q)}else{w.remove();if(S.chars[id]===w)delete S.chars[id]}};
    w.appendChild(im);sg(st).querySelector(".rd-chars").appendChild(w);S.chars[id]=w;
    w.style.left="50%";im.style.opacity=al==null?1:al;if(al===0)w.style.animation="none"}
  w.dataset.pose=pose||"a";pon(w.firstChild,l);
  place(w,x==null?null:x,y==null?0:y,sc==null?1:sc,al,0);
  emoji(w,em,"rd-emo",w.firstChild);
}
function ctl(id,pose,expr,em,x,y,sc,al,sh,ez,d){
  const w=S.chars[id];if(!w)return;
  if(pose||expr){const l=spriteList(id,pose||w.dataset.pose,expr);if(l){if(pose)w.dataset.pose=pose;pon(w.firstChild,l)}}
  place(w,x,y,sc,al,d||0,ez);
  if(em)emoji(w,em,"rd-emo",w.firstChild);
  if(sh)shake(w,sh,"CharShakeType");
}
function hideCh(id,d){const w=S.chars[id];if(!w)return;delete S.chars[id];if(d>0)setTimeout(()=>w.remove(),d*1000+30);else w.remove()}
function clearSc(ch,d,box){
  if(ch){objx();el.querySelectorAll(".rd-hd").forEach(c=>c.remove());
    for(const k in S.chars){const w=S.chars[k];if(d>0){w.style.setProperty("--d",d+"s");w.firstChild.style.opacity=0;w.querySelectorAll(".rd-emo").forEach(e=>e.remove());setTimeout(()=>w.remove(),d*1000+30)}else w.remove()}
    S.chars={}}
  if(box){const b=el.querySelector(".rd-box");b.style.visibility="hidden";el.querySelector(".rd-tx").textContent="";el.querySelector(".rd-nm").textContent="";b.querySelectorAll(".rd-memo").forEach(x=>x.remove());el.querySelector(".rd-nx").style.display="none"}
}
function mrt(m,pose,face,em,sh){
  if(m>=3){S.mc=0;const b=el.querySelector(".rd-box");b.classList.remove("face");b.querySelectorAll(".rd-memo").forEach(x=>x.remove());return}
  if(face)faceSet(pose,face);
  const fc=el.querySelector(".rd-face");
  emoji(el.querySelector(".rd-box"),em,"rd-memo");
  if(sh)shake(fc,sh,"CharShakeType");
}
function chd(io,pos,id,pose,face,em){
  const st=el.querySelector(".rd-st");
  if(io!==0){st.querySelectorAll('.rd-hd[data-p="'+pos+'"]').forEach(x=>x.remove());return}
  const l=spriteList(id,pose,face);if(!l)return;
  let h=st.querySelector('.rd-hd[data-p="'+pos+'"]');
  if(!h){h=document.createElement("div");h.className="rd-hd";h.dataset.p=pos;h.appendChild(document.createElement("img"));st.appendChild(h)}
  const im=h.firstChild;im.referrerPolicy="no-referrer";
  im.onerror=()=>{const q=JSON.parse(im.dataset.q||"[]");if(q.length){im.src=q.shift();im.dataset.q=JSON.stringify(q)}else h.remove()};
  pon(im,l);emoji(h,em,"rd-emo",im);
}
function obj(n,mask,x,y){
  const im=el.querySelector(".rd-obj");
  const src=FILE+"Story_element_"+n+".png";
  if(im.dataset.n===n&&im.style.display==="block"){ /* misma imagen: solo se mueve, sin parpadear */
    const k=S.u*100/1080;im.style.left="calc(50% + "+(((x==null?.5:x)-.5)*1920*k)+"px)";im.style.top=((1-(y==null?.5:y))*100)+"%";
    el.querySelector(".rd-dim").classList.toggle("on",!!mask);return}
  im.dataset.n=n;im.style.display="none";
  im.onerror=()=>{miss(n);im.style.display="none"};
  im.onload=()=>{
    const k=S.u*100/1080,w=im.naturalWidth;
    if(w){im.style.width=Math.round(w*k)+"px";im.style.height="auto"}
    im.style.left="calc(50% + "+(((x==null?.5:x)-.5)*1920*k)+"px)";
    im.style.top=((1-(y==null?.5:y))*100)+"%";im.style.display="block";
  };
  im.src=FILE+"Story_element_"+n+".png";
  el.querySelector(".rd-dim").classList.toggle("on",!!mask);
}
function objx(){const im=el.querySelector(".rd-obj");if(im){im.dataset.n="";im.style.display="none";im.removeAttribute("src")}const d=el.querySelector(".rd-dim");if(d)d.classList.remove("on")}
function trn(io,style,cc,ct,d){
  const c=el.querySelector(".rd-cur");
  c.style.background=style===1?"#fff":"#000";
  c.style.transition="opacity "+(d||0)+"s linear";
  c.style.opacity=io===0?1:0;
  if(io===0){if(cc){el.querySelectorAll(".rd-chars").forEach(x=>x.innerHTML="");S.chars={}}
    if(ct)el.querySelector(".rd-box").style.visibility="hidden"}
}
const FXP=new Set(["fx_avg_bling", "fx_avg_bubble_lp", "fx_avg_dream_loop", "fx_avg_dust_2_a", "fx_avg_dust_2_b", "fx_avg_dust_a", "fx_avg_dust_b", "fx_avg_fire_dust", "fx_avg_frezon_full_loop", "fx_avg_frezon_loop", "fx_avg_goldenlight_continued", "fx_avg_line_cen_lp", "fx_avg_line_cen_lp_w", "fx_avg_line_down_lp", "fx_avg_line_down_lp_w", "fx_avg_line_goleft_lp", "fx_avg_line_goleft_lp_w", "fx_avg_line_goright_2_lp", "fx_avg_line_goright_2_lp_w", "fx_avg_line_goright_lp", "fx_avg_line_goright_lp_w", "fx_avg_movie", "fx_avg_nega_ev", "fx_avg_noise", "fx_avg_powerup_loop", "fx_avg_rain", "fx_avg_rain_2", "fx_avg_rain_sky", "fx_avg_reminiscence_loop", "fx_avg_sand_lp", "fx_avg_snow", "fx_avg_snowstorm_lp", "fx_avg_speaking", "fx_avg_star_lp", "fx_avg_summon_lp", "fx_avg_thunder", "fx_avg_warning", "fx_avg_watermarks_lp", "fx_avg_wisteria_left", "fx_avg_wisteria_right", "fx_fog_2_lp", "fx_fog_lp"]);
function fxs(n,nd){
  if(!n)return;const k=n.replace(/^fx_/,"").replace(/^avg_(?!star|magic)/,"");
  const host=el.querySelector(".rd-fxl");S.fx=S.fx||{};
  if(S.fx[n]){S.fx[n].remove();delete S.fx[n]}
  if(nd===1)return;
  const e=document.createElement("div");e.className="fx fx-"+k;host.appendChild(e);S.fx[n]=e;
  if(!FXP.has(n))setTimeout(()=>{e.remove();if(S&&S.fx&&S.fx[n]===e)delete S.fx[n]},/speedline|line_cen/.test(n)?1100:1500);
}
function ocultaCaja(){const b=el.querySelector(".rd-box");if(!b||b.style.visibility==="hidden")return;b.style.transition="opacity .15s linear";b.style.opacity="0";el.querySelector(".rd-nx").style.display="none"}
function hideAll(){objx();el.querySelectorAll(".rd-chars").forEach(c=>c.innerHTML="");el.querySelectorAll(".rd-hd").forEach(c=>c.remove());S.chars={}}
/* texto con el resto reservado (invisible): la caja no cambia de tamaño ni se re-acomoda al escribir */
function setTx(tx,shown,rest){tx.textContent=shown;if(rest){const r=document.createElement("span");r.style.visibility="hidden";r.textContent=rest;tx.appendChild(r)}}
function restoDe(i,seg){return seg.slice(i)+S.segs.slice(S.si+1).join("")}
function say(spk,t,ty,vo){
  ty=ty||0;const noLog=/_NOT_IN_LOG_/.test(t);t=fx(t);voz(vo);S.pend=0;{const b0=el.querySelector(".rd-box");b0.style.transition="none";b0.style.visibility="";b0.style.opacity="";el.querySelector(".rd-tx").textContent=""}
  const mcL=spk==="avg3_100"||ty===1||ty===2;
  const nm=(spk==="0"||mcL)?"":(S.names[spk]||"");
  const box=el.querySelector(".rd-box");
  box.className="rd-box"+(ty===3?" sub":ty===8||ty===10?" ctr":ty===9||ty===11?" cg":"")+(ty===2?" think":"")+((ty===1||ty===2)&&S.mc?" face":"");
  if(ty!==1&&ty!==2)box.querySelectorAll(".rd-memo").forEach(x=>x.remove());
  el.querySelector(".rd-nm").textContent=nm;
  const tx=el.querySelector(".rd-tx");tx.className="rd-tx"+(spk==="0"?" nar":"");
  const plain=t.split("==W==").join("");
  if(!noLog)S.log.push([mcL?PN:(S.names[spk]||"—"),plain]);
  const nx=el.querySelector(".rd-nx");nx.style.display="none";
  if(S.timer)clearInterval(S.timer);S.timer=0;
  if(S.at){clearTimeout(S.at);S.at=0}
  S.segs=t.split("==W==");S.si=0;S.shown="";S.full=plain;
  if(ty===3||ty===8){ /* subtítulo: aparece completo y sigue solo (0.03 s por carácter, como el juego) */
    tx.textContent=plain;S.segs=[plain];S.shown=plain;
    S.at=setTimeout(()=>{S.at=0;if(S&&!S.card&&!S.choice)avanza()},Math.max(900,plain.replace(/\n/g,"").length*30));
    return;
  }
  setTx(tx,"",S.full);tipea();
}
function tipea(){
  const tx=el.querySelector(".rd-tx"),seg=S.segs[S.si],base=S.shown;let i=0;
  S.timer=setInterval(()=>{i++;if(i>=seg.length){finSeg();return}setTx(tx,base+seg.slice(0,i),restoDe(i,seg))},30);
}
function finSeg(){
  clearInterval(S.timer);S.timer=0;
  S.shown+=S.segs[S.si];setTx(el.querySelector(".rd-tx"),S.shown,S.segs.slice(S.si+1).join(""));
  if(S.si<S.segs.length-1){S.si++;S.pend=1;avanza()}
  else el.querySelector(".rd-nx").style.display="";
}
function finTipeo(){finSeg()}
function vacia(){ /* si el guion no reanuda el texto, lo completa */
  if(!S.pend)return;S.pend=0;
  S.shown+=S.segs.slice(S.si).join("");S.si=S.segs.length-1;
  setTx(el.querySelector(".rd-tx"),S.shown,"");el.querySelector(".rd-nx").style.display="";
}
function autoSig(){}
function pick(i){
  const c=S.choice;S.choice=null;card(false);
  S.log.push(["Elegiste",c.o[i]]);(S.picks=S.picks||[]).push(i);
  if(c.b[i])S.stack.push({a:c.b[i],i:0});
  avanza();
}
function avanza(){
  if(!S||S.card)return;
  if(S.at){clearTimeout(S.at);S.at=0}
  if(S.busy){clearTimeout(S.wt);S.busy=0;S.wt=0;const c=el.querySelector(".rd-cur");}
  else if(S.timer){finTipeo();return}
  if(S.choice)return;
  for(;;){
    let f=S.stack[S.stack.length-1];
    if(!f){fin();return}
    if(f.i>=f.a.length){S.stack.pop();continue}
    const s=f.a[f.i++];
    if(S.pend&&/^(say|choice|intro|head|vid|end)$/.test(s[0]))vacia();
    switch(s[0]){
      case"goon":if(S.pend){S.pend=0;tipea();return}break;
      case"bg":setBg(s[1],s[2],s[3]);break;
      case"cbg":tf(s[1],{x:s[2],y:s[3],s:s[4],e:s[5],d:s[6],px:s[7],py:s[8],sh:s[9]},"b");break;
      case"stg":tf(s[1],{x:s[2],y:s[3],s:s[4],e:s[5],d:s[6],px:s[7],py:s[8],sh:s[9]},"s");break;
      case"stage":stage(s[1],s[2]);break;
      case"film":el.querySelector(".rd-film").classList.toggle("on",s[1]===0);break;
      case"bgm":bgm(s[1]);break;
      case"se":se(s[1]);break;
      case"show":setChar(s[1],s[2],s[3],s[4],s[5],s[6],s[7],s[8],s[9]);break;
      case"ctl":ctl(s[1],s[2],s[3],s[4],s[5],s[6],s[7],s[8],s[9],s[10],s[11]);break;
      case"hide":hideCh(s[1],s[2]);break;
      case"mrt":mrt(s[1],s[2],s[3],s[4],s[5]);break;
      case"chd":chd(s[1],s[2],s[3],s[4],s[5],s[6]);break;
      case"clear":if(s.length>1)clearSc(s[1],s[2],s[3]);else hideAll();break;
      case"intro":card('<small>'+esc(s[1])+'</small><h2>'+esc(s[2])+'</h2><p>'+esc(s[3])+'</p><button class="rd-b" data-a="ok" style="margin-top:18px">Comenzar</button>');return;
      case"head":card('<p style="font-size:1.1rem">'+esc(s[1])+'</p><button class="rd-b" data-a="ok" style="margin-top:18px">Continuar</button>');return;
      case"say":say(s[1],s[2],s[3],s[4]);return;
      case"vid":{const cp=window.cinePaso&&window.cinePaso(S.id,S.vn++);if(cp){S.cnp=cp;card('<small>Cinemática</small><h2>🎬 '+esc(cp.c.t)+'</h2><p>Aquí el juego reproduce un video.</p><button class="rd-b" data-a="cnv" style="margin-top:18px">▶ Ver cinemática</button> <button class="rd-b" data-a="ok" style="margin-top:18px">Continuar</button>');return}}
      card('<small>Cinemática</small><h2>🎬 '+esc(String(s[1]).split("/").pop())+'</h2><p>Aquí el juego reproduce un video. Todavía no está disponible en el lector.</p><button class="rd-b" data-a="ok" style="margin-top:18px">Continuar</button>');return;
      case"w":if(!S.pend)ocultaCaja();S.busy=1;S.wt=setTimeout(()=>{S.busy=0;S.wt=0;avanza()},s[1]*1000);return;
      case"trn":trn(s[1],s[2],s[3],s[4],s[5]);break;
      case"fx":fxs(s[2],s[3]);break;
      case"tsk":shake(el.querySelector(".rd-box"),s[1],"BgShakeType");break;
      case"obj":obj(s[1],s[2],s[3],s[4]);break;
      case"objx":objx();break;
      case"choice":S.choice={o:s[1],b:s[2]};card('<div class="rd-ch">'+s[1].map((o,i)=>'<button data-a="c" data-i="'+i+'">'+esc(fx(o))+'</button>').join("")+'</div>');return;
      case"end":fin();return;
    }
  }
}
const SIG={"STm00_01": "STm00_02", "STm01_01": "STm01_02", "STm01_02": "STm01_03", "STm01_03": "STm01_04", "STm01_04": "STm01_05", "STm01_05": "STm01_06", "STm01_06": "STm01_07", "STm01_07": "STm01_08_a", "STm01_08_a": "STm01_09", "STm01_08_b": "STm01_08_a", "STm01_08_c": "STm01_09", "STm01_09": "STm01_10", "STm01_10": "STm02_01", "STm02_01": "STm02_02_a", "STm02_02_a": "STm02_03_a", "STm02_03_a": "STm02_04", "STm02_02_b": "STm02_03_b", "STm02_03_b": "STm02_04", "STm02_02_c": "STm02_02_a", "STm02_04": "STm02_05", "STm02_05": "STm02_06", "STm02_06": "STm02_07", "STm02_07": "STm02_08", "STm02_08": "STm02_09", "STm02_09": "STm02_10", "STm02_10": "STm02_11", "STm02_11": "STm03_00_a", "STm03_00_a": "STm03_00_b", "STm03_00_b": "STm03_01", "STm03_01": "STm03_02", "STm03_02": "STm03_03", "STm03_03": "STm03_04", "STm03_04": "STm03_05", "STm03_05": "STm03_06_a", "STm03_06_a": "STm03_07", "STm03_06_b": "STm03_07", "STm03_06_c": "STm03_05", "STm03_07": "STm03_08", "STm03_08": "STm03_09", "STm03_09": "STm03_10", "STm03_10": "STm03_11"};
const ALT={STm03_05:[["STm03_06_b","Ruta alterna: Entrenamiento especial (Acto 6B)"],["STm03_06_c","Final alternativo: Terapia de choque"]],STm02_01:[["STm02_02_b","Ruta alterna: Investigación disfrazada (Acto 2)"],["STm02_02_c","Final alternativo: Un final interminable"]],STm01_07:[["STm01_08_c","Ruta alterna: la cena (Acto 8)"],["STm01_08_b","Final alternativo: Un futuro sin Trekkers"]]};
const NOMB={"STm01_01": "1 · El reinicio del despertar", "STm01_02": "2 · Huellas del pasado", "STm01_03": "3 · Oasis desvanecido", "STm01_04": "4 · Bajo el puente", "STm01_05": "5 · Vientos del distrito Ceniza", "STm01_06": "6 · Volando desde la ceniza", "STm01_07": "7 · Un tipo distinto de deseo", "STm01_08_b": "Final: Un futuro sin Trekkers", "STm01_08_a": "8A · Informe de investigación", "STm01_08_c": "8B · Postre después de la cena", "STm01_09": "9 · Cómo se reparan los recuerdos", "STm01_10": "10 · Interpretación final", "STm02_01": "1 · Loxy y la compañía", "STm02_02_c": "Final: Eternidad", "STm02_02_a": "2A · Secretos en la oscuridad", "STm02_03_a": "3A · Ojos en la oscuridad", "STm02_02_b": "2B · Investigación disfrazada", "STm02_03_b": "3B · Después de horas", "STm02_04": "4 · Chica de pelo negro", "STm02_05": "5 · Código de Honor", "STm02_06": "6 · Privilegio de la empresa", "STm02_07": "7 · Franquicia exclusiva", "STm02_08": "8 · Comercio de almas", "STm02_09": "9 · Una guerra de una hora", "STm02_10": "10 · Cómo se cumplen los deseos", "STm02_11": "Epílogo · Un nuevo comienzo", "STm00_01": "Prólogo, parte 1", "STm00_02": "Prólogo, parte 2", "STm03_00_a": "Interludio 1 · El teléfono", "STm03_00_b": "Interludio 2 · Vita", "STm03_01": "1 · Los Tres Grandes", "STm03_02": "2 · La señora oculta del bosque", "STm03_03": "3 · Petal Bloom", "STm03_04": "4 · Una cacería fallida", "STm03_05": "5 · Trauma", "STm03_06_c": "Final: Terapia de choque", "STm03_06_a": "6A · Terapia psicológica", "STm03_06_b": "6B · Entrenamiento especial", "STm03_07": "7 · La debilucha no deseada", "STm03_08": "8 · La escuadra de caza", "STm03_09": "9 · Un corazón confiado", "STm03_10": "10 · Victoria e intercambio", "STm03_11": "11 · El último monstruo"};
function fin(){pararAudio();stopShakes();marcaLeido(S.id);const nx=SIG[S.id];let h;
  if(nx){h='<small>Fin de esta parte</small><h2>'+(NOMB[S.id]||"")+' terminado</h2><p>Sigue: '+(NOMB[nx]||"la siguiente parte")+'.</p><button class="rd-b" data-a="nx" data-n="'+nx+'" style="margin-top:18px">Continuar</button>';
    (ALT[S.id]||[]).forEach(function(x){let lb=x[1];if(/: $/.test(lb)){const n=(NOMB[x[0]]||x[0]).replace(/^Final(?: verdadero)?: /,"").split(" · ");lb+=n[n.length-1]}h+=' <button class="rd-b" data-a="nx" data-n="'+x[0]+'" style="margin-top:10px">'+esc(lb)+'</button>'});
    h+=' <button class="rd-b" data-a="x" style="margin-top:18px">Cerrar</button>'}
  else h='<small>Fin</small><h2>'+(NOMB[S.id]||"Fin")+' terminado</h2><p>Por ahora llegamos hasta aquí. ¡Continuará!</p><button class="rd-b" data-a="x" style="margin-top:18px">Cerrar</button>';
  card(h)}

const CAPS={"STm00": ["Prólogo", [["STm00_01"], ["STm00_02"]], [["STm00_01", "STm00_02"]]], "STm01": ["Capítulo 1 · Seres sin memoria", [["STm01_01"], ["STm01_02"], ["STm01_03"], ["STm01_04"], ["STm01_05"], ["@BT01|Regreso al orfanato"], ["STm01_06"], ["STm01_07", "!STm01_08_b"], ["STm01_08_a", "STm01_08_c"], ["STm01_09"], ["STm01_10"]], [["STm01_01", "STm01_02"], ["STm01_02", "STm01_03"], ["STm01_03", "STm01_04"], ["STm01_04", "STm01_05"], ["STm01_05", "@BT01|Regreso al orfanato"], ["@BT01|Regreso al orfanato", "STm01_06"], ["STm01_06", "STm01_07"], ["STm01_07", "STm01_08_a"], ["STm01_07", "STm01_08_c"], ["STm01_07", "STm01_08_b"], ["STm01_08_a", "STm01_09"], ["STm01_08_c", "STm01_09"], ["STm01_09", "STm01_10"]]], "STm02": ["Capítulo 2 · El viento en el puente de la vía fluvial", [["STm02_01", "!STm02_02_c"], ["STm02_02_a", "STm02_02_b"], ["STm02_03_a", "STm02_03_b"], ["@BT01|Escapar del círculo"], ["STm02_04"], ["STm02_05"], ["STm02_06"], ["STm02_07"], ["STm02_08"], ["STm02_09"], ["@BT02|La Estrella del Cataclismo"], ["STm02_10"], ["@BT03|Reencuentro con un viejo enemigo"], ["STm02_11"]], [["STm02_01", "STm02_02_a"], ["STm02_01", "STm02_02_b"], ["STm02_01", "STm02_02_c"], ["STm02_02_a", "STm02_03_a"], ["STm02_02_b", "STm02_03_b"], ["STm02_03_a", "@BT01|Escapar del círculo"], ["STm02_03_b", "@BT01|Escapar del círculo"], ["@BT01|Escapar del círculo", "STm02_04"], ["STm02_04", "STm02_05"], ["STm02_05", "STm02_06"], ["STm02_06", "STm02_07"], ["STm02_07", "STm02_08"], ["STm02_08", "STm02_09"], ["STm02_09", "@BT02|La Estrella del Cataclismo"], ["@BT02|La Estrella del Cataclismo", "STm02_10"], ["STm02_10", "@BT03|Reencuentro con un viejo enemigo"], ["@BT03|Reencuentro con un viejo enemigo", "STm02_11"]]], "STm03": ["Capítulo 3 · Guild Sweet Guild", [["STm03_00_a"], ["STm03_00_b"], ["STm03_01"], ["STm03_02"], ["STm03_03"], ["STm03_04"], ["@BT01|Medida de poder"], ["STm03_05", "!STm03_06_c"], ["STm03_06_a", "STm03_06_b"], ["STm03_07"], ["STm03_08"], ["STm03_09"], ["@BT02|Espíritu de la brutalidad"], ["STm03_10"], ["STm03_11"]], [["STm03_00_a", "STm03_00_b"], ["STm03_00_b", "STm03_01"], ["STm03_01", "STm03_02"], ["STm03_02", "STm03_03"], ["STm03_03", "STm03_04"], ["STm03_04", "@BT01|Medida de poder"], ["@BT01|Medida de poder", "STm03_05"], ["STm03_05", "STm03_06_a"], ["STm03_05", "STm03_06_b"], ["STm03_05", "STm03_06_c"], ["STm03_06_a", "STm03_07"], ["STm03_06_b", "STm03_07"], ["STm03_07", "STm03_08"], ["STm03_08", "STm03_09"], ["STm03_09", "@BT02|Espíritu de la brutalidad"], ["@BT02|Espíritu de la brutalidad", "STm03_10"], ["STm03_10", "STm03_11"]]]};
/* Capítulos 4–9 (v33) y eventos (v36): datos generados desde los guiones del juego */
Object.assign(CAPS,{"STm04": ["Capítulo 4 · Más allá del sueño", [["STm04_01"], ["STm04_02"], ["!STm04_03_a", "STm04_03_b", "STm04_03_c"], ["STm04_04_a", "STm04_04_b", "STm04_04_c"], ["@BT01|Breaking Through"], ["STm04_05"], ["STm04_06"], ["STm04_07"], ["STm04_08"], ["STm04_09"], ["@BT02|The Last Monster"], ["STm04_10"], ["STm04_11"]], [["STm04_04_a", "@BT01|Breaking Through"], ["STm04_04_b", "@BT01|Breaking Through"], ["STm04_04_c", "@BT01|Breaking Through"], ["STm04_09", "@BT02|The Last Monster"], ["STm04_01", "STm04_02"], ["STm04_02", "STm04_03_a"], ["STm04_02", "STm04_03_b"], ["STm04_02", "STm04_03_c"], ["STm04_03_b", "STm04_04_a"], ["STm04_03_c", "STm04_04_a"], ["STm04_03_b", "STm04_04_b"], ["STm04_03_c", "STm04_04_b"], ["STm04_03_b", "STm04_04_c"], ["STm04_03_c", "STm04_04_c"], ["@BT01|Breaking Through", "STm04_05"], ["STm04_05", "STm04_06"], ["STm04_06", "STm04_07"], ["STm04_07", "STm04_08"], ["STm04_08", "STm04_09"], ["@BT02|The Last Monster", "STm04_10"], ["STm04_10", "STm04_11"]]], "STm05": ["Capítulo 5 · Una chispa en la oscuridad", [["STm05_00"], ["STm05_01"], ["STm05_02"], ["STm05_03_a", "STm05_03_b", "STm05_03_c"], ["STm05_04"], ["STm05_05"], ["@BT01|Spice in the Monolith"], ["STm05_06"], ["STm05_07"], ["@BT02|Familiar Mercenary"], ["STm05_08"], ["!STm05_09_a", "STm05_09_b", "!STm05_09_c"], ["@BT03|Blade of Jade"], ["STm05_10"], ["STm05_11"]], [["STm05_05", "@BT01|Spice in the Monolith"], ["STm05_07", "@BT02|Familiar Mercenary"], ["STm05_09_b", "@BT03|Blade of Jade"], ["STm05_00", "STm05_01"], ["STm05_01", "STm05_02"], ["STm05_02", "STm05_03_a"], ["STm05_02", "STm05_03_b"], ["STm05_02", "STm05_03_c"], ["STm05_03_c", "STm05_04"], ["STm05_04", "STm05_05"], ["@BT01|Spice in the Monolith", "STm05_06"], ["STm05_06", "STm05_07"], ["@BT02|Familiar Mercenary", "STm05_08"], ["STm05_08", "STm05_09_a"], ["STm05_08", "STm05_09_b"], ["STm05_08", "STm05_09_c"], ["@BT03|Blade of Jade", "STm05_10"], ["STm05_10", "STm05_11"]]], "STm06": ["Capítulo 6 · Milagro de un destello", [["STm06_00"], ["STm06_01"], ["STm06_02_a", "STm06_02_b", "STm06_02_c"], ["@BT01|Close Call", "STm06_03_a"], ["STm06_03_b", "STm06_04_a"], ["STm06_04_b", "!STm06_05_a"], ["STm06_05_b"], ["STm06_06"], ["STm06_07"], ["STm06_08"], ["STm06_09"], ["@BT02|The Battle in Philae Ⅱ"], ["STm06_10"], ["STm06_11"], ["@BT03|Lithe Beauty"], ["STm06_12"], ["STm06_13"]], [["STm06_02_b", "@BT01|Close Call"], ["STm06_02_c", "@BT01|Close Call"], ["STm06_09", "@BT02|The Battle in Philae Ⅱ"], ["STm06_11", "@BT03|Lithe Beauty"], ["STm06_00", "STm06_01"], ["STm06_01", "STm06_02_a"], ["STm06_01", "STm06_02_b"], ["STm06_01", "STm06_02_c"], ["STm06_02_a", "STm06_03_a"], ["@BT01|Close Call", "STm06_03_b"], ["STm06_03_a", "STm06_04_a"], ["STm06_03_b", "STm06_04_b"], ["STm06_04_a", "STm06_05_a"], ["STm06_04_b", "STm06_05_b"], ["STm06_05_b", "STm06_06"], ["STm06_06", "STm06_07"], ["STm06_07", "STm06_08"], ["STm06_08", "STm06_09"], ["@BT02|The Battle in Philae Ⅱ", "STm06_10"], ["STm06_10", "STm06_11"], ["@BT03|Lithe Beauty", "STm06_12"], ["STm06_12", "STm06_13"]]], "STm06x5": ["Especial 6.5 · Obertura de un enigma sombrío", [["STm06x5_01"], ["STm06x5_02"], ["STm06x5_03"], ["STm06x5_04"], ["STm06x5_05"], ["STm06x5_06"], ["@BT01|Desert Guests"], ["STm06x5_07"], ["@BT02|Sandstorm Night"], ["STm06x5_08"], ["STm06x5_09"], ["STm06x5_10"]], [["STm06x5_06", "@BT01|Desert Guests"], ["STm06x5_07", "@BT02|Sandstorm Night"], ["STm06x5_01", "STm06x5_02"], ["STm06x5_02", "STm06x5_03"], ["STm06x5_03", "STm06x5_04"], ["STm06x5_04", "STm06x5_05"], ["STm06x5_05", "STm06x5_06"], ["@BT01|Desert Guests", "STm06x5_07"], ["@BT02|Sandstorm Night", "STm06x5_08"], ["STm06x5_08", "STm06x5_09"], ["STm06x5_09", "STm06x5_10"]]], "STm07": ["Capítulo 7 · El precio de la estrella", [["STm07_00"], ["STm07_01"], ["@BT01|A Heart Far Away"], ["STm07_02"], ["STm07_03"], ["STm07_04"], ["!STm07_05_c", "STm07_05_a", "STm07_05_b"], ["!STm07_06_ba", "!STm07_06_bb", "!STm07_06_bc", "STm07_06_a"], ["STm07_07"], ["@BT02|Hotel Brawl"], ["STm07_08"], ["STm07_09", "STm07_12"], ["STm07_10", "STm07_13"], ["STm07_11", "STm07_14"], ["STm07_15"], ["@BT03|Beyond Fear"], ["STm07_16"]], [["STm07_01", "@BT01|A Heart Far Away"], ["STm07_07", "@BT02|Hotel Brawl"], ["STm07_15", "@BT03|Beyond Fear"], ["STm07_00", "STm07_01"], ["@BT01|A Heart Far Away", "STm07_02"], ["STm07_02", "STm07_03"], ["STm07_03", "STm07_04"], ["STm07_04", "STm07_05_c"], ["STm07_04", "STm07_05_a"], ["STm07_04", "STm07_05_b"], ["STm07_05_b", "STm07_06_ba"], ["STm07_05_b", "STm07_06_bb"], ["STm07_05_b", "STm07_06_bc"], ["STm07_05_a", "STm07_06_a"], ["STm07_06_a", "STm07_07"], ["@BT02|Hotel Brawl", "STm07_08"], ["STm07_08", "STm07_09"], ["STm07_08", "STm07_12"], ["STm07_09", "STm07_10"], ["STm07_10", "STm07_11"], ["STm07_12", "STm07_13"], ["STm07_13", "STm07_14"], ["STm07_11", "STm07_15"], ["STm07_14", "STm07_15"], ["@BT03|Beyond Fear", "STm07_16"]]], "STm08": ["Capítulo 8 · Calor residual", [["STm08_01"], ["@BT01|Warning Shot"], ["STm08_02"], ["STm08_03"], ["STm08_04"], ["STm08_05"], ["STm08_06"], ["STm08_07"], ["STm08_08"], ["STm08_09"], ["STm08_10"], ["@BT02|The Good, the Bad and the Jester"], ["STm08_11"], ["STm08_12"], ["STm08_13"], ["STm08_14"], ["STm08_15"], ["STm08_16_a", "STm08_16_b"], ["STm08_17_a", "STm08_17_b"], ["STm08_18_a", "STm08_18_b"], ["STm08_19_a", "!STm08_19_b"], ["STm08_20"], ["@BT03|Ancient Wisdom"], ["STm08_21"]], [["STm08_01", "@BT01|Warning Shot"], ["@BT01|Warning Shot", "STm08_02"], ["STm08_02", "STm08_03"], ["STm08_03", "STm08_04"], ["STm08_04", "STm08_05"], ["STm08_05", "STm08_06"], ["STm08_06", "STm08_07"], ["STm08_07", "STm08_08"], ["STm08_08", "STm08_09"], ["STm08_09", "STm08_10"], ["STm08_10", "@BT02|The Good, the Bad and the Jester"], ["@BT02|The Good, the Bad and the Jester", "STm08_11"], ["STm08_11", "STm08_12"], ["STm08_12", "STm08_13"], ["STm08_13", "STm08_14"], ["STm08_14", "STm08_15"], ["STm08_15", "STm08_16_a"], ["STm08_15", "STm08_16_b"], ["STm08_16_a", "STm08_17_a"], ["STm08_17_a", "STm08_18_a"], ["STm08_18_a", "STm08_19_a"], ["STm08_19_a", "STm08_20"], ["STm08_16_b", "STm08_17_b"], ["STm08_20", "@BT03|Ancient Wisdom"], ["@BT03|Ancient Wisdom", "STm08_21"], ["STm08_17_b", "STm08_18_b"], ["STm08_18_b", "STm08_19_b"]]], "STm09": ["Capítulo 9 · Un Monolito demasiado lejano", [["STm09_00_a"], ["STm09_00_b"], ["STm09_01_a", "STm09_01_b", "STm09_01_c", "STm09_01_d"], ["@BT01|Closing the Net", "@BT03|Turning the Tables", "@BT04|Home Turf Advantage"], ["STm09_02_a", "STm09_02_b", "STm09_02_c"], ["STm09_03_a", "STm09_03_b", "STm09_03_c"], ["STm09_04_a", "STm09_04_b", "@BT05|Battle the Stellaroids Again"], ["STm09_05_a", "STm09_05_b", "STm09_04_c"], ["STm09_06_a", "!STm09_06_b", "!STm09_05_c"], ["@BT02|Army of One"], ["!STm09_07_a"]], [["STm09_00_a", "STm09_00_b"], ["STm09_00_b", "STm09_01_a"], ["STm09_01_a", "@BT01|Closing the Net"], ["@BT01|Closing the Net", "STm09_02_a"], ["STm09_02_a", "STm09_03_a"], ["STm09_03_a", "STm09_04_a"], ["STm09_04_a", "STm09_05_a"], ["STm09_05_a", "STm09_06_a"], ["STm09_06_a", "@BT02|Army of One"], ["@BT02|Army of One", "STm09_07_a"], ["STm09_00_b", "STm09_01_b"], ["STm09_01_b", "@BT03|Turning the Tables"], ["@BT03|Turning the Tables", "STm09_02_b"], ["STm09_02_b", "STm09_03_b"], ["STm09_03_b", "STm09_04_b"], ["STm09_04_b", "STm09_05_b"], ["STm09_05_b", "STm09_06_b"], ["STm09_00_b", "STm09_01_c"], ["STm09_01_c", "@BT04|Home Turf Advantage"], ["@BT04|Home Turf Advantage", "STm09_02_c"], ["STm09_02_c", "STm09_03_c"], ["STm09_03_c", "@BT05|Battle the Stellaroids Again"], ["@BT05|Battle the Stellaroids Again", "STm09_04_c"], ["STm09_04_c", "STm09_05_c"], ["STm09_00_b", "STm09_01_d"]]], "STev_02": ["Evento · Mensajera radiante, espíritu de la noche santa", [["STev_02_01"], ["STev_02_02"], ["STev_02_03"], ["STev_02_04_a", "STev_02_04_b", "STev_02_04_c"], ["STev_02_05"], ["STev_02_06"], ["STev_02_07"], ["STev_02_08"], ["STev_02_09"], ["STev_02_10"], ["@BT01|Afterglow of the Festival"], ["STev_02_11"]], [["STev_02_01", "STev_02_02"], ["STev_02_02", "STev_02_03"], ["STev_02_03", "STev_02_04_a"], ["STev_02_03", "STev_02_04_b"], ["STev_02_03", "STev_02_04_c"], ["STev_02_04_a", "STev_02_05"], ["STev_02_04_b", "STev_02_05"], ["STev_02_04_c", "STev_02_05"], ["STev_02_05", "STev_02_06"], ["STev_02_06", "STev_02_07"], ["STev_02_07", "STev_02_08"], ["STev_02_08", "STev_02_09"], ["STev_02_09", "STev_02_10"], ["STev_02_10", "@BT01|Afterglow of the Festival"], ["@BT01|Afterglow of the Festival", "STev_02_11"]]], "STev_03": ["Evento · Un crepitante indicio de primavera", [["STev_03_01"], ["STev_03_02"], ["STev_03_03"], ["STev_03_04"], ["@BT01|Clean Sweep"], ["STev_03_05"], ["STev_03_06"], ["STev_03_07"], ["@BT02|Healer's Kindness"], ["STev_03_08"], ["STev_03_09"]], [["STev_03_01", "STev_03_02"], ["STev_03_02", "STev_03_03"], ["STev_03_03", "STev_03_04"], ["STev_03_04", "@BT01|Clean Sweep"], ["@BT01|Clean Sweep", "STev_03_05"], ["STev_03_05", "STev_03_06"], ["STev_03_06", "STev_03_07"], ["STev_03_07", "@BT02|Healer's Kindness"], ["@BT02|Healer's Kindness", "STev_03_08"], ["STev_03_08", "STev_03_09"]]], "STev_04": ["Evento · Réquiem invernal y el gatillo del alba", [["STev_04_01"], ["@BT01|Into the Frozen Dark"], ["STev_04_02"], ["STev_04_03"], ["STev_04_04"], ["STev_04_05"], ["STev_04_06"], ["STev_04_07"], ["STev_04_08"], ["@BT02|Last Stand"], ["STev_04_09"], ["STev_04_10"]], [["STev_04_01", "@BT01|Into the Frozen Dark"], ["@BT01|Into the Frozen Dark", "STev_04_02"], ["STev_04_02", "STev_04_03"], ["STev_04_03", "STev_04_04"], ["STev_04_04", "STev_04_05"], ["STev_04_05", "STev_04_06"], ["STev_04_06", "STev_04_07"], ["STev_04_07", "STev_04_08"], ["STev_04_08", "@BT02|Last Stand"], ["@BT02|Last Stand", "STev_04_09"], ["STev_04_09", "STev_04_10"]]], "STev_05": ["Evento · Para ti, mi persona más querida", [["STev_05_01"], ["STev_05_02_a", "STev_05_02_b", "STev_05_02_c"], ["STev_05_03"], ["STev_05_04"], ["@BT01|Convincing with Reason"], ["STev_05_05"], ["STev_05_06"], ["@BT02|Braving the Storm"], ["STev_05_07"], ["STev_05_08"]], [["STev_05_01", "STev_05_02_a"], ["STev_05_01", "STev_05_02_b"], ["STev_05_01", "STev_05_02_c"], ["STev_05_02_a", "STev_05_03"], ["STev_05_02_b", "STev_05_03"], ["STev_05_02_c", "STev_05_03"], ["STev_05_03", "STev_05_04"], ["STev_05_04", "@BT01|Convincing with Reason"], ["@BT01|Convincing with Reason", "STev_05_05"], ["STev_05_05", "STev_05_06"], ["STev_05_06", "@BT02|Braving the Storm"], ["@BT02|Braving the Storm", "STev_05_07"], ["STev_05_07", "STev_05_08"]]], "STev_07": ["Evento · Enmarcando los sentimientos invisibles", [["STev_07_01"], ["STev_07_02"], ["STev_07_03"], ["STev_07_04"], ["STev_07_05"], ["@BT01|A Helping Hand"], ["STev_07_06"], ["STev_07_07"], ["@BT02|The Protection"], ["STev_07_08"], ["STev_07_09"]], [["STev_07_01", "STev_07_02"], ["STev_07_02", "STev_07_03"], ["STev_07_03", "STev_07_04"], ["STev_07_04", "STev_07_05"], ["STev_07_05", "@BT01|A Helping Hand"], ["@BT01|A Helping Hand", "STev_07_06"], ["STev_07_06", "STev_07_07"], ["STev_07_07", "@BT02|The Protection"], ["@BT02|The Protection", "STev_07_08"], ["STev_07_08", "STev_07_09"]]], "STev_08": ["Evento · ¡Latido! Rapsodia neoinspirada", [["STev_08_01"], ["STev_08_02"], ["@BT01|The Great Escape"], ["STev_08_03"], ["STev_08_04"], ["STev_08_05"], ["STev_08_06"], ["@BT02|Full Speed Ahead"], ["STev_08_07"], ["STev_08_08"]], [["STev_08_01", "STev_08_02"], ["STev_08_02", "@BT01|The Great Escape"], ["@BT01|The Great Escape", "STev_08_03"], ["STev_08_03", "STev_08_04"], ["STev_08_04", "STev_08_05"], ["STev_08_05", "STev_08_06"], ["STev_08_06", "@BT02|Full Speed Ahead"], ["@BT02|Full Speed Ahead", "STev_08_07"], ["STev_08_07", "STev_08_08"]]], "STev_01": ["Evento · ¡Aventura audaz! El barco fantasma ronda las profundidades", [["STev_01_01"], ["STev_01_02"], ["STev_01_03"], ["STev_01_04"], ["STev_01_05"], ["STev_01_06"], ["STev_01_07"], ["STev_01_08"], ["STev_01_09"], ["STev_01_10"], ["STev_01_11"]], [["STev_01_01", "STev_01_02"], ["STev_01_02", "STev_01_03"], ["STev_01_03", "STev_01_04"], ["STev_01_04", "STev_01_05"], ["STev_01_05", "STev_01_06"], ["STev_01_06", "STev_01_07"], ["STev_01_07", "STev_01_08"], ["STev_01_08", "STev_01_09"], ["STev_01_09", "STev_01_10"], ["STev_01_10", "STev_01_11"]]], "STev_09": ["Evento · Una tormenta de arena y disparos", [["STev_09_01"], ["STev_09_02"], ["STev_09_03"], ["STev_09_04"], ["STev_09_05"], ["@BT01|Crossfire: Mirage Melee"], ["STev_09_06"], ["@BT02|Monster Duel: Trekker Rescuing"], ["STev_09_07"], ["STev_09_08"]], [["STev_09_01", "STev_09_02"], ["STev_09_02", "STev_09_03"], ["STev_09_03", "STev_09_04"], ["STev_09_04", "STev_09_05"], ["STev_09_05", "@BT01|Crossfire: Mirage Melee"], ["@BT01|Crossfire: Mirage Melee", "STev_09_06"], ["STev_09_06", "@BT02|Monster Duel: Trekker Rescuing"], ["@BT02|Monster Duel: Trekker Rescuing", "STev_09_07"], ["STev_09_07", "STev_09_08"]]], "STev_10": ["Evento · Brisa soleada y mares azules: ¡check-in para un verano acogedor!", [["STev_10_01"], ["STev_10_02"], ["STev_10_03"], ["STev_10_04"], ["@BT01|It's You Again!"], ["STev_10_05"], ["STev_10_06"], ["STev_10_07"], ["STev_10_08"], ["@BT02|The Crabby One with Claws"], ["STev_10_09"]], [["STev_10_01", "STev_10_02"], ["STev_10_02", "STev_10_03"], ["STev_10_03", "STev_10_04"], ["STev_10_04", "@BT01|It's You Again!"], ["@BT01|It's You Again!", "STev_10_05"], ["STev_10_05", "STev_10_06"], ["STev_10_06", "STev_10_07"], ["STev_10_07", "STev_10_08"], ["STev_10_08", "@BT02|The Crabby One with Claws"], ["@BT02|The Crabby One with Claws", "STev_10_09"]]], "STev_11": ["Evento · Surf y salpicaduras: ¡una brillante aventura de vacaciones!", [["STev_11_01"], ["STev_11_02"], ["STev_11_03"], ["STev_11_04"], ["@BT01|Deep-Sea Monolith"], ["STev_11_05"], ["STev_11_06"], ["STev_11_07"], ["@BT02|Moral Education"], ["STev_11_08"], ["STev_11_09"]], [["STev_11_01", "STev_11_02"], ["STev_11_02", "STev_11_03"], ["STev_11_03", "STev_11_04"], ["STev_11_04", "@BT01|Deep-Sea Monolith"], ["@BT01|Deep-Sea Monolith", "STev_11_05"], ["STev_11_05", "STev_11_06"], ["STev_11_06", "STev_11_07"], ["STev_11_07", "@BT02|Moral Education"], ["@BT02|Moral Education", "STev_11_08"], ["STev_11_08", "STev_11_09"]]], "STev_12": ["Evento · ¡Adelante, mi señora! ¡Manual de entrenamiento Plus!", [["STev_12_01"], ["STev_12_02"], ["STev_12_03"], ["@BT01|First Commission"], ["STev_12_04"], ["STev_12_05"], ["STev_12_06"], ["STev_12_07"], ["@BT02|Strike at the Heart"], ["STev_12_08"], ["STev_12_09"]], [["STev_12_01", "STev_12_02"], ["STev_12_02", "STev_12_03"], ["STev_12_03", "@BT01|First Commission"], ["@BT01|First Commission", "STev_12_04"], ["STev_12_04", "STev_12_05"], ["STev_12_05", "STev_12_06"], ["STev_12_06", "STev_12_07"], ["STev_12_07", "@BT02|Strike at the Heart"], ["@BT02|Strike at the Heart", "STev_12_08"], ["STev_12_08", "STev_12_09"]]]});
Object.assign(SIG,{"STm04_01": "STm04_02", "STm04_02": "STm04_03_b", "STm04_03_a": "STm04_02", "STm04_03_b": "STm04_04_a", "STm04_03_c": "STm04_04_a", "STm04_04_a": "STm04_05", "STm04_04_b": "STm04_05", "STm04_04_c": "STm04_05", "STm04_05": "STm04_06", "STm04_06": "STm04_07", "STm04_07": "STm04_08", "STm04_08": "STm04_09", "STm04_09": "STm04_10", "STm04_10": "STm04_11", "STm05_00": "STm05_01", "STm05_01": "STm05_02", "STm05_02": "STm05_03_a", "STm05_03_c": "STm05_04", "STm05_04": "STm05_05", "STm05_05": "STm05_06", "STm05_06": "STm05_07", "STm05_07": "STm05_08", "STm05_08": "STm05_09_b", "STm05_09_a": "STm05_08", "STm05_09_b": "STm05_10", "STm05_09_c": "STm05_08", "STm05_10": "STm05_11", "STm06_00": "STm06_01", "STm06_01": "STm06_02_a", "STm06_02_a": "STm06_03_a", "STm06_02_b": "STm06_03_b", "STm06_02_c": "STm06_03_b", "STm06_03_a": "STm06_04_a", "STm06_03_b": "STm06_04_b", "STm06_04_a": "STm06_05_a", "STm06_04_b": "STm06_05_b", "STm06_05_a": "STm06_04_a", "STm06_05_b": "STm06_06", "STm06_06": "STm06_07", "STm06_07": "STm06_08", "STm06_08": "STm06_09", "STm06_09": "STm06_10", "STm06_10": "STm06_11", "STm06_11": "STm06_12", "STm06_12": "STm06_13", "STm06x5_01": "STm06x5_02", "STm06x5_02": "STm06x5_03", "STm06x5_03": "STm06x5_04", "STm06x5_04": "STm06x5_05", "STm06x5_05": "STm06x5_06", "STm06x5_06": "STm06x5_07", "STm06x5_07": "STm06x5_08", "STm06x5_08": "STm06x5_09", "STm06x5_09": "STm06x5_10", "STm07_00": "STm07_01", "STm07_01": "STm07_02", "STm07_02": "STm07_03", "STm07_03": "STm07_04", "STm07_04": "STm07_05_a", "STm07_05_c": "STm07_04", "STm07_05_a": "STm07_06_a", "STm07_05_b": "STm07_06_ba", "STm07_06_ba": "STm07_05_b", "STm07_06_bb": "STm07_05_b", "STm07_06_bc": "STm07_05_b", "STm07_06_a": "STm07_07", "STm07_07": "STm07_08", "STm07_08": "STm07_09", "STm07_09": "STm07_10", "STm07_12": "STm07_13", "STm07_10": "STm07_11", "STm07_11": "STm07_15", "STm07_13": "STm07_14", "STm07_14": "STm07_15", "STm07_15": "STm07_16", "STm08_01": "STm08_02", "STm08_02": "STm08_03", "STm08_03": "STm08_04", "STm08_04": "STm08_05", "STm08_05": "STm08_06", "STm08_06": "STm08_07", "STm08_07": "STm08_08", "STm08_08": "STm08_09", "STm08_09": "STm08_10", "STm08_10": "STm08_11", "STm08_11": "STm08_12", "STm08_12": "STm08_13", "STm08_13": "STm08_14", "STm08_14": "STm08_15", "STm08_15": "STm08_16_a", "STm08_16_a": "STm08_17_a", "STm08_16_b": "STm08_17_b", "STm08_17_a": "STm08_18_a", "STm08_18_a": "STm08_19_a", "STm08_19_a": "STm08_20", "STm08_20": "STm08_21", "STm08_17_b": "STm08_18_b", "STm08_18_b": "STm08_19_b", "STm08_19_b": "STm08_18_b", "STm09_00_a": "STm09_00_b", "STm09_00_b": "STm09_01_a", "STm09_01_a": "STm09_02_a", "STm09_02_a": "STm09_03_a", "STm09_03_a": "STm09_04_a", "STm09_04_a": "STm09_05_a", "STm09_05_a": "STm09_06_a", "STm09_06_a": "STm09_07_a", "STm09_07_a": "BAm09_BT03", "STm09_01_b": "STm09_02_b", "STm09_02_b": "STm09_03_b", "STm09_03_b": "STm09_04_b", "STm09_04_b": "STm09_05_b", "STm09_05_b": "STm09_06_b", "STm09_06_b": "STm09_05_b", "STm09_01_c": "STm09_02_c", "STm09_02_c": "STm09_03_c", "STm09_03_c": "STm09_04_c", "STm09_04_c": "STm09_05_c", "STm09_05_c": "STm09_04_c", "STev_02_01": "STev_02_02", "STev_02_02": "STev_02_03", "STev_02_03": "STev_02_04_a", "STev_02_04_a": "STev_02_05", "STev_02_04_b": "STev_02_05", "STev_02_04_c": "STev_02_05", "STev_02_05": "STev_02_06", "STev_02_06": "STev_02_07", "STev_02_07": "STev_02_08", "STev_02_08": "STev_02_09", "STev_02_09": "STev_02_10", "STev_02_10": "STev_02_11", "STev_03_01": "STev_03_02", "STev_03_02": "STev_03_03", "STev_03_03": "STev_03_04", "STev_03_04": "STev_03_05", "STev_03_05": "STev_03_06", "STev_03_06": "STev_03_07", "STev_03_07": "STev_03_08", "STev_03_08": "STev_03_09", "STev_04_01": "STev_04_02", "STev_04_02": "STev_04_03", "STev_04_03": "STev_04_04", "STev_04_04": "STev_04_05", "STev_04_05": "STev_04_06", "STev_04_06": "STev_04_07", "STev_04_07": "STev_04_08", "STev_04_08": "STev_04_09", "STev_04_09": "STev_04_10", "STev_05_01": "STev_05_02_a", "STev_05_02_a": "STev_05_03", "STev_05_02_b": "STev_05_03", "STev_05_02_c": "STev_05_03", "STev_05_03": "STev_05_04", "STev_05_04": "STev_05_05", "STev_05_05": "STev_05_06", "STev_05_06": "STev_05_07", "STev_05_07": "STev_05_08", "STev_07_01": "STev_07_02", "STev_07_02": "STev_07_03", "STev_07_03": "STev_07_04", "STev_07_04": "STev_07_05", "STev_07_05": "STev_07_06", "STev_07_06": "STev_07_07", "STev_07_07": "STev_07_08", "STev_07_08": "STev_07_09", "STev_08_01": "STev_08_02", "STev_08_02": "STev_08_03", "STev_08_03": "STev_08_04", "STev_08_04": "STev_08_05", "STev_08_05": "STev_08_06", "STev_08_06": "STev_08_07", "STev_08_07": "STev_08_08", "STev_01_01": "STev_01_02", "STev_01_02": "STev_01_03", "STev_01_03": "STev_01_04", "STev_01_04": "STev_01_05", "STev_01_05": "STev_01_06", "STev_01_06": "STev_01_07", "STev_01_07": "STev_01_08", "STev_01_08": "STev_01_09", "STev_01_09": "STev_01_10", "STev_01_10": "STev_01_11", "STev_09_01": "STev_09_02", "STev_09_02": "STev_09_03", "STev_09_03": "STev_09_04", "STev_09_04": "STev_09_05", "STev_09_05": "STev_09_06", "STev_09_06": "STev_09_07", "STev_09_07": "STev_09_08", "STev_10_01": "STev_10_02", "STev_10_02": "STev_10_03", "STev_10_03": "STev_10_04", "STev_10_04": "STev_10_05", "STev_10_05": "STev_10_06", "STev_10_06": "STev_10_07", "STev_10_07": "STev_10_08", "STev_10_08": "STev_10_09", "STev_11_01": "STev_11_02", "STev_11_02": "STev_11_03", "STev_11_03": "STev_11_04", "STev_11_04": "STev_11_05", "STev_11_05": "STev_11_06", "STev_11_06": "STev_11_07", "STev_11_07": "STev_11_08", "STev_11_08": "STev_11_09", "STev_12_01": "STev_12_02", "STev_12_02": "STev_12_03", "STev_12_03": "STev_12_04", "STev_12_04": "STev_12_05", "STev_12_05": "STev_12_06", "STev_12_06": "STev_12_07", "STev_12_07": "STev_12_08", "STev_12_08": "STev_12_09"});
Object.assign(NOMB,{"STm04_01": "1 · The Old Days", "STm04_02": "2 · Her Choice", "STm04_03_a": "Final: All to the End", "STm04_03_b": "3A · Night Talk", "STm04_03_c": "3B · Camping", "STm04_04_a": "4A · One Trekker Army", "STm04_04_b": "4B · The Past You", "STm04_04_c": "4C · Complete Suppression", "STm04_05": "5 · What We Wish to Protect", "STm04_06": "6 · The Outsider", "STm04_07": "7 · A Rain That Reads the Air", "STm04_08": "8 · An Effort Being Answered", "STm04_09": "9 · Far Side of the Dream", "STm04_10": "10 · Under the Monolith", "STm04_11": "Epílogo · Not Yet Settled", "STm05_00": "Interludio · Secret Deal", "STm05_01": "1 · Unconventional Interview", "STm05_02": "2 · Tawny Nightingale", "STm05_03_a": "3A · Art of Explosion", "STm05_03_b": "3B · The Newbies and Seniors", "STm05_03_c": "3C · Miraculous Grass", "STm05_04": "4 · Connect the Clues", "STm05_05": "5 · A Sandwich of Clues", "STm05_06": "6 · Different Philosophies", "STm05_07": "7 · The Meaning of Rules", "STm05_08": "8 · Myth in the Greenhouse", "STm05_09_a": "Final: Joseph", "STm05_09_b": "9 · The Responsibility of Decision", "STm05_09_c": "Final: Intelligent Plants", "STm05_10": "10 · Headline Moment", "STm05_11": "Epílogo · The Master", "STm06_00": "Interludio · Loyalty and Betrayal", "STm06_01": "1 · The Tale of the Tyrant", "STm06_02_a": "2A · To Bargain with a Tiger", "STm06_02_b": "2B · The Cost of Denial", "STm06_02_c": "2C · The Servant's Servant", "STm06_03_a": "3A · Loyalty Beyond Words", "STm06_03_b": "3B · Midnight Street Racing", "STm06_04_a": "4A · No Turning Back", "STm06_04_b": "4B · Cable Car Station", "STm06_05_a": "Final: The World Lies Still", "STm06_05_b": "5 · The Fall", "STm06_06": "6 · Gen-3 Intelligent Plants", "STm06_07": "7 · A Reluctant Deal", "STm06_08": "8 · Firenze", "STm06_09": "9 · The Battle in Philae I", "STm06_10": "10 · The Battle in Philae Ⅲ", "STm06_11": "11 · A Cornered Beast Fights On", "STm06_12": "12 · Loyalty Until the End", "STm06_13": "13 · An Unknown Tomorrow", "STm06x5_01": "1 · Midnight Letter", "STm06x5_02": "2 · Mysterious Visitor", "STm06x5_03": "3 · Win Win", "STm06x5_04": "4 · A Trip to Old Haunts", "STm06x5_05": "5 · Closing the Net", "STm06x5_06": "6 · The Promise", "STm06x5_07": "7 · The Variable", "STm06x5_08": "8 · A Promise Kept Soon", "STm06x5_09": "9 · The Speech", "STm06x5_10": "10 · Daydream", "STm07_00": "Interludio · Omnisky Aegis", "STm07_01": "1 · History of United Harvest", "STm07_02": "2 · A Deal", "STm07_03": "3 · Bid Day", "STm07_04": "4 · The Offer", "STm07_05_c": "Final: Status Unknown", "STm07_05_a": "5A · Haunting Thoughts", "STm07_05_b": "5B · A Hundred Million", "STm07_06_ba": "Final: From Another World", "STm07_06_bb": "Final: Unfulfilled Promise", "STm07_06_bc": "Final: Redemption of United Harvest", "STm07_06_a": "6 · Fallen Petals", "STm07_07": "7 · Blades Reunited", "STm07_08": "8 · Cannon Fodder Tactic", "STm07_09": "9 · Crossing the Sky", "STm07_12": "12 · Starting Easy", "STm07_10": "10 · Ascending for a Prayer", "STm07_11": "11 · Lies and Hope", "STm07_13": "13 · Mutual Benefit", "STm07_14": "14 · Technical Adjustment", "STm07_15": "15 · Floor 51", "STm07_16": "Epílogo · Scepter of Death", "STm08_01": "1 · Innocent Slaughter", "STm08_02": "2 · At Daggers Drawn", "STm08_03": "3 · Who Am I", "STm08_04": "4 · Self-Fulfilling Trap", "STm08_05": "5 · Companions", "STm08_06": "6 · The End of the World", "STm08_07": "Recuerdo · The Blank Solution Ⅰ", "STm08_08": "Recuerdo · The Blank Solution Ⅱ", "STm08_09": "Recuerdo · The Blank Solution Ⅲ", "STm08_10": "7 · First Encounter with Mirage", "STm08_11": "8 · Rules of the Desert", "STm08_12": "9 · Home Alone", "STm08_13": "10 · Pause", "STm08_14": "11 · Mirage's Daily Routine", "STm08_15": "12 · Shadow Duel", "STm08_16_a": "13A · The White Cat's Past", "STm08_16_b": "13B · The Desert Scorpion's Ambition", "STm08_17_a": "Recuerdo · Happy Birthday Ⅰ", "STm08_18_a": "Recuerdo · Happy Birthday Ⅱ", "STm08_19_a": "Recuerdo · Happy Birthday Ⅲ", "STm08_20": "14A · Sunrise in Mirage", "STm08_17_b": "14B · King of War", "STm08_21": "15A · My Name", "STm08_18_b": "15B · Butterfly Effect", "STm08_19_b": "Final: Mom", "STm09_00_a": "Interludio 1 · Lead-in", "STm09_00_b": "Interludio 2 · Light Up", "STm09_01_a": "1A · Wind Through the Treetops", "STm09_02_a": "2A · A Moment to Breathe", "STm09_03_a": "3A · Ceasefire", "STm09_04_a": "4A · Wise in the Fries", "STm09_05_a": "5A · Noya's Intuition", "STm09_06_a": "6A · The Rain That Never Falls", "STm09_07_a": "Final: Sand Through Fingers", "STm09_01_b": "1B · Foreknowledge", "STm09_02_b": "2B · Changing Sides", "STm09_03_b": "3B · Rain in the Desert", "STm09_04_b": "4B · What Victory Brings", "STm09_05_b": "5B · Backfire", "STm09_06_b": "Final: She at Your Side", "STm09_01_c": "1C · The Bait Is Set", "STm09_02_c": "2C · The Tyrant's Tower", "STm09_03_c": "3C · Where It All Began", "STm09_04_c": "4C · What Endures Unchanged", "STm09_05_c": "Final: A Monolith Too Far", "STm09_01_d": "Final verdadero · Narrow Door", "STev_02_01": "1 · Snowish Festival Messenger", "STev_02_02": "2 · Gift Rush", "STev_02_03": "3 · Trace of the Spirit", "STev_02_04_a": "4A · Red for Passion", "STev_02_04_b": "4B · Gray for Coincidence", "STev_02_04_c": "4C · Blue for the Snow", "STev_02_05": "5 · A Familiar Glimmer", "STev_02_06": "6 · A Wish in Loneliness", "STev_02_07": "7 · The Magic of Friendship", "STev_02_08": "8 · A Bigger World", "STev_02_09": "9 · A Spectacular Entrance", "STev_02_10": "10 · A Dangerous \"Game\"", "STev_02_11": "Epílogo · A Gift for You", "STev_03_01": "1 · Familiar Face in a Million", "STev_03_02": "2 · Among the Folks", "STev_03_03": "3 · Through the Fog", "STev_03_04": "4 · The Bait Is Set", "STev_03_05": "5 · Tough Gains", "STev_03_06": "6 · After the Mystery", "STev_03_07": "7 · Truth Revealed", "STev_03_08": "8 · Years Apart", "STev_03_09": "9 · A World Made New", "STev_04_01": "1 · To the Northern City", "STev_04_02": "2 · The Frozen Ruins", "STev_04_03": "3 · Memories of Home", "STev_04_04": "4 · Ancient Secrets", "STev_04_05": "5 · Night Before Dawn", "STev_04_06": "6 · Malicious Intent", "STev_04_07": "7 · The Archons", "STev_04_08": "8 · Trigger of Dawn", "STev_04_09": "9 · The Burden of Power", "STev_04_10": "10 · Beyond the Storm", "STev_05_01": "1 · Post Haste's Commission", "STev_05_02_a": "2A · Rumor Has It", "STev_05_02_b": "2B · Wise in Letters", "STev_05_02_c": "2C · Following the Old Maps", "STev_05_03": "3 · A Sealed Heart", "STev_05_04": "4 · Letter Thief Encounter", "STev_05_05": "5 · Monsters Did It?", "STev_05_06": "6 · Operation Corn Kernel", "STev_05_07": "7 · A Greeting Transcending Time", "STev_05_08": "8 · To My Dearest You", "STev_07_01": "1 · The Reunion", "STev_07_02": "2 · The Photo Film", "STev_07_03": "3 · The Guardian", "STev_07_04": "4 · A Test Subject", "STev_07_05": "5 · A Friend", "STev_07_06": "6 · The First Time", "STev_07_07": "7 · The Resolve", "STev_07_08": "8 · A Smile", "STev_07_09": "9 · An Ordinary Girl", "STev_08_01": "1 · Energy Crisis", "STev_08_02": "2 · Find the Genius Artisan", "STev_08_03": "3 · The Underground Market", "STev_08_04": "4 · The Mobile Workshop", "STev_08_05": "5 · The Show Begins", "STev_08_06": "6 · Time to Reel Them In", "STev_08_07": "7 · A Narrow Escape", "STev_08_08": "EX · A New Order", "STev_01_01": "1 · Flickering Glow", "STev_01_02": "2 · From the Ghost Ship", "STev_01_03": "3 · Mysteries and Scents", "STev_01_04": "4 · A Lead from the Voice", "STev_01_05": "5 · Seeing is Deceiving", "STev_01_06": "6 · The Look-Alike", "STev_01_07": "7 · Beneath the Shadow", "STev_01_08": "8 · The Land of Echoes", "STev_01_09": "9 · The Origin of Light", "STev_01_10": "10 · The Secret of the Ocean", "STev_01_11": "Epílogo · Never Ending Summer", "STev_09_01": "1 · Expedition: Absence of Power", "STev_09_02": "2 · Cangwu: Proof of Power", "STev_09_03": "3 · Emor: Display of Power", "STev_09_04": "4 · Start: Chaton's Investigation", "STev_09_05": "5 · Infiltration: Into the Dark Nest", "STev_09_06": "6 · Raid: Traps of the Dark Nest", "STev_09_07": "7 · Breakout: The Power Reborn", "STev_09_08": "8 · Cheers: To the Great Chaton", "STev_10_01": "1 · Time for a Vacation!", "STev_10_02": "2 · With Swimsuits & Brooms", "STev_10_03": "3 · Hide-and-Seek on the Beach", "STev_10_04": "4 · Tale of the Vending Artifact", "STev_10_05": "5 · Giant Shadow with Treasure", "STev_10_06": "6 · A Bad Start", "STev_10_07": "7 · Let Me Be Your Hand", "STev_10_08": "8 · The Sun Shines Again", "STev_10_09": "9 · Sunshine and Sea Breeze", "STev_11_01": "1 · Breeze-Delivered Commission", "STev_11_02": "2 · Rocking Dreams on Deck", "STev_11_03": "3 · New Star's Castaway Tale", "STev_11_04": "4 · Phantoms of the Sea", "STev_11_05": "5 · Collector in the Vortex", "STev_11_06": "6 · Conch Shell Scramble", "STev_11_07": "7 · Sea in a Frame", "STev_11_08": "8 · Fractures and Refuge", "STev_11_09": "9 · Summer Goes On", "STev_12_01": "1 · A Tea Party for Young Ladies", "STev_12_02": "2 · Grounded and Humble", "STev_12_03": "3 · Improvement", "STev_12_04": "4 · New Life", "STev_12_05": "5 · Missing", "STev_12_06": "6 · Undercover", "STev_12_07": "7 · Breakout", "STev_12_08": "8 · Night of Honor", "STev_12_09": "9 · A New Dream"});
Object.assign(CAPS,{"STsp_01": ["Nova Times #01 · El frío de la hoja, el calor de tu mano", [["STsp_01_01"], ["STsp_01_02"], ["STsp_01_03"]], [["STsp_01_01", "STsp_01_02"], ["STsp_01_02", "STsp_01_03"]]], "STsp_02": ["Nova Times #02 · Tu nombre, desconocido para mi corazón", [["STsp_02_01"], ["STsp_02_02"], ["STsp_02_03"], ["STsp_02_04"]], [["STsp_02_01", "STsp_02_02"], ["STsp_02_02", "STsp_02_03"], ["STsp_02_03", "STsp_02_04"]]], "STsp_03": ["Nova Times #03 · Mil flores en la noche", [["STsp_03_01"], ["STsp_03_02"], ["STsp_03_03"]], [["STsp_03_01", "STsp_03_02"], ["STsp_03_02", "STsp_03_03"]]], "STsp_04": ["Nova Times #04 · Sueños de matcha", [["STsp_04_01"], ["STsp_04_02"], ["STsp_04_03"]], [["STsp_04_01", "STsp_04_02"], ["STsp_04_02", "STsp_04_03"]]], "STsp_05": ["Nova Times #05 · La veterana y la novata", [["STsp_05_01"], ["STsp_05_02"], ["STsp_05_03"]], [["STsp_05_01", "STsp_05_02"], ["STsp_05_02", "STsp_05_03"]]], "STsp_06": ["Nova Times #06 · Alma de guardia, corazón de caballero", [["STsp_06_01"], ["STsp_06_02"], ["STsp_06_03"]], [["STsp_06_01", "STsp_06_02"], ["STsp_06_02", "STsp_06_03"]]], "STsp_07": ["Nova Times #07 · Deseo en la nieve", [["STsp_07_01"], ["STsp_07_02"], ["STsp_07_03"]], [["STsp_07_01", "STsp_07_02"], ["STsp_07_02", "STsp_07_03"]]], "STsp_08": ["Nova Times #08 · Cautiva de la verdad", [["STsp_08_01"], ["STsp_08_02"], ["STsp_08_03"]], [["STsp_08_01", "STsp_08_02"], ["STsp_08_02", "STsp_08_03"]]], "STsp_09": ["Nova Times #09 · Pareja por un día", [["STsp_09_01"], ["STsp_09_02"], ["STsp_09_03"]], [["STsp_09_01", "STsp_09_02"], ["STsp_09_02", "STsp_09_03"]]], "STsp_10": ["Nova Times #10 · Un día de cosecha", [["STsp_10_01"], ["STsp_10_02"], ["STsp_10_03"]], [["STsp_10_01", "STsp_10_02"], ["STsp_10_02", "STsp_10_03"]]], "STsp_11": ["Nova Times #11 · Deslizándose en la luz del sol", [["STsp_11_01"], ["STsp_11_02"], ["STsp_11_03"]], [["STsp_11_01", "STsp_11_02"], ["STsp_11_02", "STsp_11_03"]]], "STsp_12": ["Nova Times #12 · Tú, en mis ojos", [["STsp_12_01"], ["STsp_12_02"], ["STsp_12_03"], ["STsp_12_04"]], [["STsp_12_01", "STsp_12_02"], ["STsp_12_02", "STsp_12_03"], ["STsp_12_03", "STsp_12_04"]]], "STsp_13": ["Nova Times #13 · La señorita y la criada descarada", [["STsp_13_01"], ["STsp_13_02"], ["STsp_13_03"]], [["STsp_13_01", "STsp_13_02"], ["STsp_13_02", "STsp_13_03"]]], "STsp_14": ["Nova Times #14 · Resonancia más allá de la luz estelar", [["STsp_14_01"], ["STsp_14_02"], ["STsp_14_03"]], [["STsp_14_01", "STsp_14_02"], ["STsp_14_02", "STsp_14_03"]]], "STsp_15": ["Nova Times #15 · Síndrome de dependencia de la ternura", [["STsp_15_01"], ["STsp_15_02"], ["STsp_15_03"]], [["STsp_15_01", "STsp_15_02"], ["STsp_15_02", "STsp_15_03"]]], "STsp_16": ["Nova Times #16 · La vida continúa", [["STsp_16_01"], ["STsp_16_02"], ["STsp_16_03"]], [["STsp_16_01", "STsp_16_02"], ["STsp_16_02", "STsp_16_03"]]], "STsp_17": ["Nova Times #17 · El tesoro más preciado", [["STsp_17_01"], ["STsp_17_02"], ["STsp_17_03"]], [["STsp_17_01", "STsp_17_02"], ["STsp_17_02", "STsp_17_03"]]], "STsp_18": ["Nova Times #18 · Durmiendo donde el otoño se inclina", [["STsp_18_01"], ["STsp_18_02"], ["STsp_18_03"]], [["STsp_18_01", "STsp_18_02"], ["STsp_18_02", "STsp_18_03"]]]});
Object.assign(SIG,{"STsp_01_01": "STsp_01_02", "STsp_01_02": "STsp_01_03", "STsp_02_01": "STsp_02_02", "STsp_02_02": "STsp_02_03", "STsp_02_03": "STsp_02_04", "STsp_03_01": "STsp_03_02", "STsp_03_02": "STsp_03_03", "STsp_04_01": "STsp_04_02", "STsp_04_02": "STsp_04_03", "STsp_05_01": "STsp_05_02", "STsp_05_02": "STsp_05_03", "STsp_06_01": "STsp_06_02", "STsp_06_02": "STsp_06_03", "STsp_07_01": "STsp_07_02", "STsp_07_02": "STsp_07_03", "STsp_08_01": "STsp_08_02", "STsp_08_02": "STsp_08_03", "STsp_09_01": "STsp_09_02", "STsp_09_02": "STsp_09_03", "STsp_10_01": "STsp_10_02", "STsp_10_02": "STsp_10_03", "STsp_11_01": "STsp_11_02", "STsp_11_02": "STsp_11_03", "STsp_12_01": "STsp_12_02", "STsp_12_02": "STsp_12_03", "STsp_12_03": "STsp_12_04", "STsp_13_01": "STsp_13_02", "STsp_13_02": "STsp_13_03", "STsp_14_01": "STsp_14_02", "STsp_14_02": "STsp_14_03", "STsp_15_01": "STsp_15_02", "STsp_15_02": "STsp_15_03", "STsp_16_01": "STsp_16_02", "STsp_16_02": "STsp_16_03", "STsp_17_01": "STsp_17_02", "STsp_17_02": "STsp_17_03", "STsp_18_01": "STsp_18_02", "STsp_18_02": "STsp_18_03"});
Object.assign(NOMB,{"STsp_01_01": "1 · The Chill of the Blade, the Warmth of Your Grip (Part I)", "STsp_01_02": "2 · The Chill of the Blade, the Warmth of Your Grip (Part II)", "STsp_01_03": "3 · The Chill of the Blade, the Warmth of Your Grip (Part III)", "STsp_02_01": "1 · Your Name, Unknown to My Heart (Part I)", "STsp_02_02": "2 · Your Name, Unknown to My Heart (Part II)", "STsp_02_03": "3 · Your Name, Unknown to My Heart (Part III)", "STsp_02_04": "4 · Your Name, Unknown to My Heart (Part IV)", "STsp_03_01": "1 · A Thousand Blossoms by Night (Part I)", "STsp_03_02": "2 · A Thousand Blossoms by Night (Part II)", "STsp_03_03": "3 · A Thousand Blossoms by Night (Part III)", "STsp_04_01": "1 · Matcha Dreaming (Part I)", "STsp_04_02": "2 · Matcha Dreaming (Part II)", "STsp_04_03": "3 · Matcha Dreaming (Part III)", "STsp_05_01": "1 · The Old Timer and the Newcomer (Part I)", "STsp_05_02": "2 · The Old Timer and the Newcomer (Part II)", "STsp_05_03": "3 · The Old Timer and the Newcomer (Part III)", "STsp_06_01": "1 · Soul of a Guard, Heart of a Knight (Part I)", "STsp_06_02": "2 · Soul of a Guard, Heart of a Knight (Part II)", "STsp_06_03": "3 · Soul of a Guard, Heart of a Knight (Part III)", "STsp_07_01": "1 · Wish in the Snow (Part I)", "STsp_07_02": "2 · Wish in the Snow (Part II)", "STsp_07_03": "3 · Wish in the Snow (Part III)", "STsp_08_01": "1 · Captive of Truth (Part I)", "STsp_08_02": "2 · Captive of Truth (PartII)", "STsp_08_03": "3 · Captive of Truth (Part III)", "STsp_09_01": "1 · One-Day Partner (Part I)", "STsp_09_02": "2 · One-Day Partner (Part II)", "STsp_09_03": "3 · One-Day Partner (Part III)", "STsp_10_01": "1 · A Day of Harvest (Part I)", "STsp_10_02": "2 · A Day of Harvest (Part II)", "STsp_10_03": "3 · A Day of Harvest (Part III)", "STsp_11_01": "1 · Slipping into Sunlight (Part I)", "STsp_11_02": "2 · Slipping into Sunlight (Part II)", "STsp_11_03": "3 · Slipping into Sunlight (Part III)", "STsp_12_01": "1 · You, In My Eyes (Part Ⅰ)", "STsp_12_02": "2 · You, In My Eyes (Part Ⅱ)", "STsp_12_03": "3 · You, In My Eyes (Part Ⅲ)", "STsp_12_04": "4 · You, In My Eyes (Part Ⅳ)", "STsp_13_01": "1 · The Missy and the Saucy Maid (Part I)", "STsp_13_02": "2 · The Missy and the Saucy Maid (Part II)", "STsp_13_03": "3 · The Missy and the Saucy Maid (Part III)", "STsp_14_01": "1 · Resonance Beyond the Starlight (Part I)", "STsp_14_02": "2 · Resonance Beyond the Starlight (Part II)", "STsp_14_03": "3 · Resonance Beyond the Starlight (Part III)", "STsp_15_01": "1 · Cuteness Dependency Syndrome (Part I)", "STsp_15_02": "2 · Cuteness Dependency Syndrome (Part II)", "STsp_15_03": "3 · Cuteness Dependency Syndrome (Part III)", "STsp_16_01": "1 · Life Goes On (Part I)", "STsp_16_02": "2 · Life Goes On (Part II)", "STsp_16_03": "3 · Life Goes On (Part III)", "STsp_17_01": "1 · The Most Precious Treasure (Part Ⅰ)", "STsp_17_02": "2 · The Most Precious Treasure (Part Ⅱ)", "STsp_17_03": "3 · The Most Precious Treasure (Part Ⅲ)", "STsp_18_01": "1 · Slumbering Where Autumn Tilts (Part I)", "STsp_18_02": "2 · Slumbering Where Autumn Tilts (Part II)", "STsp_18_03": "3 · Slumbering Where Autumn Tilts (Part III)"});
/* Historias de personaje (CG_<id>_NN): v49 */
Object.assign(CAPS,{"CG_162":["Historia de Firstlight Noya",[["CG_162_01"],["CG_162_02"],["CG_162_03"]],[["CG_162_01","CG_162_02"],["CG_162_02","CG_162_03"]]],"CG_139":["Historia de Allie",[["CG_139_01"],["CG_139_02"],["CG_139_03"]],[["CG_139_01","CG_139_02"],["CG_139_02","CG_139_03"]]],"CG_137":["Historia de Eleanor",[["CG_137_01"],["CG_137_02"],["CG_137_03"]],[["CG_137_01","CG_137_02"],["CG_137_02","CG_137_03"]]],"CG_157":["Historia de Karin",[["CG_157_01"],["CG_157_02"],["CG_157_03"]],[["CG_157_01","CG_157_02"],["CG_157_02","CG_157_03"]]],"CG_160":["Historia de Suntide Willow",[["CG_160_01"],["CG_160_02"],["CG_160_03"]],[["CG_160_01","CG_160_02"],["CG_160_02","CG_160_03"]]],"CG_114":["Historia de Chaton",[["CG_114_01"],["CG_114_02"],["CG_114_03"]],[["CG_114_01","CG_114_02"],["CG_114_02","CG_114_03"]]],"CG_140":["Historia de Sparkla",[["CG_140_01"],["CG_140_02"],["CG_140_03"]],[["CG_140_01","CG_140_02"],["CG_140_02","CG_140_03"]]],"CG_115":["Historia de Firefly",[["CG_115_01"],["CG_115_02"],["CG_115_03"]],[["CG_115_01","CG_115_02"],["CG_115_02","CG_115_03"]]],"CG_145":["Historia de Otoha",[["CG_145_01"],["CG_145_02"],["CG_145_03"]],[["CG_145_01","CG_145_02"],["CG_145_02","CG_145_03"]]],"CG_130":["Historia de Donna",[["CG_130_01"],["CG_130_02"],["CG_130_03"]],[["CG_130_01","CG_130_02"],["CG_130_02","CG_130_03"]]],"CG_143":["Historia de Wraith",[["CG_143_01"],["CG_143_02"],["CG_143_03"]],[["CG_143_01","CG_143_02"],["CG_143_02","CG_143_03"]]],"CG_159":["Historia de Springseek Coronis",[["CG_159_01"],["CG_159_02"],["CG_159_03"]],[["CG_159_01","CG_159_02"],["CG_159_02","CG_159_03"]]],"CG_110":["Historia de Firenze",[["CG_110_01"],["CG_110_02"],["CG_110_03"]],[["CG_110_01","CG_110_02"],["CG_110_02","CG_110_03"]]],"CG_158":["Historia de Snowish Laru",[["CG_158_01"],["CG_158_02"],["CG_158_03"]],[["CG_158_01","CG_158_02"],["CG_158_02","CG_158_03"]]],"CG_133":["Historia de Nazuka",[["CG_133_01"],["CG_133_02"],["CG_133_03"]],[["CG_133_01","CG_133_02"],["CG_133_02","CG_133_03"]]],"CG_134":["Historia de Fuyuka",[["CG_134_01"],["CG_134_02"],["CG_134_03"]],[["CG_134_01","CG_134_02"],["CG_134_02","CG_134_03"]]],"CG_155":["Historia de Shia",[["CG_155_01"],["CG_155_02"],["CG_155_03"]],[["CG_155_01","CG_155_02"],["CG_155_02","CG_155_03"]]],"CG_144":["Historia de Chitose",[["CG_144_01"],["CG_144_02"],["CG_144_03"]],[["CG_144_01","CG_144_02"],["CG_144_02","CG_144_03"]]],"CG_125":["Historia de Freesia",[["CG_125_01"],["CG_125_02"],["CG_125_03"]],[["CG_125_01","CG_125_02"],["CG_125_02","CG_125_03"]]],"CG_141":["Historia de Chixia",[["CG_141_01"],["CG_141_02"],["CG_141_03"]],[["CG_141_01","CG_141_02"],["CG_141_02","CG_141_03"]]],"CG_132":["Historia de Minova",[["CG_132_01"],["CG_132_02"],["CG_132_03"]],[["CG_132_01","CG_132_02"],["CG_132_02","CG_132_03"]]],"CG_149":["Historia de Gerie",[["CG_149_01"],["CG_149_02"],["CG_149_03"]],[["CG_149_01","CG_149_02"],["CG_149_02","CG_149_03"]]],"CG_156":["Historia de Nazuna",[["CG_156_01"],["CG_156_02"],["CG_156_03"]],[["CG_156_01","CG_156_02"],["CG_156_02","CG_156_03"]]],"CG_135":["Historia de Mistique",[["CG_135_01"],["CG_135_02"],["CG_135_03"]],[["CG_135_01","CG_135_02"],["CG_135_02","CG_135_03"]]],"CG_119":["Historia de Nanoha",[["CG_119_01"],["CG_119_02"],["CG_119_03"]],[["CG_119_01","CG_119_02"],["CG_119_02","CG_119_03"]]],"CG_127":["Historia de Teresa",[["CG_127_01"],["CG_127_02"],["CG_127_03"]],[["CG_127_01","CG_127_02"],["CG_127_02","CG_127_03"]]],"CG_113":["Historia de Shimiao",[["CG_113_01"],["CG_113_02"],["CG_113_03"]],[["CG_113_01","CG_113_02"],["CG_113_02","CG_113_03"]]],"CG_111":["Historia de Iris",[["CG_111_01"],["CG_111_02"],["CG_111_03"]],[["CG_111_01","CG_111_02"],["CG_111_02","CG_111_03"]]],"CG_108":["Historia de Kasimira",[["CG_108_01"],["CG_108_02"],["CG_108_03"]],[["CG_108_01","CG_108_02"],["CG_108_02","CG_108_03"]]],"CG_126":["Historia de Flora",[["CG_126_01"],["CG_126_02"],["CG_126_03"]],[["CG_126_01","CG_126_02"],["CG_126_02","CG_126_03"]]],"CG_103":["Historia de Amber",[["CG_103_01"],["CG_103_02"],["CG_103_03"]],[["CG_103_01","CG_103_02"],["CG_103_02","CG_103_03"]]],"CG_117":["Historia de Jinglin",[["CG_117_01"],["CG_117_02"],["CG_117_03"]],[["CG_117_01","CG_117_02"],["CG_117_02","CG_117_03"]]],"CG_107":["Historia de Tilia",[["CG_107_01"],["CG_107_02"],["CG_107_03"]],[["CG_107_01","CG_107_02"],["CG_107_02","CG_107_03"]]],"CG_150":["Historia de Laru",[["CG_150_01"],["CG_150_02"],["CG_150_03"]],[["CG_150_01","CG_150_02"],["CG_150_02","CG_150_03"]]],"CG_116":["Historia de Ridge",[["CG_116_01"],["CG_116_02"],["CG_116_03"]],[["CG_116_01","CG_116_02"],["CG_116_02","CG_116_03"]]],"CG_142":["Historia de Cosette",[["CG_142_01"],["CG_142_02"],["CG_142_03"]],[["CG_142_01","CG_142_02"],["CG_142_02","CG_142_03"]]],"CG_118":["Historia de Coronis",[["CG_118_01"],["CG_118_02"],["CG_118_03"]],[["CG_118_01","CG_118_02"],["CG_118_02","CG_118_03"]]],"CG_147":["Historia de Caramel",[["CG_147_01"],["CG_147_02"],["CG_147_03"]],[["CG_147_01","CG_147_02"],["CG_147_02","CG_147_03"]]],"CG_112":["Historia de Noya",[["CG_112_01"],["CG_112_02"],["CG_112_03"]],[["CG_112_01","CG_112_02"],["CG_112_02","CG_112_03"]]],"CG_120":["Historia de Canace",[["CG_120_01"],["CG_120_02"],["CG_120_03"]],[["CG_120_01","CG_120_02"],["CG_120_02","CG_120_03"]]],"CG_123":["Historia de Ann",[["CG_123_01"],["CG_123_02"],["CG_123_03"]],[["CG_123_01","CG_123_02"],["CG_123_02","CG_123_03"]]]});
Object.assign(SIG,{"CG_162_01":"CG_162_02","CG_162_02":"CG_162_03","CG_139_01":"CG_139_02","CG_139_02":"CG_139_03","CG_137_01":"CG_137_02","CG_137_02":"CG_137_03","CG_157_01":"CG_157_02","CG_157_02":"CG_157_03","CG_160_01":"CG_160_02","CG_160_02":"CG_160_03","CG_114_01":"CG_114_02","CG_114_02":"CG_114_03","CG_140_01":"CG_140_02","CG_140_02":"CG_140_03","CG_115_01":"CG_115_02","CG_115_02":"CG_115_03","CG_145_01":"CG_145_02","CG_145_02":"CG_145_03","CG_130_01":"CG_130_02","CG_130_02":"CG_130_03","CG_143_01":"CG_143_02","CG_143_02":"CG_143_03","CG_159_01":"CG_159_02","CG_159_02":"CG_159_03","CG_110_01":"CG_110_02","CG_110_02":"CG_110_03","CG_158_01":"CG_158_02","CG_158_02":"CG_158_03","CG_133_01":"CG_133_02","CG_133_02":"CG_133_03","CG_134_01":"CG_134_02","CG_134_02":"CG_134_03","CG_155_01":"CG_155_02","CG_155_02":"CG_155_03","CG_144_01":"CG_144_02","CG_144_02":"CG_144_03","CG_125_01":"CG_125_02","CG_125_02":"CG_125_03","CG_141_01":"CG_141_02","CG_141_02":"CG_141_03","CG_132_01":"CG_132_02","CG_132_02":"CG_132_03","CG_149_01":"CG_149_02","CG_149_02":"CG_149_03","CG_156_01":"CG_156_02","CG_156_02":"CG_156_03","CG_135_01":"CG_135_02","CG_135_02":"CG_135_03","CG_119_01":"CG_119_02","CG_119_02":"CG_119_03","CG_127_01":"CG_127_02","CG_127_02":"CG_127_03","CG_113_01":"CG_113_02","CG_113_02":"CG_113_03","CG_111_01":"CG_111_02","CG_111_02":"CG_111_03","CG_108_01":"CG_108_02","CG_108_02":"CG_108_03","CG_126_01":"CG_126_02","CG_126_02":"CG_126_03","CG_103_01":"CG_103_02","CG_103_02":"CG_103_03","CG_117_01":"CG_117_02","CG_117_02":"CG_117_03","CG_107_01":"CG_107_02","CG_107_02":"CG_107_03","CG_150_01":"CG_150_02","CG_150_02":"CG_150_03","CG_116_01":"CG_116_02","CG_116_02":"CG_116_03","CG_142_01":"CG_142_02","CG_142_02":"CG_142_03","CG_118_01":"CG_118_02","CG_118_02":"CG_118_03","CG_147_01":"CG_147_02","CG_147_02":"CG_147_03","CG_112_01":"CG_112_02","CG_112_02":"CG_112_03","CG_120_01":"CG_120_02","CG_120_02":"CG_120_03","CG_123_01":"CG_123_02","CG_123_02":"CG_123_03"});
Object.assign(NOMB,{"CG_162_01":"1 · The Name of Hers (Part I)","CG_162_02":"2 · The Name of Hers (Part II)","CG_162_03":"3 · The Name of Hers (Part III)","CG_139_01":"1 · Make-Believe Wedding (Part I)","CG_139_02":"2 · Make-Believe Wedding (Part II)","CG_139_03":"3 · Make-Believe Wedding (Part III)","CG_137_01":"1 · Something's on Her Mind (Part I)","CG_137_02":"2 · Something's on Her Mind (Part II)","CG_137_03":"3 ·  Something's on Her Mind (Part III)","CG_157_01":"1 · Three-Legged Race (Part Ⅰ)","CG_157_02":"2 · Three-Legged Race (Part Ⅱ)","CG_157_03":"3 · Three-Legged Race (Part Ⅲ)","CG_160_01":"1 · A Hustling Holiday (Part I)","CG_160_02":"2 · A Hustling Holiday (Part II)","CG_160_03":"3 · A Hustling Holiday (Part III)","CG_114_01":"1 · Commission: Tyrant's Trials (Part I)","CG_114_02":"2 · Commission: Tyrant's Trials (Part II)","CG_114_03":"3 · Commission: Tyrant's Trials (Part III)","CG_140_01":"1 · Sparkla's Troubles (Part I)","CG_140_02":"2 · Sparkla's Troubles (Part II)","CG_140_03":"3 · Sparkla's Troubles (Part III)","CG_115_01":"1 · Searching, Searching for a Friend (Part I)","CG_115_02":"2 · Searching, Searching for a Friend (Part II)","CG_115_03":"3 · Searching, Searching for a Friend (Part III)","CG_145_01":"1 · Performer of Myriad Faces (Part I)","CG_145_02":"2 · Performer of Myriad Faces (Part II)","CG_145_03":"3 · Performer of Myriad Faces (Part III)","CG_130_01":"1 · The Different Donna (Part I)","CG_130_02":"2 · The Different Donna (Part II)","CG_130_03":"3 · The Different Donna (Part III)","CG_143_01":"1 · The You I Know (Part I)","CG_143_02":"2 · The You I Know (Part II)","CG_143_03":"3 · The You I Know (Part III)","CG_159_01":"1 · Secret Digestive Recipe (Part I)","CG_159_02":"2 · Secret Digestive Recipe (Part II)","CG_159_03":"3 · Secret Digestive Recipe (Part III)","CG_110_01":"1 · Philae Vacation (Part I)","CG_110_02":"2 · Philae Vacation (Part II)","CG_110_03":"3 · Philae Vacation (Part III)","CG_158_01":"1 · Gifts on Delivery (Part I)","CG_158_02":"2 · Gifts on Delivery (Part II)","CG_158_03":"3 · Gifts on Delivery (Part III)","CG_133_01":"1 · Whispers in the Wind (Part I)","CG_133_02":"2 · Whispers in the Wind (Part II)","CG_133_03":"3 · Whispers in the Wind (Part III)","CG_134_01":"1 · First Snow (Part I)","CG_134_02":"2 · First Snow","CG_134_03":"3 · First Snow (Part III)","CG_155_01":"1 · Trace of Scent (Part I)","CG_155_02":"2 · Trace of Scent (Part II)","CG_155_03":"3 · Trace of Scent (Part III)","CG_144_01":"1 · The Way of Oneness (Part I)","CG_144_02":"2 · The Way of Oneness (Part II)","CG_144_03":"3 · The Way of Oneness (Part III)","CG_125_01":"1 · A Bonding Duel (Part I)","CG_125_02":"2 · A Bonding Duel (Part II)","CG_125_03":"3 · A Bonding Duel (Part III)","CG_141_01":"1 · The Haunted Village (Part I)","CG_141_02":"2 · The Haunted Village (Part II)","CG_141_03":"3 · The Haunted Village (Part III)","CG_132_01":"1 · A Delinquent's Day (Part I)","CG_132_02":"2 · A Delinquent's Day (Part II)","CG_132_03":"3 · A Delinquent's Day (Part III)","CG_149_01":"1 · Collars and Cords (Part I)","CG_149_02":"2 · Collars and Cords (Part II)","CG_149_03":"3 · Collars and Cords (Part III)","CG_156_01":"1 · Small Room, Big Clean-up (Part I)","CG_156_02":"2 · Small Room, Big Clean-up (Part II)","CG_156_03":"3 · Small Room, Big Clean-up (Part III)","CG_135_01":"1 · A Special Report (Part I)","CG_135_02":"2 · A Special Report (Part II)","CG_135_03":"3 · A Special Report (Part III)","CG_119_01":"1 · The Maid's Secret Mission (Part I)","CG_119_02":"2 · The Maid's Secret Mission (Part II)","CG_119_03":"3 · The Maid's Secret Mission (Part III)","CG_127_01":"1 · The Clever Courier Never Gets Hurt (Part I)","CG_127_02":"2 · The Clever Courier Never Gets Hurt (Part II)","CG_127_03":"3 · The Clever Courier Never Gets Hurt (Part III)","CG_113_01":"1 ·  Spice Reveals All (Part I) ","CG_113_02":"2 ·  Spice Reveals All (Part II) ","CG_113_03":"3 ·  Spice Reveals All (Part III) ","CG_111_01":"1 · The Shopping War (Part I)","CG_111_02":"2 · The Shopping War (Part II)","CG_111_03":"3 · The Shopping War (Part III)","CG_108_01":"1 · A Lucky Day (Part 1)","CG_108_02":"2 · A Lucky Day (Part 2)","CG_108_03":"3 · A Lucky Day (Part III)","CG_126_01":"1 · Miss Butterfly (Part I)","CG_126_02":"2 · Miss Butterfly (Part II)","CG_126_03":"3 · Miss Butterfly (Part III)","CG_103_01":"1 · The Lost Kitten (Part I)","CG_103_02":"2 · The Lost Kitten (Part II)","CG_103_03":"3 · The Lost Kitten (Part III)","CG_117_01":"1 · Candy Hidden within the Promise (Part I)","CG_117_02":"2 · Candy Hidden within the Promise (Part I)","CG_117_03":"3 · Candy Hidden within the Promise (Part III)","CG_107_01":"1 · Masked Knight Tilia (Part I)","CG_107_02":"2 · Masked Knight Tilia (Part II)","CG_107_03":"3 · Masked Knight Tilia (Part III)","CG_150_01":"1 · The Great Fry-tastrophe (Part I)","CG_150_02":"2 · The Great Fry-tastrophe (Part II)","CG_150_03":"3 · The Great Fry-tastrophe (Part III)","CG_116_01":"1 · An Atypical Greenhouse (Part I)","CG_116_02":"2 · An Atypical Greenhouse (Part II)","CG_116_03":"3 · An Atypical Greenhouse (Part III)","CG_142_01":"1 · \"Date\" Turmoil (Part I)","CG_142_02":"2 · \"Date\" Turmoil (Part II)","CG_142_03":"3 · \"Date\" Turmoil (Part II)","CG_118_01":"1 · Bones Obsession (Part I)","CG_118_02":"2 · Bones Obsession (Part II)","CG_118_03":"3 · Bones Obsession (Part III)","CG_147_01":"1 · Echo of Hearts and Stars (Part I)","CG_147_02":"2 · Echo of Hearts and Stars (Part II)","CG_147_03":"3 · Echo of Hearts and Stars (Part III)","CG_112_01":"1 · Fast and Focused (Part I)","CG_112_02":"2 · Fast and Focused (Part 2)","CG_112_03":"3 · Fast and Focused (Part III)","CG_120_01":"1 · The Secret After-Class Paper (Part I)","CG_120_02":"2 · The Secret After-Class Paper (Part II)","CG_120_03":"3 · The Secret After-Class Paper (Part III)","CG_123_01":"1 · The Sleepless Little Guardian (Part I)","CG_123_02":"2 · The Sleepless Little Guardian (Part II)","CG_123_03":"3 · The Sleepless Little Guardian (Part III)"});
Object.assign(ALT,{"STm04_02": [["STm04_03_a", "Final alternativo: "], ["STm04_03_c", "Ruta alterna: "]], "STm04_03_b": [["STm04_04_b", "Ruta alterna: "], ["STm04_04_c", "Ruta alterna: "]], "STm04_03_c": [["STm04_04_b", "Ruta alterna: "], ["STm04_04_c", "Ruta alterna: "]], "STm05_02": [["STm05_03_b", "Ruta alterna: "], ["STm05_03_c", "Ruta alterna: "]], "STm05_08": [["STm05_09_a", "Final alternativo: "], ["STm05_09_c", "Final alternativo: "]], "STm06_01": [["STm06_02_b", "Ruta alterna: "], ["STm06_02_c", "Ruta alterna: "]], "STm07_04": [["STm07_05_c", "Final alternativo: "], ["STm07_05_b", "Ruta alterna: "]], "STm07_05_b": [["STm07_06_bb", "Final alternativo: "], ["STm07_06_bc", "Final alternativo: "]], "STm07_08": [["STm07_12", "Ruta alterna: "]], "STm08_15": [["STm08_16_b", "Ruta alterna: "]], "STm09_00_b": [["STm09_01_b", "Ruta alterna: "], ["STm09_01_c", "Ruta alterna: "], ["STm09_01_d", "Ruta alterna: "]], "STev_02_03": [["STev_02_04_b", "Ruta alterna: "], ["STev_02_04_c", "Ruta alterna: "]], "STev_05_01": [["STev_05_02_b", "Ruta alterna: "], ["STev_05_02_c", "Ruta alterna: "]]});
function chOf(id){const p=String(id).split("_");if(p[0]==="CG"&&/^disc/.test(p[1]||""))return"CGD_"+p[1];return p[0]==="STev"||p[0]==="STsp"||p[0]==="CG"?p[0]+"_"+p[1]:p[0]}
function leidos(){try{return JSON.parse(localStorage.getItem("rdr")||"[]")}catch(e){return[]}}
function marcaLeido(id){try{const l=leidos();if(l.indexOf(id)<0){l.push(id);localStorage.setItem("rdr",JSON.stringify(l))}}catch(e){}}
function actos(hold){
  const c=CAPS[chOf(S.id)];if(!c)return;
  let pr=null;try{pr=localStorage.getItem("rdp"+chOf(S.id))}catch(e){}
  const rd=leidos();S.hold=hold?1:0;
  const nodo=t=>{
    if(t[0]==="@"){const q=t.slice(1).split("|"),bt=(CTX[chOf(S.id)]||{})["@"+q[0]];return '<div class="rd-nd bt" data-id="'+esc(t)+'"><b>'+q[0]+' ⚔</b><span>'+esc(bt||q[1])+'</span></div>'}
    const f=t[0]==="!",id=f?t.slice(1):t,n=(NOMB[id]||id).split(" · "),num=n.length>1?n[0]:"",tit=n.length>1?n.slice(1).join(" · "):n[0];
    const cl="rd-nd"+(f?" fin":"")+(rd.indexOf(id)>=0?" leido":"")+(id===pr?" act":"")+(id===S.id&&!hold?" cur":"");
    return '<button class="'+cl+'" data-a="nx" data-n="'+id+'" data-id="'+id+'"><b>'+(f?"El fin":num)+(rd.indexOf(id)>=0?" ✓":"")+'</b><span>'+(f?tit.replace(/^Final: /,""):tit)+'</span></button>'
  };
  let h='<div class="rd-map"><div class="rd-mt"><h2>'+c[0]+'</h2><button class="rd-b" data-a="'+(hold?'x':'ay')+'">'+(hold?'Cerrar':'Volver')+'</button></div>';
  if(hold){const pi=(pr&&NOMB[pr])?pr:c[1][0][0];h+='<button class="rd-b rd-cont" data-a="nx" data-n="'+pi+'">'+((pr&&NOMB[pr])?'Continuar: ':'Empezar: ')+(NOMB[pi]||pi)+'</button>'}
  h+='<div class="rd-ms"><div class="rd-mg">';
  c[1].forEach(col=>{h+='<div class="rd-mc">'+col.map(nodo).join("")+'</div>'});
  h+='<svg class="rd-ml"></svg></div></div></div>';
  card(h);
  requestAnimationFrame(()=>{
    const g=el.querySelector(".rd-mg"),svg=g&&g.querySelector(".rd-ml");if(!g)return;
    const find=t=>{const id=t[0]==="@"?null:t;if(id)return g.querySelector('[data-id="'+id+'"]');
      const nm=t.slice(1).split("|")[1];return[].find.call(g.querySelectorAll(".rd-nd.bt"),x=>x.dataset.id===t||x.textContent.indexOf(nm)>=0)};
    const pos=e=>{let x=0,y=0,o=e;while(o&&o!==g){x+=o.offsetLeft;y+=o.offsetTop;o=o.offsetParent}return{l:x,r:x+e.offsetWidth,m:y+e.offsetHeight/2}};
    svg.setAttribute("width",g.scrollWidth);svg.setAttribute("height",g.scrollHeight);
    let d="";c[2].forEach(k=>{const a=find(k[0]),b=find(k[1]);if(!a||!b)return;const p=pos(a),q=pos(b),mx=(p.r+q.l)/2;
      d+='<path d="M'+p.r+" "+p.m+"C"+mx+" "+p.m+" "+mx+" "+q.m+" "+q.l+" "+q.m+'"/>'});
    svg.innerHTML=d;
    const t=g.querySelector(".act")||g.querySelector(".cur");if(t&&t.scrollIntoView)try{t.scrollIntoView({inline:"center",block:"nearest"})}catch(e){}
  });
}
/* lector-meta.json lo genera generar_lector.py cada dia: capitulos, siguiente acto y botones de historias nuevas (sin tocar este archivo) */
window.__meta=fetch("lector-meta.json",{cache:"no-cache"}).then(r=>r.ok?r.json():null).then(m=>{if(m){Object.assign(CAPS,m.CAPS||{});Object.assign(SIG,m.SIG||{});Object.assign(NOMB,m.NOMB||{});Object.assign(ALT,m.ALT||{})}return m}).catch(()=>null);
/* Marcadores: guardan el acto, cuantas lineas se habian leido y las decisiones tomadas; al retomar se avanza rapido y en silencio hasta ahi */
function bks(){try{return JSON.parse(localStorage.getItem("ssv_bk")||"[]")}catch(e){return[]}}
function guardaBks(l){try{localStorage.setItem("ssv_bk",JSON.stringify(l.slice(0,40)))}catch(e){}}
function aviso(t){const o=document.createElement("div");o.textContent=t;o.style.cssText="position:absolute;top:calc(env(safe-area-inset-top,0px) + 8px);left:50%;transform:translateX(-50%);z-index:30;padding:6px 14px;border-radius:14px;background:rgba(20,16,50,.9);border:1px solid #3a3560;color:#fff;font-size:.8rem;pointer-events:none;transition:opacity .6s";el.appendChild(o);setTimeout(()=>{o.style.opacity=0},1800);setTimeout(()=>o.remove(),2500)}
function marca(){
  if(!S||!S.log.length){aviso("Todavía no hay nada que marcar");return}
  const u=S.log[S.log.length-1],l=bks().filter(b=>!(b.id===S.id&&b.n===S.log.length));
  l.unshift({id:S.id,n:S.log.length,p:(S.picks||[]).slice(),w:u[0],t:String(u[1]).slice(0,90),a:NOMB[S.id]||S.id,c:(CAPS[chOf(S.id)]||[""])[0],f:Date.now()});
  guardaBks(l);aviso("🔖 Marcador guardado");
}
function ffwd(bk){
  if(!S)return;const m0=S.mute;S.mute=1;let pi=0,g=0;const pk=(bk.p||[]).slice();
  while(S&&S.log.length<bk.n&&g++<9000){
    if(S.card){const c=el.querySelector("#rd-c");if(c&&c.querySelector(".rd-log,.rd-map,.rd-end"))break;card(false);avanza();continue}
    if(S.choice){if(pi>=pk.length)break;pick(pk[pi++]);continue}
    avanza();
  }
  if(S){S.mute=m0;if(S.timer)finTipeo()}
}
window.bkLista=bks;
window.bkBorra=function(i){const l=bks();l.splice(i,1);guardaBks(l)};
window.bkShow=function(){
  const r=document.getElementById("bk-root");if(!r)return;
  if(!r._ok){r._ok=1;
    r.addEventListener("click",async e=>{
      const d=e.target.closest("[data-bd]");if(d){window.bkBorra(+d.dataset.bd);window.bkShow();return}
      const g=e.target.closest("[data-bg]");if(g){const b=bks()[+g.dataset.bg];if(b)window.abrirLector(b.id,b)}
    });
  }
  const l=bks();
  const f=t=>new Date(t).toLocaleDateString("es",{day:"numeric",month:"short"});
  r.innerHTML=`<p class="nota" style="margin:2px 2px 10px">Dentro del lector, abre el menú ⚙ y toca “🔖 Marcar aquí” para guardar el punto donde vas. Aquí puedes volver a él.</p>`+(l.length?l.map((b,i)=>`<div class="card" style="margin-bottom:8px"><div style="font-size:.72rem;color:#9a95c4">${esc(b.c||"")} · ${f(b.f)}</div><b style="display:block;margin:2px 0">${esc(b.a||b.id)}</b><div style="font-size:.82rem;color:#cfc8ff;margin-bottom:8px"><i>${esc(b.w||"")}:</i> ${esc(b.t||"")}…</div><div style="display:flex;gap:8px"><button class="btn" data-bg="${i}" style="flex:1">▶ Continuar</button><button class="btn out" data-bd="${i}" aria-label="Borrar">🗑</button></div></div>`).join(""):'<p class="nota">Todavía no tienes marcadores.</p>');
};
window.abrirLector=async function(id,bk){try{await window.__meta}catch(e){}
  build();
  try{const st=document.getElementById("bgm-st");if(st&&document.getElementById("bgmbar").classList.contains("on"))st.click()}catch(e){}
  if(fsOn())await aplicaFs();else{try{if(screen.orientation&&screen.orientation.lock)await screen.orientation.lock("landscape")}catch(e){}}
  let pr=null;try{pr=localStorage.getItem("rdp"+chOf(id))}catch(e){}
  await iniciar(id,null,bk?false:!!CAPS[chOf(id)]);
  if(bk)ffwd(bk);
};
/* precarga: baja los sprites de la historia por adelantado, de 3 en 3, en el orden en que aparecen */
function precarga(steps,tok){if(window.ssvCfg&&ssvCfg("pre")===0)return;
  const u=[],vis=new Set();
  (function rec(a){(a||[]).forEach(s=>{
    if(!Array.isArray(s))return;
    if((s[0]==="show"||s[0]==="ctl"||s[0]==="chd")){
      const id=s[0]==="chd"?s[3]:s[1],pose=s[0]==="chd"?s[4]:s[2],ex=s[0]==="chd"?s[5]:s[3];
      if(id&&ex!=null){const l=spriteList(id,pose||"a",ex);if(l&&!vis.has(l[0])){vis.add(l[0]);u.push(l[0])}}
    }
    s.forEach(v=>{if(Array.isArray(v)&&Array.isArray(v[0]))v.forEach(x=>{if(Array.isArray(x))rec([x])})})
  })})(steps);
  let i=0;const next=()=>{
    if(!S||S.pt!==tok||i>=u.length)return;
    const m=new Image();m.referrerPolicy="no-referrer";m.onload=m.onerror=next;m.src=u[i++]};
  for(let k=0;k<3;k++)next();
}
/* Textos editables (v33): textos/<acto>.txt y textos/<capítulo>.txt. Si existen, reemplazan el texto del guion. */
const CTX={};
function txSlots(a,o){(a||[]).forEach(s=>{const k=s[0];if(k==="intro")o.push([s,1],[s,2],[s,3]);else if(k==="head")o.push([s,1]);else if(k==="say")o.push([s,2]);else if(k==="choice"){s[1].forEach((x,i)=>o.push([s[1],i]));s[2].forEach(b=>txSlots(b,o))}});return o}
async function txGet(u){try{const r=await fetch(u,{cache:"no-cache"});if(!r.ok)return null;return await r.text()}catch(e){return null}}
async function txActo(d){
  const t=await txGet("textos/"+d.id+".txt");if(!t)return;
  const sl=txSlots(d.steps,[]);
  t.split(/\r?\n/).forEach(l=>{
    let m=l.match(/^N:([^|]+?)\s*\|\s?(.*)$/);if(m){const v=m[2].trim();if(v){d.names[m[1].trim()]=v}return}
    m=l.match(/^\s*(\d+)[^|]*\|\s?(.*)$/);if(!m)return;const k=+m[1]-1,v=m[2].replace(/\s+$/,"");
    if(sl[k]&&v)sl[k][0][sl[k][1]]=v;
  });
}
async function txCap(ch){
  if(CTX[ch]||!CAPS[ch])return;CTX[ch]={};
  const t=await txGet("textos/"+ch+".txt");if(!t)return;
  t.split(/\r?\n/).forEach(l=>{const m=l.match(/^\s*(@?[\w]+)\s*\|\s?(.*)$/);if(!m)return;const k=m[1],v=m[2].trim();if(!v)return;
    CTX[ch][k]=v;if(k[0]!=="@"&&NOMB[k]){const n=NOMB[k],i=n.indexOf(" · ");NOMB[k]=/^Final: /.test(n)?"Final: "+v:(i>=0?n.slice(0,i+3)+v:v)}});
}
let AUTO=null;
async function avisoAuto(id){
  try{if(!AUTO){const t=await txGet("textos/_auto.txt");AUTO=(t||"").split(/\r?\n/).map(x=>x.trim()).filter(Boolean)}
    if(!AUTO.includes("textos/"+id+".txt")&&!AUTO.includes("textos/"+chOf(id)+".txt"))return;
    const o=el.querySelector(".rd-auto")||document.createElement("div");o.className="rd-auto";
    o.textContent="Traducción automática, en revisión";
    o.style.cssText="position:absolute;top:calc(env(safe-area-inset-top,0px) + 8px);left:50%;transform:translateX(-50%);z-index:30;padding:5px 12px;border-radius:14px;background:rgba(20,16,50,.85);border:1px solid #3a3560;color:#cfc8ff;font-size:.72rem;pointer-events:none;transition:opacity .6s;opacity:1";
    el.appendChild(o);setTimeout(()=>{o.style.opacity=0},5000);setTimeout(()=>o.remove(),5800)}catch(e){}
}
async function iniciar(id,prev,hold){
  let d;try{const r=await fetch("lector-"+id+".json");if(!r.ok)throw 0;d=await r.json()}catch(e){alert("No se pudo cargar la historia.");return}
  if(d.tx){d.id=d.id||id;await Promise.all([txActo(d),txCap(chOf(id))])}
  let g=1,m=0,zs=1,em=1;try{em=localStorage.getItem("rde")==="0"?0:1;const z=+localStorage.getItem("rdz");if(z)zs=z;const v=localStorage.getItem("rdg");if(v!=null)g=+v;m=+(localStorage.getItem("rdm")||0)}catch(e){}
  if(S&&S.timer){clearInterval(S.timer);clearTimeout(S.wt);clearTimeout(S.at)}
  if(!hold)try{localStorage.setItem("rdp"+chOf(id),id)}catch(e){}
  S={id:id,picks:[],tr:{},u:(window.innerHeight>window.innerWidth?window.innerWidth:window.innerHeight)/100,names:d.names,en:d.en||{},stack:[{a:d.steps,i:0}],pt:Math.random(),chars:{},log:[],g:g,mute:m,zs:zs,em:em,timer:0,card:0,choice:null,vn:0};
  try{const cn=window.cineDe&&window.cineDe(id),bc=el.querySelector('.rd-menu [data-a="cn"]');if(bc){bc.hidden=!cn;if(cn)bc.textContent="🎬 Cinemática: "+cn.t}}catch(e){}
  try{if(window.l2dDisp){const my=S;window.l2dDisp(id,my.en,my.names).then(r=>{if(S!==my)return;S.l2d=r;const b=el&&el.querySelector('.rd-menu [data-a="l2d"]');if(b){b.hidden=!r;if(r)b.textContent="🎞 L2D: "+r.n}})}}catch(e){}
  el.querySelector(".rd-tx").textContent="";el.querySelector(".rd-nm").textContent="";
  el.querySelectorAll(".rd-chars").forEach(c=>c.innerHTML="");el.querySelectorAll(".rd-hd,.rd-memo").forEach(c=>c.remove());el.querySelectorAll(".rd-bgi,.rd-sgi").forEach(e=>{e.style.cssText=""});el.querySelectorAll(".rd-sg").forEach(e=>e.classList.toggle("on",e.dataset.s==="0"));el.querySelector(".rd-film").classList.remove("on");
  el.querySelector(".rd-fxl").innerHTML="";el.querySelector(".rd-cur").style.opacity=0;el.querySelector(".rd-box").style.visibility="";
  S.mc=0;if(prev)S.vp=prev.vp;try{const mv=document.querySelector('meta[name=viewport]');if(mv&&!/viewport-fit/.test(mv.content)){S.vp=mv.content;mv.content=mv.content+",viewport-fit=cover"}}catch(e){}
  btnG();btnM();btnZ();btnE();btnF();try{precarga(d.steps,S.pt);precargaBg(d.steps)}catch(x){}card(false);el.classList.add("on");stopShakes();fit();setTimeout(fit,400);if(hold)actos(true);else avanza();avisoAuto(id);
}
})();
