import React, { useState } from "react";
import Header from "../components/Header";
import MyCertificates from "../components/MyCertificates";
import MyAssessments from "../components/MyAssessments";
import Avatar from "../components/Avatar";
import { useAuth } from "../context/AuthContext";
import Icon from "../components/Icon";

export default function EmployeeDashboard() {
  const { currentUser, db } = useAuth();
  const [activeTab, setActiveTab] = useState("certificates");

  const employee    = db.employees.find((e) => e.id === currentUser.employeeId);
  const designation = employee
    ? db.designations.find((d) => d.id === employee.designationId)
    : null;
  const user = db.users.find((u) => u.employeeId === currentUser.employeeId);
  const role = user ? user.role : currentUser.role;

  if (!employee) {
    return (
      <div className="page-wrapper">
        <Header title="My Dashboard" />
        <main className="main-content">
          <div className="not-found-card">
            <div className="not-found-icon"><Icon name="warning" />️</div>
            <h2 className="not-found-title">Profile Not Found</h2>
            <p className="not-found-sub">
              Your employee record could not be loaded. Please contact your administrator.
            </p>
          </div>
        </main>
      </div>
    );
  }

  // Counts for tab labels
  const myCerts    = db.uploadedCertificates.filter((c) => c.employeeId === employee.id);
  const myResults  = db.assessmentResults.filter((r) => r.employeeId === employee.id);

  return (
    <div className="page-wrapper">
      <Header title="My Dashboard" />

      <main className="main-content">
        {/* Profile Card */}
        <div className="profile-card">
          <Avatar name={employee.name} size={64} style={{ flexShrink: 0 }} />
          <div className="profile-info">
            <h2 className="profile-name">{employee.name}</h2>
            <div className="profile-fields">
              <div className="profile-field">
                <span className="profile-field-label">Email</span>
                <span className="profile-field-value">{employee.email}</span>
              </div>
              <div className="profile-field">
                <span className="profile-field-label">Designation</span>
                <span className="profile-field-value">
                  {designation ? designation.name : "—"}
                </span>
              </div>
              <div className="profile-field">
                <span className="profile-field-label">Role</span>
                <span className={`role-badge role-${role.toLowerCase()}`}>{role}</span>
              </div>
              <div className="profile-field">
                <span className="profile-field-label">Status</span>
                {(() => {
                  if (myCerts.length === 0) return <span className="status-badge bg-secondary">No Certificates</span>;
                  if (myCerts.some(c => c.status === "PENDING")) return <span className="status-badge bg-warning">Pending</span>;
                  if (myCerts.some(c => c.status === "APPROVED")) return <span className="status-badge bg-success">Verified</span>;
                  return <span className="status-badge bg-secondary">No Certificates</span>;
                })()}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs-container">
          <div className="tabs-nav" role="tablist">
            <button
              id="tab-my-certificates"
              role="tab"
              aria-selected={activeTab === "certificates"}
              className={`tab-btn ${activeTab === "certificates" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("certificates")}
            >
              <Icon name="certificate" /> My Certificates
              {myCerts.length > 0 && (
                <span className="tab-count">({myCerts.length})</span>
              )}
            </button>
            <button
              id="tab-my-assessments"
              role="tab"
              aria-selected={activeTab === "assessments"}
              className={`tab-btn ${activeTab === "assessments" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("assessments")}
            >
              <Icon name="reports" /> My Assessments
              {myResults.length > 0 && (
                <span className="tab-count">({myResults.length})</span>
              )}
            </button>
          </div>

          <div className="tab-content" role="tabpanel">
            {activeTab === "certificates" && (
              <MyCertificates employeeId={employee.id} />
            )}
            {activeTab === "assessments" && (
              <MyAssessments employeeId={employee.id} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
