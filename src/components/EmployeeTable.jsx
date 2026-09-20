
import React, { useState, useMemo, useCallback } from "react";

import { useAuth } from "../context/AuthContext";

import SearchInput from "./SearchInput";

import { useSort } from "./useSort";

import Icon from "./Icon";

export default function EmployeeTable({ employees, onEdit, onDelete, onView }) {
  const { db } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [designationFilter, setDesignationFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const getDesignationName = useCallback((designationId) => {
    const des = db.designations.find((d) => d.id === designationId);
    return des ? des.name : "—";
  }, [db.designations]);

  const getRole = useCallback((employeeId) => {
    const user = db.users.find((u) => u.employeeId === employeeId);
    return user ? user.role : "—";
  }, [db.users]);

  // 1. Search and Advanced filter
  const filteredEmployees = useMemo(() => {
    let result = employees;

    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter((emp) =>
        emp.name.toLowerCase().includes(lowerQuery) ||
        emp.email.toLowerCase().includes(lowerQuery)
      );
    }

    if (designationFilter) {
      result = result.filter(emp => String(emp.designationId) === designationFilter);
    }

    if (roleFilter) {
      result = result.filter(emp => getRole(emp.id) === roleFilter);
    }

    return result;
  }, [employees, searchQuery, designationFilter, roleFilter, getRole]);

  // 2. Map data for sorting
  const sortableData = useMemo(() => {
    return filteredEmployees.map(emp => ({
      ...emp,
      designationName: getDesignationName(emp.designationId),
      roleName: getRole(emp.id)
    }));
  }, [filteredEmployees, getDesignationName, getRole]);

  // 3. Sorting
  const { sortedData, requestSort, sortKey, sortDirection } = useSort(sortableData, "name", "asc");

  const renderSortIcon = (key) => {
    if (sortKey !== key) return <span style={{ marginLeft: 4 }}><Icon name="upDown" /></span>;
    return sortDirection === "asc" ? <span style={{ marginLeft: 4 }}><Icon name="up" /></span> : <span style={{ marginLeft: 4 }}><Icon name="down" /></span>;
  };

  return (
    <div className="table-container">
      <div className="table-toolbar" style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: "16px" }}>
        <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Search by name or email..." />

        <div style={{ display: "flex", gap: "12px" }}>
          <select
            className="form-input form-select"
            style={{ minWidth: "180px", padding: "6px 12px", height: "36px" }}
            value={designationFilter}
            onChange={e => setDesignationFilter(e.target.value)}
          >
            <option value="">All Designations</option>

            {db.designations.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>

          <select
            className="form-input form-select"
            style={{ minWidth: "150px", padding: "6px 12px", height: "36px" }}
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
          >
            <option value="">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="EMPLOYEE">Employee</option>
          </select>
        </div>
      </div>

      {filteredEmployees.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><Icon name="users" /></div>
          <p className="empty-state-text">No employees found.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table" id="employee-table">
            <thead>
              <tr>
                <th>#</th>

                <th onClick={() => requestSort("name")} style={{ cursor: "pointer" }}>
                  Name{renderSortIcon("name")}
                </th>

                <th onClick={() => requestSort("email")} style={{ cursor: "pointer" }}>
                  Email{renderSortIcon("email")}
                </th>

                <th onClick={() => requestSort("designationName")} style={{ cursor: "pointer" }}>
                  Designation{renderSortIcon("designationName")}
                </th>

                <th onClick={() => requestSort("roleName")} style={{ cursor: "pointer" }}>
                  Role{renderSortIcon("roleName")}
                </th>

                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {sortedData.map((emp, index) => (
                <tr key={emp.id}>
                  <td className="td-index">{index + 1}</td>

                  <td className="td-name">{emp.name}</td>

                  <td className="td-email">{emp.email}</td>

                  <td>{emp.designationName}</td>

                  <td>
                    <span className={`role - badge role - ${emp.roleName.toLowerCase()} `}>
                      {emp.roleName}
                    </span>
                  </td>

                  <td className="td-actions">
                    <button
                      id={`view - btn - ${emp.id} `}
                      className="btn btn-sm btn-view"
                      onClick={() => onView(emp.id)}
                      title="View details"
                    >
                      View
                    </button>

                    <button
                      id={`edit - btn - ${emp.id} `}
                      className="btn btn-sm btn-edit"
                      onClick={() => onEdit(emp.id)}
                      title="Edit employee"
                    >
                      Edit
                    </button>

                    <button
                      id={`delete -btn - ${emp.id} `}
                      className="btn btn-sm btn-danger"
                      onClick={() => onDelete(emp.id)}
                      title="Delete employee"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
