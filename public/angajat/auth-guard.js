// =====================================
// SuperParty - Auth Guard (Angajat)
// File: public/angajat/auth-guard.js
// Source of truth: GET /api/auth/me (reads DB; returns tokenUser + fresh token)
//
// Rules:
// - no token/user -> /login.html
// - role admin/gm -> their dashboards
// - users.status:
//    approved     -> OK
//    kyc_required -> /angajat/kyc.html
//    pending      -> /angajat/pending.html
//    rejected     -> /angajat/pending.html?reason=rejected
// =====================================

(function () {
  "use strict";

  const API_BASE = "https://superparty-ai-backend-production.up.railway.app";

  function safeJSONParse(v) {
    try { return JSON.parse(v); } catch { return null; }
  }

  function lower(v, fallback) {
    return (v == null ? fallback : String(v)).toLowerCase();
  }

  function pathNow() {
    return (window.location.pathname || "").toLowerCase();
  }

  function redirect(to) {
    if ((window.location.pathname || "") !== to) window.location.href = to;
  }

  function clearAuth() {
    try { localStorage.removeItem("sp_token"); } catch (e) {}
    try { localStorage.removeItem("sp_user"); } catch (e) {}
  }

  function normalizeUser(u) {
    const user = u || {};
    return {
      id: user.id,
      full_name: user.full_name || user.fullName || "",
      email: user.email || "",
      phone: user.phone || "",
      role: user.role || "angajat",
      status: user.status || "kyc_required",
      updatedAt: Date.now(),
      raw: user
    };
  }

  function applyRouting(u) {
    const role = lower(u.role, "angajat");
    const status = lower(u.status, "kyc_required");

    // Role dashboards
    if (role === "admin") return redirect("/admin/index.html");
    if (role === "gm") return redirect("/gm/index.html");

    // Angajat pages
    const p = pathNow();
    const onKyc = p.includes("/angajat/kyc");
    const onPending = p.includes("/angajat/pending");

    if (status === "approved") {
      if (onKyc || onPending) return redirect("/angajat/");
      return;
    }

    if (status === "kyc_required") {
      if (!onKyc) return redirect("/angajat/kyc.html");
      return;
    }

    if (status === "pending") {
      if (!onPending) return redirect("/angajat/pending.html");
      return;
    }

    if (status === "rejected") {
      if (!onPending) return redirect("/angajat/pending.html?reason=rejected");
      return;
    }

    if (!onPending) return redirect("/angajat/pending.html?status=" + encodeURIComponent(status));
  }

  async function refreshFromMe(token) {
    const r = await fetch(API_BASE + "/api/auth/me", {
      headers: { Authorization: "Bearer " + String(token) }
    });

    const j = await r.json().catch(() => null);
    if (!r.ok || !j || !j.success || !j.tokenUser) {
      throw new Error("ME failed");
    }

    const freshToken = j.token ? String(j.token) : String(token);
    const freshUser = normalizeUser(j.tokenUser);

    try { localStorage.setItem("sp_token", freshToken); } catch (e) {}
    try { localStorage.setItem("sp_user", JSON.stringify(freshUser)); } catch (e) {}

    return freshUser;
  }

  (async function main() {
    const token = localStorage.getItem("sp_token") || "";
    const user = safeJSONParse(localStorage.getItem("sp_user") || "null");

    if (!token || !user || !user.email) {
      clearAuth();
      return redirect("/login.html");
    }

    try {
      const freshUser = await refreshFromMe(token);
      applyRouting(freshUser);
    } catch (e) {
      clearAuth();
      return redirect("/login.html");
    }
  })();
})();
