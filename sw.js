// Service worker: guarda la app para abrirla sin conexión y siempre busca primero la versión nueva.
// Si cambias la lista SHELL, sube también el número de CACHE.
const CACHE = "stella-sora-wiki-v123";
const SHELL = ["./", "index.html", "data.js", "traducciones.js", "historias.js", "lector.js", "cambios.js", "fichas.js","discos.js","teams.js","cumples.js","votos.js","cine.js","votos-config.js","stamina.js","sonidos.js","heartlink.js","ajustes.js","recordatorios.js","ranking.js","galeria.js","l2d.js","visor3d.js","l2d.json","l2d-voces.json","audio-jhon.json","push-config.js","emblemas.json","comunidad-config.js", "manifest.webmanifest", "icon-192.png", "icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE && !/^ssv-(img|mdl)-/.test(k)).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
// Cache de imagenes y modelos 3D de otros sitios (la 1a vez baja, las siguientes salen del telefono al instante).
// Se sirve la copia guardada y en segundo plano se refresca. Limite de entradas para no llenar el telefono.
const IMG = "ssv-img-v1", MDL = "ssv-mdl-v1", MAX_IMG = 700, MAX_MDL = 14;
const esImg = u => u.hostname === "raw.githubusercontent.com" && /\.(webp|png|jpe?g|gif)$/i.test(u.pathname);
const esMdl = u => u.hostname === "cdn.jsdelivr.net" && /StellaSoraModels/.test(u.pathname);
async function recorta(c, max){ const k = await c.keys(); if(k.length > max) await Promise.all(k.slice(0, k.length - max).map(r => c.delete(r))); }
async function externo(e, nombre, max){
  const c = await caches.open(nombre), hit = await c.match(e.request.url);
  const red = fetch(e.request.url, { mode: "cors", credentials: "omit" }).then(res => {
    if(res.ok){ c.put(e.request.url, res.clone()).then(() => recorta(c, max)).catch(() => {}); }
    return res;
  });
  if(hit){ red.catch(() => {}); return hit; }     // copia guardada ya; se refresca en segundo plano
  return red.catch(() => Response.error());
}
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const u = new URL(req.url);
  if (u.origin !== location.origin) {                           // imagenes y modelos de otros sitios
    if (esImg(u)) e.respondWith(externo(e, IMG, MAX_IMG));
    else if (esMdl(u)) e.respondWith(externo(e, MDL, MAX_MDL));
    return;                                                     // el resto: sin tocar
  }
  e.respondWith(
    fetch(req, { cache: "no-cache" })                          // 1º: versión nueva
      .then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return res; })
      .catch(() => caches.match(req).then(m => m || caches.match("index.html")))  // sin internet: copia guardada
  );
});

// Notificaciones push: muestra el aviso y, al tocarlo, abre la app en Novedades.
// Los avisos del Worker (stamina) llegan sin texto: se pide a /msg.
try { importScripts("push-config.js"); } catch (x) {}
const hex = b => [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, "0")).join("");
self.addEventListener("push", e => {
  e.waitUntil((async () => {
    let d = {}; try { if (e.data) d = e.data.json(); } catch (x) {}
    if (!d.title) {
      try {
        const s = await self.registration.pushManager.getSubscription(), W = self.SSV_PUSH && self.SSV_PUSH.worker;
        if (s && W) { const h = hex(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s.endpoint))); d = await (await fetch(W + "/msg?h=" + h)).json(); }
      } catch (x) {}
    }
    await self.registration.showNotification(d.title || "Stella Sora Vita", { body: d.body || (d.title ? "" : "Tienes un aviso nuevo"), icon: "icon-192.png", badge: "icon-192.png", data: { url: d.url || "./#news" } });
  })());
});
self.addEventListener("notificationclick", e => {
  e.notification.close();
  const url = new URL((e.notification.data && e.notification.data.url) || "./", self.registration.scope).href;
  e.waitUntil(clients.matchAll({ type: "window", includeUncontrolled: true }).then(L => {
    for (const c of L) { if ("focus" in c) { c.navigate && c.navigate(url).catch(() => {}); return c.focus(); } }
    return clients.openWindow(url);
  }));
});
