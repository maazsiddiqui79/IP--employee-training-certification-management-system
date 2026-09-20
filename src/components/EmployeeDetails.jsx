import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import CertificatesTab from "./CertificatesTab";
import AssessmentsTab from "./AssessmentsTab";
import Icon from "./Icon";

// EmployeeDetails — profile card + tabbed records view
// Used by both EmployeeDetailsPage (admin) and EmployeeDashboard (employee)
// Props: employee, readOnly (bool — hides edit/delete in employee view)
export default function EmployeeDetails({ employee, readOnly = false }) {
  const { db } = useAuth();
  const [activeTab, setActiveTab] = useState("certificates");

  const designation = db.designations.find((d) => d.id === employee.designationId);
  const user        = db.users.find((u) => u.employeeId === employee.id);
  const role        = user ? user.role : "—";

  return (
    <div className="employee-details">
      {/* Profile Card */}
      <div className="profile-card">
        <div className="profile-avatar">
          {employee.name.charAt(0).toUpperCase()}
        </div>
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
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        <div className="tabs-nav" role="tablist">
          <button
            id="tab-certificates"
            role="tab"
            aria-selected={activeTab === "certificates"}
            className={`tab-btn ${activeTab === "certificates" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("certificates")}
          >
            <Icon name="certificate" /> Certificates
          </button>
          <button
            id="tab-assessments"
            role="tab"
            aria-selected={activeTab === "assessments"}
            className={`tab-btn ${activeTab === "assessments" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("assessments")}
          >
            <Icon name="reports" /> Assessments
          </button>
        </div>

        <div className="tab-content" role="tabpanel">
          {activeTab === "certificates" && (
            <CertificatesTab
              employeeId={employee.id}
              certificates={db.certificates}
            />
          )}
          {activeTab === "assessments" && (
            <AssessmentsTab
              employeeId={employee.id}
              assessments={db.assessments}
            />
          )}
        </div>
      </div>
    </div>
  );
}
