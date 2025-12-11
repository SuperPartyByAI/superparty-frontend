// GATE: verifică login + KYC înainte de dashboard
(function () {
  const email = localStorage.getItem("userEmail");
  if (!email) {
    window.location.href = "/login.html";
    return;
  }

  const API_BASE = "https://superparty-ai-backend-production.up.railway.app";

  fetch(`${API_BASE}/api/kyc/status?email=${encodeURIComponent(email)}`)
    .then(r => r.json())
    .then(data => {
      if (!data.success || data.status !== "approved") {
        window.location.href = "/angajat/kyc.html";
      }
    })
    .catch(() => {
      // Dacă nu putem verifica, pentru siguranță trimitem la KYC
      window.location.href = "/angajat/kyc.html";
    });
})();
