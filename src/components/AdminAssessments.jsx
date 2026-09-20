import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import AssessmentForm from "./AssessmentForm";
import AssessmentMarksModal from "./AssessmentMarksModal";
import StatusBadge from "./StatusBadge";
import SearchInput from "./SearchInput";
import { useToast } from "../context/ToastContext";
import Icon from "./Icon";

// AdminAssessments — Admin view: list + create + manage assessments
export default function AdminAssessments() {
  const { db, deleteAdminAssessment } = useAuth();
  const { addToast } = useToast();

  const [showCreateForm,   setShowCreateForm]   = useState(false);
  const [marksAssessment,  setMarksAssessment]  = useState(null); // assessment open for marks entry
  const [deleteTarget,     setDeleteTarget]     = useState(null); // id to delete
  const [searchQuery,      setSearchQuery]      = useState("");

  const getCompletedCount = (assessmentId) =>
    db.assessmentResults.filter(
      (r) => r.assessmentId === assessmentId && r.status === "COMPLETED"
    ).length;

  const getTotalAssigned = (assessment) => assessment.assignedEmployeeIds.length;

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  const handleDeleteConfirm = () => {
    deleteAdminAssessment(deleteTarget);
    setDeleteTarget(null);
    addToast("Assessment deleted successfully.", "success");
  };

  const filteredAssessments = db.adminAssessments.filter((a) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return a.title.toLowerCase().includes(q) || (a.courseName && a.courseName.toLowerCase().includes(q));
  });

  return (
    <div className="section-container">
      {/* Header */}
      <div className="section-header">
        <div>
          <h2 className="section-title">Assessments</h2>
          <p className="section-subtitle">
            {db.adminAssessments.length} assessment{db.adminAssessments.length !== 1 ? "s" : ""} created
          </p>
        </div>
        <div style={{ display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap" }}>
          <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Search assessments..." />
          <button className="btn btn-primary" id="create-assessment-btn" onClick={() => setShowCreateForm(true)}>
            + Create Assessment
          </button>
        </div>
      </div>

      {/* Assessment list */}
      {filteredAssessments.length === 0 ? (
        <div className="content-card">
          <div className="empty-state">
            <div className="empty-state-icon"><Icon name="assessment" /></div>
            <p className="empty-state-text">No assessments found.</p>
          </div>
        </div>
      ) : (
        <div className="assessment-card-list">
          {filteredAssessments.map((assessment) => {
            const total     = getTotalAssigned(assessment);
            const completed = getCompletedCount(assessment.id);
            const pending   = total - completed;

            return (
              <div key={assessment.id} className="assessment-card">
                <div className="assessment-card-top">
                  <div>
                    <h3 className="assessment-card-title">{assessment.title}</h3>
                    {assessment.courseName && (
                      <span className="assessment-card-course">{assessment.courseName}</span>
                    )}
                  </div>
                  <div className="assessment-card-badges">
                    {pending > 0 && <span className="count-badge pending-badge">{pending} pending</span>}
                    {completed > 0 && <span className="count-badge completed-badge">{completed} completed</span>}
                  </div>
                </div>

                {assessment.description && (
                  <p className="assessment-card-desc">{assessment.description}</p>
                )}

                <div className="assessment-card-meta">
                  <span><Icon name="calendar" /> {formatDate(assessment.assessmentDate)}</span>
                  <span><Icon name="trophy" /> Max Marks: {assessment.maximumMarks}</span>
                  <span><Icon name="users" /> {total} employee{total !== 1 ? "s" : ""} assigned</span>
                  <span>Created: {formatDate(assessment.createdAt)}</span>
                </div>

                {/* Results preview table */}
                <div className="assessment-results-preview">
                  <table className="data-table marks-table">
                    <thead>
                      <tr>
                        <th>Employee</th>
                        <th>Marks</th>
                        <th>Remarks</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assessment.assignedEmployeeIds.map((empId) => {
                        const emp    = db.employees.find((e) => e.id === empId);
                        const result = db.assessmentResults.find(
                          (r) => r.assessmentId === assessment.id && r.employeeId === empId
                        );
                        return (
                          <tr key={empId}>
                            <td className="td-name">{emp ? emp.name : `#${empId}`}</td>
                            <td>
                              {result && result.marks !== null
                                ? <strong>{result.marks}/{assessment.maximumMarks}</strong>
                                : <span className="text-muted">—</span>}
                            </td>
                            <td className="text-muted">{result?.remarks || "—"}</td>
                            <td><StatusBadge status={result?.status || "PENDING"} /></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="assessment-card-actions">
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => setMarksAssessment(assessment)}
                  >
                    <Icon name="pencil" /> Enter / Edit Marks
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => setDeleteTarget(assessment.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Assessment Modal */}
      {showCreateForm && <AssessmentForm onClose={() => setShowCreateForm(false)} />}

      {/* Marks Entry Modal */}
      {marksAssessment && (
        <AssessmentMarksModal
          assessment={marksAssessment}
          onClose={() => setMarksAssessment(null)}
        />
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <div className="modal-overlay">
          <div className="modal modal-sm" role="dialog" aria-modal="true">
            <div className="modal-header">
              <h2 className="modal-title">Delete Assessment</h2>
            </div>
            <div className="modal-body">
              <div className="confirm-icon"><Icon name="trash" /></div>
              <p className="confirm-message">Delete this assessment?</p>
              <p className="confirm-sub">All entered marks and results will be permanently removed.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDeleteConfirm}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
