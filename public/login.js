// public/login.js
// Login real pe backend Railway (fără Apps Script)

(function () {
  const BACKEND_URL = "https://superparty-ai-backend-production.up.railway.app";

  const form = document.getElementById("loginForm");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const btn = document.getElementById("loginBtn");
  const msgBox = document.getElementById("loginMessage");

  function showMessage(text, type) {
    if (!msgBox) return;
    msgBox.textContent = text;
    msgBox.className = "msg " + type;
    msgBox.style.display = "block";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!emailInput || !passwordInput || !btn) return;

    msgBox.style.display = "none";

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
      showMessage("Te rog completează emailul și parola.", "error");
      return;
    }

    btn.disabled = true;
    btn.textContent = "Se autentifică...";

    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!data.success) {
        showMessage(data.error || "Email sau parolă incorecte.", "error");
        btn.disabled = false;
        btn.textContent = "Autentifică-te";
        return;
      }

      try {
        localStorage.setItem("userEmail", data.user?.email || email);
        localStorage.setItem("userFullName", data.user?.fullName || "");
        localStorage.setItem("userRole", data.user?.role || "angajat");
        localStorage.setItem("userKycStatus", data.user?.kycStatus || "required");

        if (data.token) {
          localStorage.setItem("authToken", data.token);
        }
      } catch (e) {
        console.error("Nu pot salva în localStorage:", e);
      }

      showMessage("Autentificare reușită. Te redirecționăm în dashboard...", "success");

      setTimeout(() => {
        window.location.href = "/angajat/index.html";
      }, 1000);
    } catch (err) {
      console.error(err);
      showMessage("Eroare de rețea sau server. Încearcă din nou.", "error");
      btn.disabled = false;
      btn.textContent = "Autentifică-te";
    }
  }

  if (form) {
    form.addEventListener("submit", handleSubmit);
  }
})();
