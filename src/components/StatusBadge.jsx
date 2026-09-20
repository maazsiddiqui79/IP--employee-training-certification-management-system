import React from "react";

// StatusBadge — reusable status indicator for certificates and assessments
// status: "PENDING" | "APPROVED" | "REJECTED" | "COMPLETED"
export default function StatusBadge({ status }) {
  const map = {
    PENDING:   { label: "Pending",   cls: "status-pending"   },
    APPROVED:  { label: "Approved",  cls: "status-approved"  },
    REJECTED:  { label: "Rejected",  cls: "status-rejected"  },
    COMPLETED: { label: "Completed", cls: "status-completed" },
  };
  const { label, cls } = map[status] || { label: status, cls: "" };
  return <span className={`status-badge ${cls}`}>{label}</span>;
}
