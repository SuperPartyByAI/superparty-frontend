// =====================================
// SuperParty - Admin KYC Logic
// File: public/admin/kyc.js
// - Always uses localStorage sp_token + /api/auth/me refresh
// - Adds Authorization header on every admin call
// - On 401 -> clears auth and redirects to /login.html
// =====================================

(function () {
  "use strict";

  const API_BASE = "https://superparty-ai-backend-production.up.railway.app";
  const LOGIN_URL = "/login.html";

  function qs(sel) { return document.querySelector(sel); }
  function safeJSONParse(v) { try { return JSON.parse(v); } catch { return null; } }

  function clearAuth() {
    try { localStorage.removeItem("sp_token"); } catch (_) {}
    try { localStorage.removeItem("sp_user"); } catch (_) {}
  }

  function redirect(to) {
    if ((window.location.pathname || "") !== to) window.location.href = to;
  }

  function normalizeUser(u) {
    const user = u || {};
    return {
      id: user.id,
      full_name: user.full_name || user.fullName || "",
      email: user.email || "",
      phone: user.phone || "",
      role: user.role || "angajat",
      status: user.status || "kyc_required",
      updatedAt: Date.now(),
      raw: user,
    };
  }

  async function refreshSession() {
    const token = localStorage.getItem("sp_token") || "";
    const user = safeJSONParse(localStorage.getItem("sp_user") || "null");

    if (!token || !user || !user.email) {
      clearAuth();
      redirect(LOGIN_URL);
      return null;
    }

    // Source of truth: /api/auth/me (DB + fresh token)
    const r = await fetch(API_BASE + "/api/auth/me", {
      headers: { Authorization: "Bearer " + token },
    });

    if (r.status === 401) {
      clearAuth();
      redirect(LOGIN_URL);
      return null;
    }

    const j = await r.json().catch(() => null);
    if (!r.ok || !j || !j.success || !j.tokenUser) {
      // If backend is temporarily failing, keep existing session
      return { token, user };
    }

    const freshToken = j.token ? String(j.token) : token;
    const freshUser = normalizeUser(j.tokenUser);

    try { localStorage.setItem("sp_token", freshToken); } catch (_) {}
    try { localStorage.setItem("sp_user", JSON.stringify(freshUser)); } catch (_) {}

    return { token: freshToken, user: freshUser };
  }

  async function apiFetch(path, opts) {
    const sess = await refreshSession();
    if (!sess) return null;

    const headers = Object.assign({}, (opts && opts.headers) ? opts.headers : {});
    headers.Authorization = "Bearer " + sess.token;

    const r = await fetch(API_BASE + path, Object.assign({}, opts || {}, { headers }));

    if (r.status === 401) {
      clearAuth();
      redirect(LOGIN_URL);
      return null;
    }

    return r;
  }

  function renderJSONFallback(obj) {
    const pre = qs("#kycJson") || qs("#json") || qs("pre");
    if (!pre) {
      console.log("KYC DATA:", obj);
      return;
    }
    pre.textContent = JSON.stringify(obj, null, 2);
  }

  async function loadKycList() {
    // IMPORTANT: backend-ul tău listează pending fără query param.
    // Dacă vrei filtrare, o facem client-side.
    const r = await apiFetch("/api/admin/kyc/list", { method: "GET" });
    if (!r) return;

    const j = await r.json().catch(() => null);
    if (!r.ok || !j || !j.success) {
      renderJSONFallback({ ok: false, status: r.status, body: j });
      return;
    }

    // Prefer să nu stric HTML-ul tău existent.
    // Dacă ai un container cu id="kycList", încerc să-l umplu minimal.
    const listEl = qs("#kycList");
    if (!listEl) {
      renderJSONFallback(j);
      return;
    }

    const rows = Array.isArray(j.pending) ? j.pending : [];
    if (!rows.length) {
      listEl.innerHTML = "<div style='opacity:.8'>Nu există cereri KYC în așteptare.</div>";
      return;
    }

    listEl.innerHTML = rows.map((k) => {
      const name = (k.kyc_full_name || k.full_name || "").replace(/</g, "&lt;");
      const email = (k.kyc_email || k.email || "").replace(/</g, "&lt;");
      const id = Number(k.user_id || 0);

      return `
        <div style="border:1px solid rgba(255,255,255,.12); background:rgba(255,255,255,.06); border-radius:12px; padding:12px; margin:10px 0;">
          <div style="font-weight:700">${name || "(fără nume)"} <span style="opacity:.8; font-weight:400">(${email || "fără email"})</span></div>
          <div style="opacity:.8; margin-top:6px;">user_id: ${id} • status: ${String(k.kyc_status || "pending")}</div>
          <div style="display:flex; gap:10px; margin-top:10px; flex-wrap:wrap;">
            <button data-approve="${id}" style="padding:8px 10px; border-radius:10px; border:1px solid rgba(16,185,129,.45); background:rgba(16,185,129,.18); color:#eafff6; cursor:pointer;">Approve</button>
            <button data-reject="${id}" style="padding:8px 10px; border-radius:10px; border:1px solid rgba(239,68,68,.45); background:rgba(239,68,68,.18); color:#ffecec; cursor:pointer;">Reject</button>
          </div>
        </div>
      `;
    }).join("");

    // bind actions
    listEl.querySelectorAll("button[data-approve]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const user_id = Number(btn.getAttribute("data-approve") || "0");
        await approve(user_id);
        await loadKycList();
      });
    });

    listEl.querySelectorAll("button[data-reject]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const user_id = Number(btn.getAttribute("data-reject") || "0");
        const reason = prompt("Motiv reject (opțional):") || "";
        await reject(user_id, reason);
        await loadKycList();
      });
    });
  }

  async function approve(user_id) {
    if (!user_id) return { ok: false, error: "Missing user_id" };
    const r = await apiFetch("/api/admin/kyc/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id }),
    });
    if (!r) return { ok: false, error: "No response" };
    return await r.json().catch(() => ({ ok: false, status: r.status }));
  }

  async function reject(user_id, reason) {
    if (!user_id) return { ok: false, error: "Missing user_id" };
    const r = await apiFetch("/api/admin/kyc/reject", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id, reason: reason || "" }),
    });
    if (!r) return { ok: false, error: "No response" };
    return await r.json().catch(() => ({ ok: false, status: r.status }));
  }

  // Expose helpers (useful in DevTools)
  window.SuperPartyAdminKyc = {
    refreshSession,
    loadKycList,
    approve,
    reject,
  };

  document.addEventListener("DOMContentLoaded", async () => {
    const sess = await refreshSession();
    if (!sess) return;

    const role = String(sess.user?.role || "").toLowerCase();
    if (role !== "admin") {
      // dacă nu ești admin, nu ai ce căuta aici
      redirect("/angajat/");
      return;
    }

    await loadKycList();
  });
})();
