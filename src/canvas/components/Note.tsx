import React, { useEffect, useRef, useState } from "react";
import { useNoteResize } from "../hooks/note";
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

import RichTextEditor from "./RichTextEditor";
import {
  htmlToPlainText,
  sanitizeHTML,
  containsHTML,
} from "../utils/htmlUtils";
import { useRichTextSelection } from "../hooks/text";

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
}) => {
  // Use the new simplified editing hook
  const {
    isEditing,
    editContent,
    startEditing,
    saveAndStop,
    handleContentChange,
    handleBlur,
    handleEscape,
  } = useNoteEditing({ id, content });

  const [isDragging, setIsDragging] = useState(false);
  const [isHoveringNote, setIsHoveringNote] = useState(false);
  const [isFormatting, setIsFormatting] = useState(false);
  const editorRef = useRef<HTMLDivElement | null>(null);
  const latestEditContentRef = useRef(editContent);

  const { contextMenu, handleRightClick, handleCloseContextMenu } =
    useNoteContextMenu({
      id,
      onNoteRightClick,
    });

  const { noteRef } = useGlobalClickHandler({ isEditing, onSave: saveAndStop });
  const { saveSelection, restoreSelection, clearSelection } =
    useRichTextSelection({ isActive: isEditing });

  useEffect(() => {
    latestEditContentRef.current = editContent;
  }, [editContent]);

  useEffect(() => {
    if (!isEditing) {
      setIsFormatting(false);
      clearSelection();
    }
  }, [isEditing, clearSelection]);

  useEffect(() => {
    if (!isEditing || !editorRef.current) return;
    const html = latestEditContentRef.current;
    editorRef.current.innerHTML =
      html && html.trim() !== "" && html !== "&nbsp;" ? html : "<p><br /></p>";
    saveSelection({ immediate: true });
  }, [isEditing, saveSelection]);

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
    isEditing, // Pass editing state to prevent size changes during editing
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

  // Set up the drag gesture for moving the note - disabled when resizing or editing
  const bindDrag = useDrag(
    ({ movement: [mx, my], first, last, memo, event, type }) => {
      // Don't drag if we're resizing or editing
      if (isResizing || isEditing) return;

      // Skip right-click dragging (only handle left mouse button)
      if (type === "mousedown" && (event as MouseEvent).button !== 0) return;

      // Don't start dragging if we're in the middle of a save operation
      if (first && isEditing) return;

      // Don't start dragging if the target is a contentEditable element
      if (first && (event.target as HTMLElement)?.contentEditable === "true")
        return;

      if (first) {
        const nativeEvent = event as Event & {
          preventDefault?: () => void;
          cancelable?: boolean;
        };
        if (nativeEvent?.cancelable && nativeEvent.preventDefault) {
          nativeEvent.preventDefault();
        }

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
      eventOptions: { passive: false },
      filterTaps: true,
      shouldSnap: gridState !== "off",
      enabled: !isEditing && !isResizing, // Completely disable drag when editing or resizing
    }
  );

  // Wrapper for resize bindings
  const createHandleProps = () => {
    const resizeBindings = bindResize(
      "bottomRight",
      (newDimensions, newPosition) => {
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
      }
    );

    return resizeBindings();
  };

  // Determine cursor based on interaction state
  const getCursor = () => {
    if (isEditing) return "text";
    if (isResizing) return getResizeCursor() || "grab";
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
    touchAction: isEditing || isFormatting ? ("auto" as const) : ("none" as const),
    position: "absolute" as const,
    backgroundColor: color || "#f8f9fa",
    zIndex: 5,
  };

  // Check if content is empty (handle both plain text and HTML)
  const isEmpty =
    !content ||
    (containsHTML(content)
      ? htmlToPlainText(content).trim() === ""
      : content.trim() === "");

  // Handle double click to start editing
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    startEditing();
  };

  // Handle content input changes
  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const newContent = e.currentTarget.innerHTML;
    handleContentChange(newContent);
    saveSelection({ immediate: true });
  };

  const handleEditorBlur = () => {
    setIsFormatting(false);
    clearSelection();
    handleBlur();
  };

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
        className={`note-container backdrop-blur-lg shadow-lg relative ${className}`}
        style={{
          ...combinedStyle,
          borderRadius: `${radius}px`,
        }}
        {...(isEditing ? {} : bindDrag())}
        onContextMenu={handleRightClick}
        onDoubleClick={handleDoubleClick}
        onMouseEnter={() => setIsHoveringNote(true)}
        onMouseLeave={() => setIsHoveringNote(false)}
      >
        {/* Background image if provided */}
        {image && (
          <div
            className="absolute inset-0 bg-center bg-cover bg-no-repeat opacity-75 z-0"
            style={{
              backgroundImage: `url(${image})`,
              borderRadius: `${radius}px`,
            }}
          />
        )}

        {/* Inner content container with dynamic padding */}
        <div
          className="w-full h-full overflow-hidden relative z-10"
          style={{
            padding: `${padding}px`,
            minWidth: "100%",
            maxWidth: "100%",
            minHeight: "100%",
            maxHeight: "100%",
            boxSizing: "border-box",
          }}
        >
          {isEditing ? (
            <div
              contentEditable={true}
              className="break-words outline-none w-full h-full overflow-hidden"
              ref={editorRef}
              style={{
                color: color && color !== "white" ? "#000000" : "black",
                opacity: 1,
                minHeight: "100%",
                maxHeight: "100%",
                resize: "none",
                overflow: "auto",
              }}
              onInput={handleInput}
              onBlur={handleEditorBlur}
              onFocus={() => saveSelection()}
              onMouseUp={() => saveSelection()}
              onKeyUp={() => saveSelection()}
              onSelect={() => saveSelection()}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  e.preventDefault();
                  setIsFormatting(false);
                  clearSelection();
                  handleEscape();
                }
              }}
              suppressContentEditableWarning={true}
            />
          ) : (
            <div
              className="break-words"
              style={{
                color: color && color !== "white" ? "#000000" : "black",
                opacity: 1,
              }}
            >
              {isEmpty ? (
                <div
                  className="italic"
                  style={{
                    color: color === "white" ? "gray" : "rgba(0, 0, 0, 0.6)",
                  }}
                ></div>
              ) : // Check if content contains HTML and render appropriately
              containsHTML(content) ? (
                <div
                  dangerouslySetInnerHTML={{
                    __html: sanitizeHTML(content),
                  }}
                  style={{
                    color: color && color !== "white" ? "#000000" : "black",
                    opacity: color && color !== "white" ? 0.8 : 1,
                  }}
                />
              ) : (
                content
              )}
            </div>
          )}
        </div>

        {/* Single resize handle in the bottom right corner */}
        <div
          className={`absolute w-6 h-6 cursor-nwse-resize z-10 transition-opacity duration-200 ${
            isHoveringNote ? "opacity-100" : "opacity-0"
          }`}
          style={{
            bottom: `${Math.max(4, radius / 2)}px`,
            right: `${Math.max(4, radius / 2)}px`,
          }}
          {...createHandleProps()}
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

      {/* Floating Rich Text Editor */}
      {isEditing && (
        <Portal>
          <RichTextEditor
            isVisible={isEditing}
            theme={theme}
            editorRef={editorRef}
            restoreSelection={restoreSelection}
            saveSelection={saveSelection}
            onApplyFormatting={handleContentChange}
            onFormattingStart={() => setIsFormatting(true)}
            onFormattingEnd={() => {
              setIsFormatting(false);
              // Re-save selection after formatting completes
              saveSelection({ immediate: true });
            }}
          />
        </Portal>
      )}

      {/* Context menu - rendered in a portal to avoid z-index issues */}
      {contextMenu && id && (
        <Portal>
          <NoteContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            noteId={id}
            hasImage={!!image}
            onClose={handleCloseContextMenu}
            theme={theme}
          />
        </Portal>
      )}
    </>
  );
};

export default React.memo(Note);
