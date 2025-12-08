#!/bin/bash

echo "🔧 Generez fișierul src/pages/Login.tsx ..."

mkdir -p src/pages

cat > src/pages/Login.tsx << 'EOF'
// ═══════════════════════════════════════════════════════════
// Login.tsx – Pagina de autentificare SuperParty (FINAL)
// ═══════════════════════════════════════════════════════════

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Eroare la autentificare");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, rgba(102,126,234,1), rgba(118,75,162,1))",
        padding: 16,
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 18,
          padding: "28px 26px",
          width: "100%",
          maxWidth: 380,
          boxShadow: "0 18px 40px rgba(0,0,0,0.25)",
        }}
      >
        <h1
          style={{
            margin: 0,
            marginBottom: 6,
            fontSize: 22,
            fontWeight: 700,
            color: "#1e293b",
          }}
        >
          SuperParty Login
        </h1>

        <p
          style={{
            margin: 0,
            marginBottom: 20,
            fontSize: 13,
            color: "#475569",
          }}
        >
          Autentifică-te pentru a continua
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#1e293b",
                marginBottom: 4,
                display: "block",
              }}
            >
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid #cbd5e1",
                outline: "none",
                fontSize: 14,
              }}
            />
          </div>

          <div style={{ marginBottom: 10 }}>
            <label
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#1e293b",
                marginBottom: 4,
                display: "block",
              }}
            >
              Parola
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid #cbd5e1",
                outline: "none",
                fontSize: 14,
              }}
            />
          </div>

          {error && (
            <div
              style={{
                marginBottom: 10,
                color: "#dc2626",
                fontSize: 13,
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: 999,
              border: "none",
              background: "#4f46e5",
              color: "white",
              fontWeight: 600,
              fontSize: 14,
              cursor: loading ? "default" : "pointer",
              opacity: loading ? 0.8 : 1,
            }}
          >
            {loading ? "Se conectează..." : "Autentificare"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
EOF

echo "✅ Login.tsx a fost generat cu succes!"
