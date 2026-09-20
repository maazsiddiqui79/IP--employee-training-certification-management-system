import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import Icon from "./Icon";
import { assessmentSchema } from "../utils/schemas";

// AssessmentForm — modal for Admin to create a new assessment
// Props: onClose
export default function AssessmentForm({ onClose }) {
  const { db, createAdminAssessment } = useAuth();
  const { addToast } = useToast();

  const [form, setForm] = useState({
    title:          "",
    description:    "",
    courseName:     "",
    assessmentDate: "",
    maximumMarks:   "",
  });
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState([]);
  const [errors,    setErrors]    = useState({});
  const [submitted, setSubmitted] = useState(false);

  const setField = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  const toggleEmployee = (empId) => {
    setSelectedEmployeeIds((prev) =>
      prev.includes(empId) ? prev.filter((id) => id !== empId) : [...prev, empId]
    );
  };

  const validate = () => {
    let errs = {};
    const data = {
      title: form.title,
      description: form.description,
      courseName: form.courseName,
      assessmentDate: form.assessmentDate,
      maximumMarks: form.maximumMarks,
      assignedEmployeeIds: selectedEmployeeIds
    };

    const validation = assessmentSchema.safeParse(data);
    if (!validation.success) {
      const formatted = validation.error.format();
      for (const key in formatted) {
        if (key !== "_errors" && formatted[key]?._errors?.length) {
          errs[key] = formatted[key]._errors[0];
        }
      }
      if (formatted.assignedEmployeeIds?._errors?.length) {
        errs.employees = formatted.assignedEmployeeIds._errors[0];
      }
    }
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    createAdminAssessment({
      title:               form.title.trim(),
      description:         form.description.trim(),
      courseName:          form.courseName.trim(),
      assessmentDate:      form.assessmentDate || null,
      maximumMarks:        Number(form.maximumMarks),
      assignedEmployeeIds: selectedEmployeeIds,
    });
    addToast("Assessment created successfully.", "success");
    onClose();
  };

  const fe = (field) =>
    submitted && errors[field] ? <span className="field-error">{errors[field]}</span> : null;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-lg" role="dialog" aria-modal="true" aria-label="Create Assessment">
        <div className="modal-header">
          <h2 className="modal-title">Create Assessment</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close"><Icon name="close" /></button>
        </div>

        <form className="modal-body" onSubmit={handleSubmit} noValidate>
          {/* Title */}
          <div className="form-group">
            <label className="form-label">Assessment Title <span className="required">*</span></label>
            <input
              type="text"
              className={`form-input ${submitted && errors.title ? "input-error" : ""}`}
              value={form.title}
              onChange={(e) => setField("title", e.target.value)}
              placeholder="e.g. Python Technical Interview"
            />
            {fe("title")}
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Description <span className="optional">(optional)</span></label>
            <textarea
              className="form-input form-textarea"
              rows={2}
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              placeholder="Brief description of the assessment..."
            />
          </div>

          <div className="form-row-2">
            {/* Course Name */}
            <div className="form-group">
              <label className="form-label">Training / Course Name <span className="optional">(optional)</span></label>
              <input
                type="text"
                className="form-input"
                value={form.courseName}
                onChange={(e) => setField("courseName", e.target.value)}
                placeholder="e.g. Python Training"
              />
            </div>

            {/* Assessment Date */}
            <div className="form-group">
              <label className="form-label">Assessment Date <span className="optional">(optional)</span></label>
              <input
                type="date"
                className="form-input"
                value={form.assessmentDate}
                onChange={(e) => setField("assessmentDate", e.target.value)}
              />
            </div>
          </div>

          {/* Maximum Marks */}
          <div className="form-group form-group-sm">
            <label className="form-label">Maximum Marks <span className="required">*</span></label>
            <input
              type="number"
              className={`form-input ${submitted && errors.maximumMarks ? "input-error" : ""}`}
              value={form.maximumMarks}
              onChange={(e) => setField("maximumMarks", e.target.value)}
              placeholder="100"
              min="1"
            />
            {fe("maximumMarks")}
          </div>

          {/* Assign Employees */}
          <div className="form-group">
            <label className="form-label">Assign Employees <span className="required">*</span></label>
            <div className={`employee-checklist ${submitted && errors.employees ? "input-error-box" : ""}`}>
              {db.employees.length === 0 ? (
                <p className="empty-state-text">No employees available.</p>
              ) : (
                db.employees.map((emp) => (
                  <label key={emp.id} className="checkbox-row">
                    <input
                      type="checkbox"
                      checked={selectedEmployeeIds.includes(emp.id)}
                      onChange={() => toggleEmployee(emp.id)}
                    />
                    <span className="checkbox-label">{emp.name}</span>
                    <span className="checkbox-sub">
                      {(db.designations.find((d) => d.id === emp.designationId) || {}).name || ""}
                    </span>
                  </label>
                ))
              )}
            </div>
            {fe("employees")}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Create Assessment</button>
          </div>
        </form>
      </div>
    </div>
  );
}
