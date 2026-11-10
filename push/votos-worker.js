// Cloudflare Worker: votos de la comunidad (personajes y discos) para Stella Sora Vita.
// Enlace D1: DB (base de datos "ssv-votos"). Pasos en push/LEEME-votos.txt
const PERMITIDOS = ["https://cdt007ssv.github.io"];
const MAX_POR_DISPOSITIVO = 300;
const TIPOS = ["pj", "ds"];

function cors(req) {
  const o = req.headers.get("Origin") || "";
  return {
    "Access-Control-Allow-Origin": PERMITIDOS.includes(o) ? o : PERMITIDOS[0],
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin",
  };
}
function json(req, obj, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { ...cors(req), "Content-Type": "application/json", "Cache-Control": "no-store" } });
}
const okDev = (d) => typeof d === "string" && /^[0-9a-f]{16,64}$/.test(d);
const okId = (s) => typeof s === "string" && s.length > 0 && s.length <= 60;

export default {
  async fetch(req, env) {
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(req) });
    const url = new URL(req.url);

    if (req.method === "GET" && url.pathname === "/votos") {
      const tot = { pj: {}, ds: {} };
      const rs = await env.DB.prepare("SELECT tipo,id,n FROM totales WHERE n>0").all();
      for (const r of rs.results || []) if (tot[r.tipo]) tot[r.tipo][r.id] = r.n;
      const mios = { pj: [], ds: [] };
      const dev = url.searchParams.get("dev");
      if (okDev(dev)) {
        const m = await env.DB.prepare("SELECT tipo,id FROM votos WHERE dev=?").bind(dev).all();
        for (const r of m.results || []) if (mios[r.tipo]) mios[r.tipo].push(r.id);
      }
      return json(req, { tot, mios });
    }

    if (req.method === "POST" && url.pathname === "/votar") {
      let b;
      try { b = await req.json(); } catch (e) { return json(req, { error: "json" }, 400); }
      if (!okDev(b.dev) || !TIPOS.includes(b.tipo) || !okId(b.id)) return json(req, { error: "datos" }, 400);
      if (b.on) {
        const c = await env.DB.prepare("SELECT COUNT(*) n FROM votos WHERE dev=?").bind(b.dev).first();
        if (c && c.n >= MAX_POR_DISPOSITIVO) return json(req, { error: "limite" }, 429);
        const r = await env.DB.prepare("INSERT OR IGNORE INTO votos(dev,tipo,id) VALUES(?,?,?)").bind(b.dev, b.tipo, b.id).run();
        if (r.meta && r.meta.changes)
          await env.DB.prepare("INSERT INTO totales(tipo,id,n) VALUES(?,?,1) ON CONFLICT(tipo,id) DO UPDATE SET n=n+1").bind(b.tipo, b.id).run();
      } else {
        const r = await env.DB.prepare("DELETE FROM votos WHERE dev=? AND tipo=? AND id=?").bind(b.dev, b.tipo, b.id).run();
        if (r.meta && r.meta.changes)
          await env.DB.prepare("UPDATE totales SET n=MAX(n-1,0) WHERE tipo=? AND id=?").bind(b.tipo, b.id).run();
      }
      const t = await env.DB.prepare("SELECT n FROM totales WHERE tipo=? AND id=?").bind(b.tipo, b.id).first();
      return json(req, { ok: 1, n: t ? t.n : 0 });
    }
    return json(req, { error: "no" }, 404);
  },
};
