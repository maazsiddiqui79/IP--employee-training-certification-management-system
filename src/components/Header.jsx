import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useToast } from "../context/ToastContext";
import Icon from "./Icon";

export default function Header({ title }) {
  const { currentUser, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const { addToast } = useToast();
  const navigate = useNavigate();
  
  const [isNavOpen, setIsNavOpen] = useState(false);

  const handleLogout = () => {
    logout();
    addToast("Logged out successfully.", "success");
    navigate("/login");
  };

  return (
    <header className="header">
      <div className="header-left">
        <div className="header-logo">ET</div>
        <div className="header-brand">
          <span className="header-system-name">Training &amp; Certification MS</span>
          {title && <span className="header-page-title">{title}</span>}
        </div>
      </div>

      <div className="header-right">
        {currentUser && (
          <button 
            className="mobile-menu-btn"
            onClick={() => setIsNavOpen(!isNavOpen)}
            aria-label="Toggle menu"
          >
            <Icon name="menu" />
          </button>
        )}
        
        <div className={`header-nav ${isNavOpen ? "nav-open" : ""}`}>
          <button 
            className="theme-toggle-btn" 
            onClick={toggleTheme}
            aria-label="Toggle Dark Mode"
            title="Toggle Dark Mode"
          >
            {isDarkMode ? <Icon name="sun" /> : <Icon name="moon" />}
          </button>
          
          {currentUser && (
            <>
              <div className="header-user">
                <div className="header-avatar">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="header-user-info">
                  <span className="header-user-name">{currentUser.name}</span>
                  <span className={`role-badge role-${currentUser.role.toLowerCase()}`}>
                    {currentUser.role}
                  </span>
                </div>
              </div>
              <button
                id="logout-btn"
                className="btn btn-outline btn-sm"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
