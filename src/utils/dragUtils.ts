import { useEffect } from "react";

interface Position {
  x: number;
  y: number;
}

interface Dimensions {
  width: number;
  height: number;
}

interface UseElementPositionProps {
  propWidth?: number;
  propHeight?: number;
  updateDimensions: (width: number, height: number) => void;
  style?: React.CSSProperties;
  position: Position;
  updatePosition: (x: number, y: number) => void;
}

export function useElementPosition({
  propWidth,
  propHeight,
  updateDimensions,
  style,
  position,
  updatePosition,
}: UseElementPositionProps) {
  useEffect(() => {
    // Update dimensions if props change
    if (propWidth !== undefined && propHeight !== undefined) {
      updateDimensions(propWidth, propHeight);
    }
  }, [propWidth, propHeight, updateDimensions]);

  useEffect(() => {
    // Update position if style changes
    if (style?.left !== undefined && style?.top !== undefined) {
      const x =
        typeof style.left === "number"
          ? style.left
          : parseFloat(style.left as string);
      const y =
        typeof style.top === "number"
          ? style.top
          : parseFloat(style.top as string);

      if (!isNaN(x) && !isNaN(y)) {
        updatePosition(x, y);
      }
    }
  }, [style?.left, style?.top, updatePosition]);
}
