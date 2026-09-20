import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import EmployeeDetails from "../components/EmployeeDetails";
import { useAuth } from "../context/AuthContext";
import Icon from "../components/Icon";
import { z } from "zod";

const employeeIdSchema = z.string().regex(/^\d+$/, "Invalid Employee ID format");

export default function EmployeeDetailsPage() {
  const { employeeId } = useParams();
  const navigate       = useNavigate();
  const { db }         = useAuth();

  const parsedId = employeeIdSchema.safeParse(employeeId);
  const isValidId = parsedId.success;
  const empId = isValidId ? parseInt(parsedId.data, 10) : NaN;
  const employee = isValidId ? db.employees.find((e) => e.id === empId) : null;

  // Invalid / not-found employee
  if (!isValidId || !employee || isNaN(empId)) {
    return (
      <div className="page-wrapper">
        <Header title="Employee Details" />
        <main className="main-content">
          <div className="not-found-card">
            <div className="not-found-icon"><Icon name="search" /></div>
            <h2 className="not-found-title">Employee Not Found</h2>
            <p className="not-found-sub">
              No employee with ID <strong>{employeeId}</strong> exists in the system.
            </p>
            <button
              id="back-to-dashboard-btn"
              className="btn btn-primary"
              onClick={() => navigate("/admin/dashboard")}
            >
              ← Back to Dashboard
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <Header title="Employee Details" />

      <main className="main-content">
        <div className="page-header">
          <button
            id="back-btn"
            className="btn btn-secondary btn-sm"
            onClick={() => navigate("/admin/dashboard")}
          >
            ← Back to Dashboard
          </button>
        </div>

        <EmployeeDetails employee={employee} />
      </main>
    </div>
  );
}
