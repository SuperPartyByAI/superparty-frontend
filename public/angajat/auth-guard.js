// =====================================
// SuperParty - Auth Guard (Angajat)
// File: public/angajat/auth-guard.js
// Checks: sp_token + sp_user in localStorage
// Redirect rules:
// - Not logged in -> /login.html
// - role admin/gm -> their dashboards
// - kyc not approved -> /angajat/kyc.html (except if already there)
// - status not active -> /angajat/pending.html (except if already there)
// =====================================

(function () {
  function safeJSONParse(v) {
    try { return JSON.parse(v); } catch { return null; }
  }
  function lower(v, fallback) {
    return (v == null ? fallback : String(v)).toLowerCase();
  }
  function currentPath() {
    return (window.location.pathname || "").toLowerCase();
  }
  function redirect(to) {
    // evită loop-uri
    if ((window.location.pathname || "") !== to) window.location.href = to;
  }

  const token = localStorage.getItem("sp_token");
  const user = safeJSONParse(localStorage.getItem("sp_user") || "null");

  // 1) Must be logged in
  if (!token || !user || !user.email) {
    localStorage.removeItem("sp_token");
    localStorage.removeItem("sp_user");
    return redirect("/login.html");
  }

  // 2) Role routing (optional but recommended)
  const role = lower(user.role, "angajat");
  if (role === "admin") return redirect("/admin/index.html");
  if (role === "gm") return redirect("/gm/index.html");

  // 3) Angajat rules
  const p = currentPath();
  const isKycPage = p.includes("/angajat/kyc");
  const isPendingPage = p.includes("/angajat/pending");

  const kyc = lower(user.kyc_status || user.kycStatus, "pending");
  const status = lower(user.status, "active");

  // Force KYC until approved (except on KYC page)
  if (kyc !== "approved" && !isKycPage) {
    return redirect("/angajat/kyc.html");
  }

  // If not active, show pending (except on pending page)
  if (status !== "active" && !isPendingPage) {
    return redirect("/angajat/pending.html");
  }

  // OK -> allow page load
})();
