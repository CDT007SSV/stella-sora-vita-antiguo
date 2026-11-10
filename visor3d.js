/* Visor 3D de personajes (Three.js). Se descarga solo cuando se pide un modelo. */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const CDN = 'https://cdn.jsdelivr.net/gh/StellaSoraWiki/StellaSoraModels@main/';
let renderer, scene, camera, controls, mixer, clock, raf, currentRoot, pmrem;

function disposeViewer(){
  if(raf) cancelAnimationFrame(raf);
  raf=null; mixer=null;
  if(currentRoot && scene) scene.remove(currentRoot);
  currentRoot=null;
  const el=document.getElementById('mv3d');
  if(el) el.innerHTML='';
  if(renderer){ renderer.dispose(); renderer=null; }
  pmrem=null;
}

function boostColor(c, sat=1.25, contrast=1.15){
  // HSL saturation + lightness contrast around mid-gray
  const hsl = {h:0,s:0,l:0};
  c.getHSL(hsl);
  hsl.s = Math.min(1, hsl.s * sat);
  hsl.l = 0.5 + (hsl.l - 0.5) * contrast;
  hsl.l = Math.max(0, Math.min(1, hsl.l));
  c.setHSL(hsl.h, hsl.s, hsl.l);
}

function fixMaterials(root){
  root.traverse(obj=>{
    if(!obj.isMesh) return;
    // Copias de baja calidad (LOD) del mismo traje/arma: se dibujaban encima y salian manchas grises
    if(/(^|[_\s])lod([_\s]|$)|lod_tl|_lod/i.test(obj.name||'') || /_l$/i.test(obj.name||'') && root.getObjectByName(String(obj.name).replace(/_l$/i,''))){ obj.visible=false; return; }
    obj.castShadow = true;
    obj.frustumCulled = false; // evita que partes desaparezcan al animarse
    obj.receiveShadow = true;
    const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
    mats.forEach(m=>{
      if(!m) return;
      const name = ((m.name||'') + ' ' + (obj.name||'')).toLowerCase();

      const wasBlend = !!m.transparent, wasAT = m.alphaTest || 0;   // estado ORIGINAL (antes de modificar)
      if(/outline|contour|silhouette/.test(name)){ obj.visible = false; return; }
      if(!m.map && /^lit\b/.test((m.name||'').toLowerCase())){ obj.visible = false; return; } // mallas de contorno: ocultas
      if(m.map) m.map.colorSpace = THREE.SRGBColorSpace;
      if(m.emissiveMap) m.emissiveMap.colorSpace = THREE.SRGBColorSpace;

      // Eyes / face: keep vivid, avoid glass treatment
      const isEye = /eye|瞳|hitomi|iris|sclera|eyeball|mat_eye|face_eye/.test(name);
      const isFace = /face|skin|head|body/.test(name) && !/glass|lens/.test(name);
      const isGlass = /glass|lens|crystal|transp|glasses/.test(name) && !isEye;

      if(isGlass){
        m.transparent = true;
        m.depthWrite = false;
        m.opacity = Math.min(m.opacity || 1, 0.4);
        m.side = THREE.DoubleSide;
      } else if(/hair|pelo|bang|strand/.test(name)){
        // Hair: ensure opaque and vivid
        m.transparent = false;
        m.depthWrite = true;
        m.side = THREE.DoubleSide;
        if(m.color) boostColor(m.color, 1.3, 1.25);
      } else if(/face|skin|head|body|cheek|lip|brow/.test(name) && !isEye){
        // Face/skin: force opaque and boost color
        m.transparent = false;
        m.depthWrite = true;
        m.side = THREE.FrontSide;
        if(m.color) boostColor(m.color, 1.2, 1.15);
        if(m.isMeshStandardMaterial){
          m.roughness = Math.min(m.roughness ?? 0.6, 0.65);
          m.metalness = 0;
        }
      } else {
        // Non-glass: force opaque unless author marked alpha
        if(m.opacity >= 0.98) {
          m.transparent = false;
          m.depthWrite = true;
        }
        if(m.isMeshStandardMaterial || m.isMeshPhysicalMaterial){
          // Less washed metalness/roughness
          if(m.metalness > 0.6 && !/metal|weapon|armor|iron|gold/.test(name))
            m.metalness *= 0.5;
          // Slightly glossier eyes
          if(isEye){
            // Force eyes to ignore lighting/environment and use the game emission color
            m.roughness = 1.0;
            m.metalness = 0.0;
            m.envMapIntensity = 0.0;
            m.envMap = null;
            m.lightMapIntensity = 0;
            m.aoMapIntensity = 0;

            let emColor = null;
            try {
              const ud = m.userData || {};
              // Three.js GLTFLoader puts extras directly in userData
              const colors = ud.colors || (ud.extras && ud.extras.colors) || {};
              let ec = colors._EmissionColor || colors.emissionColor;
              if(!ec && ud.extras && ud.extras.colors) ec = ud.extras.colors._EmissionColor;
              if(ec && Array.isArray(ec) && ec.length >= 3 && (ec[0]+ec[1]+ec[2]) > 0.05){
                emColor = new THREE.Color(ec[0], ec[1], ec[2]);
              }
            } catch(e){}

            if(emColor){
              m.color = emColor.clone();
              m.emissive = emColor.clone();
              m.emissiveIntensity = 1.6;
              // Remove texture influence that might be desaturating
              if(m.map && !m.emissiveMap) m.emissiveMap = m.map;
            } else {
              // Strong fallback: make eyes bright and saturated from whatever color they have
              if(m.color){
                const c = m.color.clone();
                const hsl = {h:0,s:0,l:0};
                c.getHSL(hsl);
                hsl.s = Math.min(1, hsl.s * 1.8 + 0.3);
                hsl.l = Math.max(0.45, hsl.l);
                c.setHSL(hsl.h, hsl.s, hsl.l);
                m.color = c;
                m.emissive = c.clone();
                m.emissiveIntensity = 1.4;
              }
            }
            // Force opaque if it was blending in a way that washes color
            if(m.opacity > 0.9){
              m.transparent = false;
              m.depthWrite = true;
            }
          } else if(isFace){
            if(m.color) boostColor(m.color, 1.15, 1.12);
            m.roughness = Math.min(Math.max(m.roughness ?? 0.55, 0.45), 0.7);
          } else {
            if(m.color) boostColor(m.color, 1.22, 1.18);
          }
          if(m.envMapIntensity === undefined) m.envMapIntensity = 0.35;
          else m.envMapIntensity = Math.min(0.5, m.envMapIntensity * 0.6);
        } else if(m.color){
          boostColor(m.color, 1.2, 1.15);
        }
      }

      if(m.alphaTest > 0) m.alphaTest = Math.max(m.alphaTest, 0.35);
      m.side = THREE.DoubleSide;   // antes se forzaba FrontSide: telas/pelo/capas finas desaparecían
      m.needsUpdate = true;

      // Convert to unlit (MeshBasicMaterial) to match wiki shading=unlit
      if(m.isMeshStandardMaterial || m.isMeshPhysicalMaterial){
        const basic = new THREE.MeshBasicMaterial({
          map: m.map || null,
          color: m.color ? m.color.clone() : new THREE.Color(0xffffff),
          // Partes con alfa (pelo, telas, pestañas): recorte limpio en vez de forzarlas opacas
          transparent: isGlass,
          opacity: isGlass ? Math.min(m.opacity || 0.4, 0.45) : 1,
          alphaTest: (!isGlass && (wasAT > 0 || (wasBlend && m.map))) ? Math.max(wasAT, 0.5) : 0,
          side: THREE.DoubleSide,
          depthWrite: !isGlass
        });
        if(m.emissive && (m.emissive.r + m.emissive.g + m.emissive.b) > 0.05){
          basic.color.lerp(m.emissive, 0.55);
        }
        if(Array.isArray(obj.material)){
          const idx = obj.material.indexOf(m);
          if(idx >= 0) obj.material[idx] = basic;
        } else if(obj.material === m){
          obj.material = basic;
        }
      }
    });
  });
}

