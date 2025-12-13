// kyc-gate.js (ROOT)
// Protejează /angajat/kyc/*: trebuie logat; admin -> admin; dacă e complet -> angajat home.

(function () {
  "use strict";

  const routes = (window.SUPERPARTY_ROUTES || {
    login: "/login.html",
    admin: "/admin/index.html",
    angajatHome: "/angajat/index.html",
    angajatKyc: "/angajat/kyc/index.html",
  });

  if (!window.auth || !auth.isLoggedIn()) {
    location.href = routes.login;
    return;
  }

  const u = auth.getUser() || {};
  const role = String(u.role || "").toLowerCase();

  // admin nu are ce căuta în KYC angajat
  if (role === "admin" || role === "superadmin") {
    location.href = routes.admin;
    return;
  }

  const status = String(u.status || "").toLowerCase();
  const kyc = String(u.kyc_status || "").toLowerCase();
  const contract = String(u.contract_signed || "").toLowerCase();

  const ok = (status === "active" && kyc === "approved" && contract === "signed");
  if (ok) {
    location.href = routes.angajatHome;
  }
})();
