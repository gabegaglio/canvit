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
import "./App.css";

function CanvasInner() {
  const { scale, setScale, positionX, positionY, setPosition } = useCanvas();
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const last = useRef({ x: 0, y: 0 });
  const [gridState, setGridState] = useState<"off" | "lines" | "snap">("off");

  // Simple state for settings - start with just theme and logo
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [showLogo, setShowLogo] = useState<boolean>(true);
  const [showSettings, setShowSettings] = useState(false);

  // New state for note/image styling
  const [elementRadius, setElementRadius] = useState<number>(8); // Default: rounded-lg (8px) - shared for both notes and images
  const [noteMargin, setNoteMargin] = useState<number>(0); // Default: no margin
  const [imageMargin, setImageMargin] = useState<number>(0); // Default: no margin

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
    setScale
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
    setTheme((prev) => {
      const newTheme = prev === "light" ? "dark" : "light";
      console.log("Theme changed from", prev, "to", newTheme);
      return newTheme;
    });
  };

  // Simple logo toggle function
  const toggleLogo = () => {
    console.log("Logo toggle clicked. Current showLogo:", showLogo);
    setShowLogo((prev) => {
      const newShowLogo = !prev;
      console.log("Logo visibility changed from", prev, "to", newShowLogo);
      return newShowLogo;
    });
  };

  // Functions to update radius and padding
  const updateNoteRadius = (radius: number) => {
    setElementRadius(radius);
  };

  const updateImageRadius = (radius: number) => {
    setElementRadius(radius);
  };

  const updateNoteMargin = (margin: number) => {
    setNoteMargin(margin);
  };

  const updateImageMargin = (margin: number) => {
    setImageMargin(margin);
  };

  // Simple settings toggle
  const toggleSettings = () => {
    setShowSettings((prev) => !prev);
  };

  // Reset all settings to defaults
  const resetSettings = () => {
    setTheme("light");
    setShowLogo(true);
    setElementRadius(8);
    setNoteMargin(0);
    setImageMargin(0);
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
          boxSize={BOX_SIZE}
          logoSrc={canvitLogo}
          showGrid={gridState === "lines"}
          showSnap={gridState === "snap"}
          showLogo={showLogo}
          onCloseCanvasContextMenu={handleCloseContextMenu}
          theme={theme}
          elementRadius={elementRadius}
          noteMargin={noteMargin}
          imageMargin={imageMargin}
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
          noteMargin={noteMargin}
          imageMargin={imageMargin}
          onElementRadiusChange={updateNoteRadius}
          onNoteMarginChange={updateNoteMargin}
          onImageMarginChange={updateImageMargin}
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
