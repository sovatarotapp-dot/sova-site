// POST /api/waitlist — saves a launch-waitlist email to Supabase.
// Env vars (set in Vercel → Settings → Environment Variables):
//   SUPABASE_URL                 e.g. https://xxxx.supabase.co
//   SUPABASE_SERVICE_ROLE_KEY    secret key — server only, never in browser code
// (SUPABASE_SECRET_KEY / NEXT_PUBLIC_SUPABASE_URL are accepted as fallbacks.)

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const WINDOW_MS = 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map(); // best-effort per-instance rate limit

function tooMany(ip) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 5000) hits.clear();
  return list.length > MAX_PER_WINDOW;
}

function send(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

async function readBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") {
    try { return JSON.parse(req.body); } catch { return {}; }
  }
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 10_000) break;
    chunks.push(chunk);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}"); } catch { return {}; }
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return send(res, 405, { error: "method_not_allowed" });
  }

  const ip = String(req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "unknown").split(",")[0].trim();
  if (tooMany(ip)) return send(res, 429, { error: "rate_limited" });

  const body = (await readBody(req)) || {};

  // Honeypot: real people never fill the hidden "website" field.
  if (body.website) return send(res, 200, { ok: true });

  const email = String(body.email || "").trim().toLowerCase();
  if (!EMAIL_RE.test(email) || email.length > 254) return send(res, 400, { error: "invalid_email" });
  if (body.consent !== true) return send(res, 400, { error: "consent_required" });

  const source = String(body.source || "").slice(0, 200) || null;

  const url = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/+$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || "";
  if (!url || !key) {
    console.error("waitlist: Supabase env vars are missing");
    return send(res, 503, { error: "not_configured" });
  }

  const headers = {
    apikey: key,
    "Content-Type": "application/json",
    Prefer: "resolution=ignore-duplicates,return=minimal",
  };
  // Legacy service_role keys are JWTs and also go in Authorization; new sb_secret_ keys go in apikey only.
  if (key.startsWith("eyJ")) headers.Authorization = `Bearer ${key}`;

  try {
    const r = await fetch(`${url}/rest/v1/waitlist?on_conflict=email`, {
      method: "POST",
      headers,
      body: JSON.stringify({ email, source, consent_at: new Date().toISOString() }),
    });
    if (!r.ok) {
      const text = await r.text().catch(() => "");
      console.error("waitlist: Supabase insert failed", r.status, text.slice(0, 300));
      return send(res, 502, { error: "save_failed" });
    }
  } catch (err) {
    console.error("waitlist: Supabase request error", err && err.message);
    return send(res, 502, { error: "save_failed" });
  }

  return send(res, 200, { ok: true });
};
