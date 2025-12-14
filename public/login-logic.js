// =====================================
// SuperParty - Login Logic
// File: public/login-logic.js
// Flow:
// 1) POST /api/auth/login -> token
// 2) GET  /api/auth/me (DB truth) -> tokenUser + fresh token
// 3) Save localStorage: sp_token + sp_user
// 4) Redirect by role/status
// =====================================

(function () {
  "use strict";

  const API_BASE = "https://superparty-ai-backend-production.up.railway.app";

  function qs(sel) { return document.querySelector(sel); }

  function setMsg(text, type) {
    // Optional element ids you may already have in login.html:
    // #msg or #error or #status
    const el = qs("#msg") || qs("#error") || qs("#status");
    if (!el) return;
    el.textContent = text || "";
    el.style.color = (type === "ok") ? "#34d399" : "#fca5a5";
  }

  function safeJSONParse(v) {
    try { return JSON.parse(v); } catch { return null; }
  }

  function clearAuth() {
    try { localStorage.removeItem("sp_token"); } catch (e) {}
    try { localStorage.removeItem("sp_user"); } catch (e) {}
  }

  function normalizeUser(u) {
    const user = u || {};
    const out = {
      id: user.id,
      full_name: user.full_name || user.fullName || "",
      email: user.email || "",
      phone: user.phone || "",
      role: user.role || "angajat",
      status: user.status || "kyc_required",
      updatedAt: Date.now(),
      raw: user
    };
    return out;
  }

  function redirectByUser(u) {
    const role = String(u.role || "angajat").toLowerCase();
    const status = String(u.status || "kyc_required").toLowerCase();

    // Role dashboards
    if (role === "admin") { window.location.href = "/admin/index.html"; return; }
    if (role === "gm") { window.location.href = "/gm/index.html"; return; }

    // Status routing (backend users.status is source of truth)
    if (status === "approved") { window.location.href = "/angajat/"; return; }
    if (status === "kyc_required") { window.location.href = "/angajat/kyc.html"; return; }
    if (status === "pending") { window.location.href = "/angajat/pending.html"; return; }
    if (status === "rejected") { window.location.href = "/angajat/pending.html?reason=rejected"; return; }

    // Fallback
    window.location.href = "/angajat/pending.html?status=" + encodeURIComponent(status);
  }

  async function loginAndRefresh(email, password) {
    // 1) LOGIN -> initial token
    const r1 = await fetch(API_BASE + "/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const j1 = await r1.json().catch(() => null);
    if (!r1.ok || !j1 || !j1.success || !j1.token) {
      const err = (j1 && (j1.error || j1.message)) ? (j1.error || j1.message) : ("Login failed (" + r1.status + ")");
      throw new Error(err);
    }

    // Save temporary token (so /me can be called)
    try { localStorage.setItem("sp_token", String(j1.token)); } catch (e) {}
    try { localStorage.setItem("sp_user", JSON.stringify(normalizeUser(j1.user || {}))); } catch (e) {}

    // 2) ME -> DB truth + fresh token
    const r2 = await fetch(API_BASE + "/api/auth/me", {
      headers: { Authorization: "Bearer " + String(j1.token) }
    });
    const j2 = await r2.json().catch(() => null);

    if (r2.ok && j2 && j2.success && j2.tokenUser) {
      // If backend returns fresh token, prefer it
      const freshToken = j2.token ? String(j2.token) : String(j1.token);
      const freshUser = normalizeUser(j2.tokenUser);

      try { localStorage.setItem("sp_token", freshToken); } catch (e) {}
      try { localStorage.setItem("sp_user", JSON.stringify(freshUser)); } catch (e) {}

      return freshUser;
    }

    // Fallback: if /me failed, use login payload (still works, but may be stale)
    return normalizeUser(j1.user || {});
  }

  async function onSubmit(e) {
    e.preventDefault();

    const emailEl = qs("#email") || qs('input[name="email"]');
    const passEl = qs("#password") || qs('input[name="password"]');

    const email = String(emailEl ? emailEl.value : "").trim().toLowerCase();
    const password = String(passEl ? passEl.value : "");

    if (!email || !password) {
      setMsg("Completează email și parolă.", "bad");
      return;
    }

    setMsg("Se autentifică...", "ok");

    try {
      clearAuth();
      const user = await loginAndRefresh(email, password);
      setMsg("OK. Redirect...", "ok");
      redirectByUser(user);
    } catch (err) {
      clearAuth();
      setMsg(String(err && err.message ? err.message : err), "bad");
    }
  }

  function init() {
    // If you have <form id="loginForm"> this will bind; otherwise it will try first form
    const form = qs("#loginForm") || qs("form");
    if (!form) return;

    form.addEventListener("submit", onSubmit);
  }

  init();
})();
