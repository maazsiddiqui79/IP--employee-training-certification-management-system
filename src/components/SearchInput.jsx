import React from "react";
import Icon from "./Icon";

export default function SearchInput({ value, onChange, placeholder = "Search..." }) {
  return (
    <div className="search-input-wrap">
      <span className="search-icon"><Icon name="search" /></span>
      <input
        type="text"
        className="form-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}
