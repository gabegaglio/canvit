import React, { useRef } from "react";
import { CanvasProvider, useCanvas } from "./contexts/CanvasContext";
import canvitLogo from "./assets/canvit.svg";
import HomeButton from "./canvas/components/ToolBarButtons/HomeButton";
import Toolbar from "./canvas/components/Toolbar";
import { useCanvasPanAndZoom } from "./canvas/hooks/useCanvasPanAndZoom";
import CanvasContextMenu from "./canvas/menus/CanvasContextmenu";
import { useCanvasHandlers } from "./canvas/hooks/useCanvasHandlers";
import CanvasContent from "./canvas/components/CanvasContent";
import { CANVAS_SIZE, BOX_SIZE } from "./canvas/constants";

function CanvasInner() {
  const { scale, setScale, positionX, positionY, setPosition } = useCanvas();
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const last = useRef({ x: 0, y: 0 });

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

  return (
    <>
      <Toolbar onAddNote={handleAddNoteFromToolbar} />

      <div
        ref={containerRef}
        className="w-full h-full overflow-hidden bg-white relative"
        style={{ minHeight: "100vh", minWidth: "100vw", touchAction: "none" }}
        onContextMenu={handleContextMenu}
      >
        <CanvasContent
          positionX={positionX}
          positionY={positionY}
          scale={scale}
          canvasSize={CANVAS_SIZE}
          boxSize={BOX_SIZE}
          logoSrc={canvitLogo}
        />
      </div>

      {contextMenu && (
        <CanvasContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={handleCloseContextMenu}
          onAddNote={handleAddNoteFromContextMenu}
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
