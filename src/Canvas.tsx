import React, { useRef, useEffect, useState } from "react";
import { CanvasProvider, useCanvas } from "./contexts/CanvasContext";
import canvitLogo from "./assets/canvit.svg";
import Toolbar from "./canvas/components/Toolbar";
import { useCanvasPanAndZoom } from "./canvas/hooks/useCanvasPanAndZoom";
import CanvasContextMenu from "./canvas/menus/CanvasContextmenu";
import { useCanvasHandlers } from "./canvas/hooks/useCanvasHandlers";
import CanvasContent from "./canvas/components/CanvasContent";
import { CANVAS_SIZE, BOX_SIZE } from "./canvas/constants";
import "./App.css";

function CanvasInner() {
  const { scale, setScale, positionX, positionY, setPosition } = useCanvas();
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const last = useRef({ x: 0, y: 0 });
  const [isGridActive, setIsGridActive] = useState(false);
  const [showDebug, setShowDebug] = useState(false);

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
  const handleToggleGrid = (active: boolean) => {
    setIsGridActive(active);
    console.log("Grid toggled:", active);
    // Grid functionality will be implemented later
  };

  return (
    <>
      <Toolbar
        onAddNote={handleAddNoteFromToolbar}
        onToggleGrid={handleToggleGrid}
      />

      {/* Debug button */}
      <button
        className="fixed bottom-4 left-4 bg-red-500 text-white px-3 py-1 rounded z-50"
        onClick={() => setShowDebug(!showDebug)}
        style={{ zIndex: 9999 }}
      >
        Debug
      </button>

      {/* Debug overlay */}
      {showDebug && (
        <div
          className="fixed bottom-16 left-4 bg-white p-4 rounded shadow-lg z-50"
          style={{ zIndex: 9999 }}
        >
          <h3 className="font-bold mb-2">Debug Info</h3>
          <p>Scale: {scale.toFixed(2)}</p>
          <p>
            Position: {positionX.toFixed(0)}, {positionY.toFixed(0)}
          </p>
          <p>Grid: {isGridActive ? "On" : "Off"}</p>
          <p>Context Menu: {contextMenu ? "Open" : "Closed"}</p>
          <button
            className="mt-2 px-2 py-1 bg-blue-500 text-white rounded"
            onClick={() => {
              console.log("Canvas state:", {
                scale,
                positionX,
                positionY,
                isGridActive,
                contextMenu,
              });
            }}
          >
            Log to Console
          </button>
        </div>
      )}

      <div
        ref={containerRef}
        className="w-full h-full overflow-hidden bg-slate-100 relative"
        style={{ minHeight: "100vh", minWidth: "100vw", touchAction: "none" }}
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
          showGrid={isGridActive}
          onCloseCanvasContextMenu={handleCloseContextMenu}
        />
      </div>

      {contextMenu && (
        <CanvasContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={handleCloseContextMenu}
          onAddNote={handleAddNoteFromContextMenu}
          isGridActive={isGridActive}
          onToggleGrid={handleToggleGrid}
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
