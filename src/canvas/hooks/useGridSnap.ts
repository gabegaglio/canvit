import { useState, useEffect } from "react";
import { getSnapPosition, getSnapDimensions } from "../utils/gridUtils";

interface UseGridSnapProps {
  x: number;
  y: number;
  width: number;
  height: number;
  gridSize: number;
  isGridActive: boolean;
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
  isGridActive,
  isDragging,
  isResizing,
}: UseGridSnapProps): SnapInfo => {
  // Calculate snap positions and dimensions
  const snapPosition = getSnapPosition(x, y, gridSize);
  const snapDimensions = getSnapDimensions(width, height, gridSize);

  // State to track if we should show the snapping guide
  const [showSnapGuide, setShowSnapGuide] = useState(false);

  // Update the snap guide visibility based on grid state and interaction
  useEffect(() => {
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
    isGridActive,
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
