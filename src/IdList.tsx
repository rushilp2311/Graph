import React, { useState } from "react";
// Make sure this CSS file exists for styling

const IdList = ({ uniqueIds, onIdClick, onShowAllGraph, selectedIds }) => {
  // No searchId state or search functionality here anymore

  return (
    <div className="id-list-container">
      <div className="id-list-header">
        <h2>IDs</h2>
        <button className="show-all-button" onClick={onShowAllGraph}>
          Show All Graph
        </button>
      </div>

      <ul className="id-list">
        {uniqueIds.map((id) => (
          <li
            key={id}
            className={`id-list-item ${selectedIds.includes(id) ? "selected" : ""}`}
            onClick={() => onIdClick(id)}
          >
            {id}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default IdList;
