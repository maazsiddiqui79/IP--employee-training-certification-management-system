import React from "react";
import { useAuth } from "../context/AuthContext";
import StatusBadge from "./StatusBadge";
import Icon from "./Icon";

// AssessmentsTab — shows assessment results for an employee (admin Employee Details view)
// Props: employeeId
export default function AssessmentsTab({ employeeId }) {
  const { db } = useAuth();

  const myResults = db.assessmentResults.filter((r) => r.employeeId === employeeId);

  if (myResults.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon"><Icon name="reports" /></div>
        <p className="empty-state-text">No assessment records available.</p>
      </div>
    );
  }

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  const getScoreClass = (marks, max) => {
    if (marks === null) return "";
    const pct = (marks / max) * 100;
    if (pct >= 90) return "score-excellent";
    if (pct >= 75) return "score-good";
    if (pct >= 60) return "score-average";
    return "score-low";
  };

  return (
    <div className="table-wrapper">
      <table className="data-table" id="assessments-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Assessment</th>
            <th>Course</th>
            <th>Date</th>
            <th>Marks</th>
            <th>Remarks</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {myResults.map((result, idx) => {
            const assessment = db.adminAssessments.find((a) => a.id === result.assessmentId);
            if (!assessment) return null;
            return (
              <tr key={result.id}>
                <td className="td-index">{idx + 1}</td>
                <td className="td-name">{assessment.title}</td>
                <td>{assessment.courseName || "—"}</td>
                <td>{formatDate(assessment.assessmentDate)}</td>
                <td>
                  {result.marks !== null ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <span className={`score-badge ${getScoreClass(result.marks, assessment.maximumMarks)}`} style={{ alignSelf: "flex-start" }}>
                        {result.marks} / {assessment.maximumMarks}
                      </span>
                      <progress 
                        value={result.marks} 
                        max={assessment.maximumMarks} 
                        style={{ width: "100px", height: "8px" }}
                        title={`${((result.marks / assessment.maximumMarks) * 100).toFixed(0)}%`}
                      />
                    </div>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </td>
                <td className="text-muted">{result.remarks || "—"}</td>
                <td><StatusBadge status={result.status} /></td>
              </tr>
            );
          }).filter(Boolean)}
        </tbody>
      </table>
    </div>
  );
}
