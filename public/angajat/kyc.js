// ========================================
// CONFIG BACKEND KYC
// ========================================

// URL Apps Script – același folosit în login / register / AI
const SP_BACKEND_URL =
  "https://script.google.com/macros/s/AKfycbxs819m4gt-tpTkAIIS91EnxhwYx-5wdbnh6Zi5_GcY14zs5XYqS9ykFuYCCcokhQ/exec";

// Numele acțiunilor din backend – ADAPTEZI dacă la tine sunt altele:
// - KYC_GET_STATUS: întoarce statusul curent (ex: pending, approved, rejected)
// - KYC_SUBMIT: marchează că userul a trimis KYC pentru verificare
const KYC_GET_STATUS_ACTION = "kyc_status";
const KYC_SUBMIT_ACTION     = "kyc_submit";

// ========================================
// HOOK-URI DIN DOM
// ========================================

const kycStatusBadge  = document.getElementById("kycStatusBadge");
const kycStatusText   = document.getElementById("kycStatusText");
const sideStatusText  = document.getElementById("sideStatusText");
const sideStatusBadge = document.getElementById("sideStatusBadge");
const submitKycBtn    = document.getElementById("submitKycBtn");

const ciFataBtn        = document.getElementById("ciFataBtn");
const ciVersoBtn       = document.getElementById("ciVersoBtn");
const selfieBtn        = document.getElementById("selfieBtn");
const contractAcceptEl = document.getElementById("contractAccept");
const contractStatus   = document.getElementById("contractStatusPill");

const ciFataStatusPill  = document.getElementById("ciFataStatusPill");
const ciVersoStatusPill = document.getElementById("ciVersoStatusPill");
const selfieStatusPill  = document.getElementById("selfieStatusPill");
const viewContractBtn   = document.getElementById("viewContractBtn");

// ========================================
// UTILE LOCALE
// ========================================

function getCurrentEmail() {
  try {
    return (
      localStorage.getItem("superparty_user_email") ||
      localStorage.getItem("loggedUserEmail") ||
      ""
    );
  } catch (e) {
    return "";
  }
}

function setKycStatusText(text, type) {
  if (!kycStatusText) return;
  kycStatusText.textContent = text || "";
  kycStatusText.className = "status " + (type || "info");
}

function setKycBadge(status) {
  if (!kycStatusBadge) return;
  const span = kycStatusBadge.querySelector("span") || kycStatusBadge;
  span.textContent = status || "necunoscut";
}

function setSideStatus(status, description) {
  if (sideStatusText) {
    sideStatusText.textContent = description || "";
  }
  if (sideStatusBadge) {
    sideStatusBadge.textContent = status || "";
    sideStatusBadge.classList.remove("pending", "blocked");
    if (status === "approved") {
      sideStatusBadge.classList.remove("blocked");
    } else if (status === "blocked" || status === "rejected") {
      sideStatusBadge.classList.add("blocked");
    } else {
      sideStatusBadge.classList.add("pending");
    }
  }
}

function setButtonLoading(btn, isLoading) {
  if (!btn) return;
  btn.disabled = isLoading;
}

// Simulăm „upload” – momentan doar schimbăm vizualul; uploadul real îl faci ulterior
function markUploaded(pillEl) {
  if (!pillEl) return;
  pillEl.textContent = "încărcată (demo)";
  pillEl.classList.remove("pill-warning", "pill-error");
  pillEl.classList.add("pill-success");
}

// ========================================
// JSONP – CITIRE STATUS KYC + SUBMIT KYC
// ========================================

function jsonpRequest(action, extraParams) {
  return new Promise((resolve) => {
    const cbName = "spKycCB_" + Date.now() + "_" + Math.floor(Math.random() * 100000);

    window[cbName] = function (res) {
      try {
        resolve(res);
      } finally {
        if (script.parentNode) script.parentNode.removeChild(script);
        delete window[cbName];
      }
    };

    const email = getCurrentEmail();
    const params = Object.assign({}, extraParams || {}, {
      action: action,
      email: email,
      callback: cbName,
    });

    const qs =
      "?" +
      Object.keys(params)
        .map((k) => k + "=" + encodeURIComponent(params[k]))
        .join("&");

    const url = SP_BACKEND_URL + qs;

    const script = document.createElement("script");
    script.src = url;
    script.onerror = function () {
      if (window[cbName]) {
        resolve({
          success: false,
          error: "Eroare de rețea la KYC.",
        });
        delete window[cbName];
      }
      if (script.parentNode) script.parentNode.removeChild(script);
    };

    document.body.appendChild(script);
  });
}

// ========================================
// LOAD INITIAL STATUS
// ========================================

