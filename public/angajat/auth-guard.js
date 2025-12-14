// =====================================
// SuperParty - Auth Guard (Angajat)
// File: public/angajat/auth-guard.js
//
// Source of truth:
// - token: localStorage sp_token
// - live user: GET /api/auth/me (reads DB; returns tokenUser + fresh token)
//
// Redirect rules:
// - Not logged in / invalid token -> /login.html
// - role admin/gm -> their dashboards
// - users.status:
//    - kyc_required -> /angajat/kyc.html
//    - pending      -> /angajat/pending.html
//    - rejected     -> /angajat/pending.html?reason=rejected
//    - approved     -> allow
// =====================================

(function () {
  "use strict";

  const API_BASE = "https://superparty-ai-backend-production.up.railway.app";

  const LOGIN_URL = "/login.html";
  const KYC_URL = "/angajat/kyc.html";
  const PENDING_URL = "/angajat/pending.html";

  function safeJSONParse(v) {
    try { return JSON.parse(v); } catch { return null; }
  }

  function lower(v, fallback) {
    return (v == null ? fallback : String(v)).toLowerCase();
  }

  function currentPath() {
    return (window.location.pathname || "").toLowerCase();
  }

  function clearAuth() {
    try { localStorage.removeItem("sp_token"); } catch (_) {}
    try { localStorage.removeItem("sp_user"); } catch (_) {}
  }

  function redirect(to) {
    if ((window.location.pathname || "") !== to) window.location.replace(to);
  }

  async function fetchMe(token) {
    const r = await fetch(API_BASE + "/api/auth/me", {
      method: "GET",
      headers: { Authorization: "Bearer " + token },
      cache: "no-store",
    });

    if (!r.ok) return null;

    const j = await r.json().catch(() => null);
    if (!j || !j.success || !j.tokenUser) return null;

    // rescriem localStorage cu ce spune backend-ul (DB truth)
    try { localStorage.setItem("sp_user", JSON.stringify(j.tokenUser)); } catch (_) {}
    if (j.token) {
      try { localStorage.setItem("sp_token", String(j.token)); } catch (_) {}
    }

    return j.tokenUser;
  }

  (async function main() {
    const p = currentPath();
    const isKycPage = p.includes("/angajat/kyc");
    const isPendingPage = p.includes("/angajat/pending");

    const token = String(localStorage.getItem("sp_token") || "");
    const rawUser = String(localStorage.getItem("sp_user") || "");

    // 1) Must have local token + user (fast fail)
    if (!token || !rawUser) {
      clearAuth();
      return redirect(LOGIN_URL);
    }

    const cached = safeJSONParse(rawUser);
    if (!cached || !cached.email) {
      clearAuth();
      return redirect(LOGIN_URL);
    }

    // 2) Source of truth: /api/auth/me (DB status + fresh token)
    const liveUser = await fetchMe(token);
    if (!liveUser) {
      clearAuth();
      return redirect(LOGIN_URL);
    }

    // 3) Role routing (admin/gm)
    const role = lower(liveUser.role, "angajat");
    if (role === "admin") return redirect("/admin/index.html");
    if (role === "gm") return redirect("/gm/index.html");

    // 4) Angajat gate by users.status ONLY
    const status = lower(liveUser.status, "kyc_required");

    if (status === "kyc_required" && !isKycPage) {
      return redirect(KYC_URL + "?from=guard&status=" + encodeURIComponent(status));
    }

    if (status === "pending" && !isPendingPage) {
      return redirect(PENDING_URL);
    }

    if (status === "rejected" && !isPendingPage) {
      return redirect(PENDING_URL + "?reason=rejected");
    }

    // allow only approved
    if (status !== "approved") {
      if (!isPendingPage) return redirect(PENDING_URL + "?status=" + encodeURIComponent(status));
    }

    // OK -> allow page load
  })().catch(function () {
    clearAuth();
    redirect(LOGIN_URL);
  });
})();
