// ═══════════════════════════════════════════════════════════
// App.tsx – Routing + Protected Routes SuperParty (FINAL)
// ═══════════════════════════════════════════════════════════

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Dashboard from "./pages/Dashboard";

// Componentă care protejează rutele
function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: 20 }}>Se încarcă...</div>;
  }

  if (!user) {
    // IMPORTANT: ai basename="/app", deci folosim path relativ la /app
    return <Navigate to="/login.html" replace />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter basename="/app">
      <AuthProvider>
        <Routes>
          {/* Home -> login static */}
          <Route path="/" element={<Navigate to="/login.html" replace />} />

          {/* Orice /login din React -> login static */}
          <Route path="/login" element={<Navigate to="/login.html" replace />} />

          {/* Dashboard protejat */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
