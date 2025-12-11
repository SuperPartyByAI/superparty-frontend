// public/angajat/register.js
// Register real pe backend Railway (nu mai folosim Apps Script sau localStorage pentru pending)

(function () {
  const BACKEND_URL = "https://superparty-ai-backend-production.up.railway.app";

  const form = document.getElementById("registerForm");
  const btn = document.getElementById("registerBtn");
  const msgBox = document.getElementById("registerMessage");

  function showMessage(text, type) {
    if (!msgBox) return;
    msgBox.textContent = text;
    msgBox.className = "msg " + type;
    msgBox.style.display = "block";
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!form || !btn) return;

    if (msgBox) {
      msgBox.style.display = "none";
    }

    const fullName = document.getElementById("fullName")?.value.trim() || "";
    const email = document.getElementById("email")?.value.trim() || "";
    const phone = document.getElementById("phone")?.value.trim() || "";
    const password = document.getElementById("password")?.value || "";
    const confirmPassword = document.getElementById("confirmPassword")?.value || "";

    if (!fullName || !email || !phone || !password || !confirmPassword) {
      showMessage("Te rog completează toate câmpurile.", "error");
      return;
    }

    if (password !== confirmPassword) {
      showMessage("Parolele nu coincid.", "error");
      return;
    }

    btn.disabled = true;
    btn.textContent = "Se procesează...";

    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, phone, password })
      });

      const data = await res.json();

      if (!data.success) {
        showMessage(data.error || "Nu am putut crea contul. Încearcă din nou.", "error");
        btn.disabled = false;
        btn.textContent = "Creează cont";
        return;
      }

      showMessage(
        data.message || "Cont creat. Așteaptă aprobarea unui admin înainte să fie activat.",
        "success"
      );
      form.reset();
    } catch (err) {
      console.error(err);
      showMessage("Eroare de rețea sau server. Încearcă din nou.", "error");
    } finally {
      btn.disabled = false;
      btn.textContent = "Creează cont";
    }
  }

  if (form) {
    form.addEventListener("submit", onSubmit);
  }
})();
