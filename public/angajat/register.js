// ===============================
// SuperParty - Register (Angajat)
// File: public/angajat/register.js
// Backend: Railway
// ===============================

const BACKEND = "https://superparty-ai-backend-production.up.railway.app";

(function () {
  const form = document.getElementById("registerForm");
  const btn = document.getElementById("registerBtn");
  const msg = document.getElementById("registerMessage");

  const fullNameEl = document.getElementById("fullName");
  const emailEl = document.getElementById("email");
  const phoneEl = document.getElementById("phone");
  const passEl = document.getElementById("password");
  const confirmEl = document.getElementById("confirmPassword");

  function showMessage(text, type) {
    if (!msg) return;
    msg.classList.remove("error", "success");
    msg.classList.add(type);
    msg.textContent = text;
    msg.style.display = "block";
  }

  function setLoading(loading) {
    if (!btn) return;
    btn.disabled = !!loading;
    btn.textContent = loading ? "Se creează contul…" : "Creează cont";
  }

  function normalizePhone(phone) {
    return String(phone || "").trim().replace(/\s+/g, "");
  }

  async function registerRequest(payload) {
    // IMPORTANT:
    // Endpoint-ul asteptat: POST /api/auth/register
    // Daca la tine in backend e altul, spune-mi si il ajustez.
    const r = await fetch(BACKEND + "/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const j = await r.json().catch(() => null);

    if (!r.ok || !j) {
      const err = (j && j.error) ? j.error : `Eroare server (HTTP ${r.status})`;
      throw new Error(err);
    }

    if (j.success !== true) {
      throw new Error(j.error || "Nu s-a putut crea contul.");
    }

    return j;
  }

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const full_name = String(fullNameEl.value || "").trim();
    const email = String(emailEl.value || "").trim().toLowerCase();
    const phone = normalizePhone(phoneEl.value);
    const password = String(passEl.value || "");
    const confirmPassword = String(confirmEl.value || "");

    if (!full_name || !email || !phone || !password || !confirmPassword) {
      showMessage("Completează toate câmpurile.", "error");
      return;
    }

    if (password.length < 6) {
      showMessage("Parola trebuie să aibă minim 6 caractere.", "error");
      return;
    }

    if (password !== confirmPassword) {
      showMessage("Parolele nu coincid.", "error");
      return;
    }

    setLoading(true);
    msg.style.display = "none";

    try {
      const payload = {
        full_name,
        email,
        phone,
        password,
        role: "angajat",
      };

      const res = await registerRequest(payload);

      // Nu logam automat. Contul intra la aprobare/admin.
      // Curatam orice sesiune veche:
      localStorage.removeItem("sp_user");
      localStorage.removeItem("sp_token");

      showMessage(
        "Cont creat. Intră la aprobare admin. Te duc la login…",
        "success"
      );

      setTimeout(() => {
        window.location.href = "/login.html";
      }, 900);

    } catch (err) {
      showMessage(err && err.message ? err.message : "Eroare la creare cont.", "error");
    } finally {
      setLoading(false);
    }
  });
})();
