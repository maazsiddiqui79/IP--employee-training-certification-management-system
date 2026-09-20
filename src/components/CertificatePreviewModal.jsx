import React, { useState, useEffect } from "react";
import StatusBadge from "./StatusBadge";
import Icon from "./Icon";
import { getFile } from "../utils/fileStore";

export default function CertificatePreviewModal({ certificate, onClose }) {
  const [localFileData, setLocalFileData] = useState(certificate?.fileData || null);

  useEffect(() => {
    if (certificate && !certificate.fileData) {
      getFile(certificate.id).then(data => {
        if (data) setLocalFileData(data);
      }).catch(err => console.error("Failed to load file from IndexedDB", err));
    } else {
      setLocalFileData(certificate?.fileData || null);
    }
  }, [certificate]);

  if (!certificate) return null;

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-lg" role="dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header print-hide">
          <h2 className="modal-title">Certificate Preview</h2>
          <div style={{ display: "flex", gap: "8px" }}>
            <button 
              className="btn btn-secondary btn-sm" 
              onClick={() => {
                if (localFileData) {
                  const a = document.createElement("a");
                  a.href = localFileData;
                  a.download = certificate.fileName || "certificate";
                  a.click();
                } else if (certificate.fileUrl) {
                  window.open(certificate.fileUrl, "_blank");
                }
              }}
              disabled={!localFileData && !certificate.fileUrl}
            >
              <Icon name="down" /> Download
            </button>
            <button className="btn-close" onClick={onClose} aria-label="Close" style={{ alignSelf: "center" }}><Icon name="close" /></button>
          </div>
        </div>
        
        <div className="modal-body" style={{ maxHeight: "70vh", overflowY: "auto", display: "flex", flexDirection: "column", gap: "24px" }}>
          <div className="cert-preview-card" style={{ padding: "16px", border: "1px solid var(--border)", borderRadius: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <div>
                <h3 style={{ margin: "0 0 8px 0" }}>{certificate.certificateName}</h3>
                <p style={{ margin: "0", color: "var(--text-muted)" }}>{certificate.organization}</p>
              </div>
              <StatusBadge status={certificate.status} />
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
              <div>
                <small style={{ color: "var(--text-muted)", display: "block" }}>Issue Date</small>
                <strong>{formatDate(certificate.issueDate)}</strong>
              </div>
              <div>
                <small style={{ color: "var(--text-muted)", display: "block" }}>Expiry Date</small>
                <strong>{certificate.expiryDate ? formatDate(certificate.expiryDate) : "No Expiry"}</strong>
              </div>
              <div>
                <small style={{ color: "var(--text-muted)", display: "block" }}>Certificate ID</small>
                <strong>{certificate.certificateId || "—"}</strong>
              </div>
            </div>

            {/* Real preview if localFileData exists, otherwise fallback */}
            <div className="preview-box" style={{ width: "100%", height: "400px", backgroundColor: "var(--color-bg)", border: "1px solid var(--color-border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-muted)", borderRadius: "4px", overflow: "hidden" }}>
              {localFileData ? (
                certificate.fileType?.startsWith("image/") ? (
                  <img src={localFileData} alt="Certificate" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                ) : certificate.fileType === "application/pdf" ? (
                  <object data={localFileData} type="application/pdf" width="100%" height="100%">
                    <p>Alternative text - include a link <a href={localFileData}>to the PDF!</a></p>
                  </object>
                ) : (
                  <p>Unsupported file type for preview.</p>
                )
              ) : (
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "32px", marginBottom: "8px" }}><Icon name="file" /></div>
                  <div>Document Preview (No file uploaded)</div>
                </div>
              )}
            </div>
          </div>

          <div className="cert-history">
            <h4>Verification History</h4>
            {certificate.history && certificate.history.length > 0 ? (
              <ul style={{ listStyle: "none", padding: "0", margin: "0", borderLeft: "2px solid var(--border)", marginLeft: "8px" }}>
                {certificate.history.map((h, i) => (
                  <li key={i} style={{ paddingLeft: "16px", position: "relative", marginBottom: "16px" }}>
                    <div style={{ position: "absolute", left: "-6px", top: "4px", width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "var(--primary)" }}></div>
                    <div style={{ fontSize: "14px", fontWeight: "bold" }}>
                      {h.action}
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                      by {h.user} on {formatDate(h.date)}
                    </div>
                    {h.reason && (
                      <div style={{ fontSize: "14px", marginTop: "4px", backgroundColor: "var(--bg-card)", padding: "8px", borderRadius: "4px" }}>
                        Reason: {h.reason}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>No history recorded.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
