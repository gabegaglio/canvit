/**
 * Utility functions for grid snapping calculations
 */

/**
 * Calculate the snapped position based on grid size
 * @param x - Current x position
 * @param y - Current y position
 * @param gridSize - Size of the grid cells
 * @returns Snapped position coordinates
 */
export const getSnapPosition = (x: number, y: number, gridSize: number) => {
  return {
    x: Math.round(x / gridSize) * gridSize,
    y: Math.round(y / gridSize) * gridSize,
  };
};

/**
 * Calculate the snapped dimensions based on grid size
 * @param width - Current width
 * @param height - Current height
 * @param gridSize - Size of the grid cells
 * @returns Snapped dimensions
 */
export const getSnapDimensions = (
  width: number,
  height: number,
  gridSize: number
) => {
  return {
    width: Math.round(width / gridSize) * gridSize,
    height: Math.round(height / gridSize) * gridSize,
  };
};

/**
 * Check if a position is already snapped to the grid
 * @param x - Current x position
 * @param y - Current y position
 * @param gridSize - Size of the grid cells
 * @returns True if the position is already snapped
 */
export const isPositionSnapped = (x: number, y: number, gridSize: number) => {
  return x % gridSize === 0 && y % gridSize === 0;
};

/**
 * Check if dimensions are already snapped to the grid
 * @param width - Current width
 * @param height - Current height
 * @param gridSize - Size of the grid cells
 * @returns True if the dimensions are already snapped
 */
export const isDimensionsSnapped = (
  width: number,
  height: number,
  gridSize: number
) => {
  return width % gridSize === 0 && height % gridSize === 0;
};

/**
 * Get the nearest grid position without snapping
 * @param x - Current x position
 * @param y - Current y position
 * @param gridSize - Size of the grid cells
 * @returns Nearest grid position
 */
export const getNearestGridPosition = (
  x: number,
  y: number,
  gridSize: number
) => {
  return {
    x: Math.round(x / gridSize) * gridSize,
    y: Math.round(y / gridSize) * gridSize,
  };
};
