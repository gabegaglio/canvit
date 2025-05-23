/**
 * Utility functions for grid operations
 */

/**
 * Snap a coordinate value to the nearest grid point
 * @param value The current coordinate value
 * @param gridSize The size of the grid
 * @returns The snapped coordinate value
 */
export const snapToGrid = (value: number, gridSize: number): number => {
  return Math.round(value / gridSize) * gridSize;
};

/**
 * Calculate the snap target position for a note
 * @param x Current X position
 * @param y Current Y position
 * @param gridSize Size of the grid
 * @returns The snapped position {x, y}
 */
export const getSnapPosition = (
  x: number,
  y: number,
  gridSize: number
): { x: number; y: number } => {
  return {
    x: snapToGrid(x, gridSize),
    y: snapToGrid(y, gridSize),
  };
};

/**
 * Calculate the snap target for note dimensions
 * @param width Current width
 * @param height Current height
 * @param gridSize Size of the grid
 * @returns The snapped dimensions {width, height}
 */
export const getSnapDimensions = (
  width: number,
  height: number,
  gridSize: number
): { width: number; height: number } => {
  return {
    width: Math.max(gridSize, snapToGrid(width, gridSize)),
    height: Math.max(gridSize, snapToGrid(height, gridSize)),
  };
};
