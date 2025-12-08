#!/bin/bash

echo "🔧 Generez fișierul src/context/AuthContext.tsx ..."

mkdir -p src/context

cat > src/context/AuthContext.tsx << 'EOF'
// ═══════════════════════════════════════════════════════════
// AuthContext.tsx – Sistem Autentificare SuperParty (FINAL)
// ═══════════════════════════════════════════════════════════

import React, { createContext, useContext, useEffect, useState } from "react";
import { loginUser, LoginResponse } from "../api/auth";

export interface AuthUser extends LoginResponse {}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "sp_user";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        setUser(JSON.parse(data));
      }
    } catch (error) {
      console.warn("Nu pot citi userul din localStorage:", error);
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const userData = await loginUser(email, password);
      setUser(userData);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth trebuie folosit în interiorul AuthProvider");
  }
  return ctx;
};
EOF

echo "✅ AuthContext.tsx a fost generat cu succes!"
