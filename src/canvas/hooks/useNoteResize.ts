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
  content?: string;
}

// Reasonable minimum size that allows some content
const MIN_SIZE = 80;
// Minimum width per character for longest word calculation
const MIN_WIDTH_PER_CHAR = 8;

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
}: UseNoteResizeOptions) {
  const [dimensions, setDimensions] = useState({
    width: initialWidth,
    height: initialHeight,
  });
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [isResizing, setIsResizing] = useState<ResizeHandle | null>(null);

  // Starting values for the current resize operation
  const startDimensions = useRef({ width: 0, height: 0 });
  // Track the latest dimensions for smooth updates
  const latestDimensions = useRef({ width: initialWidth, height: initialHeight });

  // Calculate the minimum width based on content - only for long words
  const calculateMinWidth = () => {
    if (!content) return MIN_SIZE;
    
    // Find the longest word in the content
    const words = content.split(/\s+/);
    const longestWord = words.reduce((longest, word) => 
      word.length > longest.length ? word : longest, "");
      
    // Only apply special minimum width for long words (more than 8 chars)
    if (longestWord.length <= 8) return MIN_SIZE;
    
    // Calculate minimum width based on longest word length
    const wordBasedMinWidth = Math.max(
      MIN_SIZE,
      longestWord.length * MIN_WIDTH_PER_CHAR + 24 // Add minimal padding
    );
    
    return wordBasedMinWidth;
  };

  const updateDimensions = (width: number, height: number) => {
    // Calculate minimum width based on content
    const minWidth = calculateMinWidth();
    
    // Apply minimum constraints
    const newWidth = Math.max(width, minWidth);
    const newHeight = Math.max(height, MIN_SIZE);
    
    // Update state
    setDimensions({ width: newWidth, height: newHeight });
    latestDimensions.current = { width: newWidth, height: newHeight };
  };

  const updatePosition = (x: number, y: number) => {
    setPosition({ x, y });
  };

  const bindResize = (handle: ResizeHandle) => {
    // We only support bottomRight resize now
    if (handle !== "bottomRight") {
      return () => ({});
    }

    return useDrag(
      ({ movement: [mx, my], first, active, last }) => {
        // When starting a resize, capture initial values
        if (first) {
          startDimensions.current = { ...latestDimensions.current };
          setIsResizing(handle);
        }

        // Adjust movement based on canvas scale
        const adjustedMx = mx / scale;
        const adjustedMy = my / scale;

        // Calculate new dimensions (only grows from bottom-right)
        const minWidth = calculateMinWidth();
        const newWidth = Math.max(minWidth, startDimensions.current.width + adjustedMx);
        const newHeight = Math.max(MIN_SIZE, startDimensions.current.height + adjustedMy);

        // Update state with smooth visual feedback
        setDimensions({ width: newWidth, height: newHeight });
        latestDimensions.current = { width: newWidth, height: newHeight };

        // Continuously update parent during drag for smoothness
        if (active && id) {
          onResize?.(id, newWidth, newHeight);
        }

        // When a resize operation ends
        if (last && id) {
          // Final notification to parent components
          onResize?.(id, newWidth, newHeight);
          // Clear resizing state
          setIsResizing(null);
        }
      },
      {
        preventDefault: true,
        stopPropagation: true,
      }
    );
  };

  const getResizeCursor = () => {
    return isResizing ? "nwse-resize" : null;
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
