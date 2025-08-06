import { useState, useRef } from "react";
import { useDrag } from "@use-gesture/react";

// Define resize handle positions
export type ResizeHandle =
  | "top"
  | "right"
  | "bottom"
  | "left"
  | "topRight"
  | "bottomRight"
  | "bottomLeft"
  | "topLeft";

interface UseNoteResizeOptions {
  id?: string;
  scale?: number;
  initialWidth?: number;
  initialHeight?: number;
  initialX?: number;
  initialY?: number;
  onResize?: (id: string, width: number, height: number) => void;
  onPositionChange?: (id: string, x: number, y: number) => void;
}

const MIN_SIZE = 100;

export function useNoteResize({
  id,
  scale = 1,
  initialWidth = 200,
  initialHeight = 150,
  initialX = 0,
  initialY = 0,
  onResize,
  onPositionChange,
}: UseNoteResizeOptions) {
  const [dimensions, setDimensions] = useState({
    width: initialWidth,
    height: initialHeight,
  });
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [isResizing, setIsResizing] = useState<ResizeHandle | null>(null);

  const initialDimensions = useRef({ width: 0, height: 0 });

  const updateDimensions = (width: number, height: number) => {
    setDimensions({ width, height });
  };

  const updatePosition = (x: number, y: number) => {
    setPosition({ x, y });
  };

  const bindResize = (handle: ResizeHandle) => {
    return useDrag(
      ({ movement: [mx, my], first, last, event }) => {
        event.stopPropagation();

        if (first) {
          initialDimensions.current = {
            width: dimensions.width,
            height: dimensions.height,
          };
          setIsResizing(handle);
        }

        const adjustedMx = mx / scale;
        const adjustedMy = my / scale;

        let newWidth = initialDimensions.current.width;
        let newHeight = initialDimensions.current.height;
        let newX = position.x;
        let newY = position.y;

        // Horizontal handles
        if (handle.includes("left")) {
          newWidth = Math.max(
            MIN_SIZE,
            initialDimensions.current.width - adjustedMx
          );
          newX = position.x + (initialDimensions.current.width - newWidth);
        } else if (handle.includes("right")) {
          newWidth = Math.max(
            MIN_SIZE,
            initialDimensions.current.width + adjustedMx
          );
        }

        // Vertical handles
        if (handle.includes("top")) {
          newHeight = Math.max(
            MIN_SIZE,
            initialDimensions.current.height - adjustedMy
          );
          newY = position.y + (initialDimensions.current.height - newHeight);
        } else if (handle.includes("bottom")) {
          newHeight = Math.max(
            MIN_SIZE,
            initialDimensions.current.height + adjustedMy
          );
        }

        // Update UI state
        setDimensions({ width: newWidth, height: newHeight });
        setPosition({ x: newX, y: newY });

        if (last) {
          setIsResizing(null);
          if (id) {
            onResize?.(id, newWidth, newHeight);
            onPositionChange?.(id, newX, newY);
          }
        }
      },
      {
        preventDefault: true,
        stopPropagation: true,
      }
    );
  };

  const getResizeCursor = () => {
    switch (isResizing) {
      case "top":
      case "bottom":
        return "ns-resize";
      case "left":
      case "right":
        return "ew-resize";
      case "topRight":
      case "bottomLeft":
        return "nesw-resize";
      case "bottomRight":
      case "topLeft":
        return "nwse-resize";
      default:
        return null;
    }
  };

  return {
    dimensions,
    position,
    isResizing,
    updateDimensions,
    updatePosition,
    bindResize,
    getResizeCursor,
  };
}
