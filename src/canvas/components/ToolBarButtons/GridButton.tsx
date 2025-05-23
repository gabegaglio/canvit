import React from "react";

interface GridButtonProps {
  isGridActive: boolean;
  onClick: () => void;
}

const GridButton: React.FC<GridButtonProps> = ({ isGridActive, onClick }) => {
  return (
    <button
      className={`w-12 h-12 flex items-center justify-center rounded-full bg-white shadow-lg transition-all duration-200 hover:scale-110 focus:outline-none cursor-pointer ${
        isGridActive ? "bg-blue-100" : "bg-white"
      }`}
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
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-blue-600"
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
