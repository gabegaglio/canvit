import { useEffect, useRef } from "react";

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
  // Store function references in refs to avoid dependency issues
  const updateDimensionsRef = useRef(updateDimensions);
  const updatePositionRef = useRef(updatePosition);

  // Update refs when functions change
  useEffect(() => {
    updateDimensionsRef.current = updateDimensions;
  }, [updateDimensions]);

  useEffect(() => {
    updatePositionRef.current = updatePosition;
  }, [updatePosition]);

  // Update dimensions from props if they change
  useEffect(() => {
    if (propWidth && propHeight) {
      updateDimensionsRef.current(propWidth, propHeight);
    }
  }, [propWidth, propHeight, updateDimensionsRef]);

  // Set initial position from props
  useEffect(() => {
    if (style?.left && style?.top && position.x === 0 && position.y === 0) {
      const x = style.left as number;
      const y = style.top as number;
      updatePositionRef.current(x, y);
    }
  }, [style?.left, style?.top, position.x, position.y, updatePositionRef]);
};
