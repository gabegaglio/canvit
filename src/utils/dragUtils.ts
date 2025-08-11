import { useDrag } from "@use-gesture/react";

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
  isHoveringHandle: boolean | null; // Accept boolean or null for isHoveringHandle
  isDragging: boolean;
  getResizeCursor?: () => string | null;
}): string => {
  if (isResizing) return getResizeCursor?.() || "grab";
  if (isHoveringHandle) return "nwse-resize";
  if (isDragging) return "grabbing";
  return "grab";
};
