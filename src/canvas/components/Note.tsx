import React, { useRef } from "react";
import { useDrag } from "@use-gesture/react";

interface NoteProps {
  id?: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onDragEnd?: (id: string, x: number, y: number) => void;
  scale?: number; // Canvas scale factor
}

const Note: React.FC<NoteProps> = ({
  id,
  children,
  className,
  style,
  onDragEnd,
  scale = 1,
}) => {
  const noteRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });

  // Track the initial position and current offset
  const initialPosition = useRef({ x: 0, y: 0 });

  // Track if currently dragging
  const [isDragging, setIsDragging] = React.useState(false);

  // Set up the drag gesture
  const bind = useDrag(
    ({ movement: [mx, my], first, last, memo }) => {
      if (first) {
        // Store initial position
        initialPosition.current = {
          x: (style?.left as number) || 0,
          y: (style?.top as number) || 0,
        };
        setIsDragging(true);
        // Return initial position as memo for access in subsequent callbacks
        return initialPosition.current;
      }

      // Adjust movement based on canvas scale to ensure 1:1 movement
      const adjustedMx = mx / scale;
      const adjustedMy = my / scale;

      // Calculate new position using the memo (initial position)
      const x = memo.x + adjustedMx;
      const y = memo.y + adjustedMy;

      // Update the position
      setPosition({ x, y });

      // When drag ends, notify parent
      if (last) {
        setIsDragging(false);
        if (id && onDragEnd) {
          onDragEnd(id, x, y);
        }
      }

      // Return initial position for continued use in this drag gesture
      return memo;
    },
    {
      // Prevent drag from moving the entire canvas
      preventDefault: true,
      // Style cursor during drag
      filterTaps: true,
    }
  );

  // Combine passed-in style with position
  const combinedStyle = {
    ...style,
    left: position.x || style?.left,
    top: position.y || style?.top,
    cursor: isDragging ? "grabbing" : "grab",
    userSelect: "none" as const, // Prevent text selection during drag
    touchAction: "none" as const, // Prevent scrolling on touch devices
  };

  React.useEffect(() => {
    // Set initial position from props
    if (style?.left && style?.top && !position.x && !position.y) {
      setPosition({
        x: style.left as number,
        y: style.top as number,
      });
    }
  }, [style?.left, style?.top, position.x, position.y]);

  return (
    <div
      ref={noteRef}
      className={`bg-white bg-opacity-20 backdrop-blur-md rounded-lg shadow-lg p-4 text-black border border-white border-opacity-30 ${className}`}
      style={combinedStyle}
      {...bind()}
    >
      {children}
    </div>
  );
};

export default Note;
