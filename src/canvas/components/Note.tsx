import React, { useState } from "react";
import { useNoteResize, type ResizeHandle } from "../hooks/note";
import { useElementPosition } from "../hooks/canvas";
import { useDrag } from "@use-gesture/react";
import { useGridSnap } from "../hooks/canvas";
import SnapGuide from "./SnapGuide";
import { BOX_SIZE } from "../constants";
import NoteContextMenu from "../menus/NoteContextMenu";
import { Portal } from "../utils/PortalHelper";
import { useNoteEditing } from "../hooks/note";
import { useNoteContextMenu } from "../hooks/note";
import { useGlobalClickHandler } from "../hooks/ui";

interface NoteProps {
  id?: string;
  className?: string;
  style?: React.CSSProperties;
  onDragEnd?: (id: string, x: number, y: number) => void;
  onResize?: (id: string, width: number, height: number) => void;
  scale?: number; // Canvas scale factor
  width?: number;
  height?: number;
  content?: string;
  gridState?: "off" | "lines" | "snap"; // Whether grid snapping is active
  gridSize?: number; // Grid size for snapping
  color?: string; // Background color
  image?: string; // Image URL or data URL
  onNoteRightClick?: () => void; // Callback to close canvas context menu if open
  theme: "light" | "dark";
  radius?: number; // Border radius in pixels
  padding?: number; // Padding in pixels
  margin?: number; // Margin in pixels
}

