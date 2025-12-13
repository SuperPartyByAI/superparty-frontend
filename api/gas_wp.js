// api/gas_wp.js
// Vercel Serverless Function -> Google Apps Script (fix CORS)
// URL: /api/gas_wp?action=...

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  const GAS_EXEC =
    process.env.GAS_WP_URL ||
    "https://script.google.com/macros/s/AKfycbwpScVyziDaoVeuxcqdBQ3qx6j-QHy5FYoWtvlqMSsu15eXGI_l5fmo1Bg8zqP1BLyJ/exec";

  try {
    const outUrl = new URL(GAS_EXEC);

    // Copiem query-ul către Apps Script
    for (const [k, v] of Object.entries(req.query || {})) {
      if (Array.isArray(v)) v.forEach((x) => outUrl.searchParams.append(k, String(x)));
      else if (v !== undefined) outUrl.searchParams.set(k, String(v));
    }

    const method = String(req.method || "GET").toUpperCase();

    const headers = {};
    let body;

    if (method !== "GET" && method !== "HEAD") {
      headers["Content-Type"] = req.headers["content-type"] || "application/json";
      body = headers["Content-Type"].includes("application/json")
        ? JSON.stringify(req.body ?? {})
        : (typeof req.body === "string" ? req.body : JSON.stringify(req.body ?? {}));
    }

    const r = await fetch(outUrl.toString(), { method, headers, body });
    const ct = r.headers.get("content-type") || "application/json";
    const text = await r.text();

    res.status(r.status);
    res.setHeader("Content-Type", ct);
    res.send(text);
  } catch (e) {
    console.error("gas_wp proxy error:", e);
    res.status(500).json({ error: "gas_wp_proxy_failed" });
  }
}