async function loadKycStatus() {
  const email = getCurrentEmail();
  if (!email) {
    setKycStatusText(
      "Nu am găsit email-ul în localStorage. Loghează-te din nou înainte de KYC.",
      "error"
    );
    setKycBadge("necunoscut");
    setSideStatus("necunoscut", "Nu am putut identifica utilizatorul.");
    return;
  }

  setKycStatusText("Citesc statusul KYC pentru " + email + "…", "info");
  setKycBadge("se încarcă");
  setSideStatus("pending_kyc", "Se încarcă statusul contului…");

  const res = await jsonpRequest(KYC_GET_STATUS_ACTION, {});

  if (!res || !res.success) {
    const errMsg =
      (res && res.error) || "Nu am putut încărca statusul KYC. Încearcă mai târziu.";
    setKycStatusText(errMsg, "error");
    setKycBadge("eroare");
    setSideStatus("necunoscut", errMsg);
    return;
  }

  // așteptăm ceva gen: { success:true, kyc_status:"pending", account_status:"pending_approval", steps:{ ... } }
  const kycStatus = res.kyc_status || "pending";
  const accStatus = res.account_status || "pending_approval";

  setKycBadge(kycStatus);

  let sideDesc = "Cont: " + accStatus + ", KYC: " + kycStatus + ".";
  if (kycStatus === "approved" && accStatus === "active") {
    sideDesc = "KYC aprobat și cont activ – poți intra în dashboard.";
    setKycStatusText(
      "KYC = approved, cont = active. Poți merge în dashboard.",
      "success"
    );
  } else if (kycStatus === "rejected") {
    setKycStatusText(
      "KYC respins. Verifică pozele și cere explicații la admin sau AI.",
      "error"
    );
  } else {
    setKycStatusText(
      "KYC este în status: " + kycStatus + ". Așteaptă finalizarea verificării.",
      "info"
    );
  }

  setSideStatus(kycStatus, sideDesc);

  // dacă backend-ul îți trimite și ce pași sunt bifați, îi poți marca aici:
  if (res.steps) {
    if (res.steps.ci_fata_done && ciFataStatusPill) {
      ciFataStatusPill.textContent = "încărcată (backend)";
      ciFataStatusPill.classList.remove("pill-warning");
      ciFataStatusPill.classList.add("pill-success");
    }
    if (res.steps.ci_verso_done && ciVersoStatusPill) {
      ciVersoStatusPill.textContent = "încărcată (backend)";
      ciVersoStatusPill.classList.remove("pill-warning");
      ciVersoStatusPill.classList.add("pill-success");
    }
    if (res.steps.selfie_done && selfieStatusPill) {
      selfieStatusPill.textContent = "încărcată (backend)";
      selfieStatusPill.classList.remove("pill-warning");
      selfieStatusPill.classList.add("pill-success");
    }
    if (res.steps.contract_accepted && contractAcceptEl && contractStatus) {
      contractAcceptEl.checked = true;
      contractStatus.textContent = "acceptat (backend)";
      contractStatus.classList.add("pill-success");
    }
  }
}

// ========================================
// SUBMIT KYC
// ========================================

async function submitKyc() {
  const email = getCurrentEmail();
  if (!email) {
    setKycStatusText(
      "Nu am găsit email-ul în localStorage. Trebuie să te loghezi înainte de KYC.",
      "error"
    );
    return;
  }

  // Validare minimă locală – verificăm că userul a bifat ce trebuie
  const ciFataOk  = ciFataStatusPill && ciFataStatusPill.classList.contains("pill-success");
  const ciVersoOk = ciVersoStatusPill && ciVersoStatusPill.classList.contains("pill-success");
  const selfieOk  = selfieStatusPill && selfieStatusPill.classList.contains("pill-success");
  const contractOk = contractAcceptEl && contractAcceptEl.checked;

  if (!ciFataOk || !ciVersoOk || !selfieOk || !contractOk) {
    setKycStatusText(
      "Te rog asigură-te că ai încărcat CI față, CI verso, selfie și ai acceptat contractul.",
      "error"
    );
    return;
  }

  setKycStatusText("Trimit KYC-ul la verificare…", "info");
  setButtonLoading(submitKycBtn, true);

  const res = await jsonpRequest(KYC_SUBMIT_ACTION, {
    ci_fata: ciFataOk ? "1" : "0",
    ci_verso: ciVersoOk ? "1" : "0",
    selfie: selfieOk ? "1" : "0",
    contract: contractOk ? "1" : "0",
  });

  setButtonLoading(submitKycBtn, false);

  if (!res || !res.success) {
    const errMsg =
      (res && res.error) || "Nu am putut trimite KYC-ul. Încearcă mai târziu.";
    setKycStatusText(errMsg, "error");
    return;
  }

  const newStatus = res.kyc_status || "pending";
  setKycBadge(newStatus);

  if (newStatus === "approved") {
    setKycStatusText(
      "KYC trimis și aprobat. Dacă și contul devine ACTIVE, vei putea intra în dashboard.",
      "success"
    );
  } else {
    setKycStatusText(
      "KYC trimis. Status curent: " + newStatus + ". Așteaptă verificarea.",
      "info"
    );
  }
}

// ========================================
// INIT UI LOCAL (DEMO UPLOAD + CONTRACT)
// ========================================

function initKycUI() {
  if (ciFataBtn) {
    ciFataBtn.addEventListener("click", function () {
      // aici ulterior poți pune input type="file" real. Momentan doar marcăm UI-ul.
      markUploaded(ciFataStatusPill);
    });
  }

  if (ciVersoBtn) {
    ciVersoBtn.addEventListener("click", function () {
      markUploaded(ciVersoStatusPill);
    });
  }

  if (selfieBtn) {
    selfieBtn.addEventListener("click", function () {
      markUploaded(selfieStatusPill);
    });
  }

  if (contractAcceptEl && contractStatus) {
    contractAcceptEl.addEventListener("change", function () {
      if (contractAcceptEl.checked) {
        contractStatus.textContent = "acceptat (local)";
        contractStatus.classList.add("pill-success");
      } else {
        contractStatus.textContent = "nebifat";
        contractStatus.classList.remove("pill-success");
      }
    });
  }

  if (viewContractBtn) {
    viewContractBtn.addEventListener("click", function () {
      // aici poți băga un link spre PDF / pagină de contract
      alert("Aici vei deschide contractul digital (PDF / pagină separată).");
    });
  }

  if (submitKycBtn) {
    submitKycBtn.addEventListener("click", submitKyc);
  }
}

// ========================================
// BOOTSTRAP
// ========================================

initKycUI();
loadKycStatus();
