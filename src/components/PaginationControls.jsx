import React from "react";

export default function PaginationControls({ currentPage, totalPages, prevPage, nextPage, goToPage }) {
  if (totalPages <= 1) return null;

  return (
    <div className="pagination-controls" style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "16px", justifyContent: "flex-end" }}>
      <button 
        className="btn btn-sm btn-outline" 
        onClick={prevPage} 
        disabled={currentPage === 1}
      >
        Previous
      </button>
      
      <span className="pagination-info" style={{ fontSize: "14px" }}>
        Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
      </span>
      
      <button 
        className="btn btn-sm btn-outline" 
        onClick={nextPage} 
        disabled={currentPage === totalPages}
      >
        Next
      </button>
    </div>
  );
}
