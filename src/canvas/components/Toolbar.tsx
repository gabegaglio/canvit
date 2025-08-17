import React, { useEffect, useState } from "react";
import AddButton from "./ToolBarButtons/AddButton";
import AddImageButton from "./ToolBarButtons/AddImageButton";
import HomeButton from "./ToolBarButtons/HomeButton";
import GridButton from "./ToolBarButtons/GridButton";
import SettingsButton from "./ToolBarButtons/SettingsButton";

interface ToolbarProps {
  onAddNote?: () => void;
  onToggleGrid?: (gridState: "off" | "lines" | "snap") => void;
  onToggleSettings?: () => void;
  showSettings?: boolean;
  theme: "light" | "dark";
}

const Toolbar: React.FC<ToolbarProps> = ({
  onAddNote,
  onToggleGrid,
  onToggleSettings,
  showSettings = false,
  theme,
}) => {
  const [visible, setVisible] = useState(true);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [gridState, setGridState] = useState<"off" | "lines" | "snap">("off");

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Bottom toolbar threshold - show when near bottom of screen
      const bottomThreshold = 80; // px from bottom
      if (window.innerHeight - e.clientY < bottomThreshold) {
        setVisible(true);
      } else {
        setVisible(false);
      }

      // Top-left settings button threshold
      const topLeftThreshold = 120; // px from top-left corner
      if (e.clientX < topLeftThreshold && e.clientY < topLeftThreshold) {
        setSettingsVisible(true);
      } else {
        setSettingsVisible(false);
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
    <>
      {/* Bottom horizontal toolbar */}
      <div
        className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999] transition-all duration-300 pointer-events-none
          ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        style={{ pointerEvents: visible ? "auto" : "none" }}
      >
        {/* Modern horizontal toolbar */}
        <div
          className={`backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-300 flex flex-row items-center px-4 py-2 rounded-lg ${
            theme === "dark"
              ? "bg-black/80 border border-white/20"
              : "bg-white/95 border border-black/10"
          }`}
        >
          <HomeButton theme={theme} />

          {/* Separator */}
          <div
            className={`w-px h-6 mx-3 ${
              theme === "dark" ? "bg-white/20" : "bg-black/20"
            }`}
          />

          {/* Add buttons group */}
          <div className="flex flex-row gap-2">
            {onAddNote && <AddButton onClick={onAddNote} theme={theme} />}
            <AddImageButton onClick={() => {}} theme={theme} />
          </div>

          {/* Separator */}
          <div
            className={`w-px h-6 mx-3 ${
              theme === "dark" ? "bg-white/20" : "bg-black/20"
            }`}
          />

          <GridButton
            gridState={gridState}
            onClick={handleToggleGrid}
            theme={theme}
          />
        </div>
      </div>

      {/* Top left settings button */}
      <div
        className={`fixed top-8 left-8 z-[9999] transition-all duration-300 pointer-events-none
          ${
            settingsVisible && !showSettings
              ? "opacity-100 translate-x-0"
              : "opacity-0 -translate-x-4"
          }`}
        style={{
          pointerEvents: settingsVisible && !showSettings ? "auto" : "none",
        }}
      >
        <SettingsButton
          onClick={onToggleSettings || (() => {})}
          theme={theme}
        />
      </div>
    </>
  );
};

export default Toolbar;