function stripRootMotion(clip){
  clip.tracks.forEach(t=>{
    if(!t.name.endsWith('.position')) return;
    const node = t.name.slice(0, -'.position'.length);
    if(!/^(root|bip00?1|armature|hips?|pelvis|center)$/i.test(node)) return;
    const v = t.values, x0 = v[0], z0 = v[2];
    for(let i=0;i<v.length;i+=3){ v[i] = x0; v[i+2] = z0; }
  });
  return clip;
}

let clipCache = new Map();
function loadAnimClip(loader, animMeta){
  let p = clipCache.get(animMeta.file);
  if(!p){
    p = loader.loadAsync(CDN + animMeta.file).then(g=>g.animations[0]||null);
    p.catch(()=>clipCache.delete(animMeta.file));   // si falla, que se pueda reintentar
    clipCache.set(animMeta.file, p);
  }
  return p;
}
// Nivel de calidad segun el dispositivo: movil = sin sombras reales ni antialias; gama media/baja = ademas pixel 1 y 30 fps
const MOVIL = matchMedia('(pointer:coarse)').matches;
const GAMA_BAJA = MOVIL && ((navigator.deviceMemory||4) <= 4 || (navigator.hardwareConcurrency||8) <= 6);
// Calidad elegida por la persona (ssv_q3d): auto | bajo | medio | alto
let Q = null, ULT = null;
function calidad(){
  let v='auto'; try{ v=localStorage.getItem('ssv_q3d')||'auto' }catch(e){}
  const d = window.devicePixelRatio || 1;
  if(v==='bajo')  return {aa:false, pr:1, sombra:false, fps30:true,  falsa:true};
  if(v==='medio') return {aa:false, pr:Math.min(d,1.5), sombra:false, fps30:false, falsa:true};
  if(v==='alto')  return {aa:true,  pr:Math.min(d,2.5), sombra:true,  fps30:false, falsa:false, mapa:2048};
  return {aa:!MOVIL, pr:GAMA_BAJA?1:Math.min(d, MOVIL?1.5:2), sombra:!MOVIL, fps30:GAMA_BAJA, falsa:MOVIL};
}
window.recargar3d = function(){ if(ULT) window.loadTrekkerModel(...ULT); };

