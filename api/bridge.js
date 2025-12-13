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

  async function readJsonBodySafe(req) {
    // În Next/Vercel, de obicei req.body e deja obiect.
    // Dar păstrăm compatibilitate dacă vine ca string sau dacă e undefined.
    let body = req.body;

    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch {
        body = {};
      }
    }

    if (body && typeof body === "object") return body;

    // Fallback: citește raw body (cazuri rare)
    try {
      let raw = "";
      for await (const chunk of req) raw += chunk;
      if (!raw) return {};
      try {
        return JSON.parse(raw);
      } catch {
        return {};
      }
    } catch {
      return {};
    }
  }

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
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text; // poate fi text/html dacă backend dă eroare
    }

    return { status: r.status, data };
  }

  function sendOut(res, out) {
    if (out && out.data && typeof out.data === "object") {
      return res.status(out.status).json(out.data);
    }
    // dacă e string/null
    return res.status(out.status).send(out?.data ?? "");
  }

  try {
    if (action === "ping") {
      return res.status(200).json({ ok: true, bridge: true, railway: RAILWAY });
    }

    // =========================
    // LOGIN
    // Acceptă:
    // - POST JSON: { email, password }
    // - GET query: ?email=...&password=...
    // =========================
    if (action === "login") {
      const body = await readJsonBodySafe(req);

      const email = String(body.email ?? req.query.email ?? "").trim();
      const password = String(body.password ?? req.query.password ?? "").trim();

      if (!email || !password) {
        return res.status(400).json({ success: false, error: "Missing email/password" });
      }

      const out = await call("/api/auth/login", {
        method: "POST",
        json: { email, password },
      });

      return sendOut(res, out);
    }

    // =========================
    // REGISTER
    // Acceptă:
    // - POST JSON: { full_name/name, email, phone, password }
    // - GET query: ?name=...&email=...&phone=...&password=...
    // =========================
    if (action === "register") {
      const body = await readJsonBodySafe(req);

      const name = String(body.full_name ?? body.name ?? req.query.name ?? "").trim();
      const email = String(body.email ?? req.query.email ?? "").trim();
      const phone = String(body.phone ?? req.query.phone ?? "").trim();
      const password = String(body.password ?? req.query.password ?? "").trim();

      if (!name || !email || !phone || !password) {
        return res.status(400).json({ success: false, error: "Missing register fields" });
      }

      const out = await call("/api/auth/register", {
        method: "POST",
        json: { full_name: name, email, phone, password },
      });

      return sendOut(res, out);
    }

    // =========================
    // COMPLETE KYC
    // Acceptă:
    // - POST JSON: trimite mai departe body (tot)
    // - Forward Authorization: Bearer <token>
    // =========================
    if (action === "completeKYC") {
      const body = await readJsonBodySafe(req);

      const authHeader = req.headers.authorization
        ? { Authorization: req.headers.authorization }
        : undefined;

      // păstrăm endpoint-ul existent din bridge-ul tău
      const out = await call("/api/kyc/complete", {
        method: "POST",
        json: body,
        headers: authHeader,
      });

      return sendOut(res, out);
    }

    // =========================
    // GET ALL USERS (admin)
    // Forward Authorization
    // =========================
    if (action === "getAllUsers") {
      const out = await call("/api/admin/users", {
        method: "GET",
        headers: req.headers.authorization
          ? { Authorization: req.headers.authorization }
          : undefined,
      });

      return sendOut(res, out);
    }

    return res.status(400).json({ error: "Unknown action", action });
  } catch (e) {
    console.error("bridge error:", e);
    return res.status(500).json({ error: "bridge_failed" });
  }
}
