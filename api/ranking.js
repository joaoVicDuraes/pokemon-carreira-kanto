/* Ranking global — função serverless do Vercel (Node).
   Banco: Upstash Redis (Vercel -> Storage -> Upstash for Redis), usado pela API REST, sem dependências.
   Variáveis de ambiente (o Vercel cria sozinho ao conectar o banco ao projeto):
     KV_REST_API_URL + KV_REST_API_TOKEN   ou   UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN

   GET  /api/ranking?region=kanto[&pid=<id>]  -> top 50 da região (+ sua posição, se pid)
   POST /api/ranking  {region, pid, name, badges, elite, legend, day, starter, team:[{s,sh}]}
        -> guarda só a MELHOR carreira de cada jogador por região.

   Proteção contra recorde falso: o jogo roda inteiro no navegador, então não dá pra provar que
   uma carreira foi jogada de verdade. O servidor faz o que dá: recalcula a pontuação a partir das
   insígnias/Elite Four (o cliente não manda pontuação), recusa combinações impossíveis (ex.: Elite
   Four sem as 8 insígnias, campeão em poucos dias), limita envios por IP e limpa o nome. */
"use strict";

const REGIONS = { kanto: 1, johto: 1, hoenn: 1 };
const TOP = 50, KEEP = 500;
const BAD = ["porra", "caralho", "merda", "puta", "buceta", "viado", "fdp", "pqp", "cu", "pau", "foda", "nazi", "hitler"];

function db() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return async (cmds) => {
    const r = await fetch(url.replace(/\/$/, "") + "/pipeline", {
      method: "POST",
      headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
      body: JSON.stringify(cmds),
    });
    if (!r.ok) throw new Error("redis " + r.status);
    const out = await r.json();
    return out.map((x) => { if (x.error) throw new Error(x.error); return x.result; });
  };
}

/* pontuação: 10 por insígnia, 12 por vitória na Liga, +20 campeão, +30 pós-Liga (Red/Steven) */
function scoreOf(e) { return e.badges * 10 + e.elite * 12 + (e.elite >= 5 ? 20 : 0) + (e.legend ? 30 : 0); }
/* ordem: pontuação, depois menos dias na estrada */
function rankKey(e) { return scoreOf(e) * 1000 + (999 - e.day); }
function minDays(e) { return 1 + 3 * e.badges + (e.elite > 0 ? 3 : 0) + (e.legend ? 3 : 0); }

function cleanName(s) {
  s = String(s || "").normalize("NFC").replace(/[^\p{L}\p{N} _.-]/gu, "").replace(/\s+/g, " ").trim().slice(0, 12);
  if (s.length < 2) return null;
  const flat = s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
  if (BAD.some((w) => (w.length <= 3 ? flat === w : flat.includes(w)))) return null;
  return s;
}
const cleanSp = (s) => String(s || "").replace(/[^\p{L}\p{N} .'♀♂:-]/gu, "").slice(0, 16);

function validate(b) {
  const int = (v, lo, hi) => Number.isInteger(v) && v >= lo && v <= hi;
  if (!b || typeof b !== "object") return "corpo inválido";
  if (!REGIONS[b.region]) return "região inválida";
  if (typeof b.pid !== "string" || !/^[a-f0-9]{16,32}$/.test(b.pid)) return "jogador inválido";
  if (!int(b.badges, 0, 8) || !int(b.elite, 0, 5) || !int(b.day, 1, 999)) return "números fora do jogo";
  if (b.elite > 0 && b.badges < 8) return "Liga sem as 8 insígnias";
  if (b.legend && b.elite < 5) return "pós-Liga sem ser campeão";
  if (b.day < minDays(b)) return "dias de menos para chegar até aí";
  if (!Array.isArray(b.team) || b.team.length < 1 || b.team.length > 6) return "time inválido";
  return null;
}

function send(res, code, obj) {
  res.statusCode = code;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(obj));
}

async function readBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") { try { return JSON.parse(req.body); } catch (e) { return null; } }
  let raw = "";
  for await (const ch of req) { raw += ch; if (raw.length > 4000) return null; }
  try { return JSON.parse(raw); } catch (e) { return null; }
}

async function top(run, region, pid) {
  const k = "rank:" + region;
  const cmds = [["ZREVRANGE", k, "0", String(TOP - 1)], ["ZCARD", k]];
  if (pid) cmds.push(["ZREVRANK", k, pid]);
  const [ids, total, mine] = await run(cmds);
  let rows = [];
  if (ids && ids.length) {
    const [vals] = await run([["HMGET", "rankd:" + region, ...ids]]);
    rows = vals.map((v, i) => { try { const o = JSON.parse(v); o.pos = i + 1; o.me = ids[i] === pid; return o; } catch (e) { return null; } }).filter(Boolean);
  }
  let me = null;
  if (pid && mine !== null && mine !== undefined) {
    const [v] = await run([["HGET", "rankd:" + region, pid]]);
    try { me = Object.assign(JSON.parse(v), { pos: mine + 1 }); } catch (e) {}
  }
  return { region, total: total || 0, rows, me };
}

module.exports = async function handler(req, res) {
  const run = db();
  if (!run) return send(res, 503, { error: "not_configured" });
  try {
    if (req.method === "GET") {
      const u = new URL(req.url, "http://x");
      const region = u.searchParams.get("region");
      const pid = u.searchParams.get("pid");
      if (!REGIONS[region]) return send(res, 400, { error: "região inválida" });
      return send(res, 200, await top(run, region, pid && /^[a-f0-9]{16,32}$/.test(pid) ? pid : null));
    }
    if (req.method !== "POST") return send(res, 405, { error: "método" });

    const ip = String(req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "?").split(",")[0].trim();
    const [hits] = await run([["INCR", "rl:" + ip], ["EXPIRE", "rl:" + ip, "600", "NX"]]);
    if (hits > 12) return send(res, 429, { error: "Muitos envios. Tente de novo em alguns minutos." });

    const b = await readBody(req);
    const err = validate(b);
    if (err) return send(res, 400, { error: err });
    const name = cleanName(b.name);
    if (!name) return send(res, 400, { error: "Nome inválido: use de 2 a 12 letras ou números." });

    const e = {
      name, badges: b.badges, elite: b.elite, legend: !!b.legend, day: b.day,
      starter: cleanSp(b.starter),
      team: b.team.slice(0, 6).map((m) => ({ s: cleanSp(m && m.s), sh: !!(m && m.sh) })),
      at: Date.now(),
    };
    e.score = scoreOf(e);
    const k = "rank:" + b.region, key = rankKey(e);
    const [old] = await run([["ZSCORE", k, b.pid]]);
    const better = old === null || old === undefined || key > Number(old);
    if (better) {
      await run([
        ["ZADD", k, String(key), b.pid],
        ["HSET", "rankd:" + b.region, b.pid, JSON.stringify(e)],
      ]);
      /* corta a cauda: guarda só os KEEP melhores */
      const [cut] = await run([["ZRANGE", k, "0", String(-KEEP - 1)]]);
      if (cut && cut.length) await run([["ZREM", k, ...cut], ["HDEL", "rankd:" + b.region, ...cut]]);
    }
    const out = await top(run, b.region, b.pid);
    out.improved = better;
    return send(res, 200, out);
  } catch (ex) {
    return send(res, 500, { error: "Falha no servidor do ranking." });
  }
};

/* exportado para os testes */
module.exports._t = { scoreOf, rankKey, minDays, cleanName, validate };
