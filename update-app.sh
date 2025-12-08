#!/bin/bash

echo "🔧 Generez fișierul src/App.tsx ..."

cat > src/App.tsx << 'EOF'
// ═══════════════════════════════════════════════════════════
// App.tsx – Routing + Protected Routes SuperParty (FINAL)
// ═══════════════════════════════════════════════════════════

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

// Componentă care protejează rutele
function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: 20 }}>Se încarcă...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter basename="/app">
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />

          <Route path="/login" element={<Login />} />

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
EOF

echo "✅ App.tsx a fost generat cu succes!"

