import { useState, useMemo } from "react";

export function useSort(data, defaultKey = null, defaultDirection = "asc") {
  const [sortKey, setSortKey] = useState(defaultKey);
  const [sortDirection, setSortDirection] = useState(defaultDirection);

  const requestSort = (key) => {
    if (sortKey === key) {
      // toggle
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const sortedData = useMemo(() => {
    if (!sortKey) return data;
    
    return [...data].sort((a, b) => {
      // Retrieve nested keys using reduce, e.g. "user.name"
      const valA = sortKey.split('.').reduce((obj, k) => (obj || {})[k], a);
      const valB = sortKey.split('.').reduce((obj, k) => (obj || {})[k], b);

      if (valA === valB) return 0;
      if (valA == null) return sortDirection === "asc" ? -1 : 1;
      if (valB == null) return sortDirection === "asc" ? 1 : -1;

      // Date comparison
      const dateA = new Date(valA);
      const dateB = new Date(valB);
      if (typeof valA === "string" && typeof valB === "string" && 
          !isNaN(dateA.getTime()) && !isNaN(dateB.getTime()) && 
          (valA.includes("-") || valA.includes("/"))) {
        return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
      }

      // string comparison
      if (typeof valA === "string" && typeof valB === "string") {
        return sortDirection === "asc"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }

      // number comparison
      return sortDirection === "asc" ? valA - valB : valB - valA;
    });
  }, [data, sortKey, sortDirection]);

  return { sortedData, requestSort, sortKey, sortDirection };
}
