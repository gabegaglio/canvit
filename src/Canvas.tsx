import React, { useState, useRef } from "react";
import { CanvasProvider, useCanvas } from "./contexts/CanvasContext";
import CanvasContent from "./canvas/components/CanvasContent";
import { useCanvasPanAndZoom } from "./canvas/hooks/canvas";
import Toolbar from "./canvas/components/Toolbar";
import { useCanvasHandlers } from "./canvas/hooks/canvas";
import CanvasContextMenu from "./canvas/menus/CanvasContextmenu";
import SettingsMenu from "./canvas/menus/SettingsMenu";
import canvitLogo from "./assets/canvit.svg";
import { CANVAS_SIZE, BOX_SIZE } from "./canvas/constants";
import DebugPanel from "./utils/DebugPanel";
import ZoomIndicator from "./canvas/components/ZoomIndicator";
import { useSettings } from "./canvas/hooks/settings/useSettings";
import "./App.css";

function CanvasInner() {
  const {
    scale,
    setScale,
    positionX,
    positionY,
    setPosition,
    isAnyNoteEditing,
  } = useCanvas();
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const last = useRef({ x: 0, y: 0 });
  const [gridState, setGridState] = useState<"off" | "lines" | "snap">("off");

  const {
    settings,
    updateSetting,
    resetToDefaults: resetSettingsToDefaults,
  } = useSettings();

  const theme =
    settings.theme === "dark"
      ? "dark"
      : settings.theme === "light"
      ? "light"
      : "light";
  const showLogo = settings.showLogo;
  const elementRadius = settings.noteRadius;
  // Grid size is stored as slider value (0-5), convert to actual size
  const gridSizeSlider = Math.min(5, Math.max(0, settings.gridSize ?? 2));
  const gridScales = [0.25, 0.5, 1, 2, 3, 4];
  const gridSize = gridScales[gridSizeSlider] * BOX_SIZE;

  const [showSettings, setShowSettings] = useState(false);

  // Use canvas handlers for context menu and note adding
  const {
    contextMenu,
    handleContextMenu,
    handleAddNoteFromContextMenu,
    handleAddNoteFromToolbar,
    handleCloseContextMenu,
  } = useCanvasHandlers({ positionX, positionY, scale });

  // Use the pan and zoom hook
  useCanvasPanAndZoom(
    containerRef,
    isDragging,
    last,
    positionX,
    positionY,
    setPosition,
    scale,
    setScale,
    isAnyNoteEditing
  );

  // Handle canvas click to close context menu
  const handleCanvasClick = () => {
    handleCloseContextMenu();
  };

  // Prevent context menu on right click
  const handleCanvasRightClick = (e: React.MouseEvent) => {
    // Check if the event originated from a note element
    const target = e.target as HTMLElement;
    const isNote = target.closest(".note-container");

    // If it's a note, let the note handle it
    if (isNote) {
      return;
    }

    // Otherwise, show the canvas context menu
    e.preventDefault();
    handleContextMenu(e);
  };

  // Handle grid toggle from toolbar
  const handleToggleGrid = (newGridState: "off" | "lines" | "snap") => {
    setGridState(newGridState);
  };

  // Simple theme toggle function
  const toggleTheme = () => {
    console.log("Theme toggle clicked. Current theme:", theme);
    const nextTheme = theme === "dark" ? "light" : "dark";
    updateSetting("theme", nextTheme);
    console.log("Theme changed to", nextTheme);
  };

  // Simple logo toggle function
  const toggleLogo = () => {
    console.log("Logo toggle clicked. Current showLogo:", showLogo);
    const nextShowLogo = !showLogo;
    updateSetting("showLogo", nextShowLogo);
    console.log("Logo visibility changed to", nextShowLogo);
  };

  const handleElementRadiusChange = (radius: number) => {
    updateSetting("noteRadius", radius);
  };

  const handleGridSizeChange = (sliderValue: number) => {
    const clamped = Math.min(5, Math.max(0, sliderValue));
    updateSetting("gridSize", clamped);
  };

  // Simple settings toggle
  const toggleSettings = () => {
    setShowSettings((prev) => !prev);
  };

  // Reset all settings to defaults
  const resetSettings = () => {
    resetSettingsToDefaults();
  };

  return (
    <>
      <Toolbar
        onAddNote={handleAddNoteFromToolbar}
        onToggleGrid={handleToggleGrid}
        onToggleSettings={toggleSettings}
        showSettings={showSettings}
        theme={theme}
      />
      <ZoomIndicator scale={scale} theme={theme} />
      {/* Debug panel - disabled by default */}
      <DebugPanel
        isEnabled={false}
        scale={scale}
        positionX={positionX}
        positionY={positionY}
        gridState={gridState}
        hasContextMenu={contextMenu !== null}
        theme={theme}
      />

      <div
        ref={containerRef}
        className={`w-full h-full overflow-hidden relative transition-colors duration-200 ${
          theme === "dark" ? "text-white" : "text-gray-900"
        }`}
        style={{
          minHeight: "100vh",
          minWidth: "100vw",
          touchAction: "none",
          backgroundColor: theme === "dark" ? "#000000" : "transparent", // Make background transparent
          color: theme === "dark" ? "#ffffff" : "#111827", // Force text color
        }}
        onClick={handleCanvasClick}
        onContextMenu={handleCanvasRightClick}
      >
        <CanvasContent
          positionX={positionX}
          positionY={positionY}
          scale={scale}
          canvasSize={CANVAS_SIZE}
          gridSize={gridSize}
          logoSize={BOX_SIZE * 3}
          logoSrc={canvitLogo}
          showGrid={gridState === "lines"}
          showSnap={gridState === "snap"}
          showLogo={showLogo}
          onCloseCanvasContextMenu={handleCloseContextMenu}
          theme={theme}
          elementRadius={elementRadius}
        />
      </div>

      {contextMenu && (
        <CanvasContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={handleCloseContextMenu}
          onAddNote={handleAddNoteFromContextMenu}
          gridState={gridState}
          onToggleGrid={handleToggleGrid}
          theme={theme}
          positionX={positionX}
          positionY={positionY}
          scale={scale}
        />
      )}

      {showSettings && (
        <SettingsMenu
          closeSettings={() => setShowSettings(false)}
          theme={theme}
          onThemeToggle={toggleTheme}
          showLogo={showLogo}
          onLogoToggle={toggleLogo}
          elementRadius={elementRadius}
          gridSize={gridSizeSlider}
          onElementRadiusChange={handleElementRadiusChange}
          onGridSizeChange={handleGridSizeChange}
          onResetSettings={resetSettings}
        />
      )}
    </>
  );
}

const Canvas: React.FC = () => (
  <CanvasProvider>
    <CanvasInner />
  </CanvasProvider>
);

export default Canvas;
