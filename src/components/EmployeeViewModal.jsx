import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import CertificatesTab from "./CertificatesTab";
import AssessmentsTab from "./AssessmentsTab";
import Avatar from "./Avatar";
import Icon from "./Icon";

export default function EmployeeViewModal({ employeeId, onClose }) {
  const { db } = useAuth();
  const [activeTab, setActiveTab] = useState("certificates");

  const employee = db.employees.find((e) => e.id === employeeId);
  const user     = db.users.find((u) => u.employeeId === employeeId);
  
  if (!employee) return null;

  const designation = db.designations.find((d) => d.id === employee.designationId);
  const role        = user ? user.role : "—";

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: 'numeric' });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-lg" role="dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header print-hide">
          <h2 className="modal-title">Employee Details</h2>
          <div style={{ display: "flex", gap: "8px" }}>
            <button className="btn btn-secondary btn-sm" onClick={() => window.print()}>
              🖨️ Print Profile
            </button>
            <button className="btn-close" onClick={onClose} aria-label="Close" style={{ alignSelf: "center" }}><Icon name="close" /></button>
          </div>
        </div>
        
        <div className="modal-body print-area" style={{ maxHeight: "70vh", overflowY: "auto", padding: "0" }}>
          <div className="employee-details">
            {/* Profile Card */}
            <div className="profile-card" style={{ border: "none", boxShadow: "none", margin: 0, borderRadius: 0 }}>
              <Avatar name={employee.name} size={64} style={{ flexShrink: 0 }} />
              <div className="profile-info">
                <h2 className="profile-name">{employee.name}</h2>
                <div className="profile-fields" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div className="profile-field">
                    <span className="profile-field-label">Email</span>
                    <span className="profile-field-value">{employee.email}</span>
                  </div>
                  <div className="profile-field">
                    <span className="profile-field-label">Phone</span>
                    <span className="profile-field-value">{employee.phone || "—"}</span>
                  </div>
                  <div className="profile-field">
                    <span className="profile-field-label">Designation</span>
                    <span className="profile-field-value">{designation ? designation.name : "—"}</span>
                  </div>
                  <div className="profile-field">
                    <span className="profile-field-label">Role</span>
                    <span className={`role-badge role-${role.toLowerCase()}`}>{role}</span>
                  </div>
                  <div className="profile-field">
                    <span className="profile-field-label">Date of Joining</span>
                    <span className="profile-field-value">{formatDate(employee.dateOfJoining)}</span>
                  </div>
                  <div className="profile-field">
                    <span className="profile-field-label">Last Login</span>
                    <span className="profile-field-value">{formatDateTime(user?.lastLogin)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="tabs-container" style={{ margin: "0 24px 24px" }}>
              <div className="tabs-nav" role="tablist">
                <button
                  role="tab"
                  aria-selected={activeTab === "certificates"}
                  className={`tab-btn ${activeTab === "certificates" ? "tab-active" : ""}`}
                  onClick={() => setActiveTab("certificates")}
                >
                  <Icon name="certificate" /> Certificates
                </button>
                <button
                  role="tab"
                  aria-selected={activeTab === "assessments"}
                  className={`tab-btn ${activeTab === "assessments" ? "tab-active" : ""}`}
                  onClick={() => setActiveTab("assessments")}
                >
                  <Icon name="reports" /> Assessments
                </button>
              </div>

              <div className="tab-content" role="tabpanel" style={{ padding: "16px 0" }}>
                {activeTab === "certificates" && (
                  <CertificatesTab employeeId={employee.id} certificates={db.certificates} />
                )}
                {activeTab === "assessments" && (
                  <AssessmentsTab employeeId={employee.id} assessments={db.assessments} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
