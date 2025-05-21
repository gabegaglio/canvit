import { useDrag } from "@use-gesture/react";
import { useState, useEffect } from "react";

/**
 * Creates a drag handler for moving an element
 * @param options Configuration options for the drag handler
 * @returns Drag binding
 */
export const createDragHandler = ({
  position,
  scale = 1,
  isResizing = false,
  isHoveringHandle = false,
  setIsDragging,
  updatePosition,
  onDragEnd,
  id,
}: {
  position: { x: number; y: number };
  scale?: number;
  isResizing?: boolean;
  isHoveringHandle?: boolean;
  setIsDragging: (isDragging: boolean) => void;
  updatePosition: (x: number, y: number) => void;
  onDragEnd?: (id: string, x: number, y: number) => void;
  id?: string;
}) => {
  return useDrag(
    ({ movement: [mx, my], first, last, memo }) => {
      // Don't drag if we're resizing or hovering over a resize handle
      if (isResizing || isHoveringHandle) return;

      if (first) {
        setIsDragging(true);
        return {
          initialX: position.x,
          initialY: position.y,
        };
      }

      // Adjust movement based on canvas scale
      const adjustedMx = mx / scale;
      const adjustedMy = my / scale;

      // Calculate new position
      const x = memo.initialX + adjustedMx;
      const y = memo.initialY + adjustedMy;

      // Update position
      updatePosition(x, y);

      if (last) {
        setIsDragging(false);
        if (id && onDragEnd) {
          onDragEnd(id, x, y);
        }
      }

      return memo;
    },
    {
      preventDefault: true,
      filterTaps: true,
    }
  );
};

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
  isHoveringHandle: any; // Accept any type for isHoveringHandle
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
  position: { x: number; y: number },
  updatePosition: (x: number, y: number) => void
) => {
  // Update dimensions from props if they change
  useEffect(() => {
    if (propWidth && propHeight) {
      updateDimensions(propWidth, propHeight);
    }
  }, [propWidth, propHeight, updateDimensions]);

  // Set initial position from props
  useEffect(() => {
    if (style?.left && style?.top && position.x === 0 && position.y === 0) {
      const x = style.left as number;
      const y = style.top as number;
      updatePosition(x, y);
    }
  }, [style?.left, style?.top, position.x, position.y, updatePosition]);
};
