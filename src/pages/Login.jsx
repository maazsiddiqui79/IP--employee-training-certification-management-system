import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import Icon from "../components/Icon";
import { loginSchema } from "../utils/schemas";

export default function Login() {
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      const err = validation.error.format();
      setError(err.email?._errors[0] || err.password?._errors[0] || "Invalid input.");
      return;
    }

    setLoading(true);

    // Simulate network delay for loading state visibility
    setTimeout(() => {
      const result = login(email.trim(), password);
      setLoading(false);

      if (!result.success) {
        setError(result.message);
        addToast(result.message, "error");
        return;
      }

      addToast("Login successful!", "success");
      if (result.role === "ADMIN") navigate("/admin/dashboard");
      else navigate("/employee/dashboard");
    }, 600);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Branding */}
        <div className="login-brand">
          <div className="login-logo">
            <span>ET</span>
          </div>
          <h1 className="login-title">Training &amp; Certification</h1>
          <p className="login-subtitle">Employee Management System</p>
        </div>

        {/* Form */}
        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <h2 className="login-heading">Sign In</h2>

          {error && (
            <div className="alert alert-error" role="alert">
              <span className="alert-icon"><Icon name="warning" /></span>
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="login-email" className="form-label">
              Email Address
            </label>
            <input
              id="login-email"
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password" className="form-label">
              Password
            </label>
            <div className="password-input-wrap">
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <Icon name="eyeOff" /> : <Icon name="eye" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
          >
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                <span className="spinner"></span> Signing in...
              </span>
            ) : "Sign In"}
          </button>
        </form>

        {/* Demo hint */}
        <div className="login-hint">
          <p><strong>Admin:</strong> admin@example.com</p>
          <p><strong>Admin Password:</strong> admin123</p>
          <p><strong>Employee:</strong> alice@example.com</p>
          <p><strong>Employee Password:</strong> alice123</p>
          <small style={{ color: "var(--text-muted)", fontSize: "12px" }}>Here credentials are for demo purpose only.</small>
        </div>
      </div>
    </div>
  );
}
