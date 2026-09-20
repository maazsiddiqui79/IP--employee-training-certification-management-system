import React, { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import Icon from "./Icon";
import { certificateSchema } from "../utils/schemas";

// Accepted file types
const ACCEPTED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpg",
  "image/jpeg",
  "image/png",
  "image/webp",
];
const ACCEPTED_EXTENSIONS = [".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png", ".webp"];
const ACCEPTED_LABEL = "PDF, DOC, DOCX, JPG, JPEG, PNG, WEBP";

// CertificateUploadForm — modal for employee to upload a certificate
// Props: onClose
export default function CertificateUploadForm({ onClose }) {
  const { currentUser, uploadCertificate } = useAuth();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    certificateName: "",
    organization:    "",
    issueDate:       "",
    expiryDate:      "",
    certificateId:   "",
    verificationUrl: "",
  });
  const [file,      setFile]      = useState(null); // { name, type, data (base64) }
  const [errors,    setErrors]    = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [uploading, setUploading] = useState(false);

  const setField = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  // ── File handling ────────────────────────────────────────
  const handleFileChange = async (e) => {
    const f = e.target.files[0];
    if (!f) return;

    try {
      const buffer = await f.slice(0, 4).arrayBuffer();
      const view = new Uint8Array(buffer);
      const hex = Array.from(view).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();

      const isValidMagic = 
        hex.startsWith('25504446') || // PDF
        hex.startsWith('FFD8FF') ||   // JPG
        hex.startsWith('89504E47') || // PNG
        hex.startsWith('52494646') || // WEBP (RIFF)
        hex.startsWith('D0CF11E0') || // DOC
        hex.startsWith('504B0304');   // DOCX

      if (!isValidMagic) {
        setErrors((prev) => ({
          ...prev,
          file: `Invalid file content signature. File rejected for safety.`,
        }));
        e.target.value = "";
        return;
      }
    } catch (err) {
        setErrors((prev) => ({ ...prev, file: "Failed to read file signature." }));
        e.target.value = "";
        return;
    }

    const extOk = ACCEPTED_EXTENSIONS.some((ext) =>
      f.name.toLowerCase().endsWith(ext)
    );
    const typeOk = ACCEPTED_TYPES.includes(f.type);

    if (!extOk || !typeOk) {
      setErrors((prev) => ({
        ...prev,
        file: `Invalid file extension/type. Accepted formats: ${ACCEPTED_LABEL}`,
      }));
      e.target.value = "";
      return;
    }

    setErrors((prev) => { const n = { ...prev }; delete n.file; return n; });

    const reader = new FileReader();
    reader.onload = (ev) => {
      setFile({ name: f.name, type: f.type || "application/octet-stream", data: ev.target.result });
    };
    reader.readAsDataURL(f);
  };

  // ── Validation ───────────────────────────────────────────
  const validate = () => {
    let errs = {};
    const data = {
      ...form,
      expiryDate: form.expiryDate || "",
      verificationUrl: form.verificationUrl || ""
    };

    const validation = certificateSchema.safeParse(data);
    if (!validation.success) {
      const formatted = validation.error.format();
      for (const key in formatted) {
        if (key !== "_errors" && formatted[key]?._errors?.length) {
          errs[key] = formatted[key]._errors[0];
        }
      }
    }
    
    if (!file) errs.file = "Certificate file is required.";
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setUploading(true);

    uploadCertificate({
      employeeId:      currentUser.employeeId,
      certificateName: form.certificateName.trim(),
      organization:    form.organization.trim(),
      issueDate:       form.issueDate,
      expiryDate:      form.expiryDate || null,
      certificateId:   form.certificateId.trim() || null,
      verificationUrl: form.verificationUrl.trim() || null,
      fileName:        file.name,
      fileType:        file.type,
      fileData:        file.data,
    });

    setUploading(false);
    onClose();
  };

  const fe = (field) =>
    submitted && errors[field] ? (
      <span className="field-error">{errors[field]}</span>
    ) : null;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-lg" role="dialog" aria-modal="true" aria-label="Upload Certificate">
        <div className="modal-header">
          <h2 className="modal-title">Upload Certificate</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close"><Icon name="close" /></button>
        </div>

        <form className="modal-body" onSubmit={handleSubmit} noValidate>
          <div className="form-row-2">
            {/* Certificate Name */}
            <div className="form-group">
              <label className="form-label">Certificate Name <span className="required">*</span></label>
              <input
                type="text"
                className={`form-input ${submitted && errors.certificateName ? "input-error" : ""}`}
                value={form.certificateName}
                onChange={(e) => setField("certificateName", e.target.value)}
                placeholder="e.g. AWS Cloud Practitioner"
              />
              {fe("certificateName")}
            </div>

            {/* Organization */}
            <div className="form-group">
              <label className="form-label">Issuing Organization <span className="required">*</span></label>
              <input
                type="text"
                className={`form-input ${submitted && errors.organization ? "input-error" : ""}`}
                value={form.organization}
                onChange={(e) => setField("organization", e.target.value)}
                placeholder="e.g. Amazon Web Services"
              />
              {fe("organization")}
            </div>
          </div>

          <div className="form-row-2">
            {/* Issue Date */}
            <div className="form-group">
              <label className="form-label">Issue Date <span className="required">*</span></label>
              <input
                type="date"
                className={`form-input ${submitted && errors.issueDate ? "input-error" : ""}`}
                value={form.issueDate}
                onChange={(e) => setField("issueDate", e.target.value)}
              />
              {fe("issueDate")}
            </div>

            {/* Expiry Date */}
            <div className="form-group">
              <label className="form-label">Expiry Date <span className="optional">(optional)</span></label>
              <input
                type="date"
                className={`form-input ${submitted && errors.expiryDate ? "input-error" : ""}`}
                value={form.expiryDate}
                onChange={(e) => setField("expiryDate", e.target.value)}
              />
              {fe("expiryDate")}
            </div>
          </div>

          <div className="form-row-2">
            {/* Certificate ID */}
            <div className="form-group">
              <label className="form-label">Certificate / Credential ID <span className="optional">(optional)</span></label>
              <input
                type="text"
                className="form-input"
                value={form.certificateId}
                onChange={(e) => setField("certificateId", e.target.value)}
                placeholder="e.g. AWS-CP-12345"
              />
            </div>

            {/* Verification URL */}
            <div className="form-group">
              <label className="form-label">Verification URL <span className="optional">(optional)</span></label>
              <input
                type="url"
                className={`form-input ${submitted && errors.verificationUrl ? "input-error" : ""}`}
                value={form.verificationUrl}
                onChange={(e) => setField("verificationUrl", e.target.value)}
                placeholder="https://..."
              />
              {fe("verificationUrl")}
            </div>
          </div>

          {/* File Upload */}
          <div className="form-group">
            <label className="form-label">Certificate File <span className="required">*</span></label>
            <div
              className={`file-drop-area ${submitted && errors.file ? "input-error" : ""}`}
              onClick={() => fileInputRef.current.click()}
            >
              {file ? (
                <div className="file-selected">
                  <span className="file-icon"><Icon name="file" /></span>
                  <span className="file-name">{file.name}</span>
                  <button
                    type="button"
                    className="file-remove"
                    onClick={(e) => { e.stopPropagation(); setFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                  ><Icon name="close" /></button>
                </div>
              ) : (
                <div className="file-placeholder">
                  <span className="file-upload-icon">📁</span>
                  <p>Click to select a file</p>
                  <p className="file-hint">Accepted: {ACCEPTED_LABEL}</p>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
            {fe("file")}
          </div>

          <div className="alert-info-box">
            <span>ℹ️</span>
            Your certificate will be submitted for Admin verification. It will appear as <strong>Pending</strong> until reviewed.
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={uploading}>
              {uploading ? "Uploading…" : "Submit Certificate"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
