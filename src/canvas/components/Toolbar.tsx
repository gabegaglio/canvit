import React, { useEffect, useState } from "react";
import AddButton from "./ToolBarButtons/AddButton";

interface ToolbarProps {
  onAddNote?: () => void;
  onToggleGrid?: (active: boolean) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ onAddNote, onToggleGrid }) => {
  const [visible, setVisible] = useState(false);
  const [isGridActive, setIsGridActive] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const threshold = 80; // px from bottom
      if (window.innerHeight - e.clientY < threshold) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleToggleGrid = () => {
    const newGridState = !isGridActive;
    setIsGridActive(newGridState);
    onToggleGrid?.(newGridState);
  };

  return (
    <div
      className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999] flex flex-row gap-4 items-end transition-all duration-300 pointer-events-none
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      style={{ pointerEvents: visible ? "auto" : "none" }}
    >
      {onAddNote && <AddButton onClick={onAddNote} />}
      <button
        onClick={handleToggleGrid}
        className="glass-icon-button"
        title={isGridActive ? "Hide Grid" : "Show Grid"}
      >
        <div className="w-6 h-6 flex items-center justify-center">
          <div
            className={`w-4 h-4 border border-white ${
              isGridActive ? "bg-white" : ""
            }`}
          ></div>
        </div>
      </button>
    </div>
  );
};

export default Toolbar;
