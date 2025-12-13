// auth-gate.js (ROOT)
// Se include DOAR pe paginile protejate care au flow: waiting / kyc / dashboard
// Necesită: sp-config.js + auth.js încărcate înainte.

(function () {
  "use strict";

  const routes = (window.SUPERPARTY_ROUTES || {
    login: "/login.html",
    waiting: "/waiting-approval.html",
    kyc: "/kyc.html",
    dashboard: "/dashboard.html",
  });

  // "requireAuth" compatibil cu auth.js-ul tău
  if (!window.auth || !auth.isLoggedIn()) {
    window.location.href = routes.login;
    return;
  }

  const user = auth.getUser() || {};
  const status = user.status ? String(user.status).toLowerCase().trim() : "";
  const path = (window.location.pathname || "").toLowerCase();

  const P = {
    waiting: String(routes.waiting || "/waiting-approval.html"),
    kyc: String(routes.kyc || "/kyc.html"),
    dash: String(routes.dashboard || "/dashboard.html"),
  };

  function go(to) {
    const t = String(to || "").toLowerCase();
    if (t && path !== t) window.location.href = to;
  }

  const isPendingAdmin =
    status === "pending_admin" ||
    status === "pending" ||
    status === "awaiting_admin" ||
    status === "waiting_admin";

  const isKycNeeded =
    status === "kyc_required" ||
    status === "kyc_incomplete" ||
    status === "kyc_pending";

  const isOk =
    status === "active" ||
    status === "approved" ||
    status === "ok";

  if (isPendingAdmin) {
    go(P.waiting);
    return;
  }

  if (isKycNeeded) {
    go(P.kyc);
    return;
  }

  if (isOk) {
    if (path === P.waiting.toLowerCase() || path === P.kyc.toLowerCase()) {
      go(P.dash);
    }
    return;
  }

  // fallback status necunoscut
  if (path === P.waiting.toLowerCase() || path === P.kyc.toLowerCase()) {
    go(P.dash);
  }
})();
