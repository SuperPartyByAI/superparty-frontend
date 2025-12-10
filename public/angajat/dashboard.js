// ==================================
// CONFIG GENERAL
// ==================================

// Backend Apps Script pentru AI (același ca la login/register/KYC)
const SP_BACKEND_URL =
  "https://script.google.com/macros/s/AKfycbxs819m4gt-tpTkAIIS91EnxhwYx-5wdbnh6Zi5_GcY14zs5XYqS9ykFuYCCcokhQ/exec";

// email utilizator logat (vine din login/register)
let loggedEmail = "";
try {
  loggedEmail =
    localStorage.getItem("superparty_user_email") ||
    localStorage.getItem("loggedUserEmail") ||
    "";
} catch (e) {
  loggedEmail = "";
}

// ==================================
// UTIL: DATA DE AZI
// ==================================
(function setTodayLabel() {
  const el = document.getElementById("todayLabel");
  if (!el) return;
  const now = new Date();
  const options = { weekday: "short", day: "2-digit", month: "short" };
  try {
    el.textContent = now.toLocaleDateString("ro-RO", options);
  } catch (e) {
    el.textContent = now.toDateString();
  }
})();

// ==================================
// SIDEBAR TOGGLE + SECTIUNI
// ==================================
(function initSidebar() {
  const sidebar = document.getElementById("sidebar");
  const toggle = document.getElementById("sidebarToggle");
  const items = document.querySelectorAll(".sidebar-item");

  if (toggle && sidebar) {
    toggle.addEventListener("click", () => {
      sidebar.classList.toggle("expanded");
    });
  }

  // schimbă secțiunea activă în dashboard (evenimente / kyc / plăți / setări)
  items.forEach((item) => {
    item.addEventListener("click", () => {
      items.forEach((i) => i.classList.remove("active"));
      item.classList.add("active");

      const section = item.getAttribute("data-section");
      const allSections = [
        "section-evenimente",
        "section-kyc",
        "section-plati",
        "section-setari",
      ];
      allSections.forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;
        if (id === "section-" + section) el.classList.remove("hidden");
        else el.classList.add("hidden");
      });
    });
  });
})();

// ==================================
// DEMO EVENIMENTE (STATIC)
// ==================================
const demoEvents = {
  EVT_001: {
    rol: "Elsa 2h + Olaf 2h · COD: A23",
    ora: "Azi · 15:00 - 17:00",
    locatie: "București, Sector 3 · Str. Florilor 23",
    client: "Maria Ionescu · 0722 456 789",
    plata: "650 lei (cash)",
    tips: "— (poți trece tips la final)",
    dovezi: {
      step1: "validat",
      step2: "obligatoriu",
      step3: "blocat",
    },
    note: "La acest eveniment lipsește Etapa 2: poze „Am ajuns la locație”.",
  },
  EVT_002: {
    rol: "Spider-Man 2h · COD: B15",
    ora: "Azi · 11:00 - 13:00",
    locatie: "Voluntari, Ilfov",
    client: "Ion Popescu · 0721 123 456",
    plata: "450 lei (cash)",
    tips: "—",
    dovezi: {
      step1: "validat",
      step2: "obligatoriu",
      step3: "blocat",
    },
    note: "Asigură-te că faci poze la sosire și la plecare, conform procedurii.",
  },
  EVT_003: {
    rol: "Frozen Party 3h · COD: W19",
    ora: "Sâmbătă · 17:00 - 20:00",
    locatie: "Pipera, București",
    client: "Andreea Dumitrescu · 0723 555 111",
    plata: "900 lei (cash / transfer)",
    tips: "—",
    dovezi: {
      step1: "validat",
      step2: "obligatoriu",
      step3: "blocat",
    },
    note: "Eveniment de weekend – ai toate cele 3 etape obligatorii.",
  },
};

