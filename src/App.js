import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { ThemeProvider } from "./context/ThemeContext";

import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import EmployeeDetailsPage from "./pages/EmployeeDetailsPage";
import NotFound from "./pages/NotFound";
import BackToTop from "./components/BackToTop";

import "./styles/styles.css";

function ProtectedRoute({ children, requiredRole }) {
  const { currentUser } = useAuth();
  
  if (!currentUser) return <Navigate to="/login" replace />;
  if (requiredRole && currentUser.role !== requiredRole) {
    return <Navigate to={currentUser.role === "ADMIN" ? "/admin/dashboard" : "/employee/dashboard"} replace />;
  }
  return children;
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <div className="app-container">
              <Routes>
                {/* Public */}
                <Route path="/login" element={<Login />} />

                {/* Admin-only routes */}
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute requiredRole="ADMIN">
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/employees/:employeeId"
                  element={
                    <ProtectedRoute requiredRole="ADMIN">
                      <EmployeeDetailsPage />
                    </ProtectedRoute>
                  }
                />

                {/* Employee-only routes */}
                <Route
                  path="/employee/dashboard"
                  element={
                    <ProtectedRoute requiredRole="EMPLOYEE">
                      <EmployeeDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Default: redirect root to login */}
                <Route path="/" element={<Navigate to="/login" replace />} />
                
                {/* 404 Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              <BackToTop />
            </div>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
