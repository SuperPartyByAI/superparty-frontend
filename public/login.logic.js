// public/login.logic.js (ROOT)
// Login stabil: Bridge -> (user + token) -> localStorage(sp_user + sp_token) -> redirect

(function () {
  "use strict";

  const btn = document.getElementById("btn");
  const msg = document.getElementById("msg");

  const routes = window.SUPERPARTY_ROUTES || {
    login: "/login.html",
    admin: "/admin/index.html",
    angajatHome: "/angajat/index.html",
    angajatKyc: "/angajat/kyc.html"
  };

  function setMsg(t) {
    if (msg) msg.textContent = t || "";
  }

  function safeLower(v) {
    return String(v || "").toLowerCase();
  }

  function normalizeToken(res) {
    return (
      (res && typeof res.token === "string" && res.token) ||
      (res && typeof res.jwt === "string" && res.jwt) ||
      (res && typeof res.accessToken === "string" && res.accessToken) ||
      (res && typeof res.access_token === "string" && res.access_token) ||
      ""
    );
  }

  function normalizeUser(res, emailFallback) {
    const u = (res && res.user) ? res.user : (res || {});
    const email = u.email || emailFallback || "";

    return {
      id: u.id ?? u.user_id ?? u.userId ?? null,
      full_name: u.full_name ?? u.fullName ?? u.name ?? "",
      phone: u.phone ?? u.telefon ?? "",
      email,
      role: safeLower(u.role || ""),
      status: safeLower(u.status || ""),
      kyc_status: safeLower(u.kyc_status || u.kycStatus || ""),
      contract_signed: safeLower(u.contract_signed || u.contractSigned || ""),
      is_approved: u.is_approved ?? u.isApproved ?? "",
      updatedAt: Date.now(),
      raw: u
    };
  }

  async function bridgeLogin(email, password) {
    const r = await fetch("/api/bridge?action=login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const j = await r.json().catch(() => null);

    if (!r.ok) {
      return {
        success: false,
        status: r.status,
        error: (j && j.error) ? j.error : "Login eșuat."
      };
    }

    return j; // {success:true, user:{...}, token:"..."}
  }

  if (!btn) {
    console.error("[login.logic] Nu găsesc butonul #btn");
    return;
  }

  btn.onclick = async () => {
    const email = (document.getElementById("email")?.value || "").trim();
    const password = document.getElementById("password")?.value || "";

    if (!email || !password) {
      setMsg("Completează datele");
      return;
    }

    btn.disabled = true;
    setMsg("Se autentifică...");

    try {
      // curățăm sesiunea ca să nu rămâi cu user fără token
      try {
        localStorage.removeItem("sp_user");
        localStorage.removeItem("sp_token");
      } catch {}

      const res = await bridgeLogin(email, password);

      if (!res || res.success !== true) {
        setMsg((res && res.error) ? res.error : "Email sau parolă incorecte.");
        return;
      }

      const token = normalizeToken(res);
      const spUser = normalizeUser(res, email);

      if (!token || token.length < 20) {
        setMsg("Login OK dar lipsește token-ul (JWT). Nu pot crea sesiune.");
        return;
      }

      localStorage.setItem("sp_token", token);
      localStorage.setItem("sp_user", JSON.stringify(spUser));

      // compatibilitate chei vechi
      localStorage.setItem("userEmail", spUser.email);
      if (spUser.full_name) localStorage.setItem("userFullName", spUser.full_name);
      if (spUser.role) localStorage.setItem("superparty_user_role", spUser.role);
      localStorage.setItem("loggedUserEmail", spUser.email);
      localStorage.setItem("superparty_user_email", spUser.email);

      if (spUser.role === "admin") {
        location.href = routes.admin;
        return;
      }

      if (
        spUser.status === "active" &&
        spUser.kyc_status === "approved" &&
        spUser.contract_signed === "signed"
      ) {
        location.href = routes.angajatHome;
      } else {
        location.href = routes.angajatKyc;
      }
    } catch (e) {
      console.error(e);
      setMsg("Eroare login (rețea/bridge).");
    } finally {
      btn.disabled = false;
    }
  };
})();
