import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Icon from "./Icon";
import CertificatePreviewModal from "./CertificatePreviewModal";
import StatusBadge from "./StatusBadge";
import { getFile } from "../utils/fileStore";

// Reports — Admin computed reports from live application state
export default function Reports() {
  const { db } = useAuth();
  const today  = new Date().toISOString().split("T")[0];

  const certs   = db.uploadedCertificates;
  const asmts   = db.adminAssessments;
  const results = db.assessmentResults;

  const [previewCert, setPreviewCert] = useState(null);

  const handleDownload = async (cert) => {
    try {
      const fileData = await getFile(cert.id);
      if (fileData) {
        const a = document.createElement("a");
        a.href = fileData;
        a.download = cert.fileName || "certificate";
        a.click();
      } else if (cert.fileUrl) {
        window.open(cert.fileUrl, "_blank");
      } else {
        alert("No file available to download.");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to download file.");
    }
  };

  // ── Certificate Summary ─────────────────────────────────
  const totalCerts    = certs.length;
  const pendingCerts  = certs.filter((c) => c.status === "PENDING").length;
  const approvedCerts = certs.filter((c) => c.status === "APPROVED").length;
  const rejectedCerts = certs.filter((c) => c.status === "REJECTED").length;
  const expiredCerts  = certs.filter(
    (c) => c.status === "APPROVED" && c.expiryDate && c.expiryDate < today
  ).length;

  // ── Assessment Summary ──────────────────────────────────
  const totalAssessments   = asmts.length;
  const completedResults   = results.filter((r) => r.status === "COMPLETED" && r.marks !== null);
  const uniqueAssessed     = new Set(completedResults.map((r) => r.employeeId)).size;
  const overallAvg = (() => {
    if (completedResults.length === 0) return null;
    const percentages = completedResults.map((r) => {
      const a = asmts.find((a) => a.id === r.assessmentId);
      return a ? (r.marks / a.maximumMarks) * 100 : 0;
    });
    return (percentages.reduce((s, p) => s + p, 0) / percentages.length).toFixed(1);
  })();

  // ── Assessment-wise results ─────────────────────────────
  const assessmentRows = asmts.map((a) => {
    const aResults    = completedResults.filter((r) => r.assessmentId === a.id);
    const avgMarks    = aResults.length > 0
      ? (aResults.reduce((s, r) => s + r.marks, 0) / aResults.length).toFixed(1)
      : null;
    const allResults  = results.filter((r) => r.assessmentId === a.id);
    return {
      ...a,
      completed: aResults.length,
      pending:   allResults.length - aResults.length,
      avgMarks,
    };
  });

  // ── Employee Training Summary ───────────────────────────
  const employeeRows = db.employees.map((emp) => {
    const empCerts    = certs.filter((c) => c.employeeId === emp.id);
    const empResults  = completedResults.filter((r) => r.employeeId === emp.id);
    const des         = db.designations.find((d) => d.id === emp.designationId);
    const avgScore    = empResults.length > 0
      ? (() => {
          const pcts = empResults.map((r) => {
            const a = asmts.find((a) => a.id === r.assessmentId);
            return a ? (r.marks / a.maximumMarks) * 100 : 0;
          });
          return (pcts.reduce((s, p) => s + p, 0) / pcts.length).toFixed(1);
        })()
      : null;
    return {
      id:              emp.id,
      name:            emp.name,
      designation:     des ? des.name : "—",
      approvedCerts:   empCerts.filter((c) => c.status === "APPROVED").length,
      pendingCerts:    empCerts.filter((c) => c.status === "PENDING").length,
      rejectedCerts:   empCerts.filter((c) => c.status === "REJECTED").length,
      totalAssessments: results.filter((r) => r.employeeId === emp.id).length,
      avgScore,
    };
  });

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  const exportToCSV = () => {
    // 1. Prepare CSV headers
    const headers = [
      "Employee",
      "Designation",
      "Approved Certifications",
      "Pending Certifications",
      "Rejected Certifications",
      "Total Assessments",
      "Avg Score"
    ];
    
    // 2. Prepare CSV rows
    const rows = employeeRows.map(row => [
      `"${row.name}"`,
      `"${row.designation}"`,
      row.approvedCerts,
      row.pendingCerts,
      row.rejectedCerts,
      row.totalAssessments,
      row.avgScore !== null ? `${row.avgScore}%` : "N/A"
    ]);
    
    // 3. Combine headers and rows
    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.join(","))
    ].join("\n");
    
    // 4. Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `training_summary_${today}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="section-container">
      <div className="section-header print-hide">
        <div>
          <h2 className="section-title">Reports</h2>
          <p className="section-subtitle">Generated from live application data · {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}</p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button className="btn btn-secondary" onClick={() => window.print()}>
            🖨️ Print Report
          </button>
          <button className="btn btn-primary" onClick={exportToCSV}>
            📥 Export to CSV
          </button>
        </div>
      </div>
      
      {/* Show title only when printing */}
      <div className="print-only" style={{ display: "none" }}>
        <h2>System Reports - {today}</h2>
      </div>

      {/* ── Certificate Summary ── */}
      <div className="report-section">
        <h3 className="report-section-title"><Icon name="certificate" /> Certificate Summary</h3>
        <div className="stat-grid">
          <div className="stat-card stat-total">
            <div className="stat-value">{totalCerts}</div>
            <div className="stat-label">Total Certificates</div>
          </div>
          <div className="stat-card stat-pending">
            <div className="stat-value">{pendingCerts}</div>
            <div className="stat-label">Pending Verification</div>
          </div>
          <div className="stat-card stat-approved">
            <div className="stat-value">{approvedCerts}</div>
            <div className="stat-label">Approved</div>
          </div>
          <div className="stat-card stat-rejected">
            <div className="stat-value">{rejectedCerts}</div>
            <div className="stat-label">Rejected</div>
          </div>
          <div className="stat-card stat-expired">
            <div className="stat-value">{expiredCerts}</div>
            <div className="stat-label">Expired</div>
          </div>
        </div>
      </div>

      {/* ── Assessment Summary ── */}
      <div className="report-section">
        <h3 className="report-section-title"><Icon name="reports" /> Assessment Summary</h3>
        <div className="stat-grid">
          <div className="stat-card stat-total">
            <div className="stat-value">{totalAssessments}</div>
            <div className="stat-label">Total Assessments</div>
          </div>
          <div className="stat-card stat-approved">
            <div className="stat-value">{uniqueAssessed}</div>
            <div className="stat-label">Employees Assessed</div>
          </div>
          <div className="stat-card stat-info">
            <div className="stat-value">{overallAvg !== null ? `${overallAvg}%` : "—"}</div>
            <div className="stat-label">Overall Average Score</div>
          </div>
          <div className="stat-card stat-total">
            <div className="stat-value">{completedResults.length}</div>
            <div className="stat-label">Marks Entered</div>
          </div>
        </div>

        {assessmentRows.length > 0 && (
          <div className="table-wrapper report-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Assessment</th>
                  <th>Course</th>
                  <th>Date</th>
                  <th>Max Marks</th>
                  <th>Completed</th>
                  <th>Pending</th>
                  <th>Avg Marks</th>
                </tr>
              </thead>
              <tbody>
                {assessmentRows.map((a) => (
                  <tr key={a.id}>
                    <td className="td-name">{a.title}</td>
                    <td>{a.courseName || "—"}</td>
                    <td>{formatDate(a.assessmentDate)}</td>
                    <td>{a.maximumMarks}</td>
                    <td><span className="count-badge completed-badge">{a.completed}</span></td>
                    <td><span className="count-badge pending-badge">{a.pending}</span></td>
                    <td>{a.avgMarks !== null ? `${a.avgMarks}/${a.maximumMarks}` : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Employee Training Summary ── */}
      <div className="report-section">
        <h3 className="report-section-title"><Icon name="users" /> Employee Training Summary</h3>
        <div className="table-wrapper report-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Designation</th>
                <th><Icon name="check" /> Approved Certifications</th>
                <th><Icon name="pending" /> Pending Certifications</th>
                <th>❌ Rejected Certifications</th>
                <th>Total Assessments</th>
                <th>Avg Score</th>
              </tr>
            </thead>
            <tbody>
              {employeeRows.map((row) => (
                <tr key={row.id}>
                  <td className="td-name">{row.name}</td>
                  <td>{row.designation}</td>
                  <td><strong>{row.approvedCerts}</strong></td>
                  <td>{row.pendingCerts}</td>
                  <td>{row.rejectedCerts}</td>
                  <td>{row.totalAssessments}</td>
                  <td>{row.avgScore !== null ? `${row.avgScore}%` : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* ── All Certificates Master List ── */}
      <div className="report-section print-hide">
        <h3 className="report-section-title"><Icon name="certificate" /> All Certificates Master List</h3>
        <div className="table-wrapper report-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Certificate Name</th>
                <th>Issue Date</th>
                <th>Expiry Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {certs.map((c) => {
                const emp = db.employees.find(e => e.id === c.employeeId);
                const isExpired = c.status === "APPROVED" && c.expiryDate && c.expiryDate < today;
                return (
                  <tr key={c.id} style={isExpired ? { backgroundColor: "var(--score-low-bg)" } : {}}>
                    <td className="td-name">{emp ? emp.name : "—"}</td>
                    <td>{c.certificateName}</td>
                    <td>{formatDate(c.issueDate)}</td>
                    <td style={isExpired ? { color: "var(--color-danger)", fontWeight: "bold" } : {}}>
                      {formatDate(c.expiryDate)}
                    </td>
                    <td><StatusBadge status={c.status} /></td>
                    <td className="td-actions">
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button className="btn btn-sm btn-view" onClick={() => setPreviewCert(c)}>
                          <Icon name="eye" /> View
                        </button>
                        <button className="btn btn-sm btn-secondary" onClick={() => handleDownload(c)}>
                          <Icon name="down" /> Download
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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
