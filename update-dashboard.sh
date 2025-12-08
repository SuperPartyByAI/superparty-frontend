#!/bin/bash

echo "🔧 Generez fișierul src/pages/Dashboard.tsx ..."

mkdir -p src/pages

cat > src/pages/Dashboard.tsx << 'EOF'
// ═══════════════════════════════════════════════════════════
// Dashboard.tsx – Pagina principală după Autentificare
// ═══════════════════════════════════════════════════════════

import React from "react";
import { useAuth } from "../context/AuthContext";

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: 30,
        background: "#f1f5f9",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: 800,
          margin: "0 auto",
          background: "#fff",
          padding: 24,
          borderRadius: 16,
          boxShadow: "0 8px 28px rgba(0,0,0,0.1)",
        }}
      >
        <h1 style={{ fontSize: 28, marginBottom: 20, color: "#1e293b" }}>
          Bun venit, {user?.name}! 🎉
        </h1>

        <p style={{ fontSize: 16, marginBottom: 10, color: "#334155" }}>
          Email: <b>{user?.email}</b>
        </p>

        <p style={{ fontSize: 16, marginBottom: 10, color: "#334155" }}>
          Rol: <b>{user?.role}</b>
        </p>

        {user?.is_driver && (
          <p style={{ fontSize: 16, marginBottom: 10, color: "#334155" }}>
            Statut: <b>Șofer</b>
          </p>
        )}

        <button
          onClick={logout}
          style={{
            marginTop: 20,
            padding: "10px 16px",
            background: "#ef4444",
            color: "white",
            borderRadius: 10,
            border: "none",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
EOF

echo "✅ Dashboard.tsx a fost generat cu succes!"
