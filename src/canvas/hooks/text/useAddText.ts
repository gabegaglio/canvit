import { useCallback } from "react";
import { v4 as uuidv4 } from "uuid";

export interface TextData {
  id: string;
  x: number;
  y: number;
  content: string;
  width: number;
  height: number;
  color?: string;
}

interface UseAddTextProps {
  onAddText: (textData: TextData) => void;
  canvasScale: number;
  gridSize: number;
  gridState: "off" | "lines" | "snap";
  viewportCenter?: { x: number; y: number };
}

export const useAddText = ({
  onAddText,
  canvasScale,
  gridSize,
  gridState,
  viewportCenter = { x: 400, y: 300 },
}: UseAddTextProps) => {
  const createText = useCallback(
    (position?: { x: number; y: number }) => {
      const id = uuidv4();

      // Use provided position or default to viewport center
      let x = position?.x ?? viewportCenter.x;
      let y = position?.y ?? viewportCenter.y;

      // Apply grid snapping if enabled
      if (gridState === "snap") {
        x = Math.round(x / gridSize) * gridSize;
        y = Math.round(y / gridSize) * gridSize;
      }

      const textData: TextData = {
        id,
        x,
        y,
        content: "",
        width: 100,
        height: 32,
        color: undefined, // Will use theme default
      };

      onAddText(textData);
      return id;
    },
    [onAddText, canvasScale, gridSize, gridState, viewportCenter]
  );

  const createTextAtCursor = useCallback(
    (cursorPosition: { x: number; y: number }) => {
      // Adjust cursor position for canvas scale
      const adjustedX = cursorPosition.x / canvasScale;
      const adjustedY = cursorPosition.y / canvasScale;

      return createText({ x: adjustedX, y: adjustedY });
    },
    [createText, canvasScale]
  );

  return {
    createText,
    createTextAtCursor,
  };
};
