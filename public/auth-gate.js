// public/auth-gate.js
// Se include DOAR pe paginile protejate (waiting / kyc / dashboard).
// Necesită înainte: <script src="/sp-config.js"></script> + <script src="/auth.js"></script>

(function () {
  "use strict";

  const routes = (window.SUPERPARTY_ROUTES || {
    login: "/login.html",
    waiting: "/waiting-approval.html",
    kyc: "/kyc.html",
    dashboard: "/dashboard.html",
  });

  // Require auth (compatibil cu auth.js-ul tău)
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

  // grupuri status (ca să nu se rupă când mai adaugi variante)
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

  // 1) dacă e pending admin -> merge doar pe waiting
  if (isPendingAdmin) {
    go(P.waiting);
    return;
  }

  // 2) dacă trebuie KYC -> merge doar pe kyc
  if (isKycNeeded) {
    go(P.kyc);
    return;
  }

  // 3) dacă e ok -> nu are voie să stea pe waiting/kyc
  if (isOk) {
    if (path === P.waiting.toLowerCase() || path === P.kyc.toLowerCase()) {
      go(P.dash);
    }
    return;
  }

  // fallback: status necunoscut -> trimitem în dashboard
  if (path === P.waiting.toLowerCase() || path === P.kyc.toLowerCase()) {
    go(P.dash);
  }
})();
