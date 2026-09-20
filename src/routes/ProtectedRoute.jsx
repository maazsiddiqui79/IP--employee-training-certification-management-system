import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Blocks unauthenticated users → /login
// Blocks wrong-role users → their own dashboard
export function ProtectedRoute({ children, requiredRole }) {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && currentUser.role !== requiredRole) {
    // Send each role to their correct home
    if (currentUser.role === "ADMIN")     return <Navigate to="/admin/dashboard"    replace />;
    if (currentUser.role === "EMPLOYEE")  return <Navigate to="/employee/dashboard" replace />;
  }

  return children;
}
