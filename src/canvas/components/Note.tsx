import React, { useRef, useState } from "react";
import { useNoteResize } from "../hooks/useNoteResize";
import type { ResizeHandle } from "../hooks/useNoteResize";
import { useElementPosition } from "../../utils/dragUtils";
import { useDrag } from "@use-gesture/react";

interface NoteProps {
  id?: string;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onDragEnd?: (id: string, x: number, y: number) => void;
  onResize?: (id: string, width: number, height: number) => void;
  scale?: number; // Canvas scale factor
  width?: number;
  height?: number;
  content?: string;
}

const Note: React.FC<NoteProps> = ({
  id,
  children,
  className,
  style,
  onDragEnd,
  onResize,
  scale = 1,
  width: propWidth,
  height: propHeight,
  content = "",
}) => {
  const noteRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHoveringHandle, setIsHoveringHandle] = useState<ResizeHandle | null>(
    null
  );

  // Initialize resize hook
  const {
    dimensions,
    position,
    isResizing,
    updateDimensions,
    updatePosition,
    bindResize,
    getResizeCursor,
  } = useNoteResize({
    id,
    scale,
    initialWidth: propWidth || 200,
    initialHeight: propHeight || 150,
    initialX: (style?.left as number) || 0,
    initialY: (style?.top as number) || 0,
    onResize,
    onPositionChange: onDragEnd,
    content, // Pass content to calculate minimum width
  });

  // Use utility hook for position and dimension updates
  useElementPosition(
    propWidth,
    propHeight,
    updateDimensions,
    style,
    position,
    updatePosition
  );

  // Set up the drag gesture for moving the note - disabled when resizing
  const bindDrag = useDrag(
    ({ movement: [mx, my], first, last, memo }) => {
      // Don't drag if we're resizing or hovering over a resize handle
      if (isResizing || isHoveringHandle) return;

      if (first) {
        setIsDragging(true);
        return {
          initialX: position.x,
          initialY: position.y,
        };
      }

      // Adjust movement based on canvas scale
      const adjustedMx = mx / scale;
      const adjustedMy = my / scale;

      // Calculate new position
      const x = memo.initialX + adjustedMx;
      const y = memo.initialY + adjustedMy;

      // Update position
      updatePosition(x, y);

      if (last) {
        setIsDragging(false);
        if (id && onDragEnd) {
          onDragEnd(id, x, y);
        }
      }

      return memo;
    },
    {
      preventDefault: true,
      filterTaps: true,
    }
  );

  // Wrapper for resize bindings to track handle hover state
  const createHandleProps = (handle: ResizeHandle) => {
    const resizeBindings = bindResize(handle);

    return {
      ...resizeBindings(),
      onMouseEnter: () => setIsHoveringHandle(handle),
      onMouseLeave: () => setIsHoveringHandle(null),
    };
  };

  // Determine cursor based on interaction state
  const getCursor = () => {
    if (isResizing) return getResizeCursor() || "grab";
    if (isHoveringHandle) return "nwse-resize";
    if (isDragging) return "grabbing";
    return "grab";
  };

  // Combined style
  const combinedStyle = {
    ...style,
    left: position.x,
    top: position.y,
    width: dimensions.width,
    height: dimensions.height,
    cursor: getCursor(),
    userSelect: "none" as const,
    touchAction: "none" as const,
    position: "absolute" as const,
  };

  // Check if content is empty
  const isEmpty = !content || content.trim() === "";

  return (
    <div
      ref={noteRef}
      className={`bg-white-900 backdrop-blur-lg rounded-lg shadow-lg relative ${className}`}
      style={combinedStyle}
      {...bindDrag()}
    >
      {/* Inner content container with padding */}
      <div className="p-4 w-full h-full overflow-hidden text-black">
        {isEmpty ? (
          <div className="text-gray-500 italic">Add an idea</div>
        ) : (
          <div className="text-black break-words">{content}</div>
        )}
      </div>

      {/* Single resize handle in the bottom right corner */}
      <div
        className="absolute bottom-0 right-0 w-6 h-6 cursor-nwse-resize z-10"
        {...createHandleProps("bottomRight")}
      >
        <svg
          className="w-full h-full text-black opacity-50"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M22,22H20V20H22V22M22,18H20V16H22V18M18,22H16V20H18V22M18,18H16V16H18V18M14,22H12V20H14V22M22,14H20V12H22V14Z" />
        </svg>
      </div>
    </div>
  );
};

export default Note;
