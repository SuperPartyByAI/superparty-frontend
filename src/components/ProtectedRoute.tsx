import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiresAuth?: boolean;
  requiresKyc?: boolean;
  requiresAdmin?: boolean;
}

export function ProtectedRoute({
  children,
  requiresAuth = true,
  requiresKyc = false,
  requiresAdmin = false,
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-400">Se încarcă...</p>
        </div>
      </div>
    );
  }

  if (requiresAuth && !user) {
    return <Navigate to="/login" replace />;
  }

  if (requiresKyc && user && user.kyc_status !== "approved") {
    if (user.kyc_status === "pending_approval") {
      return <Navigate to="/kyc-pending" replace />;
    }
    return <Navigate to="/kyc" replace />;
  }

  if (requiresAdmin && user && !user.is_admin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
