import { useState, useEffect } from "react";

interface Position {
  x: number;
  y: number;
}

interface Dimensions {
  width: number;
  height: number;
}

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

interface SnapResult {
  snapPosition: Position;
  snapDimensions: Dimensions;
  showSnapGuide: boolean;
}

export function useGridSnap({
  x,
  y,
  width,
  height,
  gridSize,
  isGridActive,
  isDragging,
  isResizing,
}: UseGridSnapProps): SnapResult {
  const [showSnapGuide, setShowSnapGuide] = useState(false);

  // Calculate snapped position
  const snapPosition: Position = {
    x: isGridActive ? Math.round(x / gridSize) * gridSize : x,
    y: isGridActive ? Math.round(y / gridSize) * gridSize : y,
  };

  // Calculate snapped dimensions
  const snapDimensions: Dimensions = {
    width: isGridActive ? Math.round(width / gridSize) * gridSize : width,
    height: isGridActive ? Math.round(height / gridSize) * gridSize : height,
  };

  // Show snap guide when dragging or resizing with grid active
  useEffect(() => {
    const shouldShow = isGridActive && (isDragging || isResizing);
    setShowSnapGuide(shouldShow);
  }, [isGridActive, isDragging, isResizing]);

  return {
    snapPosition,
    snapDimensions,
    showSnapGuide,
  };
}
