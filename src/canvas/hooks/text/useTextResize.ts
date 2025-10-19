import { useCallback } from "react";
import { useDrag } from "@use-gesture/react";

interface UseTextResizeProps {
  onResize: (width: number, height: number) => void;
  scale: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
}

export const useTextResize = ({
  onResize,
  scale,
  minWidth = 0, // Remove minimum width restriction
  minHeight = 0, // Remove minimum height restriction
  maxWidth = Infinity, // Remove maximum width restriction
  maxHeight = Infinity, // Remove maximum height restriction
}: UseTextResizeProps) => {
  // Single resize handle for bottom-right corner
  const bindResize = useDrag(
    ({ movement: [mx, my], first, last, memo }) => {
      if (first) {
        return {
          initialWidth: memo?.initialWidth || 100,
          initialHeight: memo?.initialHeight || 24,
        };
      }

      // Adjust movement based on canvas scale
      const adjustedMx = mx / scale;
      const adjustedMy = my / scale;

      // Calculate new dimensions
      let newWidth = memo.initialWidth + adjustedMx;
      let newHeight = memo.initialHeight + adjustedMy;

      // Apply constraints
      newWidth = Math.max(Math.min(newWidth, maxWidth), minWidth);
      newHeight = Math.max(Math.min(newHeight, maxHeight), minHeight);

      // Update size
      onResize(newWidth, newHeight);

      if (last) {
        // Final update
        onResize(newWidth, newHeight);
      }

      return memo;
    },
    { preventDefault: true, filterTaps: true }
  );

  const getResizeCursor = useCallback(() => "nwse-resize", []);

  return {
    bindResize,
    getResizeCursor,
  };
};
