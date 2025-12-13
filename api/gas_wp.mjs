// api/gas_wp.mjs
// Proxy Vercel -> Google Apps Script (fix CORS)
// Endpoint: /api/gas_wp

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
    const url = new URL(GAS_EXEC);

    // Copiem query-ul
    const q = req.query || {};
    for (const k of Object.keys(q)) {
      const v = q[k];
      if (Array.isArray(v)) v.forEach((x) => url.searchParams.append(k, String(x)));
      else if (v !== undefined) url.searchParams.set(k, String(v));
    }

    const method = String(req.method || "GET").toUpperCase();
    const headers = {};

    let body;
    if (method !== "GET" && method !== "HEAD") {
      headers["Content-Type"] = req.headers["content-type"] || "application/json";
      body =
        headers["Content-Type"].includes("application/json")
          ? JSON.stringify(req.body ?? {})
          : (typeof req.body === "string" ? req.body : JSON.stringify(req.body ?? {}));
    }

    const r = await fetch(url.toString(), { method, headers, body });
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
