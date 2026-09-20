import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import Icon from "./Icon";
import { employeeAddSchema, employeeEditSchema } from "../utils/schemas";

// EmployeeForm — handles both Add and Edit modes
// Props:
//   mode       – "add" | "edit"
//   employeeId – (edit mode) id of employee being edited
//   onClose    – close/cancel callback
export default function EmployeeForm({ mode, employeeId, onClose }) {
  const { db, addEmployee, editEmployee } = useAuth();
  const { addToast } = useToast();

  const isEdit = mode === "edit";

  // Form field state
  const [name,          setName]          = useState("");
  const [email,         setEmail]         = useState("");
  const [phone,         setPhone]         = useState("");
  const [dateOfJoining, setDateOfJoining] = useState("");
  const [password,      setPassword]      = useState("");
  const [newPassword,   setNewPassword]   = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showPassword,  setShowPassword]  = useState(false);
  const [designationId, setDesignationId] = useState("");
  const [role,          setRole]          = useState("EMPLOYEE");
  const [errors,        setErrors]        = useState({});
  const [submitted,     setSubmitted]     = useState(false);
  const [changePassword, setChangePassword] = useState(false);

  // Pre-populate form in edit mode
  useEffect(() => {
    if (isEdit && employeeId) {
      const emp  = db.employees.find((e) => e.id === employeeId);
      const user = db.users.find((u) => u.employeeId === employeeId);
      if (emp) {
        setName(emp.name);
        setEmail(emp.email);
        setPhone(emp.phone || "");
        if (emp.dateOfJoining) {
          // ensure it fits YYYY-MM-DD input format if it's an ISO string
          setDateOfJoining(emp.dateOfJoining.split('T')[0]);
        }
        setDesignationId(String(emp.designationId));
      }
      if (user) {
        setRole(user.role);
      }
    }
  }, [isEdit, employeeId, db]);

  // ----------------------------------------------------------
  // Validation
  // ----------------------------------------------------------
  const validate = () => {
    let errs = {};
    const data = {
      name,
      email,
      phone,
      dateOfJoining,
      designationId: String(designationId),
      role,
      ...(isEdit ? {
        changePassword,
        newPassword,
        confirmNewPassword
      } : { password })
    };

    const schema = isEdit ? employeeEditSchema : employeeAddSchema;
    const validation = schema.safeParse(data);

    if (!validation.success) {
      const formatted = validation.error.format();
      for (const key in formatted) {
        if (key !== "_errors" && formatted[key]?._errors?.length) {
          errs[key] = formatted[key]._errors[0];
        }
      }
    }

    if (!errs.email && validation.success) {
      // Duplicate email check
      const duplicate = db.users.find((u) => {
        const sameEmail = u.email.toLowerCase() === email.trim().toLowerCase();
        if (!sameEmail) return false;
        if (isEdit && u.employeeId === employeeId) return false;
        return true;
      });
      if (duplicate) errs.email = "This email is already in use.";
    }

    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    if (isEdit) {
      const updatedEmpData = { name: name.trim(), email: email.trim(), designationId: parseInt(designationId), phone: phone.trim(), dateOfJoining };
      const updatedUserData = { role };
      if (changePassword && newPassword.trim()) {
        updatedUserData.password = newPassword.trim();
      }
      editEmployee(employeeId, updatedEmpData, updatedUserData.role, updatedUserData.password);
      addToast("Employee updated successfully.", "success");
      if (changePassword && newPassword.trim()) {
        addToast("Password changed successfully.", "success");
      }
    } else {
      addEmployee(
        { name: name.trim(), email: email.trim(), designationId: parseInt(designationId), phone: phone.trim(), dateOfJoining },
        { email: email.trim(), password: password.trim(), role }
      );
      addToast("Employee added successfully.", "success");
    }

    onClose();
  };

  const fieldError = (field) =>
    submitted && errors[field] ? (
      <span className="field-error">{errors[field]}</span>
    ) : null;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={isEdit ? "Edit Employee" : "Add Employee"}>
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? "Edit Employee" : "Add New Employee"}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close"><Icon name="close" /></button>
        </div>

        <form className="modal-body" onSubmit={handleSubmit} noValidate>
          {/* Name */}
          <div className="form-group">
            <label htmlFor="emp-name" className="form-label">Full Name <span className="required">*</span></label>
            <input
              id="emp-name"
              type="text"
              className={`form-input ${submitted && errors.name ? "input-error" : ""}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
            />
            {fieldError("name")}
          </div>

          {/* Email */}
          <div className="form-group">
            <label htmlFor="emp-email" className="form-label">Email Address <span className="required">*</span></label>
            <input
              id="emp-email"
              type="email"
              className={`form-input ${submitted && errors.email ? "input-error" : ""}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
            />
            {fieldError("email")}
          </div>

          {/* Phone */}
          <div className="form-group">
            <label htmlFor="emp-phone" className="form-label">Phone Number</label>
            <input
              id="emp-phone"
              type="text"
              className={`form-input ${submitted && errors.phone ? "input-error" : ""}`}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="555-0199"
            />
            {fieldError("phone")}
          </div>

          {/* Date of Joining */}
          <div className="form-group">
            <label htmlFor="emp-doj" className="form-label">Date of Joining <span className="required">*</span></label>
            <input
              id="emp-doj"
              type="date"
              className={`form-input ${submitted && errors.dateOfJoining ? "input-error" : ""}`}
              value={dateOfJoining}
              onChange={(e) => setDateOfJoining(e.target.value)}
            />
            {fieldError("dateOfJoining")}
          </div>

          {/* Password — only in Add mode */}
          {!isEdit && (
            <div className="form-group">
              <label htmlFor="emp-password" className="form-label">Password <span className="required">*</span></label>
              <div className="password-input-wrap">
                <input
                  id="emp-password"
                  type={showPassword ? "text" : "password"}
                  className={`form-input ${submitted && errors.password ? "input-error" : ""}`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <Icon name="eyeOff" /> : <Icon name="eye" />}
                </button>
              </div>
              {fieldError("password")}
            </div>
          )}

          {/* Change Password — only in Edit mode */}
          {isEdit && (
            <div className="form-group">
              <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <input type="checkbox" checked={changePassword} onChange={(e) => setChangePassword(e.target.checked)} />
                Change Password
              </label>
              
              {changePassword && (
                <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div>
                    <input
                      type="password"
                      className={`form-input ${submitted && errors.newPassword ? "input-error" : ""}`}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="New Password"
                    />
                    {fieldError("newPassword")}
                  </div>
                  <div>
                    <input
                      type="password"
                      className={`form-input ${submitted && errors.confirmNewPassword ? "input-error" : ""}`}
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="Confirm New Password"
                    />
                    {fieldError("confirmNewPassword")}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Designation */}
          <div className="form-group">
            <label htmlFor="emp-designation" className="form-label">Designation <span className="required">*</span></label>
            <select
              id="emp-designation"
              className={`form-input form-select ${submitted && errors.designationId ? "input-error" : ""}`}
              value={designationId}
              onChange={(e) => setDesignationId(e.target.value)}
            >
              <option value="">— Select Designation —</option>
              {db.designations.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
            {fieldError("designationId")}
          </div>

          {/* Role */}
          <div className="form-group">
            <label htmlFor="emp-role" className="form-label">Role</label>
            <select
              id="emp-role"
              className="form-input form-select"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="EMPLOYEE">Employee</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          {/* Actions */}
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" id={isEdit ? "save-edit-btn" : "save-add-btn"} className="btn btn-primary">
              {isEdit ? "Save Changes" : "Add Employee"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