function applyDoveziState(dovezi) {
  const s1 = document.getElementById("step1");
  const s2 = document.getElementById("step2");
  const s3 = document.getElementById("step3");
  if (!s1 || !s2 || !s3) return;

  [s1, s2, s3].forEach((btn) => {
    btn.classList.remove("validat", "obligatoriu", "blocat");
  });

  if (dovezi.step1) s1.classList.add(dovezi.step1);
  if (dovezi.step2) s2.classList.add(dovezi.step2);
  if (dovezi.step3) s3.classList.add(dovezi.step3);
}

(function initEventsSelection() {
  const eventsList = document.getElementById("eventsList");
  const detailsRol = document.getElementById("detailsRol");
  const detailsOra = document.getElementById("detailsOra");
  const detailsLocatie = document.getElementById("detailsLocatie");
  const detailsClient = document.getElementById("detailsClient");
  const detailsPlata = document.getElementById("detailsPlata");
  const detailsTips = document.getElementById("detailsTips");
  const detailsNote = document.getElementById("detailsDoveziNote");
  const detailsHint = document.getElementById("detailsHint");

  if (!eventsList) return;

  eventsList.addEventListener("click", (e) => {
    const card = e.target.closest(".event-card");
    if (!card) return;
    const id = card.getAttribute("data-event-id");
    const ev = demoEvents[id];
    if (!ev) return;

    if (detailsRol) detailsRol.textContent = ev.rol;
    if (detailsOra) detailsOra.textContent = ev.ora;
    if (detailsLocatie) detailsLocatie.textContent = ev.locatie;
    if (detailsClient) detailsClient.textContent = ev.client;
    if (detailsPlata) detailsPlata.textContent = ev.plata;
    if (detailsTips) detailsTips.textContent = ev.tips;
    if (detailsNote) detailsNote.textContent = ev.note;
    if (detailsHint) detailsHint.textContent =
      "Ai selectat " + id + ". Verifică dovezile înainte de eveniment.";

    applyDoveziState(ev.dovezi);
  });
})();

// ==================================
// MODAL DOVEZI (UI DEMO)
// ==================================
(function initDoveziModal() {
  const backdrop = document.getElementById("doveziModalBackdrop");
  const closeBtn = document.getElementById("doveziModalClose");
  const cancelBtn = document.getElementById("doveziModalCancel");
  const titleEl = document.getElementById("doveziModalTitle");
  const textEl = document.getElementById("doveziModalText");

  function openModalForStep(step) {
    let label = "";
    if (step === "1") label = "Etapa 1: Bagaj";
    if (step === "2") label = "Etapa 2: Am ajuns la locație";
    if (step === "3") label = "Etapa 3: Plecare & returnare";

    if (titleEl)
      titleEl.innerHTML = "📸 Upload dovezi – " + label;
    if (textEl)
      textEl.textContent =
        "Aici vei încărca pozele pentru " +
        label +
        ". În varianta finală, AI-ul verifică metadate, locația, timestamp-ul și dacă pozele sunt reale (fără fente).";

    if (backdrop) backdrop.classList.add("active");
  }

  ["step1", "step2", "step3"].forEach((id) => {
    const btn = document.getElementById(id);
    if (!btn) return;
    btn.addEventListener("click", () => {
      if (btn.classList.contains("blocat")) return;
      const etapa = btn.getAttribute("data-etapa");
      openModalForStep(etapa);
    });
  });

  function closeModal() {
    if (backdrop) backdrop.classList.remove("active");
  }

  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  if (cancelBtn) cancelBtn.addEventListener("click", closeModal);
  if (backdrop) {
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) closeModal();
    });
  }
})();

// ==================================
// AVATAR INITIALS DIN EMAIL
// ==================================
(function initAvatar() {
  const avatar = document.getElementById("avatarInitials");
  if (!avatar || !loggedEmail) return;
  const namePart = loggedEmail.split("@")[0] || "";
  const initial = namePart.charAt(0).toUpperCase() || "A";
  avatar.textContent = initial;
})();

