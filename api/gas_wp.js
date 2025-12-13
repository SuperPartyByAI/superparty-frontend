// api/gas_wp.js
// Vercel Function (Web Standard) -> Google Apps Script (fix CORS)
// Endpoint: /api/gas_wp

export default {
  async fetch(request) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const GAS_EXEC =
      process.env.GAS_WP_URL ||
      "https://script.google.com/macros/s/AKfycbwpScVyziDaoVeuxcqdBQ3qx6j-QHy5FYoWtvlqMSsu15eXGI_l5fmo1Bg8zqP1BLyJ/exec";

    try {
      const inUrl = new URL(request.url);
      const outUrl = new URL(GAS_EXEC);

      // copiem query-ul către Apps Script
      inUrl.searchParams.forEach((v, k) => outUrl.searchParams.append(k, v));

      const method = request.method.toUpperCase();

      // forward body pentru non-GET
      let body = undefined;
      const headers = new Headers();

      if (method !== "GET" && method !== "HEAD") {
        const ct = request.headers.get("content-type") || "application/json";
        headers.set("content-type", ct);
        body = await request.text();
      }

      const r = await fetch(outUrl.toString(), { method, headers, body });

      const respHeaders = new Headers(corsHeaders);
      const ct = r.headers.get("content-type") || "application/json";
      respHeaders.set("content-type", ct);

      const text = await r.text();
      return new Response(text, { status: r.status, headers: respHeaders });
    } catch (e) {
      const respHeaders = new Headers(corsHeaders);
      respHeaders.set("content-type", "application/json");
      return new Response(JSON.stringify({ error: "gas_wp_proxy_failed" }), {
        status: 500,
        headers: respHeaders,
      });
    }
  },
};
