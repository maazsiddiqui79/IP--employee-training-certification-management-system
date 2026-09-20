import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import StatusBadge from "./StatusBadge";
import CertificateUploadForm from "./CertificateUploadForm";
import CertificatePreviewModal from "./CertificatePreviewModal";
import Icon from "./Icon";

// MyCertificates — Employee's own certificate view (all statuses) + upload
// Props: employeeId
export default function MyCertificates({ employeeId }) {
  const { db } = useAuth();
  const [showUpload, setShowUpload] = useState(false);
  const [previewCert, setPreviewCert] = useState(null);

  const today = new Date().toISOString().split("T")[0];

  const myCerts   = db.uploadedCertificates.filter((c) => c.employeeId === employeeId);
  const approved  = myCerts.filter((c) => c.status === "APPROVED");
  const pending   = myCerts.filter((c) => c.status === "PENDING");
  const rejected  = myCerts.filter((c) => c.status === "REJECTED");

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  const isExpired = (expiryDate) => expiryDate && expiryDate < today;

  const CertTable = ({ certs, showRejection = false }) => {
    if (certs.length === 0) return null;
    return (
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Certificate Name</th>
              <th>Organization</th>
              <th>Issue Date</th>
              <th>Expiry Date</th>
              <th>Status</th>
              {showRejection && <th>Rejection Reason</th>}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {certs.map((cert, idx) => (
              <tr key={cert.id}>
                <td className="td-index">{idx + 1}</td>
                <td className="td-name">
                  {cert.certificateName}
                  {cert.certificateId && (
                    <div className="cert-id-sub">ID: {cert.certificateId}</div>
                  )}
                </td>
                <td>{cert.organization}</td>
                <td>{formatDate(cert.issueDate)}</td>
                <td>
                  {cert.expiryDate ? (
                    <span className={isExpired(cert.expiryDate) ? "text-danger" : ""}>
                      {formatDate(cert.expiryDate)}
                      {isExpired(cert.expiryDate) && " (Expired)"}
                    </span>
                  ) : "No Expiry"}
                </td>
                <td><StatusBadge status={cert.status} /></td>
                {showRejection && (
                  <td className="rejection-reason-cell">
                    {cert.rejectionReason || "—"}
                  </td>
                )}
                <td>
                  <button className="btn btn-sm btn-view" onClick={() => setPreviewCert(cert)}>
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="my-certs-container">
      {/* Upload button */}
      <div className="my-certs-header">
        <div>
          <p className="section-subtitle">
            {approved.length} approved · {pending.length} pending · {rejected.length} rejected
          </p>
        </div>
        <button
          id="upload-cert-btn"
          className="btn btn-primary"
          onClick={() => setShowUpload(true)}
        >
          + Upload Certificate
        </button>
      </div>

      {/* Empty state */}
      {myCerts.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon"><Icon name="certificate" /></div>
          <p className="empty-state-text">You have not uploaded any certificates yet.</p>
        </div>
      )}

      {/* ── Official (Approved) Certificates ── */}
      {approved.length > 0 && (
        <div className="cert-status-section">
          <h3 className="cert-status-heading status-heading-approved">
            <Icon name="check" /> Official Certificates ({approved.length})
          </h3>
          <CertTable certs={approved} />
        </div>
      )}

      {/* ── Pending Certificates ── */}
      {pending.length > 0 && (
        <div className="cert-status-section">
          <h3 className="cert-status-heading status-heading-pending">
            <Icon name="pending" /> Awaiting Verification ({pending.length})
          </h3>
          <div className="alert-info-box">
            <span>ℹ️</span>
            These certificates are under review by the Admin. You will see them here until verified.
          </div>
          <CertTable certs={pending} />
        </div>
      )}

      {/* ── Rejected Certificates ── */}
      {rejected.length > 0 && (
        <div className="cert-status-section">
          <h3 className="cert-status-heading status-heading-rejected">
            ❌ Rejected Certificates ({rejected.length})
          </h3>
          <div className="alert-error-box">
            <span><Icon name="warning" />️</span>
            These certificates were not approved. See rejection reasons below.
          </div>
          <CertTable certs={rejected} showRejection={true} />
        </div>
      )}

      {/* Upload Modal */}
      {showUpload && <CertificateUploadForm onClose={() => setShowUpload(false)} />}
      
      {/* Preview Modal */}
      {previewCert && <CertificatePreviewModal certificate={previewCert} onClose={() => setPreviewCert(null)} />}
    </div>
  );
}
