import React, { useRef, useEffect } from "react";
import { CanvasProvider, useCanvas } from "../lib/CanvasContext";
import canvitLogo from "../assets/canvit.svg";

const CANVAS_SIZE = 100000;
const BOX_SIZE = 250;

function CanvasInner() {
  const { scale, setScale, positionX, positionY, setPosition } = useCanvas();
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const last = useRef({ x: 0, y: 0 });

  // Drag-to-pan
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    function onMouseDown(e: MouseEvent) {
      if (!container) return;
      isDragging.current = true;
      last.current = { x: e.clientX, y: e.clientY };
      container.style.cursor = "grabbing";
    }
    function onMouseMove(e: MouseEvent) {
      if (!isDragging.current || !container) return;
      const dx = e.clientX - last.current.x;
      const dy = e.clientY - last.current.y;
      setPosition(positionX + dx, positionY + dy);
      last.current = { x: e.clientX, y: e.clientY };
    }
    function onMouseUp() {
      if (!container) return;
      isDragging.current = false;
      container.style.cursor = "grab";
    }
    container.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    container.style.cursor = "grab";
    return () => {
      container.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [positionX, positionY, setPosition]);

  // Wheel-to-zoom (zoom to mouse position)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    function onWheel(e: WheelEvent) {
      if (!container) return;
      if (e.ctrlKey || e.metaKey) return; // let browser zoom
      e.preventDefault();
      const scaleFactor = 1 - e.deltaY * 0.001;
      let nextScale = Math.max(0.1, Math.min(3, scale * scaleFactor));
      // Mouse position relative to canvas container
      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      // Adjust position so the point under the mouse stays under the mouse
      setPosition(
        mouseX - ((mouseX - positionX) * nextScale) / scale,
        mouseY - ((mouseY - positionY) * nextScale) / scale
      );
      setScale(nextScale);
    }
    container.addEventListener("wheel", onWheel, { passive: false });
    return () => container.removeEventListener("wheel", onWheel);
  }, [scale, setScale, positionX, positionY, setPosition]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full overflow-hidden bg-gray-200 relative"
      style={{ minHeight: "100vh", minWidth: "100vw", touchAction: "none" }}
    >
      <div
        className="absolute left-0 top-0 bg-gray-300"
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
  );
}

const Canvas: React.FC = () => (
  <CanvasProvider>
    <CanvasInner />
  </CanvasProvider>
);

export default Canvas;