window.loadTrekkerModel = async function(glbUrl, animsJsonUrl, folder){
  disposeViewer();
  Q = calidad(); ULT = [glbUrl, animsJsonUrl, folder];
  clipCache = new Map();
  const host = document.getElementById('mv3d');
  const status = document.getElementById('mv-status');
  const bar = document.getElementById('anim-bar');
  if(!host) return;
  status.textContent = 'Cargando modelo…';

  const w = host.clientWidth || 320;
  const h = host.clientHeight || 340;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x14121f);

  camera = new THREE.PerspectiveCamera(32, w/h, 0.05, 100);
  camera.position.set(0, 1.15, 2.6);

  renderer = new THREE.WebGLRenderer({antialias:Q.aa, alpha:false, powerPreference:'high-performance'});
  renderer.setPixelRatio(Q.pr);
  renderer.setSize(w, h, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  // Neutral tone mapping keeps albedo closer to original textures
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = Q.sombra;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  host.appendChild(renderer.domElement);

  // Soft neutral environment for some shine without strong cyan tint
  pmrem = new THREE.PMREMGenerator(renderer);
  const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = null;
  scene.environmentIntensity = 0;

  controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0.95, 0);
  controls.enableDamping = true;
  controls.minDistance = 1.1;
  controls.maxDistance = 6;

  // Balanced lights (not overblown)
  scene.add(new THREE.HemisphereLight(0xfff8f0, 0x403848, 0.55));

  const key = new THREE.DirectionalLight(0xffffff, 1.15);
  key.position.set(2.2, 4.5, 2.8);
  key.castShadow = Q.sombra;
  key.shadow.mapSize.set(Q.mapa||1024, Q.mapa||1024);
  key.shadow.camera.near = 0.5;
  key.shadow.camera.far = 20;
  key.shadow.camera.left = -3;
  key.shadow.camera.right = 3;
  key.shadow.camera.top = 3;
  key.shadow.camera.bottom = -3;
  key.shadow.bias = -0.0003;
  scene.add(key);

  const fill = new THREE.DirectionalLight(0xd0dcff, 0.35);
  fill.position.set(-2.8, 1.8, -1.2);
  scene.add(fill);

  const rim = new THREE.DirectionalLight(0xffe8d0, 0.3);
  rim.position.set(0.5, 2.2, -3);
  scene.add(rim);

  let groundMat;
  if(Q.falsa){   // sombra falsa (circulo difuso): casi gratis frente a un mapa de sombras
    const cv=document.createElement('canvas');cv.width=cv.height=128;const cx=cv.getContext('2d'),gr=cx.createRadialGradient(64,64,0,64,64,64);
    gr.addColorStop(0,'rgba(0,0,0,.55)');gr.addColorStop(1,'rgba(0,0,0,0)');cx.fillStyle=gr;cx.fillRect(0,0,128,128);
    groundMat=new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(cv),transparent:true,depthWrite:false});
  } else groundMat=new THREE.ShadowMaterial({ opacity: 0.32 });
  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(Q.falsa ? 0.9 : 2.2, 48),
    groundMat
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  const loader = new GLTFLoader();
  clock = new THREE.Clock();

  // El json de animaciones y el primer clip (Idle) se piden YA, a la vez que el modelo, para no quedar en T-pose esperando
  const animsP = fetch(animsJsonUrl).then(r=>r.ok?r.json():null).catch(()=>null);
  animsP.then(d=>{const cl=(d&&d.clips)||[];const c=cl.find(x=>x.name==='Idle')||cl.find(x=>x.loop)||cl[0];if(c)loadAnimClip(loader,c).catch(()=>{})});
  try {
    const modelGltf = await loader.loadAsync(glbUrl);
    currentRoot = modelGltf.scene;
    fixMaterials(currentRoot);

    currentRoot.updateMatrixWorld(true);
    // Caja REAL del personaje (con el esqueleto aplicado), sin armas: la caja de la geometria en reposo
    // salia mal en algunos modelos (Firenze) y por eso quedaban escalados de mas, flotando y recortados.
    const cajaPrecisa = (filtro)=>{
      const bb = new THREE.Box3();
      currentRoot.traverse(o=>{ if(o.isMesh && o.visible && filtro(o)){ try{ bb.expandByObject(o,true); }catch(e){ bb.expandByObject(o); } } });
      return bb;
    };
    let box = cajaPrecisa(o=>!/sword|weapon|staff|spear|lance|gun|bow|teapot|wand/i.test(o.name||''));
    if(box.isEmpty() || !isFinite(box.getSize(new THREE.Vector3()).y)) box = new THREE.Box3().setFromObject(currentRoot);
    const size = box.getSize(new THREE.Vector3());
    const ref = size.y > Math.max(size.x, size.z) * 0.5 ? size.y : Math.max(size.x, size.y, size.z);
    currentRoot.scale.setScalar(1.8 / (ref || 1));
    currentRoot.updateMatrixWorld(true);
    let box2 = cajaPrecisa(o=>!/sword|weapon|staff|spear|lance|gun|bow|teapot|wand/i.test(o.name||''));
    if(box2.isEmpty()) box2 = new THREE.Box3().setFromObject(currentRoot);
    currentRoot.position.x -= (box2.min.x + box2.max.x) / 2;
    currentRoot.position.z -= (box2.min.z + box2.max.z) / 2;
    currentRoot.position.y -= box2.min.y;
    scene.add(currentRoot);
    currentRoot.visible = false;   // oculto hasta tener la 1ª animacion: asi nunca se ve la T-pose
    currentRoot.updateMatrixWorld(true);

    // Encuadre: que quepa TODO el personaje (antes la cámara lo cortaba)
    const box3 = cajaPrecisa(()=>true);
    const sz = box3.getSize(new THREE.Vector3()), ctr = box3.getCenter(new THREE.Vector3());
    const vf = THREE.MathUtils.degToRad(camera.fov);
    const dist = Math.max((sz.y/2)/Math.tan(vf/2), (Math.max(sz.x, sz.z)/2)/(Math.tan(vf/2)*(w/h))) * 1.2;
    controls.target.set(0, ctr.y, 0);
    camera.position.set(0, ctr.y + sz.y*0.05, dist);
    camera.near = dist/50; camera.far = dist*20; camera.updateProjectionMatrix();
    controls.minDistance = dist*0.35; controls.maxDistance = dist*2.2;
    controls.update();
    const names=[]; currentRoot.traverse(o=>{ if(o.isMesh) names.push(o.name+' ['+[].concat(o.material).map(x=>x&&x.name).join(',')+']'); });
    console.log('Partes del modelo ('+names.length+'):', names);

    mixer = new THREE.AnimationMixer(currentRoot);

    // Reencuadre con la pose animada real (la caja inicial se calcula sin esqueleto y recortaba a Firenze)
    function refit(){
      try{
        if(!currentRoot||!camera||!controls) return;
        currentRoot.updateMatrixWorld(true);
        const bb=new THREE.Box3();
        currentRoot.traverse(o=>{ if(o.isMesh && o.visible){ try{ bb.expandByObject(o,true); }catch(e){ bb.expandByObject(o); } } });
        if(bb.isEmpty()) return;
        const s2=bb.getSize(new THREE.Vector3()), c2=bb.getCenter(new THREE.Vector3());
        if(!isFinite(s2.y)||s2.y<=0) return;
        const vf2=THREE.MathUtils.degToRad(camera.fov);
        const d2=Math.max((s2.y/2)/Math.tan(vf2/2),(Math.max(s2.x,s2.z)/2)/(Math.tan(vf2/2)*(w/h)))*1.1;
        controls.target.set(0,c2.y,0);
        camera.position.set(0,c2.y+s2.y*0.05,d2);
        camera.near=d2/50; camera.far=d2*20; camera.updateProjectionMatrix();
        controls.minDistance=d2*0.35; controls.maxDistance=d2*2.2;
        controls.update();
      }catch(e){ console.warn('refit',e); }
    }
    window.__refit3d=refit;
    [500,1500,3000].forEach(t=>setTimeout(()=>{ if(currentRoot) refit(); },t));

    let clipsMeta = [];
    try { const data = await animsP; clipsMeta = (data && data.clips) || []; } catch(e){}
    const mostrar = ()=>{ if(currentRoot && !currentRoot.visible){ currentRoot.visible = true; try{ mixer.update(0); }catch(e){} refit(); } };
    setTimeout(mostrar, 12000);   // si ninguna animacion llega, se muestra igual (mejor T-pose que nada)

    const want = ['Idle','ReadyLoop','Ready','Attack_P02','Victory','Show'];
    const pick = [];
    for(const wname of want){
      const c = clipsMeta.find(x => x.name === wname);
      if(c) pick.push(c);
    }
    for(const c of clipsMeta){
      if(pick.length >= 6) break;
      if(c.loop && !pick.includes(c) && !/Aim|Start|Tower|Episode|Prologue|Status/i.test(c.name))
        pick.push(c);
    }
    if(!pick.length && clipsMeta[0]) pick.push(clipsMeta[0]);

    async function playClip(meta, btn, intento){
      status.textContent = 'Cargando animación: ' + meta.name + '…';
      try {
        const clip = await loadAnimClip(loader, meta);
        if(!clip){ status.textContent = 'Sin datos de animación'; mostrar(); return; }
        stripRootMotion(clip);
        mixer.stopAllAction();
        const action = mixer.clipAction(clip);
        action.reset();
        action.setLoop(meta.loop ? THREE.LoopRepeat : THREE.LoopOnce, Infinity);
        if(!meta.loop) action.clampWhenFinished = true;
        action.play();
        mixer.update(0);
        mostrar();
        status.textContent = 'Animación: ' + meta.name + (meta.loop ? ' (loop)' : '');
        if(bar){
          bar.querySelectorAll('button').forEach(b=>b.classList.remove('on'));
          if(btn) btn.classList.add('on');
        }
      } catch(err){
        console.warn(err);
        if(!(intento>0)){ setTimeout(()=>playClip(meta, btn, 1), 800); return; }   // 1 reintento
        const sig = pick.find(p=>p!==meta);   // si falla, probar con otra animacion
        if(sig && !currentRoot.visible && !(intento>1)){ playClip(sig, null, 2); return; }
        status.textContent = 'Error animación ' + meta.name; mostrar();
      }
    }

    if(bar){
      bar.innerHTML = '';
      pick.forEach((meta, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.textContent = meta.name.replace(/_/g,' ');
        b.onclick = () => playClip(meta, b);
        bar.appendChild(b);
        if(i===0) playClip(meta, b);
      });
    }

    let acum = 0;
    function tick(){
      raf = requestAnimationFrame(tick);
      const dt = clock.getDelta();
      acum += dt;
      if(Q.fps30 && acum < 1/30) return;   // 30 fps en gama media/baja: la mitad de trabajo
      if(mixer) mixer.update(acum);
      acum = 0;
      controls.update();
      renderer.render(scene, camera);
    }
    tick();
  } catch(err){
    console.error(err);
    status.textContent = (navigator.onLine===false ? 'Sin conexión: el modelo 3D se descarga al abrirlo.' : 'No se pudo cargar el modelo 3D. Usa el enlace de la wiki.');
  }
};
