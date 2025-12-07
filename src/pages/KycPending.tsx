import { useAuth } from "../context/AuthContext";

export function KycPending() {
  const { user, logout, refreshUser } = useAuth();

  const handleRefresh = async () => {
    await refreshUser();
    window.location.reload();
  };

  return (
    <div className="min-h-screen w-full bg-slate-900 text-slate-50 flex items-center justify-center px-4 py-6">
      <div className="w-full max-w-2xl bg-slate-950/80 border border-slate-700 rounded-2xl shadow-xl p-6 md:p-8 space-y-6">
        <div className="text-center space-y-4">
          <div className="text-6xl">⏳</div>
          <h1 className="text-2xl md:text-3xl font-bold">Documentele sunt în verificare</h1>
          <p className="text-slate-400">
            Bună, {user?.prenume}! Echipa SuperParty verifică actele tale. Vei primi un email când contul va fi aprobat.
          </p>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
          <p className="text-sm text-amber-200">
            ℹ️ Verificarea durează de obicei 24-48 de ore. Te vom contacta dacă avem nevoie de
            documente suplimentare.
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-xs text-slate-500 text-center">
            Documentele trimise:
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
              🪪 Buletin
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
              🤳 Selfie
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
              📄 Contract
            </span>
            {user?.is_driver && (
              <>
                <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs">
                  🚗 Acte șofer
                </span>
              </>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleRefresh}
            className="flex-1 px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 text-sm font-medium"
          >
            🔄 Verifică status
          </button>
          <button
            onClick={logout}
            className="flex-1 px-4 py-2.5 rounded-lg bg-red-500/20 border border-red-500/50 text-red-300 hover:bg-red-500/30 text-sm font-medium"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
