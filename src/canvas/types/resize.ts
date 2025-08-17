// Centralized resize handle types
export type ResizeHandle = "bottomRight";

// Since we only use bottomRight, we can simplify this to just what we need
export interface ResizeHandleProps {
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseUp: (e: React.MouseEvent) => void;
}
