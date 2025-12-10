// public/admin/admin.js
// Admin demo: gestionează utilizatorii "pending_admin" din localStorage.

(function () {
  const pendingListEl = document.getElementById("pendingList");
  const logListEl = document.getElementById("logList");
  const pendingCountPill = document.getElementById("pendingCountPill");
  const reloadBtn = document.getElementById("reloadBtn");

  function loadJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch (e) {
      return fallback;
    }
  }

  function saveJson(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error("Nu pot salva", key, e);
    }
  }

  function loadPendingUsers() {
    return loadJson("sp_pending_users", []);
  }

  function savePendingUsers(users) {
    saveJson("sp_pending_users", users);
  }

  function loadLogs() {
    return loadJson("sp_admin_logs", []);
  }

  function saveLogs(logs) {
    saveJson("sp_admin_logs", logs);
  }

  function addLogEntry(message) {
    const logs = loadLogs();
    logs.unshift({
      id: "L" + Date.now(),
      message,
      at: new Date().toLocaleString("ro-RO")
    });
    saveLogs(logs);
  }

  function renderLogs() {
    if (!logListEl) return;
    const logs = loadLogs();
    logListEl.innerHTML = "";

    if (!logs.length) {
      const div = document.createElement("div");
      div.className = "log-item";
      div.innerHTML = "<span>Nu există acțiuni înregistrate încă.</span><span></span>";
      logListEl.appendChild(div);
      return;
    }

    logs.forEach(log => {
      const row = document.createElement("div");
      row.className = "log-item";
      row.innerHTML = `
        <span>${log.message}</span>
        <span>${log.at}</span>
      `;
      logListEl.appendChild(row);
    });
  }

  function renderPendingUsers() {
    if (!pendingListEl) return;
    const users = loadPendingUsers();
    pendingListEl.innerHTML = "";

    if (pendingCountPill) {
      pendingCountPill.textContent = `În așteptare: ${users.length}`;
    }

    if (!users.length) {
      const empty = document.createElement("div");
      empty.className = "empty";
      empty.textContent = "Nu există utilizatori în așteptare.";
      pendingListEl.appendChild(empty);
      return;
    }

    users.forEach(user => {
      const item = document.createElement("div");
      item.className = "user-item";

      const createdAt = user.createdAt ? new Date(user.createdAt).toLocaleString("ro-RO") : "-";

      item.innerHTML = `
        <div class="user-line">
          <div>
            <div class="user-name">${user.fullName || "-"}</div>
            <div class="user-email">${user.email || "-"}</div>
          </div>
          <div class="badge pending">pending_admin</div>
        </div>
        <div class="user-meta">
          Tel: ${user.phone || "-"} · Creat: ${createdAt}
        </div>
        <div class="user-actions">
          <button class="btn-approve">Aprobă</button>
          <button class="btn-reject">Respinge</button>
        </div>
      `;

      const approveBtn = item.querySelector(".btn-approve");
      const rejectBtn = item.querySelector(".btn-reject");

      approveBtn.addEventListener("click", () => approveUser(user.id));
      rejectBtn.addEventListener("click", () => rejectUser(user.id));

      pendingListEl.appendChild(item);
    });
  }

  function approveUser(userId) {
    let users = loadPendingUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) return;

    const user = users[idx];
    users.splice(idx, 1);
    savePendingUsers(users);

    // salvăm utilizatorul aprobat într-o listă separată (demo)
    const approved = loadJson("sp_approved_users", []);
    approved.push({
      ...user,
      status: "active",
      kycStatus: user.kycStatus || "required"
    });
    saveJson("sp_approved_users", approved);

    addLogEntry(`Aprobat cont: ${user.fullName || ""} <${user.email || ""}>`);
    renderPendingUsers();
    renderLogs();
  }

  function rejectUser(userId) {
    let users = loadPendingUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) return;

    const user = users[idx];
    users.splice(idx, 1);
    savePendingUsers(users);

    const rejected = loadJson("sp_rejected_users", []);
    rejected.push({
      ...user,
      status: "rejected"
    });
    saveJson("sp_rejected_users", rejected);

    addLogEntry(`Respins cont: ${user.fullName || ""} <${user.email || ""}>`);
    renderPendingUsers();
    renderLogs();
  }

  function init() {
    renderPendingUsers();
    renderLogs();

    if (reloadBtn) {
      reloadBtn.addEventListener("click", () => {
        renderPendingUsers();
        renderLogs();
      });
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
