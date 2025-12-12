// ===============================
// SuperParty Frontend - Login (Railway JWT)
// Fisier: public/login-logic.js
// ===============================

// URL backend Railway (PROD)
const SP_BACKEND_URL = "https://superparty-ai-backend-production.up.railway.app";

(function initLogin() {
  const form = document.getElementById("loginForm");
  const emailInput = document.getElementById("email");
  const passInput = document.getElementById("password");
  const btn = document.getElementById("loginBtn");
  const statusEl = document.getElementById("loginStatus");

  const goToRegister = document.getElementById("goToRegister");
  const goToKyc = document.getElementById("goToKyc");

  // Link-uri dummy deocamdata – le legam cand ai paginile separate
  if (goToRegister) {
    goToRegister.addEventListener("click", function (e) {
      e.preventDefault();
      alert("Pagina de creare cont o facem imediat după ce stabilizăm login-ul.");
    });
  }

  if (goToKyc) {
    goToKyc.addEventListener("click", function (e) {
      e.preventDefault();
      alert("Pagina KYC o legăm după ce finalizăm flow-ul de login.");
    });
  }

  function setStatus(text, type) {
    if (!statusEl) return;
    statusEl.textContent = text || "";
    statusEl.classList.remove("error", "success");
    if (type) statusEl.classList.add(type);
  }

  function disableForm(disabled) {
    if (btn) btn.disabled = disabled;
    if (emailInput) emailInput.disabled = disabled;
    if (passInput) passInput.disabled = disabled;
  }

  async function loginRequest(email, password) {
    try {
      const r = await fetch(SP_BACKEND_URL + "/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const j = await r.json().catch(() => null);

      if (!r.ok) {
        return {
          success: false,
          error: (j && j.error) ? j.error : "Login eșuat.",
          status: r.status,
        };
      }

      // asteptat: { success:true, user:{...}, token:"..." }
      return j;
    } catch (e) {
      return { success: false, error: "Eroare de rețea: backend indisponibil." };
    }
  }

  function safeJSONParse(v) {
    try {
      return JSON.parse(v);
    } catch {
      return null;
    }
  }

  // Optional: daca esti deja logat, poti redirecta direct
  // (comenteaza daca nu vrei comportamentul asta)
  try {
    const existingToken = localStorage.getItem("sp_token");
    const existingUser = safeJSONParse(localStorage.getItem("sp_user") || "null");
    if (existingToken && existingUser && existingUser.email) {
      // esti deja logat
      // window.location.href = "/angajat/index.html";
      // return;
    }
  } catch {}

  if (!form) return;

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = ((emailInput && emailInput.value) || "").trim();
    const pass = ((passInput && passInput.value) || "").trim();

    if (!email || !pass) {
      setStatus("Te rog introdu emailul și parola.", "error");
      return;
    }

    disableForm(true);
    setStatus("Verific datele de login în sistem…", "");

    const res = await loginRequest(email, pass);

    if (!res || res.success !== true) {
      const errMsg =
        (res && res.error) ||
        "Email sau parolă incorecte. Dacă ai uitat parola, contactează un admin.";
      setStatus(errMsg, "error");
      disableForm(false);
      return;
    }

    // Validari minime (ca sa nu salvezi junk)
    if (!res.token || !res.user || !res.user.email) {
      setStatus("Răspuns invalid de la server (lipsește token/user).", "error");
      disableForm(false);
      return;
    }

    // Login OK: salvam token + user
    try {
      localStorage.setItem("sp_token", res.token);
      localStorage.setItem("sp_user", JSON.stringify(res.user));

      // compatibilitate cu chei vechi (daca ai cod care le foloseste)
      localStorage.setItem("superparty_user_email", res.user.email);
      localStorage.setItem("loggedUserEmail", res.user.email);
      if (res.user.role) localStorage.setItem("superparty_user_role", res.user.role);
    } catch (err) {
      console.warn("Nu pot salva în localStorage:", err);
      setStatus("Nu pot salva sesiunea (localStorage blocat).", "error");
      disableForm(false);
      return;
    }

    setStatus("Autentificare reușită. Te duc în dashboard…", "success");

    // Redirect standard: dashboard angajat
    setTimeout(function () {
      window.location.href = "/angajat/index.html";
    }, 250);
  });
})();
