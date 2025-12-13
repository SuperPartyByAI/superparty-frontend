// gm-gate.js (ROOT)
// Protejează /gm/*: doar GM sau Admin are voie. Logout corect prin auth.js.

(function () {
  "use strict";

  const LOGIN_URL = "/login.html";

  if (!window.auth || !auth.isLoggedIn()) {
    location.href = LOGIN_URL;
    return;
  }

  const u = auth.getUser() || {};
  const role = String(u.role || "").toLowerCase();

  if (role !== "gm" && role !== "admin" && role !== "superadmin") {
    alert("Acces interzis! Doar GM sau Admin poate intra.");
    location.href = LOGIN_URL;
    return;
  }

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.onclick = () => auth.logout(); // șterge sp_user + sp_token și te duce la login
  }
})();
