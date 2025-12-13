// admin-gate.js (ROOT)
// Protejează /admin/*: doar admin are voie aici.

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

  if (role !== "admin" && role !== "superadmin") {
    location.href = routes.angajatHome;
  }
})();
