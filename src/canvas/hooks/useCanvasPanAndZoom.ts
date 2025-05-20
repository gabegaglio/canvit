import { useEffect } from "react";
import type { RefObject, MutableRefObject } from "react";

export function useCanvasPanAndZoom(
  containerRef: RefObject<HTMLDivElement | null>,
  isDragging: MutableRefObject<boolean>,
  last: MutableRefObject<{ x: number; y: number }>,
  positionX: number,
  positionY: number,
  setPosition: (x: number, y: number) => void,
  scale: number,
  setScale: (s: number) => void
) {
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

  // Wheel-to-zoom
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    function onWheel(e: WheelEvent) {
      if (!container) return;
      if (e.ctrlKey || e.metaKey) return;
      e.preventDefault();
      const scaleFactor = 1 - e.deltaY * 0.001;
      let nextScale = Math.max(0.1, Math.min(3, scale * scaleFactor));
      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      setPosition(
        mouseX - ((mouseX - positionX) * nextScale) / scale,
        mouseY - ((mouseY - positionY) * nextScale) / scale
      );
      setScale(nextScale);
    }
    container.addEventListener("wheel", onWheel, { passive: false });
    return () => container.removeEventListener("wheel", onWheel);
  }, [scale, setScale, positionX, positionY, setPosition]);
}
