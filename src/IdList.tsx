// src/components/IdList.tsx
//
// @ts-nocheck
import React from "react";

// Define the interface for IdList's props
interface IdListProps {
  uniqueIds: number[];
  onIdClick: (id: number) => void;
  onShowAllGraph: () => void;
  selectedIds: number[];
}

const IdList: React.FC<IdListProps> = ({
  uniqueIds,
  onIdClick,
  onShowAllGraph,
  selectedIds,
}) => {
  return (
    <div className="id-list-container">
      <div className="id-list-header">
        <h2>IDs</h2>
        <button className="show-all-button" onClick={onShowAllGraph}>
          Show All Graph
        </button>
      </div>

      <ul className="id-list">
        {uniqueIds.map(
          (
            id: number, // Type id in map callback
          ) => (
            <li
              key={id}
              className={`id-list-item ${selectedIds.includes(id) ? "selected" : ""}`}
              onClick={() => onIdClick(id)}
            >
              {id}
            </li>
          ),
        )}
      </ul>
    </div>
  );
};

export default IdList;
