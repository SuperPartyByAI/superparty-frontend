// =====================================
// SuperParty - Admin KYC Logic (AUTH FIX)
// File: public/admin/kyc.js
// - Refresh session via GET /api/auth/me (DB truth + fresh token)
// - Always sends Authorization: Bearer <sp_token> for admin calls
// - On 401 -> clear auth + redirect to /login.html
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
      raw: user
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

    const r = await fetch(API_BASE + "/api/auth/me", {
      headers: { Authorization: "Bearer " + token }
    });

    if (r.status === 401) {
      clearAuth();
      redirect(LOGIN_URL);
      return null;
    }

    const j = await r.json().catch(() => null);

    // DB truth + fresh token
    if (r.ok && j && j.success && j.tokenUser) {
      const freshToken = j.token ? String(j.token) : token;
      const freshUser = normalizeUser(j.tokenUser);

      try { localStorage.setItem("sp_token", freshToken); } catch (_) {}
      try { localStorage.setItem("sp_user", JSON.stringify(freshUser)); } catch (_) {}

      return { token: freshToken, user: freshUser };
    }

    // fallback: keep current session
    return { token, user };
  }

  async function authFetch(path, opts) {
    const sess = await refreshSession();
    if (!sess) return null;

    const headers = Object.assign({}, (opts && opts.headers) ? opts.headers : {});
    headers.Authorization = "Bearer " + String(sess.token || "");

    const r = await fetch(API_BASE + path, Object.assign({}, opts || {}, { headers }));

    if (r.status === 401) {
      clearAuth();
      redirect(LOGIN_URL);
      return null;
    }

    return r;
  }

  function renderText(text) {
    const el = qs("#kycList") || qs("#list") || qs("#content") || qs("main") || qs("body");
    if (!el) { console.log(text); return; }
    el.innerHTML = "<pre style='white-space:pre-wrap'>" + String(text || "") + "</pre>";
  }

  function escapeHtml(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  async function loadKycList() {
    const r = await authFetch("/api/admin/kyc/list", { method: "GET" });
    if (!r) return;

    const j = await r.json().catch(() => null);

    if (!r.ok || !j || !j.success) {
      renderText(JSON.stringify({ ok: false, status: r.status, body: j }, null, 2));
      return;
    }

    const rows = Array.isArray(j.pending) ? j.pending : [];

    const listEl = qs("#kycList");
    if (!listEl) {
      renderText(JSON.stringify(j, null, 2));
      return;
    }

    if (!rows.length) {
      listEl.innerHTML = "<div style='opacity:.8'>Nu există cereri KYC în așteptare.</div>";
      return;
    }

    listEl.innerHTML = rows.map((k) => {
      const name = escapeHtml(k.kyc_full_name || k.full_name || "");
      const email = escapeHtml(k.kyc_email || k.email || "");
      const userId = Number(k.user_id || 0);
      const st = escapeHtml(k.kyc_status || "pending");

      return `
        <div style="border:1px solid rgba(255,255,255,.12); background:rgba(255,255,255,.06); border-radius:12px; padding:12px; margin:10px 0;">
          <div style="font-weight:700">${name || "(fără nume)"} <span style="opacity:.8; font-weight:400">(${email || "fără email"})</span></div>
          <div style="opacity:.8; margin-top:6px;">user_id: ${userId} • kyc_status: ${st}</div>
          <div style="display:flex; gap:10px; margin-top:10px; flex-wrap:wrap;">
            <button data-approve="${userId}" style="padding:8px 10px; border-radius:10px; border:1px solid rgba(16,185,129,.45); background:rgba(16,185,129,.18); color:#eafff6; cursor:pointer;">Approve</button>
            <button data-reject="${userId}" style="padding:8px 10px; border-radius:10px; border:1px solid rgba(239,68,68,.45); background:rgba(239,68,68,.18); color:#ffecec; cursor:pointer;">Reject</button>
          </div>
        </div>
      `;
    }).join("");

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
    if (!user_id) return;

    const r = await authFetch("/api/admin/kyc/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id })
    });

    if (!r) return;
    console.log("APPROVE:", r.status, await r.json().catch(() => null));
  }

  async function reject(user_id, reason) {
    if (!user_id) return;

    const r = await authFetch("/api/admin/kyc/reject", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id, reason: String(reason || "") })
    });

    if (!r) return;
    console.log("REJECT:", r.status, await r.json().catch(() => null));
  }

  // expune pentru DevTools
  window.SuperPartyAdminKyc = { refreshSession, loadKycList, approve, reject };

  document.addEventListener("DOMContentLoaded", async () => {
    const sess = await refreshSession();
    if (!sess) return;

    const role = String(sess.user?.role || "").toLowerCase();
    if (role !== "admin") {
      redirect("/angajat/");
      return;
    }

    await loadKycList();
  });
})();
