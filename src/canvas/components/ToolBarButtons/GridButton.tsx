import React from "react";

// Logo blue color
const LOGO_BLUE = "#00AEEF";

interface GridButtonProps {
  isGridActive: boolean;
  onClick: () => void;
}

const GridButton: React.FC<GridButtonProps> = ({ isGridActive, onClick }) => {
  return (
    <button
      className={`glass-icon-button ${
        isGridActive ? "" : ""
      }`}
      style={{
        backgroundColor: isGridActive ? `${LOGO_BLUE}20` : "white",
      }}
      onClick={onClick}
      title={isGridActive ? "Hide Grid" : "Show Grid"}
    >
      {isGridActive ? (
        // Grid On Icon - 3x3 grid
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke={LOGO_BLUE}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="3" y1="9" x2="21" y2="9"></line>
          <line x1="3" y1="15" x2="21" y2="15"></line>
          <line x1="9" y1="3" x2="9" y2="21"></line>
          <line x1="15" y1="3" x2="15" y2="21"></line>
        </svg>
      ) : (
        // Grid Off Icon - empty square
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-gray-600"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        </svg>
      )}
    </button>
  );
};

export default GridButton;
