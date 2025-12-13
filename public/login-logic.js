// ===============================
// SuperParty Frontend - Login (Bridge + Railway JWT)
// Fisier: public/login-logic.js
// ===============================

"use strict";

// URL backend Railway (PROD) - fallback
const SP_BACKEND_URL = "https://superparty-ai-backend-production.up.railway.app";

// Bridge pe Vercel (same-origin)
const SP_BRIDGE_LOGIN_URL = "/api/bridge?action=login";

(function initLogin() {
  const form = document.getElementById("loginForm");
  const emailInput = document.getElementById("email");
  const passInput = document.getElementById("password");
  const btn = document.getElementById("loginBtn");
  const statusEl = document.getElementById("loginStatus");

  const goToRegister = document.getElementById("goToRegister");
  const goToKyc = document.getElementById("goToKyc");

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

  function safeJSONParse(v) {
    try {
      return JSON.parse(v);
    } catch {
      return null;
    }
  }

  function clearSession() {
    try {
      localStorage.removeItem("sp_token");
      localStorage.removeItem("sp_user");
      // chei vechi (nu le șterg obligatoriu, dar e mai curat)
      localStorage.removeItem("superparty_user_email");
      localStorage.removeItem("loggedUserEmail");
      localStorage.removeItem("superparty_user_role");
    } catch {}
  }

  function normalizeAuthResponse(j) {
    // Acceptă mai multe forme de token ca să nu se mai rupă flow-ul
    const token =
      (j && typeof j.token === "string" && j.token) ||
      (j && typeof j.jwt === "string" && j.jwt) ||
      (j && typeof j.accessToken === "string" && j.accessToken) ||
      (j && typeof j.access_token === "string" && j.access_token) ||
      "";

    const user = (j && j.user) ? j.user : null;

    return { token, user };
  }

  async function postJson(url, payload) {
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const j = await r.json().catch(() => null);
    return { ok: r.ok, status: r.status, json: j };
  }

  async function loginRequest(email, password) {
    // 1) Bridge (same-origin)
    try {
      const a = await postJson(SP_BRIDGE_LOGIN_URL, { email, password });

      if (a.ok && a.json) {
        return a.json; // așteptat {success:true, user:{...}, token:"..."}
      }

      // Dacă bridge există dar credentiale greșite, întoarcem direct eroarea
      if (a.status === 401 || a.status === 400) {
        return {
          success: false,
          error: (a.json && a.json.error) ? a.json.error : "Email sau parolă incorecte.",
          status: a.status,
        };
      }

      // Dacă bridge a dat altă eroare, încercăm fallback la Railway
    } catch (e) {
      // bridge indisponibil -> fallback
    }

    // 2) Fallback: Railway direct
    try {
      const b = await postJson(SP_BACKEND_URL + "/api/auth/login", { email, password });

      if (!b.ok) {
        return {
          success: false,
          error: (b.json && b.json.error) ? b.json.error : "Login eșuat.",
          status: b.status,
        };
      }
      return b.json;
    } catch (e) {
      return { success: false, error: "Eroare de rețea: backend indisponibil." };
    }
  }

  // (opțional) dacă ești deja logat, nu forțăm redirect automat (lăsat ca înainte)
  try {
    const existingToken = localStorage.getItem("sp_token");
    const existingUser = safeJSONParse(localStorage.getItem("sp_user") || "null");
    if (existingToken && existingUser && existingUser.email) {
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

    // nu păstrăm sesiune veche dacă faci login din nou
    clearSession();

    const res = await loginRequest(email, pass);

    if (!res || res.success !== true) {
      const errMsg =
        (res && res.error) ||
        "Email sau parolă incorecte. Dacă ai uitat parola, contactează un admin.";
      setStatus(errMsg, "error");
      disableForm(false);
      return;
    }

    const norm = normalizeAuthResponse(res);

    // Validări minime (CA SĂ NU MAI AJUNGI CU sp_user FĂRĂ token)
    if (!norm.user || !norm.user.email) {
      setStatus("Răspuns invalid de la server (lipsește user.email).", "error");
      disableForm(false);
      return;
    }
    if (!norm.token) {
      setStatus("Login OK dar lipsește token-ul (JWT). Nu pot crea sesiune. Verifică backend/bridge.", "error");
      disableForm(false);
      return;
    }

    // Standardizăm sp_user într-o formă stabilă pentru toate paginile
    const u = norm.user;
    const storedUser = {
      id: u.id,
      email: u.email,
      role: u.role || "angajat",
      status: u.status || "",
      full_name: u.full_name || u.fullName || u.name || "",
      phone: u.phone || "",
      updatedAt: Date.now(),
      raw: u
    };

    try {
      localStorage.setItem("sp_token", String(norm.token));
      localStorage.setItem("sp_user", JSON.stringify(storedUser));

      // compatibilitate cu chei vechi (dacă ai cod care le folosește)
      localStorage.setItem("superparty_user_email", storedUser.email);
      localStorage.setItem("loggedUserEmail", storedUser.email);
      localStorage.setItem("userEmail", storedUser.email); // IMPORTANT: pentru pagini vechi încă dependente
      if (storedUser.full_name) localStorage.setItem("userFullName", storedUser.full_name);
      if (storedUser.role) localStorage.setItem("superparty_user_role", storedUser.role);
    } catch (err) {
      console.warn("Nu pot salva în localStorage:", err);
      setStatus("Nu pot salva sesiunea (localStorage blocat).", "error");
      disableForm(false);
      return;
    }

    // Verificare rapidă: token chiar e scris
    try {
      const tl = (localStorage.getItem("sp_token") || "").length;
      if (!tl) {
        setStatus("Sesiune invalidă: token nu a fost salvat (localStorage).", "error");
        disableForm(false);
        return;
      }
    } catch {}

    setStatus("Autentificare reușită. Te duc în dashboard…", "success");

    setTimeout(function () {
      window.location.href = "/angajat/index.html";
    }, 250);
  });
})();
