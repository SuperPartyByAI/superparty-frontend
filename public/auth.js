/* auth.js (ROOT)
   SuperParty AUTH SDK – Single Source of Truth
   Keys: sp_token, sp_user
*/

(function (window) {
  "use strict";

  const STORAGE = { token: "sp_token", user: "sp_user" };

  const BACKEND_URL = String(
    window.SUPERPARTY_BACKEND_URL || "https://superparty-ai-backend-production.up.railway.app"
  ).replace(/\/+$/, "");

  function safeJsonParse(s) {
    try { return JSON.parse(s); } catch { return null; }
  }

  function clearSession() {
    localStorage.removeItem(STORAGE.token);
    localStorage.removeItem(STORAGE.user);
  }

  // nu acceptăm “semi-logat”
  function normalizeSession() {
    const t = localStorage.getItem(STORAGE.token) || "";
    const uRaw = localStorage.getItem(STORAGE.user);
    const u = uRaw ? safeJsonParse(uRaw) : null;

    if ((t && !u) || (!t && u)) {
      clearSession();
      return { ok: false, token: "", user: null };
    }
    return { ok: !!t && !!u, token: t, user: u };
  }

  function getToken() { return normalizeSession().token; }
  function getUser() { return normalizeSession().user; }
  function isLoggedIn() { return normalizeSession().ok; }

  function setSession(token, user) {
    if (!token || !user) {
      clearSession();
      throw new Error("INVALID_SESSION");
    }
    localStorage.setItem(STORAGE.token, token);
    localStorage.setItem(STORAGE.user, JSON.stringify(user));
  }

  function buildUrl(path) {
    const p = String(path || "");
    if (/^https?:\/\//i.test(p)) return p;
    const rel = p.startsWith("/") ? p : `/${p}`;
    return `${BACKEND_URL}${rel}`;
  }

  async function apiFetch(path, options = {}) {
    normalizeSession();

    const opts = { ...options };
    const headers = new Headers(opts.headers || {});
    const token = getToken();

    const isFormData = (typeof FormData !== "undefined") && (opts.body instanceof FormData);

    if (!isFormData && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    if (!headers.has("Accept")) headers.set("Accept", "application/json");
    if (token && !headers.has("Authorization")) {
      headers.set("Authorization", "Bearer " + token);
    }

    opts.headers = headers;

    const res = await fetch(buildUrl(path), opts);

    if (res.status === 401) {
      clearSession();
      throw new Error("UNAUTHORIZED");
    }

    const text = await res.text();
    const data = text ? safeJsonParse(text) : null;

    if (!res.ok) {
      throw new Error(data?.error || data?.message || `API_ERROR_${res.status}`);
    }

    return data;
  }

  // LOGIN – obligatoriu token+user (altfel se rupe tot)
  async function login(email, password) {
    const data = await apiFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (!data?.success || !data?.user || !data?.token) {
      clearSession();
      throw new Error("LOGIN_FAILED_INVALID_RESPONSE");
    }

    setSession(data.token, data.user);
    return data.user;
  }

  function logout() {
    clearSession();
  }

  window.auth = {
    apiFetch,
    login,
    logout,
    getUser,
    isLoggedIn,
    getToken,
    clearSession,
  };
})(window);
