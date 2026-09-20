import React from "react";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="not-found-card" style={{ maxWidth: "600px", margin: "100px auto", textAlign: "center" }}>
      <div className="not-found-icon" style={{ fontSize: "64px", marginBottom: "24px" }}>404</div>
      <h2 className="not-found-title" style={{ fontSize: "32px", marginBottom: "16px" }}>Page Not Found</h2>
      <p className="not-found-sub" style={{ fontSize: "18px", marginBottom: "32px", color: "var(--text-muted)" }}>
        The page you are looking for doesn't exist or has been moved.
      </p>
      <button className="btn btn-primary" onClick={() => navigate("/")}>
        Go to Home
      </button>
    </div>
  );
}
