import React, { useRef, useEffect } from "react";
import { CanvasProvider, useCanvas } from "../contexts/CanvasContext";
import canvitLogo from "../assets/canvit.svg";
import HomeButton from "./components/HomeButton";
import Toolbar from "./components/Toolbar";
import { useCanvasPanAndZoom } from "./hooks/useCanvasPanAndZoom";

const CANVAS_SIZE = 100000;
const BOX_SIZE = 250;

function CanvasInner() {
  const { scale, setScale, positionX, positionY, setPosition } = useCanvas();
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const last = useRef({ x: 0, y: 0 });

  // Replace the existing pan and zoom effects with the custom hook
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
      <Toolbar>
        <HomeButton />
        {/* Add more buttons here as needed */}
      </Toolbar>
      <div
        ref={containerRef}
        className="w-full h-full overflow-hidden bg-white relative"
        style={{ minHeight: "100vh", minWidth: "100vw", touchAction: "none" }}
      >
        <div
          className="absolute left-0 top-0 bg-white"
          style={{
            width: CANVAS_SIZE,
            height: CANVAS_SIZE,
            transform: `translate(${positionX}px, ${positionY}px) scale(${scale})`,
            transformOrigin: "0 0",
          }}
        >
          {/* Center logo */}
          <img
            src={canvitLogo}
            alt="Canvit Logo"
            className="absolute"
            style={{
              left: CANVAS_SIZE / 2 - BOX_SIZE / 2,
              top: CANVAS_SIZE / 2 - BOX_SIZE / 2,
              width: BOX_SIZE,
              height: BOX_SIZE,
              objectFit: "contain",
              zIndex: 10,
              pointerEvents: "none",
              userSelect: "none",
            }}
          />
        </div>
      </div>
    </>
  );
}

const Canvas: React.FC = () => (
  <CanvasProvider>
    <CanvasInner />
  </CanvasProvider>
);

export default Canvas;
