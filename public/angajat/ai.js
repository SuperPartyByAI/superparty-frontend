// =======================================================
// SuperParty AI - vizual + logic chat (frontend DEMO)
// =======================================================

(function () {
  // -----------------------------
  // 1) Injectăm CSS pentru AI
  // -----------------------------
  const style = document.createElement("style");
  style.id = "sp-ai-styles";
  style.textContent = `
    .sp-ai-toggle {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 56px;
      height: 56px;
      border-radius: 999px;
      border: 1px solid rgba(148, 163, 184, 0.6);
      background: radial-gradient(circle at 20% 0, #38bdf8 0, #1d4ed8 30%, #020617 100%);
      box-shadow: 0 18px 40px rgba(15, 23, 42, 0.85);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 9999;
      color: #e5e7eb;
      font-size: 26px;
      transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease;
    }

    .sp-ai-toggle:hover {
      transform: translateY(-1px) scale(1.02);
      box-shadow: 0 22px 55px rgba(15, 23, 42, 0.95);
    }

    .sp-ai-window {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 340px;
      max-height: 480px;
      display: flex;
      flex-direction: column;
      border-radius: 18px;
      background: rgba(15, 23, 42, 0.98);
      border: 1px solid rgba(148, 163, 184, 0.5);
      box-shadow: 0 22px 55px rgba(15, 23, 42, 0.95);
      z-index: 10000;
      overflow: hidden;
      opacity: 0;
      pointer-events: none;
      transform: translateY(8px);
      transition: opacity 0.16s ease, transform 0.16s ease;
    }

    .sp-ai-window.sp-open {
      opacity: 1;
      pointer-events: auto;
      transform: translateY(0);
    }

    .sp-ai-header {
      padding: 10px 12px;
      border-bottom: 1px solid rgba(31, 41, 55, 0.9);
      display: flex;
      align-items: center;
      gap: 8px;
      background: radial-gradient(circle at 0 0, #1d4ed8 0, #020617 55%);
    }

    .sp-ai-avatar {
      width: 28px;
      height: 28px;
      border-radius: 999px;
      background: radial-gradient(circle at 25% 0, #38bdf8 0, #1d4ed8 40%, #020617 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
    }

    .sp-ai-header-text {
      flex: 1;
    }

    .sp-ai-header-title {
      font-size: 13px;
      font-weight: 600;
      color: #e5e7eb;
    }

    .sp-ai-header-sub {
      font-size: 11px;
      color: #9ca3af;
    }

    .sp-ai-close {
      border: none;
      background: transparent;
      color: #9ca3af;
      cursor: pointer;
      font-size: 16px;
      padding: 0 4px;
    }

    .sp-ai-messages {
      flex: 1;
      padding: 10px 10px 6px;
      overflow-y: auto;
      font-size: 13px;
      background: radial-gradient(circle at top, #020617 0, #020617 45%, #020617 100%);
    }

    .sp-ai-msg {
      max-width: 90%;
      margin-bottom: 6px;
      padding: 7px 9px;
      border-radius: 12px;
      line-height: 1.4;
      word-wrap: break-word;
      white-space: pre-wrap;
    }

    .sp-ai-msg-ai {
      background: rgba(15, 23, 42, 0.95);
      border: 1px solid rgba(55, 65, 81, 0.9);
      color: #e5e7eb;
      border-bottom-left-radius: 4px;
    }

    .sp-ai-msg-user {
      margin-left: auto;
      background: linear-gradient(135deg, #1d4ed8, #3b82f6);
      color: #f9fafb;
      border-bottom-right-radius: 4px;
    }

    .sp-ai-footer {
      border-top: 1px solid rgba(31, 41, 55, 0.9);
      padding: 8px 8px 9px;
      background: rgba(15, 23, 42, 0.98);
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .sp-ai-input-row {
      display: flex;
      gap: 6px;
    }

    .sp-ai-input {
      flex: 1;
      border-radius: 999px;
      border: 1px solid rgba(55, 65, 81, 0.9);
      background: #020617;
      color: #e5e7eb;
      padding: 7px 11px;
      font-size: 13px;
      outline: none;
    }

    .sp-ai-input::placeholder {
      color: #6b7280;
    }

    .sp-ai-send-btn {
      border-radius: 999px;
      border: 1px solid rgba(59, 130, 246, 0.9);
      background: linear-gradient(135deg, #1d4ed8, #3b82f6);
      color: #f9fafb;
      font-size: 13px;
      padding: 7px 11px;
      cursor: pointer;
      white-space: nowrap;
    }

    .sp-ai-hint {
      font-size: 10px;
      color: #6b7280;
      text-align: left;
      padding: 0 4px;
    }

    @media (max-width: 480px) {
      .sp-ai-window {
        width: calc(100% - 24px);
        right: 12px;
        bottom: 12px;
      }
      .sp-ai-toggle {
        bottom: 18px;
        right: 18px;
      }
    }
  `;
  document.head.appendChild(style);

  // -----------------------------
  // 2) Butonul cu robot 🤖
  // -----------------------------
  const toggleBtn = document.createElement("button");
  toggleBtn.className = "sp-ai-toggle";
  toggleBtn.id = "spAiToggleBtn";
  toggleBtn.setAttribute("type", "button");
  toggleBtn.setAttribute("aria-label", "Deschide chat AI SuperParty");
  toggleBtn.innerHTML = "🤖";

  // -----------------------------
  // 3) Fereastra de chat
  // -----------------------------
  const win = document.createElement("div");
  win.className = "sp-ai-window";
  win.id = "spAiWindow";

  win.innerHTML = `
    <div class="sp-ai-header">
      <div class="sp-ai-avatar">SP</div>
      <div class="sp-ai-header-text">
        <div class="sp-ai-header-title">SuperParty AI</div>
        <div class="sp-ai-header-sub">Îți explic pașii pentru evenimente, dovezi, KYC</div>
      </div>
      <button class="sp-ai-close" type="button" id="spAiCloseBtn">×</button>
    </div>
    <div class="sp-ai-messages" id="spAiMessages"></div>
    <div class="sp-ai-footer">
      <form class="sp-ai-input-row" id="spAiForm">
        <input
          type="text"
          class="sp-ai-input"
          id="spAiInput"
          placeholder="Întreabă-mă: ex. ce dovezi trebuie la EVT_001?"
          autocomplete="off"
        />
        <button class="sp-ai-send-btn" type="submit">Trimite</button>
      </form>
      <div class="sp-ai-hint">
        Exemplu: „ce dovezi trebuie la EVT_002?” sau „cum îmi activez contul?”
      </div>
    </div>
  `;

  document.body.appendChild(toggleBtn);
  document.body.appendChild(win);

  const closeBtn = win.querySelector("#spAiCloseBtn");
  const messagesEl = win.querySelector("#spAiMessages");
  const formEl = win.querySelector("#spAiForm");
  const inputEl = win.querySelector("#spAiInput");

  // -----------------------------
  // Mesaje în chat
  // -----------------------------
  function addMessage(text, from) {
    const div = document.createElement("div");
    div.className = "sp-ai-msg " + (from === "user" ? "sp-ai-msg-user" : "sp-ai-msg-ai");
    div.textContent = text;
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  // Mesaj inițial AI
  addMessage(
    "Salut! Sunt SuperParty AI. Îți pot răspunde la întrebări despre evenimente, dovezi foto, KYC, contract sau status cont.",
    "ai"
  );

  // -----------------------------
  // Deschidere / închidere
  // -----------------------------
  function openChat() {
    win.classList.add("sp-open");
    toggleBtn.style.opacity = "0";
    toggleBtn.style.pointerEvents = "none";
    setTimeout(() => {
      inputEl && inputEl.focus();
    }, 50);
  }

  function closeChat() {
    win.classList.remove("sp-open");
    toggleBtn.style.opacity = "1";
    toggleBtn.style.pointerEvents = "auto";
  }

  toggleBtn.addEventListener("click", openChat);
  closeBtn.addEventListener("click", closeChat);

  // -----------------------------
  // Logică AI DEMO (local)
  // -----------------------------
  function simulateAiReply(userText) {
    const t = userText.toLowerCase().trim();

    if (!t) {
      return "Te rog scrie o întrebare sau un cod de eveniment.";
    }

    // SALUT / CE FACI / SMALL TALK
    if (
      t === "ce faci" ||
      t === "ce faci?" ||
      t.includes("ce mai faci") ||
      t.startsWith("salut") ||
      t.startsWith("salut,") ||
      t.startsWith("buna") ||
      t.startsWith("bună")
    ) {
      return "Sunt aici să te ajut cu tot ce ține de evenimente, dovezi, KYC și statusul contului tău SuperParty. Întreabă-mă, de exemplu: „ce dovezi trebuie la EVT_001?” sau „cum îmi activez contul?”.";
    }

    if (t.includes("kyc")) {
      return "Pentru KYC trebuie: poză CI față, CI verso, selfie cu buletinul și bifă pe contract. După ce le trimiți, un admin verifică și aprobă contul.";
    }

    if (t.includes("evt_001") || t.includes("evt 001")) {
      return "La EVT_001 ai 3 dovezi obligatorii: 1) poză cu pregătirea (bagaj / setare), 2) poză cu copiii la activitate, 3) poză de final cu tort / personaj.";
    }

    if (t.includes("evt_002") || t.includes("evt 002")) {
      return "La EVT_002 se aplică aceeași regulă: minim 3 poze – pregătire, în timpul activității și final. Dacă evenimentul are și alt rol (ex: șofer), pot exista și poze suplimentare.";
    }

    if (t.includes("dovezi") || t.includes("poze")) {
      return "Regula generală la dovezi: minim 3 poze / rol – pregătire, în timpul activității și final. La unele pachete pot fi mai multe, AI-ul și adminul le verifică și pot respinge dovezi neclare sau reciclate.";
    }

    if (t.includes("contract")) {
      return "Contractul SuperParty se acceptă din pagina de KYC. Acolo confirmi că datele sunt reale, că respecți procedurile și că îți asumi responsabilitatea pentru evenimentele la care mergi.";
    }

    if (t.includes("activ") || t.includes("activez contul") || t.includes("activare cont")) {
      return "Contul devine ACTIV după ce: 1) KYC este APROBAT, 2) un admin setează statusul tău pe ACTIVE în backend. Dacă ceva nu este clar, poți întreba direct un admin sau poți scrie aici ce status vezi.";
    }

    return "Am notat întrebarea ta. În versiunea DEMO îți pot da doar răspunsuri generale și reguli. Pentru integrarea completă cu backend (Apps Script + OpenAI), AI-ul va citi direct evenimentele tale, statusul KYC și dovezile din sistem.";
  }

  // -----------------------------
  // Trimitere mesaj
  // -----------------------------
  formEl.addEventListener("submit", function (e) {
    e.preventDefault();
    const text = (inputEl.value || "").trim();
    if (!text) return;

    addMessage(text, "user");
    inputEl.value = "";

    // Răspuns DEMO local
    const reply = simulateAiReply(text);
    setTimeout(() => {
      addMessage(reply, "ai");
    }, 150);
  });
})();
