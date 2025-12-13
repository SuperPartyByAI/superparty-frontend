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

  function trimStr(v) {
    return String(v ?? "").trim();
  }

  async function readRawBody(req) {
    return await new Promise((resolve) => {
      let data = "";
      req.on("data", (chunk) => {
        data += chunk;
        // safety cap ~2MB
        if (data.length > 2 * 1024 * 1024) {
          try {
            req.destroy();
          } catch {}
          resolve("");
        }
      });
      req.on("end", () => resolve(data));
      req.on("error", () => resolve(""));
    });
  }

  async function readBodySafe(req) {
    // 1) dacă framework-ul a parsat deja
    let b = req.body;

    if (Buffer.isBuffer(b)) {
      const s = b.toString("utf8");
      try {
        return s ? JSON.parse(s) : {};
      } catch {
        return {};
      }
    }

    if (typeof b === "string") {
      const s = b.trim();
      if (!s) return {};
      try {
        return JSON.parse(s);
      } catch {
        return {};
      }
    }

    if (b && typeof b === "object") {
      return b; // deja obiect
    }

    // 2) fallback: citește raw body din stream
    const raw = (await readRawBody(req)).trim();
    if (!raw) return {};

    const ct = String(req.headers["content-type"] || "").toLowerCase();

    // JSON
    if (ct.includes("application/json")) {
      try {
        return JSON.parse(raw);
      } catch {
        return {};
      }
    }

    // x-www-form-urlencoded
    if (ct.includes("application/x-www-form-urlencoded")) {
      try {
        const params = new URLSearchParams(raw);
        const obj = {};
        for (const [k, v] of params.entries()) obj[k] = v;
        return obj;
      } catch {
        return {};
      }
    }

    // fallback: încearcă JSON
    try {
      return JSON.parse(raw);
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
      data = text;
    }

    return { status: r.status, data };
  }

  function sendOut(res, out) {
    if (out && out.data && typeof out.data === "object") {
      return res.status(out.status).json(out.data);
    }
    return res.status(out?.status || 200).send(out?.data ?? "");
  }

  try {
    if (action === "ping") {
      return res.status(200).json({ ok: true, bridge: true, railway: RAILWAY });
    }

    // =========================
    // LOGIN
    // Acceptă:
    // - POST JSON body: { email, password }
    // - Query string: ?email=...&password=...
    // =========================
    if (action === "login") {
      const body = await readBodySafe(req);

      const email = trimStr(body.email || req.query.email);
      const password = trimStr(body.password || req.query.password);

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: "Missing email/password",
        });
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
    // - Query: ?name=...&email=...&phone=...&password=...
    // =========================
    if (action === "register") {
      const body = await readBodySafe(req);

      const name = trimStr(body.full_name || body.name || req.query.name);
      const email = trimStr(body.email || req.query.email);
      const phone = trimStr(body.phone || req.query.phone);
      const password = trimStr(body.password || req.query.password);

      if (!name || !email || !phone || !password) {
        return res
          .status(400)
          .json({ success: false, error: "Missing register fields" });
      }

      const out = await call("/api/auth/register", {
        method: "POST",
        json: { full_name: name, email, phone, password },
      });

      return sendOut(res, out);
    }

    // =========================
    // COMPLETE KYC
    // Forwardează tot body-ul + Authorization
    // IMPORTANT: în Railway ruta corectă este /api/kyc/submit
    // =========================
    if (action === "completeKYC") {
      const body = await readBodySafe(req);

      const out = await call("/api/kyc/submit", {
        method: "POST",
        json: body,
        headers: req.headers.authorization
          ? { Authorization: req.headers.authorization }
          : undefined,
      });

      return sendOut(res, out);
    }

    // =========================
    // GET ALL USERS (admin)
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
