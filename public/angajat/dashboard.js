// GATE: verifică login + KYC înainte de dashboard
(function () {
  const token = localStorage.getItem("sp_token") || "";
  let email = localStorage.getItem("userEmail") || "";

  // încearcă să ia email din sp_user (formatul tău actual)
  try {
    const u = JSON.parse(localStorage.getItem("sp_user") || "null");
    if (!email && u && u.email) email = String(u.email);
  } catch (_) {}

  // dacă nu avem token sau email => nu e login valid
  if (!token || !email) {
    window.location.href = "/login.html";
    return;
  }

  const API_BASE = "https://superparty-ai-backend-production.up.railway.app";

  fetch(`${API_BASE}/api/kyc/status?email=${encodeURIComponent(email)}`, {
    headers: { Authorization: "Bearer " + token },
  })
    .then((r) => r.json())
    .then((data) => {
      if (!data.success || data.status !== "approved") {
        window.location.href = "/angajat/kyc.html";
      }
    })
    .catch(() => {
      window.location.href = "/angajat/kyc.html";
    });
})();
