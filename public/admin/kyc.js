// Backend Railway
const API_BASE = "https://superparty-ai-backend-production.up.railway.app";

const tbody = document.getElementById("kycTbody");
const pendingCountEl = document.getElementById("pendingCount");
const errorBox = document.getElementById("errorBox");
const loadingBox = document.getElementById("loadingBox");
const emptyState = document.getElementById("emptyState");
const tableWrapper = document.getElementById("tableWrapper");
const filterButtons = document.querySelectorAll(".filter-btn");

let currentStatusFilter = "pending";

function setLoading(isLoading) {
  if (isLoading) {
    loadingBox.style.display = "block";
  } else {
    loadingBox.style.display = "none";
  }
}

function setError(message) {
  if (message) {
    errorBox.textContent = message;
    errorBox.style.display = "block";
  } else {
    errorBox.textContent = "";
    errorBox.style.display = "none";
  }
}

function maskCnp(cnp) {
  if (!cnp || typeof cnp !== "string") return "";
  if (cnp.length <= 4) return "****";
  return cnp.slice(0, 3) + "*******" + cnp.slice(-3);
}

function maskIban(iban) {
  if (!iban || typeof iban !== "string") return "";
  if (iban.length <= 6) return "****";
  return iban.slice(0, 4) + " **** **** " + iban.slice(-4);
}

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, "0");
  const mins = String(d.getMinutes()).padStart(2, "0");
  return `${day}.${month}.${year} ${hours}:${mins}`;
}

function renderStatusTag(kycStatus) {
  const status = (kycStatus || "").toLowerCase();
  let clazz = "tag-status pending";
  let label = "Pending";

  if (status === "approved") {
    clazz = "tag-status approved";
    label = "Approved";
  } else if (status === "rejected") {
    clazz = "tag-status rejected";
    label = "Rejected";
  }

  return `<span class="${clazz}">${label}</span>`;
}

function setActiveFilterButton(status) {
  filterButtons.forEach((btn) => {
    const s = btn.getAttribute("data-status");
    if (s === status) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });
}

async function loadKycList(status = "pending") {
  currentStatusFilter = status;
  setActiveFilterButton(status);
  setError("");
  setLoading(true);
  tbody.innerHTML = "";
  emptyState.style.display = "none";
  tableWrapper.style.display = "block";

  try {
    const resp = await fetch(
      `${API_BASE}/api/admin/kyc/list?status=${encodeURIComponent(status)}`
    );

    const data = await resp.json();

    if (!resp.ok || data.success !== true) {
      const msg =
        (data && data.error) ||
        `Eroare la încărcarea listei KYC (status HTTP ${resp.status}).`;
      setError(msg);
      tbody.innerHTML = "";
      emptyState.style.display = "block";
      tableWrapper.style.display = "none";
      pendingCountEl.textContent = "0";
      return;
    }

    const items = Array.isArray(data.items) ? data.items : [];

    if (status === "pending") {
      pendingCountEl.textContent = String(items.length);
    }

    if (items.length === 0) {
      tbody.innerHTML = "";
      emptyState.style.display = "block";
      tableWrapper.style.display = "none";
      return;
    }

    const rowsHtml = items
      .map((item) => {
        const name = item.full_name || "-";
        const email = item.email || "-";
        const cnp = maskCnp(item.cnp || "");
        const iban = maskIban(item.iban || "");
        const phone = item.phone || "-";
        const createdAt = formatDate(item.created_at);
        const kycStatus = item.kyc_status || item.status || "pending";

        return `
          <tr data-email="${email}">
            <td class="name">${name}</td>
            <td class="email">${email}</td>
            <td>${cnp}</td>
            <td>${iban}</td>
            <td>${phone}</td>
            <td>${renderStatusTag(kycStatus)}</td>
            <td class="text-muted">${createdAt}</td>
            <td>
              <div class="actions">
                <button class="btn btn-approve" data-action="approve" data-email="${email}">
                  ✓ Aprobă
                </button>
                <button class="btn btn-reject" data-action="reject" data-email="${email}">
                  ✕ Respinge
                </button>
              </div>
            </td>
          </tr>
        `;
      })
      .join("");

    tbody.innerHTML = rowsHtml;
  } catch (err) {
    console.error("loadKycList error:", err);
    setError("Eroare de rețea sau server la încărcarea listei KYC.");
    tbody.innerHTML = "";
    emptyState.style.display = "block";
    tableWrapper.style.display = "none";
    pendingCountEl.textContent = "0";
  } finally {
    setLoading(false);
  }
}

async function handleApproveReject(email, action) {
  if (!email || !action) return;

  const actionLabel = action === "approve" ? "aprobi" : "respingi";
  const confirmMsg = `Sigur vrei să ${actionLabel} KYC pentru ${email}?`;

  const ok = window.confirm(confirmMsg);
  if (!ok) return;

  setError("");
  setLoading(true);

  try {
    const resp = await fetch(`${API_BASE}/api/admin/kyc/approve`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, action }),
    });

    const data = await resp.json();

    if (!resp.ok || data.success !== true) {
      const msg =
        (data && data.error) ||
        `Eroare la ${action} pentru ${email} (status HTTP ${resp.status}).`;
      setError(msg);
      return;
    }

    // Reload lista pentru statusul curent
    await loadKycList(currentStatusFilter);
  } catch (err) {
    console.error("handleApproveReject error:", err);
    setError(
      `Eroare de rețea sau server la ${action} pentru ${email}. Încearcă din nou.`
    );
  } finally {
    setLoading(false);
  }
}

// Click pe rândurile de acțiuni (event delegation)
tbody.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;

  const btn = target.closest("button");
  if (!btn) return;

  const action = btn.getAttribute("data-action");
  const email = btn.getAttribute("data-email");

  if (action === "approve" || action === "reject") {
    handleApproveReject(email, action);
  }
});

// Click pe filtre (pending / approved / rejected)
filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const status = btn.getAttribute("data-status") || "pending";
    loadKycList(status);
  });
});

// La încărcarea paginii, afișăm pending
document.addEventListener("DOMContentLoaded", () => {
  loadKycList("pending");
});
