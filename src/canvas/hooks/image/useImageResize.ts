import { useState, useRef, useCallback } from "react";
import { useDrag } from "@use-gesture/react";
import { type ResizeHandle } from "../../types/resize";

interface UseImageResizeOptions {
  id?: string;
  scale?: number;
  initialWidth?: number;
  initialHeight?: number;
  initialX?: number;
  initialY?: number;
  onResize?: (id: string, width: number, height: number) => void;
  onPositionChange?: (id: string, x: number, y: number) => void;
}

// Reasonable minimum size for images
const MIN_SIZE = 50;

interface ResizeCallbackData {
  width: number;
  height: number;
  x: number;
  y: number;
  snapWidth?: number;
  snapHeight?: number;
  snapX?: number;
  snapY?: number;
  shouldSnap?: boolean;
}

export function useImageResize({
  id,
  scale = 1,
  initialWidth = 300,
  initialHeight = 200,
  initialX = 0,
  initialY = 0,
  onResize,
  onPositionChange,
}: UseImageResizeOptions) {
  const [dimensions, setDimensions] = useState({
    width: initialWidth,
    height: initialHeight,
  });
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [isResizing, setIsResizing] = useState(false);
  const [currentHandle, setCurrentHandle] = useState<ResizeHandle | null>(null);

  // Starting values for the current resize operation
  const startDimensions = useRef({ width: 0, height: 0 });
  const startPosition = useRef({ x: 0, y: 0 });
  // Track the latest dimensions for smooth updates
  const latestDimensions = useRef({
    width: initialWidth,
    height: initialHeight,
  });

  // Store the original aspect ratio
  const originalAspectRatio = useRef(initialWidth / initialHeight);

  const updateDimensions = useCallback((width: number, height: number) => {
    // Apply minimum constraints
    const newWidth = Math.max(width, MIN_SIZE);
    const newHeight = Math.max(height, MIN_SIZE);

    // Update state
    setDimensions({ width: newWidth, height: newHeight });
    latestDimensions.current = { width: newWidth, height: newHeight };
  }, []);

  const updatePosition = useCallback((x: number, y: number) => {
    setPosition({ x, y });
  }, []);

  const bindResize = (
    handle: ResizeHandle,
    resizeCallback?: (
      dimensions: { width: number; height: number },
      position: { x: number; y: number }
    ) => ResizeCallbackData | void
  ) => {
    // We only support bottomRight resize handle
    if (handle !== "bottomRight") {
      return () => ({});
    }

    return useDrag(
      ({ movement: [mx], first, active, last }) => {
        // When starting a resize, capture initial values
        if (first) {
          startDimensions.current = { ...latestDimensions.current };
          startPosition.current = { ...position };
          setIsResizing(true);
          setCurrentHandle(handle);
        }

        // Adjust movement based on canvas scale
        const adjustedMx = mx / scale;

        // Calculate new dimensions for bottom-right handle
        let newWidth = startDimensions.current.width;
        let newHeight = startDimensions.current.height;

        // Calculate new width based on horizontal movement
        newWidth = Math.max(
          MIN_SIZE,
          startDimensions.current.width + adjustedMx
        );

        // Calculate height to maintain aspect ratio
        newHeight = newWidth / originalAspectRatio.current;

        // Ensure minimum height constraint
        if (newHeight < MIN_SIZE) {
          newHeight = MIN_SIZE;
          newWidth = newHeight * originalAspectRatio.current;
        }

        // Get grid snapping data if callback provided
        let finalWidth = newWidth;
        let finalHeight = newHeight;
        let finalX = position.x; // Keep original position for bottom-right resize
        let finalY = position.y; // Keep original position for bottom-right resize

        if (resizeCallback) {
          const callbackData = resizeCallback(
            { width: newWidth, height: newHeight },
            { x: position.x, y: position.y }
          );

          if (callbackData) {
            // During resize, show smooth movement for better UX
            // Only apply snapping at the very end
            if (
              last &&
              callbackData.shouldSnap &&
              callbackData.snapWidth &&
              callbackData.snapHeight
            ) {
              // Final snap at the end of resize
              finalWidth = callbackData.snapWidth;
              finalHeight = callbackData.snapHeight;
              finalX = callbackData.snapX ?? position.x;
              finalY = callbackData.snapY ?? position.y;
            } else {
              // Show actual position for smooth movement during resize
              finalWidth = callbackData.width;
              finalHeight = callbackData.height;
              finalX = callbackData.x;
              finalY = callbackData.y;
            }
          }
        }

        // Update state with smooth visual feedback
        setDimensions({ width: finalWidth, height: finalHeight });
        latestDimensions.current = { width: finalWidth, height: finalHeight };

        // Update position if changed
        if (finalX !== position.x || finalY !== position.y) {
          setPosition({ x: finalX, y: finalY });
        }

        // Continuously update parent during drag for smoothness
        if (active && id) {
          onResize?.(id, finalWidth, finalHeight);
        }

        // When a resize operation ends
        if (last && id) {
          // Final notification to parent components
          onResize?.(id, finalWidth, finalHeight);
          if (finalX !== position.x || finalY !== position.y) {
            onPositionChange?.(id, finalX, finalY);
          }
          // Clear resizing state
          setIsResizing(false);
          setCurrentHandle(null);
        }
      },
      {
        preventDefault: true,
        stopPropagation: true,
      }
    );
  };

  const getResizeCursor = () => {
    return currentHandle === "bottomRight" ? "nwse-resize" : null;
  };

  return {
    dimensions,
    position,
    isResizing,
    currentHandle,
    updateDimensions,
    updatePosition,
    bindResize,
    getResizeCursor,
  };
}