const Note: React.FC<NoteProps> = ({
  id,
  className,
  style,
  onDragEnd,
  onResize,
  scale = 1,
  width: propWidth,
  height: propHeight,
  content = "",
  gridState = "off",
  gridSize = BOX_SIZE,
  color,
  image,
  onNoteRightClick,
  theme,
  radius = 8,
  padding = 16,
  margin = 0,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isHoveringHandle, setIsHoveringHandle] = useState<ResizeHandle | null>(
    null
  );

  // Use custom hooks
  const {
    isEditing,
    editContent,
    setEditContent,
    textareaRef,
    handleSave,
    handleKeyDown,
    handleDoubleClick,
    handleTextareaClick,
  } = useNoteEditing({ id, content });

  const { contextMenu, handleRightClick, handleCloseContextMenu } =
    useNoteContextMenu({
      id,
      onNoteRightClick,
    });

  const { noteRef } = useGlobalClickHandler({ isEditing, onSave: handleSave });

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

  // Use grid snap hook
  const { snapPosition, snapDimensions, showSnapGuide } = useGridSnap({
    x: position.x,
    y: position.y,
    width: dimensions.width,
    height: dimensions.height,
    gridSize,
    gridState,
    isDragging,
    isResizing,
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
    ({ movement: [mx, my], first, last, memo, event, type }) => {
      // Don't drag if we're resizing, hovering over a resize handle, or editing
      if (isResizing || isHoveringHandle || isEditing) return;

      // Skip right-click dragging (only handle left mouse button)
      if (type === "mousedown" && (event as MouseEvent).button !== 0) return;

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

      // Update position (grid snapping happens on drag end)
      updatePosition(x, y);

      if (last) {
        setIsDragging(false);
        const isGridActive = gridState !== "off";
        const finalX = isGridActive ? snapPosition.x : x;
        const finalY = isGridActive ? snapPosition.y : y;
        updatePosition(finalX, finalY);
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

  // Wrapper for resize bindings to track handle hover state
  const createHandleProps = (handle: ResizeHandle) => {
    const resizeBindings = bindResize(handle, (newDimensions, newPosition) => {
      if (gridState !== "off" && !isDragging) {
        return {
          width: newDimensions.width,
          height: newDimensions.height,
          x: newPosition.x,
          y: newPosition.y,
          snapWidth: snapDimensions.width,
          snapHeight: snapDimensions.height,
          snapX: snapPosition.x,
          snapY: snapPosition.y,
          shouldSnap: true,
        };
      }
      return {
        width: newDimensions.width,
        height: newDimensions.height,
        x: newPosition.x,
        y: newPosition.y,
        shouldSnap: false,
      };
    });

    return {
      ...resizeBindings(),
      onMouseEnter: () => setIsHoveringHandle(handle),
      onMouseLeave: () => setIsHoveringHandle(null),
    };
  };

  // Determine cursor based on interaction state
  const getCursor = () => {
    if (isEditing) return "text";
    if (isResizing) return getResizeCursor() || "grab";
    if (isHoveringHandle) {
      switch (isHoveringHandle) {
        case "topLeft":
          return "nwse-resize";
        case "topRight":
          return "nesw-resize";
        case "bottomLeft":
          return "nesw-resize";
        case "bottomRight":
          return "nwse-resize";
        default:
          return "nwse-resize";
      }
    }
    if (isDragging) return "grabbing";
    return "grab";
  };

  // Combined style with optional background color
  const combinedStyle = {
    ...style,
    left: position.x,
    top: position.y,
    width: dimensions.width,
    height: dimensions.height,
    cursor: getCursor(),
    userSelect: isEditing ? ("text" as const) : ("none" as const),
    touchAction: "none" as const,
    position: "absolute" as const,
    border: "none",
  };

  // Check if content is empty
  const isEmpty = !content || content.trim() === "";

  return (
    <>
      {/* Snap guide outline */}
      <SnapGuide
        position={snapPosition}
        dimensions={snapDimensions}
        show={showSnapGuide && gridState !== "off"}
      />

      {/* Note container */}
      <div
        ref={noteRef}
        className={`note-container shadow-lg relative ${className}`}
        style={{
          ...combinedStyle,
          borderRadius: `${radius}px`,
          backgroundColor: color || "white",
        }}
        {...bindDrag()}
        onContextMenu={handleRightClick}
        onDoubleClick={handleDoubleClick}
      >
        {/* Background image if provided */}
        {image && (
          <div
            className="absolute inset-0 bg-center bg-cover bg-no-repeat opacity-75 z-0"
            style={{
              backgroundImage: `url(${image})`,
              borderRadius: `${radius}px`,
              left: `${margin}px`,
              top: `${margin}px`,
              width: `calc(100% - ${margin * 2}px)`,
              height: `calc(100% - ${margin * 2}px)`,
            }}
          />
        )}

        {/* Inner content container with dynamic padding */}
        <div
          className="w-full h-full overflow-hidden relative z-10"
          style={{
            padding: `${padding}px`,
            position: "absolute",
            left: `${margin}px`,
            top: `${margin}px`,
            width: `calc(100% - ${margin * 2}px)`,
            height: `calc(100% - ${margin * 2}px)`,
          }}
        >
          {isEditing ? (
            <textarea
              ref={textareaRef}
              className="w-full h-full p-0 m-0 border-none outline-none resize-none bg-transparent"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              onClick={handleTextareaClick}
              spellCheck="false"
              autoComplete="off"
              autoCorrect="off"
              style={{
                color: color && color !== "white" ? "#000000" : "black",
                opacity: color && color !== "white" ? 0.8 : 1,
                whiteSpace: "pre-wrap",
                wordWrap: "break-word",
                fontFamily: "inherit",
                fontSize: "inherit",
                lineHeight: "inherit",
                userSelect: "text",
                cursor: "text",
              }}
            />
          ) : (
            <div
              className="break-words"
              style={{
                color: color && color !== "white" ? "#000000" : "black",
                opacity: color && color !== "white" ? 0.8 : 1,
                whiteSpace: "pre-wrap",
                wordWrap: "break-word",
              }}
            >
              {isEmpty ? (
                <div
                  className="italic"
                  style={{
                    color: color === "white" ? "gray" : "rgba(0, 0, 0, 0.6)",
                  }}
                >
                  Double-click to add an idea
                </div>
              ) : (
                content
              )}
            </div>
          )}
        </div>

        {/* Resize handles on all four corners */}
        {/* Top-left corner */}
        <div
          className="absolute w-3 h-3 cursor-nwse-resize z-10 opacity-0 hover:opacity-100 transition-opacity"
          style={{
            left: `${margin + 2}px`,
            top: `${margin + 2}px`,
            touchAction: "none",
          }}
          {...createHandleProps("topLeft")}
        >
          <div className="w-full h-full bg-white/80 rounded-sm border border-gray-300/50"></div>
        </div>

        {/* Top-right corner */}
        <div
          className="absolute w-3 h-3 cursor-nesw-resize z-10 opacity-0 hover:opacity-100 transition-opacity"
          style={{
            right: `${margin + 2}px`,
            top: `${margin + 2}px`,
            touchAction: "none",
          }}
          {...createHandleProps("topRight")}
        >
          <div className="w-full h-full bg-white/80 rounded-sm border border-gray-300/50"></div>
        </div>

        {/* Bottom-left corner */}
        <div
          className="absolute w-3 h-3 cursor-nesw-resize z-10 opacity-0 hover:opacity-100 transition-opacity"
          style={{
            left: `${margin + 2}px`,
            bottom: `${margin + 2}px`,
            touchAction: "none",
          }}
          {...createHandleProps("bottomLeft")}
        >
          <div className="w-full h-full bg-white/80 rounded-sm border border-gray-300/50"></div>
        </div>

        {/* Bottom-right corner */}
        <div
          className="absolute w-3 h-3 cursor-nwse-resize z-10 opacity-0 hover:opacity-100 transition-opacity"
          style={{
            right: `${margin + 2}px`,
            bottom: `${margin + 2}px`,
            touchAction: "none",
          }}
          {...createHandleProps("bottomRight")}
        >
          <div className="w-full h-full bg-white/80 rounded-sm border border-gray-300/50"></div>
        </div>
      </div>

      {/* Context menu - rendered in a portal to avoid z-index issues */}
      {contextMenu && id && (
        <Portal>
          <NoteContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            noteId={id}
            hasImage={!!image} // Pass whether the note has an image
            onClose={handleCloseContextMenu}
            theme={theme}
          />
        </Portal>
      )}
    </>
  );
};

export default Note;
