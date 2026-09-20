import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import StatusBadge from "./StatusBadge";
import Icon from "./Icon";

// AssessmentMarksModal — Admin enters/edits marks for each employee in an assessment
// Props: assessment (full object), onClose
export default function AssessmentMarksModal({ assessment, onClose }) {
  const { db, saveAssessmentResult } = useAuth();
  const { addToast } = useToast();

  const getEmployee = (empId) => db.employees.find((e) => e.id === empId);

  // Build editable rows from existing results
  const existingResults = db.assessmentResults.filter(
    (r) => r.assessmentId === assessment.id
  );

  const [rows, setRows] = useState(() =>
    assessment.assignedEmployeeIds.map((empId) => {
      const existing = existingResults.find((r) => r.employeeId === empId);
      return {
        employeeId: empId,
        marks:      existing?.marks !== null && existing?.marks !== undefined ? String(existing.marks) : "",
        remarks:    existing?.remarks || "",
        status:     existing?.status || "PENDING",
        error:      "",
      };
    })
  );

  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);

  const updateRow = (empId, field, value) => {
    setRows((prev) =>
      prev.map((r) => (r.employeeId === empId ? { ...r, [field]: value, error: "" } : r))
    );
    setSaved(false);
  };

  const validateRows = () => {
    let valid = true;
    setRows((prev) =>
      prev.map((r) => {
        if (r.marks === "") return r; // blank = pending, allowed
        const n = Number(r.marks);
        if (isNaN(n)) {
          valid = false;
          return { ...r, error: "Must be a number." };
        }
        if (n < 0) {
          valid = false;
          return { ...r, error: "Marks cannot be negative." };
        }
        if (n > assessment.maximumMarks) {
          valid = false;
          return { ...r, error: `Cannot exceed maximum marks (${assessment.maximumMarks}).` };
        }
        return r;
      })
    );
    return valid;
  };

  const handleSave = () => {
    if (!validateRows()) return;
    setSaving(true);
    rows.forEach((r) => {
      saveAssessmentResult(
        assessment.id,
        r.employeeId,
        r.marks !== "" ? r.marks : null,
        r.remarks
      );
    });
    setSaving(false);
    setSaved(true);
    addToast("Marks saved successfully.", "success");
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-xl" role="dialog" aria-modal="true" aria-label="Enter Assessment Marks">
        <div className="modal-header">
          <div>
            <h2 className="modal-title">{assessment.title}</h2>
            <p className="modal-subtitle">
              {assessment.courseName && <span>{assessment.courseName} · </span>}
              Max Marks: <strong>{assessment.maximumMarks}</strong>
              {assessment.assessmentDate && <span> · Date: {new Date(assessment.assessmentDate).toLocaleDateString("en-IN")}</span>}
            </p>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close"><Icon name="close" /></button>
        </div>

        <div className="modal-body">
          {rows.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><Icon name="users" /></div>
              <p className="empty-state-text">No employees assigned to this assessment.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table marks-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Marks (out of {assessment.maximumMarks})</th>
                    <th>Remarks</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => {
                    const emp = getEmployee(row.employeeId);
                    return (
                      <tr key={row.employeeId}>
                        <td className="td-name">{emp ? emp.name : `#${row.employeeId}`}</td>
                        <td>
                          <div className="marks-input-wrap">
                            <input
                              type="number"
                              className={`form-input marks-input ${row.error ? "input-error" : ""}`}
                              value={row.marks}
                              min="0"
                              max={assessment.maximumMarks}
                              onChange={(e) => updateRow(row.employeeId, "marks", e.target.value)}
                              placeholder="—"
                            />
                            <span className="marks-max">/ {assessment.maximumMarks}</span>
                          </div>
                          {row.error && <span className="field-error">{row.error}</span>}
                        </td>
                        <td>
                          <input
                            type="text"
                            className="form-input"
                            value={row.remarks}
                            onChange={(e) => updateRow(row.employeeId, "remarks", e.target.value)}
                            placeholder="Optional remarks..."
                          />
                        </td>
                        <td>
                          <StatusBadge status={row.marks !== "" ? "COMPLETED" : "PENDING"} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {saved && (
            <div className="success-notice"><Icon name="checkSmall" /> Marks saved successfully.</div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
          {rows.length > 0 && (
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : "Save All Marks"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