// ==================================
// WIDGET AI – CHAT ANGAJAT (JSONP)
// ==================================
(function initAIWidget() {
  const botButton = document.getElementById("aiBotButton");
  const chat = document.getElementById("aiChat");
  const close = document.getElementById("aiChatClose");
  const form = document.getElementById("aiForm");
  const input = document.getElementById("aiInput");
  const body = document.getElementById("aiChatBody");
  const statusText = document.getElementById("aiStatusText");
  const typingIndicator = document.getElementById("aiTypingIndicator");

  if (!botButton || !chat || !close || !form || !input || !body || !statusText || !typingIndicator) {
    return;
  }

  const AI_BACKEND = SP_BACKEND_URL; // folosim același Apps Script
  const emailLogat = loggedEmail || "anonim@superparty";

  function openChat() {
    botButton.classList.add("hidden");
    chat.classList.add("visible");
    input.focus();
  }

  function closeChat() {
    chat.classList.remove("visible");
    botButton.classList.remove("hidden");
  }

  botButton.addEventListener("click", openChat);
  close.addEventListener("click", closeChat);

  function appendMessage(text, from = "ai") {
    const row = document.createElement("div");
    row.className = "ai-msg-row" + (from === "user" ? " user" : "");

    const avatar = document.createElement("div");
    avatar.className =
      "ai-msg-avatar" + (from === "user" ? " ai-msg-avatar-user" : "");
    avatar.textContent = from === "user" ? "TU" : "SP";

    const bubbleWrapper = document.createElement("div");
    const bubble = document.createElement("div");
    bubble.className = "ai-msg-bubble";
    bubble.textContent = text;

    const meta = document.createElement("div");
    meta.className = "ai-msg-meta";
    meta.textContent = from === "user" ? "Tu · acum" : "SuperParty AI · acum";

    bubbleWrapper.appendChild(bubble);
    bubbleWrapper.appendChild(meta);

    if (from === "user") {
      row.appendChild(bubbleWrapper);
      row.appendChild(avatar);
    } else {
      row.appendChild(avatar);
      row.appendChild(bubbleWrapper);
    }

    body.appendChild(row);
    body.scrollTop = body.scrollHeight;
  }

  // JSONP către Apps Script (chat_angajat)
  function sendToBackend(message) {
    return new Promise((resolve) => {
      const cbName =
        "cbAI_" + Date.now() + "_" + Math.floor(Math.random() * 100000);

      window[cbName] = function (res) {
        try {
          if (res && res.success) {
            const replyText = res.reply || res.message || "(răspuns gol de la AI)";
            resolve(replyText);
          } else {
            const err =
              res && res.error ? res.error : "Eroare necunoscută de la AI.";
            resolve("Eroare AI: " + err);
          }
        } finally {
          if (script.parentNode) script.parentNode.removeChild(script);
          delete window[cbName];
        }
      };

      const url =
        AI_BACKEND +
        "?action=chat_angajat" +
        "&email=" +
        encodeURIComponent(emailLogat || "anonim@superparty") +
        "&message=" +
        encodeURIComponent(message || "") +
        "&callback=" +
        cbName;

      const script = document.createElement("script");
      script.src = url;
      script.onerror = function () {
        if (window[cbName]) {
          resolve("Eroare de rețea la conexiunea cu AI-ul SuperParty.");
          delete window[cbName];
        }
        if (script.parentNode) script.parentNode.removeChild(script);
      };

      document.body.appendChild(script);
    });
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    appendMessage(text, "user");
    input.value = "";

    statusText.textContent = "Analizez întrebarea ta…";
    typingIndicator.style.visibility = "visible";

    const reply = await sendToBackend(text);

    typingIndicator.style.visibility = "hidden";
    statusText.textContent = "Conectat la SuperParty AI (chat_angajat).";

    appendMessage(reply, "ai");
  });

  // Status inițial
  if (emailLogat && emailLogat !== "anonim@superparty") {
    statusText.textContent =
      "Conectat ca " + emailLogat + " · gata de întrebări.";
  } else {
    statusText.textContent =
      "Nu am găsit email de login – continui ca anonim.";
  }
})();
