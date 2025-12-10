// public/gm/gm.js
// Toată logica pentru pagina GM este aici (separat de HTML)

const ALLOWED_GM_EMAIL = "ursache.andrei1995@gmail.com";

function getUserEmail() {
  try {
    return localStorage.getItem("userEmail") || "";
  } catch (e) {
    return "";
  }
}

function updateAccessUI(email) {
  const emailEl = document.getElementById("gmEmail");
  const statusEl = document.getElementById("gmAccessStatus");

  if (emailEl) {
    emailEl.textContent = email || "necunoscut (nu e setat în localStorage)";
  }

  if (!statusEl) return;

  if (email && email.toLowerCase() === ALLOWED_GM_EMAIL.toLowerCase()) {
    statusEl.textContent = "Acces GM permis pentru Andrei ✔";
    statusEl.classList.remove("danger");
  } else {
    statusEl.textContent = "Acces interzis · te trimit înapoi în dashboardul de angajat...";
    statusEl.classList.add("danger");
    setTimeout(() => {
      window.location.href = "/angajat/index.html";
    }, 1800);
  }
}

function setupButtons() {
  const backBtn = document.getElementById("backToEmployeeBtn");
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      window.location.href = "/angajat/index.html";
    });
  }
}

function initGMPage() {
  const email = getUserEmail();
  updateAccessUI(email);
  setupButtons();
}

document.addEventListener("DOMContentLoaded", initGMPage);
