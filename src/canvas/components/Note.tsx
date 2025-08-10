import React, { useState } from "react";
import { useNoteResize, type ResizeHandle } from "../hooks/note";
import { useElementPosition } from "../../utils/dragUtils";
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
    if (isHoveringHandle) return "nwse-resize";
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
    backgroundColor: color || "white",
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
        className={`note-container backdrop-blur-lg rounded-lg shadow-lg relative ${className}`}
        style={combinedStyle}
        {...bindDrag()}
        onContextMenu={handleRightClick}
        onDoubleClick={handleDoubleClick}
      >
        {/* Background image if provided */}
        {image && (
          <div
            className="absolute inset-0 bg-center bg-cover bg-no-repeat rounded-lg opacity-75 z-0"
            style={{ backgroundImage: `url(${image})` }}
          />
        )}

        {/* Inner content container with padding */}
        <div className="p-4 w-full h-full overflow-hidden relative z-10">
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

        {/* Single resize handle in the bottom right corner */}
        <div
          className="absolute bottom-0 right-0 w-6 h-6 cursor-nwse-resize z-10"
          {...createHandleProps("bottomRight")}
        >
          <svg
            className="w-full h-full opacity-50"
            viewBox="0 0 24 24"
            fill="currentColor"
            style={{ color: color && color !== "white" ? "black" : "black" }}
          >
            <path d="M22,22H20V20H22V22M22,18H20V16H22V18M18,22H16V20H18V22M18,18H16V16H18V18M14,22H12V20H14V22M22,14H20V12H22V14Z" />
          </svg>
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
