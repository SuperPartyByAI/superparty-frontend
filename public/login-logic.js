// URL backend Apps Script (același folosit și înainte pentru login + AI)
const SP_BACKEND_URL =
  "https://script.google.com/macros/s/AKfycbxs819m4gt-tpTkAIIS91EnxhwYx-5wdbnh6Zi5_GcY14zs5XYqS9ykFuYCCcokhQ/exec";

(function initLogin() {
  const form = document.getElementById("loginForm");
  const emailInput = document.getElementById("email");
  const passInput = document.getElementById("password");
  const btn = document.getElementById("loginBtn");
  const statusEl = document.getElementById("loginStatus");

  const goToRegister = document.getElementById("goToRegister");
  const goToKyc = document.getElementById("goToKyc");

  // Link-uri dummy deocamdată – le legăm când ai paginile separate
  if (goToRegister) {
    goToRegister.addEventListener("click", function (e) {
      e.preventDefault();
      // când avem pagina de înregistrare: window.location.href = "/register.html";
      alert("Pagina de creare cont o facem imediat după ce stabilizăm login-ul.");
    });
  }

  if (goToKyc) {
    goToKyc.addEventListener("click", function (e) {
      e.preventDefault();
      // când avem pagina de KYC: window.location.href = "/angajat/kyc.html";
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

  // JSONP login (la fel ca testele tale cu ?callback=)
  function loginRequest(email, password) {
    return new Promise((resolve) => {
      const cbName = "spLoginCB_" + Date.now() + "_" + Math.floor(Math.random() * 100000);

      window[cbName] = function (res) {
        try {
          resolve(res);
        } finally {
          if (script.parentNode) script.parentNode.removeChild(script);
          delete window[cbName];
        }
      };

      const url =
        SP_BACKEND_URL +
        "?action=login" +
        "&email=" +
        encodeURIComponent(email) +
        "&password=" +
        encodeURIComponent(password) +
        "&callback=" +
        cbName;

      const script = document.createElement("script");
      script.src = url;
      script.onerror = function () {
        if (window[cbName]) {
          resolve({
            success: false,
            error: "Eroare de rețea sau Apps Script nu răspunde.",
          });
          delete window[cbName];
        }
        if (script.parentNode) script.parentNode.removeChild(script);
      };

      document.body.appendChild(script);
    });
  }

  if (!form) return;

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = (emailInput.value || "").trim();
    const pass = (passInput.value || "").trim();

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

    // Login OK
    try {
      // salvăm emailul în localStorage ca să-l folosim în dashboard + AI
      localStorage.setItem("superparty_user_email", email);
      localStorage.setItem("loggedUserEmail", email);

      // dacă backendul trimite și rolul, îl putem salva
      if (res.role) {
        localStorage.setItem("superparty_user_role", res.role);
      }
    } catch (e) {
      console.warn("Nu pot salva în localStorage:", e);
    }

    setStatus("Autentificare reușită. Te duc în dashboard…", "success");

    // Redirect standard: dashboard angajat
    // (admin/GM se vor deschide doar din comanda secretă prin AI)
    setTimeout(function () {
      window.location.href = "/angajat/index.html";
    }, 400);
  });
})();
