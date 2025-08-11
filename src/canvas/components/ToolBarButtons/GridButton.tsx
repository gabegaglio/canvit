import React from "react";

// Logo blue color
const LOGO_BLUE = "#00AEEF";

interface GridButtonProps {
  gridState: "off" | "lines" | "snap";
  gridDensity?: number;
  onClick: () => void;
  theme: "light" | "dark";
}

const GridButton: React.FC<GridButtonProps> = ({
  gridState,
  gridDensity = 50,
  onClick,
  theme,
}) => {
  const isDark = theme === "dark";
  const isActive = gridState !== "off";

  const getTitle = () => {
    const densityText = gridDensity < 50 ? ` (${gridDensity}px)` : "";
    switch (gridState) {
      case "off":
        return `Grid & Snap${densityText}`;
      case "lines":
        return `Snap Only${densityText}`;
      case "snap":
        return `No Grid${densityText}`;
      default:
        return `Grid & Snap${densityText}`;
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
            className={isDark ? "text-gray-300" : "text-gray-600"}
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
        backgroundColor: isActive ? `${LOGO_BLUE}20` : "transparent",
      }}
      onClick={onClick}
      title={getTitle()}
    >
      {getIcon()}
    </button>
  );
};

export default GridButton;
