import { useState, useEffect, useMemo } from "react";
import { getSnapPosition, getSnapDimensions } from "../utils/gridUtils";

interface UseGridSnapProps {
  x: number;
  y: number;
  width: number;
  height: number;
  gridSize: number;
  gridState: "off" | "lines" | "snap";
  isDragging: boolean;
  isResizing: boolean;
}

interface SnapInfo {
  snapPosition: { x: number; y: number };
  snapDimensions: { width: number; height: number };
  showSnapGuide: boolean;
}

/**
 * Hook to handle grid snapping behavior for notes
 */
export const useGridSnap = ({
  x,
  y,
  width,
  height,
  gridSize,
  gridState,
  isDragging,
  isResizing,
}: UseGridSnapProps): SnapInfo => {
  // Memoize snap calculations to avoid unnecessary recalculations
  const snapPosition = useMemo(
    () => getSnapPosition(x, y, gridSize),
    [x, y, gridSize]
  );
  const snapDimensions = useMemo(
    () => getSnapDimensions(width, height, gridSize),
    [width, height, gridSize]
  );

  // State to track if we should show the snapping guide
  const [showSnapGuide, setShowSnapGuide] = useState(false);

  // Update the snap guide visibility based on grid state and interaction
  useEffect(() => {
    const isGridActive = gridState !== "off";

    if (!isGridActive) {
      setShowSnapGuide(false);
      return;
    }

    // Only show snap guides during active dragging or resizing
    const isInteracting = isDragging || isResizing;

    // Only show snap guides if we're not already snapped
    const isAlreadySnapped =
      x === snapPosition.x &&
      y === snapPosition.y &&
      width === snapDimensions.width &&
      height === snapDimensions.height;

    setShowSnapGuide(isInteracting && !isAlreadySnapped);
  }, [
    gridState,
    isDragging,
    isResizing,
    x,
    y,
    width,
    height,
    snapPosition.x,
    snapPosition.y,
    snapDimensions.width,
    snapDimensions.height,
  ]);

  return {
    snapPosition,
    snapDimensions,
    showSnapGuide,
  };
};
