import React, { useEffect } from "react";
import { useDrag } from "@use-gesture/react";
import { useGridSnap } from "../hooks/canvas";
import SnapGuide from "./SnapGuide";
import { BOX_SIZE } from "../constants";
import { useGlobalClickHandler } from "../hooks/ui";
import { useTextEditing, useTextSizing, useTextResize } from "../hooks/text";
import { TextInput } from "./TextInput";

interface TextProps {
  id: string;
  x: number;
  y: number;
  content: string;
  width: number;
  height: number;
  color?: string;
  theme: "light" | "dark";
  onUpdateText: (id: string, content: string) => void;
  onResize: (id: string, width: number, height: number) => void;
  onDragEnd: (id: string, x: number, y: number) => void;
  scale?: number;
  gridState?: "off" | "lines" | "snap";
  gridSize?: number;
  onTextRightClick?: () => void;
}

export const Text: React.FC<TextProps> = ({
  id,
  x,
  y,
  content,
  width,
  height,
  color,
  theme,
  onUpdateText,
  onResize,
  onDragEnd,
  scale = 1,
  gridState = "off",
  gridSize = BOX_SIZE,
  onTextRightClick,
}) => {
  const [isDragging, setIsDragging] = React.useState(false);
  const [position, setPosition] = React.useState({ x, y });

  // Update position when props change
  useEffect(() => {
    setPosition({ x, y });
  }, [x, y]);

  // Ensure width is updated when content changes in canvas context
  useEffect(() => {
    if (content && id) {
      // Trigger the text sizing hook to recalculate width and height
      // The useTextSizing hook will handle the actual calculation
    }
  }, [content, id]);

  // Use text editing hook
  const {
    isEditing,
    content: editContent,
    textareaRef,
    handleDoubleClick,
    handleSave,
    handleKeyDown,
    handleChange,
    handleSelect,
    handleBlur,
  } = useTextEditing({
    initialContent: content,
    onUpdateText,
    id,
    autoFocus: content === "", // Auto-focus new text boxes
  });

  // Use text sizing hook for dynamic width and height
  const { currentWidth, currentHeight } = useTextSizing({
    content: isEditing ? editContent : content, // Use edit content when editing, regular content when displaying
    fontFamily: "inherit",
    fontSize: 16, // Default font size
    onWidthChange: (newWidth) => {
      if (id && onResize) {
        onResize(id, newWidth, height);
      }
    },
    onHeightChange: (newHeight) => {
      if (id && onResize) {
        onResize(id, currentWidth, newHeight);
      }
    },
    padding: 32, // Increased padding to ensure no text cut-off
    // Remove all size restrictions to allow natural sizing
  });

  // Ensure dimensions are properly synced when exiting edit mode
  useEffect(() => {
    if (!isEditing && content && onResize && id) {
      // When exiting edit mode, ensure both width and height are properly set
      // Use the calculated dimensions without any artificial restrictions
      const newWidth = Math.max(currentWidth, 1); // Minimum 1px to avoid zero width
      const newHeight = Math.max(currentHeight, 1); // Minimum 1px to avoid zero height

      // Always update dimensions when exiting edit mode to ensure proper sizing
      onResize(id, newWidth, newHeight);
    }
  }, [isEditing, content, currentWidth, currentHeight, onResize, id]);

  // Use grid snap hook
  const { snapPosition, showSnapGuide } = useGridSnap({
    x: position.x,
    y: position.y,
    width: 0,
    height: 0,
    gridSize,
    gridState,
    isDragging,
    isResizing: false,
  });

  // Use global click handler
  const { noteRef: textRef } = useGlobalClickHandler({
    isEditing,
    onSave: handleSave,
  });

  // Use simplified resize hook
  const { bindResize } = useTextResize({
    onResize: (newWidth, newHeight) => {
      if (id && onResize) {
        onResize(id, newWidth, newHeight);
      }
    },
    scale,
    // Remove size constraints to allow natural resizing
  });

  // Set up drag gesture for moving text
  const bindDrag = useDrag(
    ({ movement: [mx, my], first, last, memo }) => {
      // Don't drag if editing
      if (isEditing) return;

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

      setPosition({ x, y });

      if (last) {
        setIsDragging(false);
        const isGridActive = gridState !== "off";
        const finalX = isGridActive ? snapPosition.x : x;
        const finalY = isGridActive ? snapPosition.y : y;
        setPosition({ x: finalX, y: finalY });
        if (id && onDragEnd) {
          onDragEnd(id, finalX, finalY);
        }
      }

      return memo;
    },
    {
      preventDefault: true,
      filterTaps: true,
      shouldSnap: gridState !== "off",
    }
  );

  // Handle right click
  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onTextRightClick) {
      onTextRightClick();
    }
  };

  // Determine cursor based on interaction state
  const getCursor = () => {
    if (isEditing) return "text";
    if (isDragging) return "grabbing";
    return "grab";
  };

  // Combined style
  const combinedStyle = {
    left: position.x,
    top: position.y,
    cursor: getCursor(),
    userSelect: isEditing ? ("text" as const) : ("none" as const),
    touchAction: "none" as const,
    position: "absolute" as const,
    color: color || (theme === "dark" ? "#ffffff" : "#000000"),
  };

  return (
    <>
      {/* Snap guide outline */}
      <SnapGuide
        position={snapPosition}
        dimensions={{ width: 0, height: 0 }}
        show={showSnapGuide && gridState !== "off"}
      />

      {/* Text container */}
      <div
        ref={textRef}
        className="text-container"
        style={{
          ...combinedStyle,
          margin: "4px",
        }}
        {...bindDrag()}
        onContextMenu={handleRightClick}
        onDoubleClick={handleDoubleClick}
      >
        {isEditing ? (
          <TextInput
            ref={textareaRef}
            value={editContent}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onSelect={handleSelect}
            onBlur={handleBlur}
            width={currentWidth}
            height={currentHeight}
            theme={theme}
            color={color}
            placeholder="Type here..."
            autoFocus={content === ""}
          />
        ) : (
          <div
            className="px-2 py-1 relative"
            style={{
              color: color || (theme === "dark" ? "#ffffff" : "#000000"),
              width: `${width}px`, // Use the actual width from canvas context
              height: `${height}px`, // Use the actual height from canvas context
              overflow: "hidden", // Hide overflow instead of visible
              wordBreak: "keep-all", // Prevent text wrapping - text only wraps if user manually resizes
              whiteSpace: "nowrap", // Keep text on single line
              lineHeight: "1.4", // Increased line height for better text visibility
              padding: "16px", // Increased padding to ensure no text cut-off
            }}
          >
            {content || ""}

            {/* Single resize handle - bottom-right corner */}
            <div
              {...bindResize()}
              className="absolute bottom-0 right-0 w-3 h-3 cursor-nwse-resize opacity-0 hover:opacity-100 transition-opacity duration-200"
              style={{
                backgroundColor:
                  theme === "dark"
                    ? "rgba(255,255,255,0.3)"
                    : "rgba(0,0,0,0.3)",
                borderRadius: "2px",
              }}
            />
          </div>
        )}
      </div>
    </>
  );
};
