// public/angajat/register.js
// Flux demo: salvăm utilizatori noi ca "pending" în localStorage pentru Admin.

(function () {
  const form = document.getElementById("registerForm");
  const btn = document.getElementById("registerBtn");
  const msgBox = document.getElementById("registerMessage");

  function showMessage(text, type) {
    if (!msgBox) return;
    msgBox.textContent = text;
    msgBox.className = "msg " + type;
    msgBox.style.display = "block";
  }

  function loadPendingUsers() {
    try {
      const raw = localStorage.getItem("sp_pending_users");
      if (!raw) return [];
      return JSON.parse(raw);
    } catch (e) {
      return [];
    }
  }

  function savePendingUsers(list) {
    try {
      localStorage.setItem("sp_pending_users", JSON.stringify(list));
    } catch (e) {
      console.error("Nu pot salva pending_users:", e);
    }
  }

  function onSubmit(e) {
    e.preventDefault();
    if (!form || !btn) return;

    const fullName = document.getElementById("fullName")?.value.trim() || "";
    const email = document.getElementById("email")?.value.trim() || "";
    const phone = document.getElementById("phone")?.value.trim() || "";
    const password = document.getElementById("password")?.value || "";
    const confirmPassword = document.getElementById("confirmPassword")?.value || "";

    msgBox.style.display = "none";

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
      const pending = loadPendingUsers();

      // verificăm dacă email-ul este deja în pending
      const exists = pending.some(u => u.email.toLowerCase() === email.toLowerCase());
      if (exists) {
        showMessage("Există deja o cerere în așteptare cu acest email.", "error");
        btn.disabled = false;
        btn.textContent = "Creează cont";
        return;
      }

      const newUser = {
        id: "U" + Date.now(),
        fullName,
        email,
        phone,
        // în realitate parola nu ar trebui ținută în clar; aici e doar demo localStorage
        password,
        role: "angajat",
        status: "pending_admin",
        kycStatus: "not_started",
        createdAt: new Date().toISOString()
      };

      pending.push(newUser);
      savePendingUsers(pending);

      // salvăm și un flag simplu că acest email există local (de exemplu pentru debug)
      try {
        localStorage.setItem("sp_last_registered_email", email);
      } catch (e) {}

      showMessage("Cont creat. Așteaptă aprobarea unui admin înainte să fie activat.", "success");
      form.reset();
    } catch (err) {
      console.error(err);
      showMessage("A apărut o eroare la salvare. Încearcă din nou.", "error");
    } finally {
      btn.disabled = false;
      btn.textContent = "Creează cont";
    }
  }

  if (form) {
    form.addEventListener("submit", onSubmit);
  }
})();
