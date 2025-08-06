import React, { useEffect, useState } from "react";
import AddButton from "./ToolBarButtons/AddButton";
import HomeButton from "./ToolBarButtons/HomeButton";
import GridButton from "./ToolBarButtons/GridButton";

interface ToolbarProps {
  onAddNote?: () => void;
  onToggleGrid?: (gridState: "off" | "lines" | "snap") => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ onAddNote, onToggleGrid }) => {
  const [visible, setVisible] = useState(false);
  const [gridState, setGridState] = useState<"off" | "lines" | "snap">("off");

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
    // Cycle through the three states: off -> lines -> snap -> off
    const nextState =
      gridState === "off" ? "lines" : gridState === "lines" ? "snap" : "off";
    setGridState(nextState);
    if (onToggleGrid) {
      onToggleGrid(nextState);
    }
  };

  return (
    <div
      className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999] flex flex-row gap-4 items-end transition-all duration-300 pointer-events-none
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      style={{ pointerEvents: visible ? "auto" : "none" }}
    >
      <HomeButton />
      {onAddNote && <AddButton onClick={onAddNote} />}
      <GridButton gridState={gridState} onClick={handleToggleGrid} />
    </div>
  );
};

export default Toolbar;
