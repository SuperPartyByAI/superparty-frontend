// login.logic.js (ROOT)
// Păstrează vizualul tău, doar schimbă modul de login (prin auth.js)

(function () {
  "use strict";

  const btn = document.getElementById("btn");
  const msg = document.getElementById("msg");

  const routes = window.SUPERPARTY_ROUTES || {
    login: "/login.html",
    admin: "/admin/index.html",
    angajatHome: "/angajat/index.html",
    angajatKyc: "/angajat/kyc/index.html"
  };

  function setMsg(t) {
    if (msg) msg.textContent = t || "";
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
      // 1) Login prin SDK (salvează sp_token + user backend în sp_user)
      const u = await auth.login(email, password);

      // 2) Păstrăm COMPATIBILITATE cu forma ta de sp_user (ca să nu rupi paginile existente)
      const spUser = {
        id: u.id ?? u.user_id ?? u.userId ?? null,
        full_name: u.full_name ?? u.fullName ?? u.name ?? "",
        phone: u.phone ?? u.telefon ?? "",
        email: (u.email || email),
        role: String(u.role || "").toLowerCase(),
        status: String(u.status || "").toLowerCase(),
        kyc_status: String(u.kyc_status || u.kycStatus || "").toLowerCase(),
        contract_signed: String(u.contract_signed || u.contractSigned || "").toLowerCase(),
        is_approved: u.is_approved ?? u.isApproved ?? "",
        updatedAt: Date.now()
      };

      // suprascriem sp_user cu forma compatibilă (tokenul rămâne în sp_token din auth.js)
      localStorage.setItem("sp_user", JSON.stringify(spUser));
      localStorage.setItem("userEmail", spUser.email); // dacă ai cod vechi care folosește asta

      // 3) Redirect exact ca la tine
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
      setMsg("Eroare login (token/user invalid sau rețea).");
    } finally {
      btn.disabled = false;
    }
  };
})();
