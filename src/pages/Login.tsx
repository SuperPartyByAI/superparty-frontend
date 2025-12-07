import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

const SuperPartyLogin: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    
    setIsLoading(true);
    setError("");

    const result = await login(email, password);

    if (result.success && result.redirect) {
      window.location.href = result.redirect;
    } else {
      setError(result.error || "Eroare la autentificare");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full font-sans bg-gradient-to-br from-indigo-500 via-indigo-500 to-purple-600 flex items-center justify-center px-4 py-6">
      <div className="relative w-full max-w-md">
        <div className="absolute inset-0 rounded-3xl bg-white/10 blur-xl" aria-hidden="true" />

        <div className="relative rounded-3xl bg-slate-950/80 border border-white/10 shadow-2xl shadow-indigo-900/40 px-6 py-8 sm:px-8 sm:py-10 text-slate-50 space-y-6">
          <div className="space-y-1 text-center">
            <p className="text-[11px] uppercase tracking-[0.25em] text-indigo-200/80">
              SuperParty • Login
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold">
              Intră în contul tău
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Folosește datele primite de la SuperParty ca să vezi evenimentele tale.
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-sm text-red-300">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label
                htmlFor="email"
                className="text-xs font-medium uppercase tracking-wide text-slate-200"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl bg-slate-900/70 border border-slate-700 px-3 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 placeholder:text-slate-500"
                placeholder="ex: ana@superparty.ro"
                autoComplete="email"
                required
              />
            </div>

            <div className="space-y-1">
              <label
                htmlFor="password"
                className="text-xs font-medium uppercase tracking-wide text-slate-200"
              >
                Parolă
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl bg-slate-900/70 border border-slate-700 px-3 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 placeholder:text-slate-500"
                placeholder="Introdu parola ta"
                autoComplete="current-password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !email || !password}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:from-slate-600 disabled:to-slate-700 disabled:text-slate-300 px-4 py-2.5 text-sm sm:text-base font-semibold shadow-lg shadow-indigo-500/40 transition-transform duration-150 transform hover:-translate-y-0.5 disabled:transform-none"
            >
              {isLoading ? (
                <>
                  <span className="h-4 w-4 border-2 border-indigo-200 border-t-transparent rounded-full animate-spin" />
                  <span>Se conectează...</span>
                </>
              ) : (
                <>
                  <span>🚀 Intră în SuperParty</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SuperPartyLogin;