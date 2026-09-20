import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import StatusBadge from "./StatusBadge";
import { useToast } from "../context/ToastContext";
import SearchInput from "./SearchInput";
import Icon from "./Icon";
import CertificatePreviewModal from "./CertificatePreviewModal";

// CertificateVerification — Admin view of all uploaded certificates
// Shows PENDING queue + all certs for review
export default function CertificateVerification() {
  const { db, currentUser, approveCertificate, rejectCertificate } = useAuth();

  const { addToast } = useToast();

  const [filter,       setFilter]       = useState("PENDING"); // "PENDING" | "ALL"
  const [searchQuery,  setSearchQuery]  = useState("");
  const [sortOrder,    setSortOrder]    = useState("date-desc"); // "date-desc" | "date-asc" | "name-asc"
  const [selectedCert, setSelectedCert] = useState(null);      // cert being reviewed
  const [rejectMode,   setRejectMode]   = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectError,  setRejectError]  = useState("");
  const [previewCert,  setPreviewCert]  = useState(null);

  const getEmployee = (empId) => db.employees.find((e) => e.id === empId);

  const baseCerts = filter === "PENDING"
    ? db.uploadedCertificates.filter((c) => c.status === "PENDING")
    : [...db.uploadedCertificates].sort((a, b) => {
        const order = { PENDING: 0, REJECTED: 1, APPROVED: 2 };
        return (order[a.status] ?? 3) - (order[b.status] ?? 3);
      });

  const certs = baseCerts.filter(c => {
    if (!searchQuery.trim()) return true;
    const lowerQuery = searchQuery.toLowerCase();
    const emp = getEmployee(c.employeeId);
    const empName = emp ? emp.name.toLowerCase() : "";
    return c.certificateName.toLowerCase().includes(lowerQuery) || empName.includes(lowerQuery);
  }).sort((a, b) => {
    if (sortOrder === "date-desc") return new Date(b.uploadedAt) - new Date(a.uploadedAt);
    if (sortOrder === "date-asc") return new Date(a.uploadedAt) - new Date(b.uploadedAt);
    if (sortOrder === "name-asc") return a.certificateName.localeCompare(b.certificateName);
    return 0;
  });

  const handleApprove = (certId) => {
    approveCertificate(certId, currentUser.name);
    // Update selected cert view if it's the same one
    setSelectedCert((prev) =>
      prev && prev.id === certId
        ? { ...prev, status: "APPROVED", rejectionReason: null, verifiedAt: new Date().toISOString().split("T")[0], verifiedBy: currentUser.name }
        : prev
    );
    setRejectMode(false);
    addToast("Certificate approved successfully.", "success");
  };

  const handleRejectSubmit = (certId) => {
    if (!rejectReason.trim()) {
      setRejectError("Rejection reason is required.");
      return;
    }
    rejectCertificate(certId, rejectReason.trim(), currentUser.name);
    setSelectedCert((prev) =>
      prev && prev.id === certId
        ? { ...prev, status: "REJECTED", rejectionReason: rejectReason.trim(), verifiedAt: new Date().toISOString().split("T")[0], verifiedBy: currentUser.name }
        : prev
    );
    setRejectMode(false);
    setRejectReason("");
    setRejectError("");
    addToast("Certificate rejected.", "error");
  };

  const openFile = (cert) => {
    setPreviewCert(cert);
  };

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  return (
    <div className="section-container">
      {/* Header */}
      <div className="section-header">
        <div>
          <h2 className="section-title">Certificate Verification</h2>
          <p className="section-subtitle">
            {db.uploadedCertificates.filter((c) => c.status === "PENDING").length} certificate(s) awaiting review
          </p>
        </div>
        <div style={{ display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap" }}>
          <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Search certificates..." />
          <select className="form-input form-select" style={{ width: "160px" }} value={sortOrder} onChange={e => setSortOrder(e.target.value)}>
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="name-asc">Name (A-Z)</option>
          </select>
          <div className="filter-tabs">
            <button
              className={`filter-tab ${filter === "PENDING" ? "active" : ""}`}
              onClick={() => setFilter("PENDING")}
            >
              Pending ({db.uploadedCertificates.filter((c) => c.status === "PENDING").length})
            </button>
            <button
              className={`filter-tab ${filter === "ALL" ? "active" : ""}`}
              onClick={() => setFilter("ALL")}
            >
              All Certificates ({db.uploadedCertificates.length})
            </button>
          </div>
        </div>
      </div>

      <div className="verification-layout">
        {/* List panel */}
        <div className="cert-list-panel">
          {certs.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><Icon name="check" /></div>
              <p className="empty-state-text">No certificates pending verification.</p>
            </div>
          ) : (
            certs.map((cert) => {
              const emp = getEmployee(cert.employeeId);
              return (
                <div
                  key={cert.id}
                  className={`cert-list-item ${selectedCert?.id === cert.id ? "selected" : ""}`}
                  onClick={() => { setSelectedCert(cert); setRejectMode(false); setRejectReason(""); setRejectError(""); }}
                >
                  <div className="cert-list-item-top">
                    <span className="cert-list-name">{cert.certificateName}</span>
                    <StatusBadge status={cert.status} />
                  </div>
                  <div className="cert-list-item-sub">
                    <span>{emp ? emp.name : `Employee #${cert.employeeId}`}</span>
                    <span>·</span>
                    <span>{cert.organization}</span>
                    <span>·</span>
                    <span>Uploaded: {formatDate(cert.uploadedAt)}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Detail panel */}
        <div className="cert-detail-panel">
          {!selectedCert ? (
            <div className="cert-detail-empty">
              <div className="empty-state-icon"><Icon name="search" /></div>
              <p className="empty-state-text">Select a certificate from the list to review it.</p>
            </div>
          ) : (
            <>
              <div className="cert-detail-header">
                <h3 className="cert-detail-title">{selectedCert.certificateName}</h3>
                <StatusBadge status={selectedCert.status} />
              </div>

              <div className="cert-detail-grid">
                <div className="detail-field">
                  <span className="detail-label">Employee</span>
                  <span className="detail-value">
                    {(() => { const e = getEmployee(selectedCert.employeeId); return e ? e.name : "—"; })()}
                  </span>
                </div>
                <div className="detail-field">
                  <span className="detail-label">Organization</span>
                  <span className="detail-value">{selectedCert.organization}</span>
                </div>
                <div className="detail-field">
                  <span className="detail-label">Issue Date</span>
                  <span className="detail-value">{formatDate(selectedCert.issueDate)}</span>
                </div>
                <div className="detail-field">
                  <span className="detail-label">Expiry Date</span>
                  <span className="detail-value">{formatDate(selectedCert.expiryDate)}</span>
                </div>
                <div className="detail-field">
                  <span className="detail-label">Certificate ID</span>
                  <span className="detail-value">{selectedCert.certificateId || "—"}</span>
                </div>
                <div className="detail-field">
                  <span className="detail-label">Verification URL</span>
                  <span className="detail-value">
                    {selectedCert.verificationUrl
                      ? <a href={selectedCert.verificationUrl} target="_blank" rel="noreferrer" className="link">Open ↗</a>
                      : "—"}
                  </span>
                </div>
                <div className="detail-field">
                  <span className="detail-label">File</span>
                  <span className="detail-value">
                    {selectedCert.fileName
                      ? <button className="btn btn-sm btn-view" onClick={() => openFile(selectedCert)}><Icon name="file" /> View File</button>
                      : "—"}
                  </span>
                </div>
                <div className="detail-field">
                  <span className="detail-label">Uploaded</span>
                  <span className="detail-value">{formatDate(selectedCert.uploadedAt)}</span>
                </div>
                {selectedCert.verifiedAt && (
                  <>
                    <div className="detail-field">
                      <span className="detail-label">Verified On</span>
                      <span className="detail-value">{formatDate(selectedCert.verifiedAt)}</span>
                    </div>
                    <div className="detail-field">
                      <span className="detail-label">Verified By</span>
                      <span className="detail-value">{selectedCert.verifiedBy}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Rejection reason display */}
              {selectedCert.status === "REJECTED" && selectedCert.rejectionReason && (
                <div className="rejection-reason-box">
                  <strong>Rejection Reason:</strong>
                  <p>{selectedCert.rejectionReason}</p>
                </div>
              )}

              {/* Action buttons — only for PENDING */}
              {selectedCert.status === "PENDING" && !rejectMode && (
                <div className="cert-actions">
                  <button
                    className="btn btn-success"
                    onClick={() => handleApprove(selectedCert.id)}
                  >
                    <Icon name="checkSmall" /> Approve
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => setRejectMode(true)}
                  >
                    <Icon name="x" /> Reject
                  </button>
                </div>
              )}

              {/* Reject form */}
              {rejectMode && (
                <div className="reject-form">
                  <label className="form-label">Rejection Reason <span className="required">*</span></label>
                  <textarea
                    className={`form-input form-textarea ${rejectError ? "input-error" : ""}`}
                    rows={3}
                    value={rejectReason}
                    onChange={(e) => { setRejectReason(e.target.value); setRejectError(""); }}
                    placeholder="Explain why this certificate is being rejected..."
                  />
                  {rejectError && <span className="field-error">{rejectError}</span>}
                  <div className="cert-actions">
                    <button className="btn btn-secondary" onClick={() => { setRejectMode(false); setRejectReason(""); setRejectError(""); }}>
                      Cancel
                    </button>
                    <button className="btn btn-danger" onClick={() => handleRejectSubmit(selectedCert.id)}>
                      Confirm Rejection
                    </button>
                  </div>
                </div>
              )}

              {/* Already verified badge */}
              {(selectedCert.status === "APPROVED" || selectedCert.status === "REJECTED") && (
                <div className="verified-notice">
                  This certificate has already been{" "}
                  <strong>{selectedCert.status === "APPROVED" ? "approved" : "rejected"}</strong>.
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {previewCert && (
        <CertificatePreviewModal 
          certificate={previewCert} 
          onClose={() => setPreviewCert(null)} 
        />
      )}
    </div>
  );
}
