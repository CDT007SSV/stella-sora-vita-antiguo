// Cloudflare Worker: guarda las suscripciones push (en KV "SUBS") y las entrega solo a GitHub Actions.
// Variables: ADMIN_TOKEN (secreto, el mismo que el secreto PUSH_ADMIN de GitHub). Enlace KV: SUBS.
const OK = ["https://cdt007ssv.github.io", "http://localhost:8765"];
const cors = o => ({ "Access-Control-Allow-Origin": OK.includes(o) ? o : OK[0], "Access-Control-Allow-Headers": "Content-Type, Authorization", "Access-Control-Allow-Methods": "GET,POST,OPTIONS", "Vary": "Origin" });
const json = (d, s, o) => new Response(JSON.stringify(d), { status: s || 200, headers: { "Content-Type": "application/json", ...cors(o) } });
async function hid(s) { const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)); return [...new Uint8Array(d)].map(b => b.toString(16).padStart(2, "0")).join(""); }
function admin(req, env) { const a = req.headers.get("Authorization") || ""; return !!env.ADMIN_TOKEN && a === "Bearer " + env.ADMIN_TOKEN; }

// ---- Envio de avisos desde el propio Worker (cron cada minuto). Push sin contenido cifrado: el telefono pide el texto a /msg ----
const b64u = b => btoa(String.fromCharCode(...new Uint8Array(b))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const enc = o => b64u(new TextEncoder().encode(JSON.stringify(o)));
async function vapid(endpoint, env) {
  const key = await crypto.subtle.importKey("jwk", JSON.parse(env.VAPID_JWK), { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]);
  const head = enc({ typ: "JWT", alg: "ES256" }) + "." + enc({ aud: new URL(endpoint).origin, exp: Math.floor(Date.now() / 1000) + 12 * 3600, sub: "mailto:noreply@example.com" });
  const sig = await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, key, new TextEncoder().encode(head));
  return "vapid t=" + head + "." + b64u(sig) + ", k=" + env.VAPID_PUB;
}
async function avisar(endpoint, env) {
  const r = await fetch(endpoint, { method: "POST", headers: { Authorization: await vapid(endpoint, env), TTL: "3600", Urgency: "high" } });
  return r.status;
}
async function cron(env) {
  if (!env.VAPID_JWK || !env.VAPID_PUB) return;
  const now = Date.now(); let cursor;
  do {
    const r = await env.SUBS.list({ prefix: "t:", cursor });
    for (const k of r.keys) {
      const v = await env.SUBS.get(k.name); if (!v) continue;
      const t = JSON.parse(v); if (t.at > now) continue;
      const h = k.name.split(":")[1];
      const q = JSON.parse((await env.SUBS.get("m:" + h)) || "[]"); q.push({ title: t.title, body: t.body, url: t.url });
      await env.SUBS.put("m:" + h, JSON.stringify(q.slice(-10)), { expirationTtl: 3600 });
      let st = 0; try { st = await avisar(t.sub.endpoint, env); } catch (e) {}
      if (st === 404 || st === 410) { await env.SUBS.delete(h); }
      await env.SUBS.delete(k.name);
    }
    cursor = r.list_complete ? null : r.cursor;
  } while (cursor);
}
export default {
  async scheduled(ev, env, ctx) { ctx.waitUntil(cron(env)); },
  async fetch(req, env) {
    const o = req.headers.get("Origin") || "", u = new URL(req.url);
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(o) });
    try {
      if (u.pathname === "/sub" && req.method === "POST") {
        if (!OK.includes(o)) return json({ error: "origen" }, 403, o);
        const s = await req.json();
        if (!s || typeof s.endpoint !== "string" || !/^https:\/\//.test(s.endpoint) || s.endpoint.length > 600 || !s.keys || typeof s.keys.p256dh !== "string" || typeof s.keys.auth !== "string") return json({ error: "datos" }, 400, o);
        await env.SUBS.put(await hid(s.endpoint), JSON.stringify({ endpoint: s.endpoint, keys: { p256dh: s.keys.p256dh, auth: s.keys.auth } }));
        return json({ ok: 1 }, 200, o);
      }
      if (u.pathname === "/unsub" && req.method === "POST") {
        const s = await req.json();
        if (s && typeof s.endpoint === "string") { const h = await hid(s.endpoint); await env.SUBS.delete(h); await env.SUBS.delete("t:" + h + ":stamina");  /* los demas avisos caducan solos */ }
        return json({ ok: 1 }, 200, o);
      }
      if (u.pathname === "/timer" && req.method === "POST") {      // aviso programado (p. ej. stamina llena)
        if (!OK.includes(o)) return json({ error: "origen" }, 403, o);
        const b = await req.json(), sb = b && b.sub, now = Date.now();
        if (!sb || typeof sb.endpoint !== "string" || !/^https:\/\//.test(sb.endpoint) || sb.endpoint.length > 600 || !sb.keys || typeof sb.keys.p256dh !== "string" || typeof sb.keys.auth !== "string") return json({ error: "datos" }, 400, o);
        if (typeof b.kind !== "string" || !/^[a-z0-9]{1,16}$/.test(b.kind) || typeof b.at !== "number" || b.at < now - 60000 || b.at > now + 45 * 864e5) return json({ error: "datos" }, 400, o);
        const t = { sub: { endpoint: sb.endpoint, keys: { p256dh: sb.keys.p256dh, auth: sb.keys.auth } }, at: b.at, title: String(b.title || "").slice(0, 80), body: String(b.body || "").slice(0, 160), url: String(b.url || "").slice(0, 20) };
        await env.SUBS.put("t:" + await hid(sb.endpoint) + ":" + b.kind, JSON.stringify(t), { expirationTtl: 50 * 86400 });
        return json({ ok: 1 }, 200, o);
      }
      if (u.pathname === "/msg" && req.method === "GET") {      // el telefono pide el texto del aviso (se borra al leerlo)
        const h = u.searchParams.get("h") || "";
        if (!/^[0-9a-f]{64}$/.test(h)) return json({}, 200, o);
        const q = JSON.parse((await env.SUBS.get("m:" + h)) || "[]"), m = q.shift();
        if (q.length) await env.SUBS.put("m:" + h, JSON.stringify(q), { expirationTtl: 3600 }); else await env.SUBS.delete("m:" + h);
        return json(m || {}, 200, o);
      }
      if (u.pathname === "/cancel" && req.method === "POST") {
        const b = await req.json();
        if (b && typeof b.endpoint === "string" && typeof b.kind === "string" && /^[a-z0-9]{1,16}$/.test(b.kind)) await env.SUBS.delete("t:" + await hid(b.endpoint) + ":" + b.kind);
        return json({ ok: 1 }, 200, o);
      }
      if (u.pathname === "/due" && req.method === "GET") {
        if (!admin(req, env)) return json({ error: "no" }, 401, o);
        const out = [], now = Date.now(); let cursor;
        do { const r = await env.SUBS.list({ prefix: "t:", cursor }); for (const k of r.keys) { const v = await env.SUBS.get(k.name); if (!v) continue; const t = JSON.parse(v); if (t.at <= now) out.push({ id: k.name, ...t }); } cursor = r.list_complete ? null : r.cursor; } while (cursor);
        return json(out, 200, o);
      }
      if (u.pathname === "/done" && req.method === "POST") {
        if (!admin(req, env)) return json({ error: "no" }, 401, o);
        const b = await req.json();
        for (const id of (b.ids || [])) if (typeof id === "string" && id.startsWith("t:")) await env.SUBS.delete(id);
        return json({ ok: 1 }, 200, o);
      }
      if (u.pathname === "/list" && req.method === "GET") {
        if (!admin(req, env)) return json({ error: "no" }, 401, o);
        const out = []; let cursor;
        do { const r = await env.SUBS.list({ cursor }); for (const k of r.keys) { if (k.name.startsWith("t:") || k.name.startsWith("m:")) continue; const v = await env.SUBS.get(k.name); if (v) out.push(JSON.parse(v)); } cursor = r.list_complete ? null : r.cursor; } while (cursor);
        return json(out, 200, o);
      }
      if (u.pathname === "/gone" && req.method === "POST") {
        if (!admin(req, env)) return json({ error: "no" }, 401, o);
        const b = await req.json();
        for (const e of (b.endpoints || [])) await env.SUBS.delete(await hid(e));
        return json({ ok: 1 }, 200, o);
      }
      return json({ ok: 1, servicio: "ssv-push" }, 200, o);
    } catch (e) { return json({ error: "fallo" }, 500, o); }
  }
};
