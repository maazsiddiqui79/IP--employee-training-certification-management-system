import React, { useState } from "react";
import Header from "../components/Header";
import EmployeeTable from "../components/EmployeeTable";
import EmployeeForm from "../components/EmployeeForm";
import CertificateVerification from "../components/CertificateVerification";
import AdminAssessments from "../components/AdminAssessments";
import Reports from "../components/Reports";
import EmployeeViewModal from "../components/EmployeeViewModal";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import Icon from "../components/Icon";

// Admin dashboard tabs
const TABS = [
  { key: "employees",    label: <><Icon name="users" /> Employees</>               },
  { key: "certificates", label: <><Icon name="certificate" /> Certificate Verification</> },
  { key: "assessments",  label: <><Icon name="assessment" /> Assessments</>              },
  { key: "reports",      label: <><Icon name="reports" /> Reports</>                  },
];

export default function AdminDashboard() {
  const { db, deleteEmployee } = useAuth();
  const { addToast } = useToast();

  const [activeTab,    setActiveTab]    = useState("employees");
  const [modal,        setModal]        = useState(null);   // null | { mode: "add" } | { mode: "edit", employeeId }
  const [viewModal,    setViewModal]    = useState(null);   // null | employeeId
  const [deleteTarget, setDeleteTarget] = useState(null);   // null | employeeId

  const handleDeleteConfirm = () => {
    deleteEmployee(deleteTarget);
    addToast("Employee deleted successfully.", "success");
    setDeleteTarget(null);
  };

  const deleteTargetName = deleteTarget
    ? (db.employees.find((e) => e.id === deleteTarget) || {}).name || "this employee"
    : "";

  // Pending cert count for badge
  const pendingCertCount = db.uploadedCertificates.filter((c) => c.status === "PENDING").length;

  return (
    <div className="page-wrapper">
      <Header title="Admin Dashboard" />

      <main className="main-content">
        {/* Top-level Dashboard Tabs */}
        <div className="dashboard-tabs-nav">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              id={`tab-${tab.key}`}
              className={`dashboard-tab-btn ${activeTab === tab.key ? "active" : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
              {tab.key === "certificates" && pendingCertCount > 0 && (
                <span className="tab-badge">{pendingCertCount}</span>
              )}
            </button>
          ))}
        </div>

        {/* ── Employees Tab ── */}
        {activeTab === "employees" && (
          <>
            <div className="page-header">
              <div>
                <h1 className="page-title">Employee Management</h1>
                <p className="page-subtitle">
                  Manage the workforce and assign roles.
                </p>
              </div>
              <button
                id="add-employee-btn"
                className="btn btn-primary"
                onClick={() => setModal({ mode: "add" })}
              >
                + Add Employee
              </button>
            </div>

            {/* PHASE 2 & 14 — Stat Cards & Pending Summary */}
            <div className="stat-grid" style={{ marginBottom: "24px" }}>
              <div className="stat-card stat-total">
                <span className="stat-icon"><Icon name="users" /></span>
                <div className="stat-content">
                  <span className="stat-label">Total Employees</span>
                  <span className="stat-value">{db.employees.length}</span>
                </div>
              </div>
              <div className="stat-card stat-approved">
                <span className="stat-icon"><Icon name="check" /></span>
                <div className="stat-content">
                  <span className="stat-label">Approved Certifications</span>
                  <span className="stat-value">
                    {db.uploadedCertificates.filter(c => c.status === "APPROVED").length}
                  </span>
                </div>
              </div>
              <div className="stat-card stat-info">
                <span className="stat-icon"><Icon name="assessment" /></span>
                <div className="stat-content">
                  <span className="stat-label">Total Assessments</span>
                  <span className="stat-value">{db.adminAssessments.length}</span>
                </div>
              </div>
              <div className="stat-card stat-pending" 
                   onClick={() => setActiveTab("certificates")}
                   style={{ cursor: "pointer" }}
                   title="Click to view pending certificates">
                <span className="stat-icon"><Icon name="pending" /></span>
                <div className="stat-content">
                  <span className="stat-label">Pending Certifications</span>
                  <span className="stat-value">{pendingCertCount}</span>
                </div>
              </div>
            </div>

            <div className="content-card" style={{ marginBottom: "24px", padding: "16px", backgroundColor: "var(--bg-card)", borderRadius: "8px", border: "1px solid var(--border)" }}>
              <h3 style={{ marginTop: 0, marginBottom: "16px", fontSize: "16px", borderBottom: "1px solid var(--border)", paddingBottom: "8px" }}>
                Recent Activity
              </h3>
              {db.activities && db.activities.length > 0 ? (
                <ul style={{ listStyle: "none", padding: 0, margin: 0, maxHeight: "150px", overflowY: "auto" }}>
                  {db.activities.slice(0, 10).map(act => (
                    <li key={act.id} style={{ fontSize: "14px", marginBottom: "8px", paddingBottom: "8px", borderBottom: "1px dashed var(--border)" }}>
                      <span style={{ fontWeight: "bold", color: "var(--primary)" }}>{act.user}</span>: {act.action || act.text}
                      <br />
                      <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                        {new Date(act.date).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>No recent activity.</p>
              )}
            </div>

            <div className="content-card">
              <EmployeeTable
                employees={db.employees}
                onEdit={(id) => setModal({ mode: "edit", employeeId: id })}
                onDelete={(id) => setDeleteTarget(id)}
                onView={(id) => setViewModal(id)}
              />
            </div>
          </>
        )}

        {/* ── Certificate Verification Tab ── */}
        {activeTab === "certificates" && <CertificateVerification />}

        {/* ── Assessments Tab ── */}
        {activeTab === "assessments" && <AdminAssessments />}

        {/* ── Reports Tab ── */}
        {activeTab === "reports" && <Reports />}
      </main>

      {/* Add / Edit Employee Modal */}
      {modal && (
        <EmployeeForm
          mode={modal.mode}
          employeeId={modal.employeeId}
          onClose={() => setModal(null)}
        />
      )}

      {/* View Employee Modal */}
      {viewModal && (
        <EmployeeViewModal
          employeeId={viewModal}
          onClose={() => setViewModal(null)}
        />
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <div className="modal-overlay">
          <div className="modal modal-sm" role="dialog" aria-modal="true" aria-label="Confirm Delete">
            <div className="modal-header">
              <h2 className="modal-title">Confirm Deletion</h2>
            </div>
            <div className="modal-body">
              <div className="confirm-icon"><Icon name="trash" /></div>
              <p className="confirm-message">
                Are you sure you want to delete <strong>{deleteTargetName}</strong>?
              </p>
              <p className="confirm-sub">
                This will also remove their login account, certificates, and assessment records. This action cannot be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button id="cancel-delete-btn" className="btn btn-secondary" onClick={() => setDeleteTarget(null)}>
                Cancel
              </button>
              <button id="confirm-delete-btn" className="btn btn-danger" onClick={handleDeleteConfirm}>
                Delete Employee
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
