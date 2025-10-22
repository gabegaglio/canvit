import { useEffect, useRef } from "react";

/**
 * Determines the appropriate cursor based on the interaction state
 */
export const getCursorStyle = ({
  isResizing,
  isHoveringHandle,
  isDragging,
  getResizeCursor,
}: {
  isResizing: boolean;
  isHoveringHandle: boolean | null; // Accept boolean or null for isHoveringHandle
  isDragging: boolean;
  getResizeCursor?: () => string | null;
}): string => {
  if (isResizing) return getResizeCursor?.() || "grab";
  if (isHoveringHandle) return "nwse-resize";
  if (isDragging) return "grabbing";
  return "grab";
};
/**
 * Hook to handle updating element dimensions and position from props
 */
export const useElementPosition = (
  propWidth: number | undefined,
  propHeight: number | undefined,
  updateDimensions: (width: number, height: number) => void,
  style: React.CSSProperties | undefined,
  _position: { x: number; y: number },
  updatePosition: (x: number, y: number) => void,
  initialPosition?: { x: number; y: number }
) => {
  // Update dimensions from props if they change
  useEffect(() => {
    if (propWidth && propHeight) {
      updateDimensions(propWidth, propHeight);
    }
  }, [propWidth, propHeight, updateDimensions]);

  // Set initial position from props
  const initializedRef = useRef(false);
  const lastInitialRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (initialPosition) {
      const prev = lastInitialRef.current;
      if (
        !prev ||
        prev.x !== initialPosition.x ||
        prev.y !== initialPosition.y
      ) {
        lastInitialRef.current = initialPosition;
        initializedRef.current = true;
        updatePosition(initialPosition.x ?? 0, initialPosition.y ?? 0);
      }
      return;
    }

    const hasLeft =
      typeof style?.left === "number" || typeof style?.left === "string";
    const hasTop =
      typeof style?.top === "number" || typeof style?.top === "string";

    if (!hasLeft || !hasTop) {
      return;
    }

    const leftValue =
      typeof style?.left === "number"
        ? style.left
        : parseFloat(style?.left as string);
    const topValue =
      typeof style?.top === "number"
        ? style.top
        : parseFloat(style?.top as string);

    if (!Number.isFinite(leftValue) || !Number.isFinite(topValue)) {
      return;
    }

    if (!initializedRef.current) {
      initializedRef.current = true;
      updatePosition(leftValue, topValue);
    }
  }, [
    initialPosition?.x,
    initialPosition?.y,
    style?.left,
    style?.top,
    updatePosition,
  ]);
};
