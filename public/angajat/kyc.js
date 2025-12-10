// public/angajat/kyc.js
// Demo: marchează utilizatorul aprobat ca având KYC "ok" în localStorage.

(function () {
  const form = document.getElementById("kycForm");
  const emailInput = document.getElementById("kycEmail");
  const idPhotoInput = document.getElementById("idPhoto");
  const contractCheckbox = document.getElementById("acceptContract");
  const btn = document.getElementById("kycBtn");
  const msgBox = document.getElementById("kycMessage");

  function showMessage(text, type) {
    if (!msgBox) return;
    msgBox.textContent = text;
    msgBox.className = "msg " + type;
    msgBox.style.display = "block";
  }

  function loadApprovedUsers() {
    try {
      const raw = localStorage.getItem("sp_approved_users");
      if (!raw) return [];
      return JSON.parse(raw);
    } catch (e) {
      return [];
    }
  }

  function saveApprovedUsers(list) {
    try {
      localStorage.setItem("sp_approved_users", JSON.stringify(list));
    } catch (e) {
      console.error("Nu pot salva sp_approved_users:", e);
    }
  }

  function initEmail() {
    let email = "";
    try {
      email = localStorage.getItem("userEmail") || "";
    } catch (e) {}

    if (!email) {
      showMessage("Nu am găsit emailul în localStorage. Te rog autentifică-te din nou.", "error");
    }

    if (emailInput) {
      emailInput.value = email || "(necunoscut)";
    }
  }

  function onSubmit(e) {
    e.preventDefault();
    msgBox.style.display = "none";

    const email = emailInput?.value.trim() || "";
    if (!email) {
      showMessage("Nu am putut identifica utilizatorul. Re-autentifică-te.", "error");
      return;
    }

    if (!idPhotoInput || !idPhotoInput.files || idPhotoInput.files.length === 0) {
      showMessage("Te rog încarcă o poză a buletinului.", "error");
      return;
    }

    if (!contractCheckbox || !contractCheckbox.checked) {
      showMessage("Trebuie să accepți contractul de colaborare pentru a continua.", "error");
      return;
    }

    btn.disabled = true;
    btn.textContent = "Se procesează...";

    try {
      const approved = loadApprovedUsers();
      const idx = approved.findIndex(u => (u.email || "").toLowerCase() === email.toLowerCase());

      if (idx === -1) {
        showMessage("Nu am găsit acest utilizator în lista aprobaților. Verifică cu un admin.", "error");
        btn.disabled = false;
        btn.textContent = "Trimite KYC";
        return;
      }

      // marcăm KYC ca "ok"
      approved[idx].kycStatus = "ok";
      saveApprovedUsers(approved);

      showMessage("KYC trimis și marcat ca valid. Te redirecționăm în dashboard...", "success");

      setTimeout(() => {
        window.location.href = "/angajat/index.html";
      }, 1500);
    } catch (err) {
      console.error(err);
      showMessage("A apărut o eroare. Încearcă din nou.", "error");
      btn.disabled = false;
      btn.textContent = "Trimite KYC";
    }
  }

  function init() {
    initEmail();
    if (form) {
      form.addEventListener("submit", onSubmit);
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
