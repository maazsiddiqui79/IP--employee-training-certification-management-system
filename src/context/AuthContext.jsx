import React, { createContext, useContext, useState, useEffect } from "react";
import {
  users                as seedUsers,
  employees            as seedEmployees,
  designations         as seedDesignations,
  uploadedCertificates as seedUploadedCertificates,
  adminAssessments     as seedAdminAssessments,
  assessmentResults    as seedAssessmentResults,
  recentActivity       as seedRecentActivity,
} from "../data/mockData";
import { saveFile } from "../utils/fileStore";

// ============================================================
// AuthContext — global authentication + in-memory relational DB
// ============================================================

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem("etcms_currentUser");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Single source of truth for all entities
  const [db, setDb] = useState(() => {
    try {
      const saved = localStorage.getItem("etcms_db");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to load DB from localStorage", e);
    }
    return {
      users:                [...seedUsers],
      employees:            [...seedEmployees],
      designations:         [...seedDesignations],
      uploadedCertificates: [...seedUploadedCertificates],
      adminAssessments:     [...seedAdminAssessments],
      assessmentResults:    [...seedAssessmentResults],
      activities:           [...seedRecentActivity],
    };
  });

  useEffect(() => {
    localStorage.setItem("etcms_db", JSON.stringify(db));
  }, [db]);

  const addActivity = (action, user) => {
    setDb((prev) => ({
      ...prev,
      activities: [
        { id: Date.now(), action, user, date: new Date().toISOString() },
        ...(prev.activities || [])
      ]
    }));
  };

  // ── Auth ──────────────────────────────────────────────────
  const login = (email, password) => {
    const userIndex = db.users.findIndex(
      (u) =>
        u.email.toLowerCase() === email.toLowerCase() &&
        u.password === password
    );
    if (userIndex === -1) return { success: false, message: "Invalid email or password." };
    
    const user = db.users[userIndex];
    const now = new Date().toISOString();

    // Update lastLogin
    setDb((prev) => {
      const newUsers = [...prev.users];
      newUsers[userIndex] = { ...user, lastLogin: now };
      return { ...prev, users: newUsers };
    });

    let sessionUser = {
      id:         user.id,
      email:      user.email,
      role:       user.role,
      employeeId: user.employeeId,
      lastLogin:  now,
    };

    if (user.role === "ADMIN") {
      sessionUser.name = "Administrator";
    } else {
      const emp = db.employees.find((e) => e.id === user.employeeId);
      sessionUser.name = emp ? emp.name : email;
    }

    setCurrentUser(sessionUser);
    localStorage.setItem("etcms_currentUser", JSON.stringify(sessionUser));
    return { success: true, role: user.role };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("etcms_currentUser");
  };

  // ── Employee CRUD ─────────────────────────────────────────
  const addEmployee = (empData, userData) => {
    setDb((prev) => {
      const newEmpId  = prev.employees.length > 0 ? Math.max(...prev.employees.map((e) => e.id)) + 1 : 1;
      const newUserId = prev.users.length > 0      ? Math.max(...prev.users.map((u) => u.id)) + 1      : 1;
      return {
        ...prev,
        employees: [...prev.employees, { id: newEmpId,  ...empData  }],
        users:     [...prev.users,     { id: newUserId, employeeId: newEmpId, ...userData }],
      };
    });
  };

  const editEmployee = (empId, empData, role, newPassword = null) => {
    setDb((prev) => ({
      ...prev,
      employees: prev.employees.map((e) => e.id === empId ? { ...e, ...empData } : e),
      users:     prev.users.map((u) => {
        if (u.employeeId === empId) {
          const updated = { ...u, email: empData.email, role };
          if (newPassword) updated.password = newPassword;
          return updated;
        }
        return u;
      }),
    }));
    setCurrentUser((prev) => {
      if (!prev || prev.employeeId !== empId) return prev;
      const updatedUser = { ...prev, name: empData.name, email: empData.email, role };
      localStorage.setItem("etcms_currentUser", JSON.stringify(updatedUser));
      return updatedUser;
    });
    addActivity(`Updated employee: ${empData.name}`, currentUser?.name || "Admin");
  };

  const deleteEmployee = (empId) => {
    setDb((prev) => ({
      ...prev,
      employees:            prev.employees.filter((e) => e.id !== empId),
      users:                prev.users.filter((u) => u.employeeId !== empId),
      uploadedCertificates: prev.uploadedCertificates.filter((c) => c.employeeId !== empId),
      assessmentResults:    prev.assessmentResults.filter((r) => r.employeeId !== empId),
      adminAssessments:     prev.adminAssessments.map((a) => ({
        ...a,
        assignedEmployeeIds: a.assignedEmployeeIds.filter((id) => id !== empId),
      })),
    }));
  };

  // ── Certificate mutations ─────────────────────────────────

  /** Employee uploads a new certificate — always starts as PENDING */
  const uploadCertificate = (certData, employeeName) => {
    let newId = 1;
    setDb((prev) => {
      newId = prev.uploadedCertificates.length > 0
        ? Math.max(...prev.uploadedCertificates.map((c) => c.id)) + 1
        : 1;
      
      const { fileData, ...certWithoutData } = certData;
      
      if (fileData) {
        saveFile(newId, fileData).catch(err => console.error("Failed to save to IndexedDB", err));
      }

      return {
        ...prev,
        uploadedCertificates: [
          ...prev.uploadedCertificates,
          {
            id:              newId,
            status:          "PENDING",
            rejectionReason: null,
            uploadedAt:      new Date().toISOString().split("T")[0],
            verifiedAt:      null,
            verifiedBy:      null,
            history:         [{ action: "UPLOADED", date: new Date().toISOString(), user: employeeName || "Employee", reason: null }],
            ...certWithoutData,
          },
        ],
      };
    });
  };

  /** Admin approves a certificate */
  const approveCertificate = (certId, adminName) => {
    setDb((prev) => ({
      ...prev,
      uploadedCertificates: prev.uploadedCertificates.map((c) =>
        c.id === certId
          ? {
              ...c,
              status:          "APPROVED",
              rejectionReason: null,
              verifiedAt:      new Date().toISOString().split("T")[0],
              verifiedBy:      adminName,
              history:         [...(c.history || []), { action: "APPROVED", date: new Date().toISOString(), user: adminName, reason: null }]
            }
          : c
      ),
    }));
  };

  /** Admin rejects a certificate with a reason */
  const rejectCertificate = (certId, reason, adminName) => {
    setDb((prev) => ({
      ...prev,
      uploadedCertificates: prev.uploadedCertificates.map((c) =>
        c.id === certId
          ? {
              ...c,
              status:          "REJECTED",
              rejectionReason: reason,
              verifiedAt:      new Date().toISOString().split("T")[0],
              verifiedBy:      adminName,
              history:         [...(c.history || []), { action: "REJECTED", date: new Date().toISOString(), user: adminName, reason }]
            }
          : c
      ),
    }));
  };

  // ── Assessment mutations ──────────────────────────────────

  /** Admin creates a new assessment + auto-creates PENDING results for assigned employees */
  const createAdminAssessment = (assessmentData) => {
    setDb((prev) => {
      const newAssessmentId = prev.adminAssessments.length > 0
        ? Math.max(...prev.adminAssessments.map((a) => a.id)) + 1
        : 1;

      const newAssessment = {
        id:        newAssessmentId,
        createdAt: new Date().toISOString().split("T")[0],
        ...assessmentData,
      };

      const baseResultId = prev.assessmentResults.length > 0
        ? Math.max(...prev.assessmentResults.map((r) => r.id)) + 1
        : 1;

      const newResults = assessmentData.assignedEmployeeIds.map((empId, idx) => ({
        id:           baseResultId + idx,
        assessmentId: newAssessmentId,
        employeeId:   empId,
        marks:        null,
        remarks:      null,
        status:       "PENDING",
      }));

      return {
        ...prev,
        adminAssessments:  [...prev.adminAssessments, newAssessment],
        assessmentResults: [...prev.assessmentResults, ...newResults],
      };
    });
  };

  /** Admin saves/updates marks for one employee in one assessment */
  const saveAssessmentResult = (assessmentId, employeeId, marks, remarks) => {
    setDb((prev) => ({
      ...prev,
      assessmentResults: prev.assessmentResults.map((r) =>
        r.assessmentId === assessmentId && r.employeeId === employeeId
          ? {
              ...r,
              marks:   marks !== "" && marks !== null ? Number(marks) : null,
              remarks: remarks || null,
              status:  marks !== "" && marks !== null ? "COMPLETED" : "PENDING",
            }
          : r
      ),
    }));
  };

  /** Admin deletes an assessment and all its results */
  const deleteAdminAssessment = (assessmentId) => {
    setDb((prev) => ({
      ...prev,
      adminAssessments:  prev.adminAssessments.filter((a) => a.id !== assessmentId),
      assessmentResults: prev.assessmentResults.filter((r) => r.assessmentId !== assessmentId),
    }));
  };

  const value = {
    currentUser,
    login,
    logout,
    db,
    // Employee CRUD
    addEmployee,
    editEmployee,
    deleteEmployee,
    // Certificate
    uploadCertificate,
    approveCertificate,
    rejectCertificate,
    // Assessments
    createAdminAssessment,
    saveAssessmentResult,
    deleteAdminAssessment,
    // System
    addActivity,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
