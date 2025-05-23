import React, { useRef, useEffect, useState } from "react";
import { CanvasProvider, useCanvas } from "./contexts/CanvasContext";
import canvitLogo from "./assets/canvit.svg";
import Toolbar from "./canvas/components/Toolbar";
import { useCanvasPanAndZoom } from "./canvas/hooks/useCanvasPanAndZoom";
import CanvasContextMenu from "./canvas/menus/CanvasContextmenu";
import { useCanvasHandlers } from "./canvas/hooks/useCanvasHandlers";
import CanvasContent from "./canvas/components/CanvasContent";
import { CANVAS_SIZE, BOX_SIZE } from "./canvas/constants";
import DebugPanel from "./utils/DebugPanel";
import "./App.css";

function CanvasInner() {
  const { scale, setScale, positionX, positionY, setPosition } = useCanvas();
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const last = useRef({ x: 0, y: 0 });
  const [isGridActive, setIsGridActive] = useState(false);

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

      {/* Debug panel - disabled by default */}
      <DebugPanel
        isEnabled={false}
        scale={scale}
        positionX={positionX}
        positionY={positionY}
        isGridActive={isGridActive}
        hasContextMenu={contextMenu !== null}
      />

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
