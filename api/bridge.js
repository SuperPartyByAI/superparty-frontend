// api/bridge.js
// Legacy "Apps Script style" bridge: /api/bridge?action=...
// Traduce actions în endpoint-uri Railway (fără Apps Script).

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

  // helper: call Railway
  async function call(path, { method = "GET", json, headers } = {}) {
    const url = RAILWAY.replace(/\/+$/, "") + path;
    const h = {
      Accept: "application/json",
      ...(headers || {}),
    };

    let body;
    if (json !== undefined) {
      h["Content-Type"] = "application/json";
      body = JSON.stringify(json);
    }

    const r = await fetch(url, { method, headers: h, body });
    const text = await r.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch { data = text; }

    return { status: r.status, data, contentType: r.headers.get("content-type") || "application/json" };
  }

  // helper: încearcă mai multe rute (ca să nu ghicim exact numele endpoint-ului KYC)
  async function tryMany(paths, payload) {
    for (const p of paths) {
      const out = await call(p, { method: "POST", json: payload });
      // dacă nu e 404/405, ne oprim (înseamnă că ruta există)
      if (out.status !== 404 && out.status !== 405) return out;
    }
    // dacă toate au fost 404/405
    return { status: 404, data: { error: "No matching endpoint on Railway for this action" }, contentType: "application/json" };
  }

  // ACTIONS
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
      const out = await call("/api/auth/register", { method: "POST", json: { full_name: name, email, phone, password } });
      return res.status(out.status).json(out.data);
    }

    if (action === "completeKYC") {
      const email = String(req.query.email || "");
      // Încearcă endpoint-uri tipice; fără să schimbăm backend acum
      const out = await tryMany(
        ["/api/kyc/complete", "/api/kyc/submit", "/api/kyc/completeKYC", "/api/kyc/finish"],
        { email }
      );
      // dacă backend cere token și tu îl trimiți din pagină, îl forwardăm
      // (dacă paginile nu trimit Authorization, backend poate da 401 – corect)
      return res.status(out.status).json(out.data);
    }

    if (action === "getAllUsers") {
      // dacă backend are protecție pe admin, va răspunde 401 (corect)
      // forward Authorization dacă există
      const out = await call("/api/admin/users", {
        method: "GET",
        headers: req.headers.authorization ? { Authorization: req.headers.authorization } : undefined,
      });
      return res.status(out.status).json(out.data);
    }

    // action necunoscut
    return res.status(400).json({ error: "Unknown action", action });
  } catch (e) {
    console.error("bridge error:", e);
    return res.status(500).json({ error: "bridge_failed" });
  }
}
