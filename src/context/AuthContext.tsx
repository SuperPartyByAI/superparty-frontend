import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { api } from "../utils/api";

interface User {
  id: string;
  email: string;
  nume: string;
  prenume: string;
  rol?: string;
  kyc_status?: string;
  is_admin: boolean;
  is_driver: boolean;
  status: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; redirect?: string; error?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("superparty_user");
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      } catch (error) {
        console.error("Error parsing stored user:", error);
        localStorage.removeItem("superparty_user");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.login(email, password);

      if (response.success && response.user) {
        setUser(response.user);
        localStorage.setItem("superparty_user", JSON.stringify(response.user));

        // TOȚI USERII MERG LA /dashboard (inclusiv admin)
        return { success: true, redirect: "/dashboard" };
      }

      return { success: false, error: response.error || "Email sau parolă greșită" };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: "Eroare de conexiune" };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("superparty_user");
    window.location.href = "/login";
  };

  const refreshUser = async () => {
    if (user) {
      const freshUser = await api.getUser(user.id);
      if (freshUser) {
        setUser(freshUser);
        localStorage.setItem("superparty_user", JSON.stringify(freshUser));
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
