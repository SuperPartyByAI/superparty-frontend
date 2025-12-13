// api/bridge.js
// Legacy bridge: /api/bridge?action=...
// Traduce action-uri vechi (?action=...) către Railway API (fără Apps Script).

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(204).end();

  const RAILWAY =
    process.env.RAILWAY_API_URL ||
    "https://superparty-ai-backend-production.up.railway.app";

  const action = String(req.query.action || "").trim();

  async function call(path, { method = "GET", json, headers } = {}) {
    const url = RAILWAY.replace(/\/+$/, "") + path;
    const h = { Accept: "application/json", ...(headers || {}) };

    let body;
    if (json !== undefined) {
      h["Content-Type"] = "application/json";
      body = JSON.stringify(json);
    }

    const r = await fetch(url, { method, headers: h, body });
    const text = await r.text();
    let data;
    try { data = text ? JSON.parse(text) : null; } catch { data = text; }

    return { status: r.status, data };
  }

  try {
    if (action === "ping") {
      return res.status(200).json({ ok: true, bridge: true, railway: RAILWAY });
    }

    if (action === "login") {
      const email = String(req.query.email || "");
      const password = String(req.query.password || "");
      const out = await call("/api/auth/login", { method: "POST", json: { email, password } });
      return res.status(out.status).json(out.data);
    }

    if (action === "register") {
      const name = String(req.query.name || "");
      const email = String(req.query.email || "");
      const phone = String(req.query.phone || "");
      const password = String(req.query.password || "");
      const out = await call("/api/auth/register", {
        method: "POST",
        json: { full_name: name, email, phone, password },
      });
      return res.status(out.status).json(out.data);
    }

    if (action === "completeKYC") {
      // dacă nu ai endpoint în Railway pentru asta, îți va da 404 (și e corect)
      const email = String(req.query.email || "");
      const out = await call("/api/kyc/complete", { method: "POST", json: { email } });
      return res.status(out.status).json(out.data);
    }

    if (action === "getAllUsers") {
      // dacă nu ai endpoint admin în Railway, va da 404/401 (corect)
      const out = await call("/api/admin/users", {
        method: "GET",
        headers: req.headers.authorization ? { Authorization: req.headers.authorization } : undefined,
      });
      return res.status(out.status).json(out.data);
    }

    return res.status(400).json({ error: "Unknown action", action });
  } catch (e) {
    console.error("bridge error:", e);
    return res.status(500).json({ error: "bridge_failed" });
  }
}
