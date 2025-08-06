import React from "react";

// Logo blue color
const LOGO_BLUE = "#00AEEF";

interface GridButtonProps {
  gridState: "off" | "lines" | "snap";
  onClick: () => void;
}

const GridButton: React.FC<GridButtonProps> = ({ gridState, onClick }) => {
  const isActive = gridState !== "off";

  const getTitle = () => {
    switch (gridState) {
      case "off":
        return "Show Grid";
      case "lines":
        return "Grid with Lines";
      case "snap":
        return "Grid Snap Only";
      default:
        return "Show Grid";
    }
  };

  const getIcon = () => {
    switch (gridState) {
      case "off":
        // Grid Off Icon - empty square
        return (
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
        );
      case "lines":
        // Grid On Icon - 3x3 grid with lines
        return (
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
        );
      case "snap":
        // Grid Snap Icon - 3x3 grid without lines (just dots at intersections)
        return (
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
            <circle cx="9" cy="9" r="1" fill={LOGO_BLUE}></circle>
            <circle cx="15" cy="9" r="1" fill={LOGO_BLUE}></circle>
            <circle cx="9" cy="15" r="1" fill={LOGO_BLUE}></circle>
            <circle cx="15" cy="15" r="1" fill={LOGO_BLUE}></circle>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <button
      className="glass-icon-button"
      style={{
        backgroundColor: isActive ? `${LOGO_BLUE}20` : "white",
      }}
      onClick={onClick}
      title={getTitle()}
    >
      {getIcon()}
    </button>
  );
};

export default GridButton;
