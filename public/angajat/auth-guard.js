<!DOCTYPE html>
<html lang="ro">
<head>
  <meta charset="UTF-8" />
  <title>SuperParty - Autentificare</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: radial-gradient(circle at top, #ff9a9e 0, #fad0c4 40%, #fbc2eb 100%);
    }

    .login-card {
      background: #ffffff;
      border-radius: 16px;
      padding: 24px 28px;
      max-width: 380px;
      width: 100%;
      box-shadow: 0 18px 45px rgba(15, 23, 42, 0.25);
    }

    .login-title {
      font-size: 24px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 4px;
      text-align: center;
    }

    .login-subtitle {
      font-size: 13px;
      color: #64748b;
      margin-bottom: 20px;
      text-align: center;
    }

    label {
      font-size: 13px;
      color: #0f172a;
      display: block;
      margin-bottom: 4px;
    }

    input[type="email"],
    input[type="password"] {
      width: 100%;
      padding: 9px 10px;
      border-radius: 8px;
      border: 1px solid #cbd5f5;
      font-size: 14px;
      margin-bottom: 12px;
      outline: none;
      transition: border 0.15s, box-shadow 0.15s;
    }

    input[type="email"]:focus,
    input[type="password"]:focus {
      border-color: #6366f1;
      box-shadow: 0 0 0 1px rgba(99, 102, 241, 0.3);
    }

    button {
      width: 100%;
      padding: 10px 14px;
      border-radius: 999px;
      border: none;
      font-size: 15px;
      font-weight: 600;
      background: linear-gradient(135deg, #6366f1, #ec4899);
      color: white;
      cursor: pointer;
      margin-top: 4px;
      transition: transform 0.1s ease, box-shadow 0.1s ease, opacity 0.1s ease;
      box-shadow: 0 12px 30px rgba(99, 102, 241, 0.4);
    }

    button:hover {
      transform: translateY(-1px);
      box-shadow: 0 16px 40px rgba(99, 102, 241, 0.55);
      opacity: 0.96;
    }

    button:active {
      transform: translateY(0);
      box-shadow: 0 10px 26px rgba(99, 102, 241, 0.3);
    }

    .error-msg {
      display: none;
      margin-top: 10px;
      font-size: 13px;
      color: #b91c1c;
      background: #fee2e2;
      border-radius: 8px;
      padding: 8px 10px;
    }

    .footer-note {
      margin-top: 14px;
      font-size: 11px;
      text-align: center;
      color: #94a3b8;
    }

    .footer-note span {
      font-weight: 600;
      color: #6366f1;
    }
  </style>
</head>
<body>
  <div class="login-card">
    <h1 class="login-title">SuperParty</h1>
    <p class="login-subtitle">Autentificare staff &amp; colaboratori</p>

    <form id="loginForm">
      <label for="email">Email</label>
      <input id="email" type="email" placeholder="ex: nume@superparty.ro" required autocomplete="username" />

      <label for="password">Parola</label>
      <input id="password" type="password" placeholder="Parola ta" required autocomplete="current-password" />

      <button type="submit" id="loginBtn">Autentificare</button>
    </form>

    <p id="error" class="error-msg"></p>

    <p class="footer-note">
      Acces doar pentru <span>staff SuperParty</span>.
    </p>
  </div>

  <script>
    // URL backend nou (Railway / Node)
    const BACKEND_BASE_URL = "https://superparty-ai-backend-production.up.railway.app";

    async function loginWithBackend(email, password) {
      const response = await fetch(BACKEND_BASE_URL + "/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        // Dacă serverul răspunde cu 4xx / 5xx
        throw new Error((data && data.error) || "Eroare la autentificare.");
      }

      if (!data || data.success === false) {
        throw new Error((data && data.error) || "Email sau parolă incorecte.");
      }

      return data;
    }

    document.addEventListener("DOMContentLoaded", () => {
      const form = document.getElementById("loginForm");
      const emailInput = document.getElementById("email");
      const passInput = document.getElementById("password");
      const errorEl = document.getElementById("error");
      const loginBtn = document.getElementById("loginBtn");

      form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = emailInput.value.trim();
        const password = passInput.value.trim();
        errorEl.style.display = "none";
        errorEl.textContent = "";

        if (!email || !password) {
          errorEl.textContent = "Te rog completează emailul și parola.";
          errorEl.style.display = "block";
          return;
        }

        // Dezactivăm butonul pe perioada request-ului
        loginBtn.disabled = true;
        loginBtn.textContent = "Se autentifică...";

        try {
          const resp = await loginWithBackend(email, password);

          // ne așteptăm ca backend-ul să trimită ceva de genul:
          // { success: true, user: { email, full_name, role, status, kyc_status, ... } }
          const user = resp.user || resp.data || resp;

          const role = (user.role || "").toLowerCase();
          const status = (user.status || "").toLowerCase();            // ex: "active", "pending_admin", "blocked"
          const kycStatus = (user.kyc_status || user.kycStatus || "none").toLowerCase(); // ex: "approved", "pending", "none"

          // Setăm datele în localStorage - pentru gate-ul de pe /angajat/index.html
          localStorage.setItem("userEmail", user.email || email);
          localStorage.setItem("userFullName", user.full_name || user.fullName || "");
          localStorage.setItem("userRole", role || "angajat");
          localStorage.setItem("userStatus", status || "active");
          localStorage.setItem("userKycStatus", kycStatus || "none");

          // Rutare în funcție de rol + status + KYC:
          if (role === "admin") {
            window.location.href = "/admin/index.html";
            return;
          }

          if (role === "gm") {
            window.location.href = "/gm/index.html";
            return;
          }

          // Angajat: dacă nu e activ sau KYC nu e aprobat => îl trimitem direct în pending
          if (status !== "active" || kycStatus !== "approved") {
            window.location.href = "/angajat/pending.html";
          } else {
            window.location.href = "/angajat/index.html";
          }
        } catch (err) {
          errorEl.textContent = err.message || "Nu s-a putut face autentificarea. Încearcă din nou.";
          errorEl.style.display = "block";
        } finally {
          loginBtn.disabled = false;
          loginBtn.textContent = "Autentificare";
        }
      });
    });
  </script>
</body>
</html>
