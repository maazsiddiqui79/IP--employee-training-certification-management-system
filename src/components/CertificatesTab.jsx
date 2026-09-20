import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import CertificatePreviewModal from "./CertificatePreviewModal";
import Icon from "./Icon";

// CertificatesTab — shows ALL uploadedCertificates for an employee
// Used in admin Employee Details page.
// Props: employeeId
export default function CertificatesTab({ employeeId }) {
  const { db }   = useAuth();
  const [previewCert, setPreviewCert] = useState(null);
  const today    = new Date().toISOString().split("T")[0];

  const myCerts = db.uploadedCertificates.filter(
    (c) => c.employeeId === employeeId
  );

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  const isExpired = (expiryDate) => expiryDate && expiryDate < today;

  if (myCerts.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon"><Icon name="certificate" /></div>
        <p className="empty-state-text">No certificates available.</p>
      </div>
    );
  }

  return (
    <>
      <div className="table-wrapper">
        <table className="data-table" id="certificates-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Certificate Name</th>
              <th>Organization</th>
              <th>Issue Date</th>
              <th>Expiry Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {myCerts.map((cert, index) => (
              <tr key={cert.id}>
                <td className="td-index">{index + 1}</td>
                <td className="td-name">{cert.certificateName}</td>
                <td>{cert.organization}</td>
                <td>{formatDate(cert.issueDate)}</td>
                <td>
                  {cert.expiryDate ? (
                    <span className={isExpired(cert.expiryDate) ? "text-danger" : ""}>
                      {formatDate(cert.expiryDate)}
                      {isExpired(cert.expiryDate) && <><Icon name="warning" /> Expired</>}
                    </span>
                  ) : "No Expiry"}
                </td>
                <td>
                  <span className={`status-badge bg-${cert.status === "APPROVED" ? "success" : cert.status === "REJECTED" ? "danger" : "warning"}`}>
                    {cert.status}
                  </span>
                </td>
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
      
      {/* Preview Modal */}
      {previewCert && <CertificatePreviewModal certificate={previewCert} onClose={() => setPreviewCert(null)} />}
    </>
  );
}
