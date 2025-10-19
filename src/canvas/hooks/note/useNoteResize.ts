import { useState, useRef, useCallback } from "react";
import { useDrag } from "@use-gesture/react";
import { type ResizeHandle } from "../../types/resize";

interface UseNoteResizeOptions {
  id?: string;
  scale?: number;
  initialWidth?: number;
  initialHeight?: number;
  initialX?: number;
  initialY?: number;
  onResize?: (id: string, width: number, height: number) => void;
  onPositionChange?: (id: string, x: number, y: number) => void;
  content?: string;
  isEditing?: boolean; // Add editing state to prevent size changes during editing
}

// Reasonable minimum size that allows some content
const MIN_SIZE = 80;
// Minimum width per character for longest word calculation
const MIN_WIDTH_PER_CHAR = 8;

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

export function useNoteResize({
  id,
  scale = 1,
  initialWidth = 200,
  initialHeight = 150,
  initialX = 0,
  initialY = 0,
  onResize,
  onPositionChange,
  content = "",
  isEditing,
}: UseNoteResizeOptions) {
  const [dimensions, setDimensions] = useState({
    width: initialWidth,
    height: initialHeight,
  });
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [isResizing, setIsResizing] = useState(false);
  const [currentHandle, setCurrentHandle] = useState<ResizeHandle | null>(null);

  // Starting values for the current resize operation
  const startDimensions = useRef({ width: 0, height: 0 });
  const startPosition = useRef({ x: 0, y: 0 }); // Add starting position tracking
  // Track the latest dimensions for smooth updates
  const latestDimensions = useRef({
    width: initialWidth,
    height: initialHeight,
  });

  // Calculate the minimum width based on content - only for long words
  const calculateMinWidth = useCallback(() => {
    if (!content) return MIN_SIZE;

    // Find the longest word in the content
    const words = content.split(/\s+/);
    const longestWord = words.reduce(
      (longest, word) => (word.length > longest.length ? word : longest),
      ""
    );

    // Only apply special minimum width for long words (more than 8 chars)
    if (longestWord.length <= 8) return MIN_SIZE;

    // Calculate minimum width based on longest word length
    const wordBasedMinWidth = Math.max(
      MIN_SIZE,
      longestWord.length * MIN_WIDTH_PER_CHAR + 24 // Add minimal padding
    );

    return wordBasedMinWidth;
  }, [content]);

  const updateDimensions = useCallback(
    (width: number, height: number) => {
      // Don't update dimensions if we're editing to prevent unwanted resizing
      if (isEditing) return;

      // Calculate minimum width based on content
      const minWidth = calculateMinWidth();

      // Apply minimum constraints
      const newWidth = Math.max(width, minWidth);
      const newHeight = Math.max(height, MIN_SIZE);

      // Update state
      setDimensions({ width: newWidth, height: newHeight });
      latestDimensions.current = { width: newWidth, height: newHeight };
    },
    [calculateMinWidth, isEditing]
  );

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
      ({ movement: [mx, my], first, active, last }) => {
        // When starting a resize, capture initial values
        if (first) {
          startDimensions.current = { ...latestDimensions.current };
          startPosition.current = { ...position }; // Capture starting position
          setIsResizing(true);
          setCurrentHandle(handle);
        }

        // Adjust movement based on canvas scale
        const adjustedMx = mx / scale;
        const adjustedMy = my / scale;

        // Calculate new dimensions for bottom-right handle
        const minWidth = calculateMinWidth();
        let newWidth = startDimensions.current.width;
        let newHeight = startDimensions.current.height;

        // Resize from bottom-right: adjust width, height
        newWidth = Math.max(
          minWidth,
          startDimensions.current.width + adjustedMx
        );
        newHeight = Math.max(
          MIN_SIZE,
          startDimensions.current.height + adjustedMy
        );

        // Get grid snapping data if callback provided
        let finalWidth = newWidth;
        let finalHeight = newHeight;
        let finalX = position.x;
        let finalY = position.y;

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
