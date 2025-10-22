import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useDrag } from "@use-gesture/react";
import { useGridSnap } from "../hooks/canvas";
import SnapGuide from "./SnapGuide";
import { BOX_SIZE } from "../constants";
import { useGlobalClickHandler } from "../hooks/ui";
import { useRichTextSelection } from "../hooks/text";
import {
  containsHTML,
  sanitizeHTML,
  htmlToPlainText,
} from "../utils/htmlUtils";
import RichTextEditor from "./RichTextEditor";

interface TextProps {
  id: string;
  x: number;
  y: number;
  content: string;
  width?: number;
  height?: number;
  color?: string;
  theme: "light" | "dark";
  onUpdateText: (id: string, content: string) => void;
  onResize: (id: string, width: number, height: number) => void;
  onDragEnd: (id: string, x: number, y: number) => void;
  scale?: number;
  gridState?: "off" | "lines" | "snap";
  gridSize?: number;
  onTextRightClick?: () => void;
  onDelete?: (id: string) => void;
}

const EMPTY_PARAGRAPH = "<p><br /></p>";
const MIN_WIDTH = 48;
const MIN_HEIGHT = 28;

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const convertPlainTextToHTML = (value: string) => {
  const normalized = value.replace(/\r\n?/g, "\n");
  const lines = normalized.split("\n");
  const html = lines
    .map((line) =>
      line.trim().length > 0 ? `<p>${escapeHtml(line)}</p>` : EMPTY_PARAGRAPH
    )
    .join("");
  return html;
};

const ensureEditableHTML = (value: string) => {
  if (!value) return EMPTY_PARAGRAPH;
  if (containsHTML(value)) {
    const sanitized = sanitizeHTML(value);
    return sanitized && sanitized.trim() !== "" ? sanitized : EMPTY_PARAGRAPH;
  }
  const converted = convertPlainTextToHTML(value);
  return converted && converted.trim() !== "" ? converted : EMPTY_PARAGRAPH;
};

const getPlainText = (html: string) => htmlToPlainText(html).trim();

const roundSize = (value: number) => Math.max(Math.round(value), 0);

const appliesToolbar = (target: EventTarget | null) =>
  target instanceof HTMLElement && target.closest(".rich-text-toolbar");

const TextComponent: React.FC<TextProps> = ({
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
  onDelete,
}) => {
  const [position, setPosition] = useState({ x, y });
  const [isDragging, setIsDragging] = useState(false);
  const [isFormatting, setIsFormatting] = useState(false);
  const shouldAutoEdit = useMemo(
    () => getPlainText(content).length === 0,
    [content]
  );
  const [isEditing, setIsEditing] = useState(shouldAutoEdit);
  const editorRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const lastCommittedRef = useRef<string>(ensureEditableHTML(content));
  const lastMeasuredRef = useRef<{ width: number; height: number }>({
    width: width ?? MIN_WIDTH,
    height: height ?? MIN_HEIGHT,
  });
  const justDraggedRef = useRef<boolean>(false);

  const { noteRef } = useGlobalClickHandler({
    isEditing,
    onSave: () => commitChanges(),
  });

  const { saveSelection, restoreSelection, clearSelection } =
    useRichTextSelection({ isActive: isEditing });

  // Track previous props to avoid fighting with drag handler
  const prevPropsRef = useRef({ x, y });

  useEffect(() => {
    // Only update position if props actually changed (not during local dragging)
    if (prevPropsRef.current.x !== x || prevPropsRef.current.y !== y) {
      setPosition({ x, y });
      prevPropsRef.current = { x, y };
    }
  }, [x, y]);

  useEffect(() => {
    lastCommittedRef.current = ensureEditableHTML(content);
  }, [content]);

  useEffect(() => {
    lastMeasuredRef.current = {
      width: width ?? MIN_WIDTH,
      height: height ?? MIN_HEIGHT,
    };
  }, [width, height]);

  useEffect(() => {
    if (!isEditing) {
      clearSelection();
      return;
    }

    const editor = editorRef.current;
    if (!editor) return;

    const html = lastCommittedRef.current || EMPTY_PARAGRAPH;
    if (editor.innerHTML !== html) {
      editor.innerHTML = html;
    }

    requestAnimationFrame(() => {
      editor.focus();
      restoreSelection();
    });
  }, [isEditing, clearSelection, restoreSelection, content]);

  useEffect(() => {
    if (!isEditing) return;
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;
      const anchor = selection.anchorNode;
      if (!editorRef.current || !anchor) return;
      if (!editorRef.current.contains(anchor)) return;
      saveSelection({ immediate: true });
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, [isEditing, saveSelection]);

  const deleteIfEmpty = useCallback(() => {
    if (!onDelete) return;
    onDelete(id);
  }, [id, onDelete]);

  const commitChanges = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) {
      setIsEditing(false);
      return;
    }

    const sanitized = sanitizeHTML(editor.innerHTML);
    const normalized = sanitized && sanitized.trim() !== "" ? sanitized : "";
    const plainText = getPlainText(normalized);

    clearSelection();
    setIsEditing(false);

    if (plainText.length === 0) {
      deleteIfEmpty();
      return;
    }

    const finalHtml = ensureEditableHTML(normalized);

    if (finalHtml !== lastCommittedRef.current) {
      lastCommittedRef.current = finalHtml;
      onUpdateText(id, finalHtml);
    }
  }, [clearSelection, deleteIfEmpty, id, onUpdateText]);

  const { snapPosition, showSnapGuide } = useGridSnap({
    x: position.x,
    y: position.y,
    width: width ?? MIN_WIDTH,
    height: height ?? MIN_HEIGHT,
    gridSize,
    gridState,
    isDragging,
    isResizing: false,
  });

  const bindDrag = useDrag(
    ({ movement: [mx, my], first, last, memo, event, type }) => {
      // Stop propagation to prevent canvas pan
      if (event && typeof (event as Event).stopPropagation === "function") {
        (event as Event).stopPropagation();
      }

      if (type === "mousedown" && (event as MouseEvent).button !== 0) return;

      if (first) {
        // Don't start drag if we're currently editing
        if (isEditing) {
          return;
        }

        // Prevent default to stop text selection during drag
        if (event.cancelable) {
          event.preventDefault();
        }

        justDraggedRef.current = true;
        setIsDragging(true);
        return {
          initialX: position.x,
          initialY: position.y,
        };
      }

      const adjustedMx = mx / scale;
      const adjustedMy = my / scale;
      const xPos = memo.initialX + adjustedMx;
      const yPos = memo.initialY + adjustedMy;

      setPosition({ x: xPos, y: yPos });

      if (last) {
        setIsDragging(false);
        const isGridActive = gridState !== "off";
        const finalX = isGridActive ? snapPosition.x : xPos;
        const finalY = isGridActive ? snapPosition.y : yPos;
        setPosition({ x: finalX, y: finalY });
        onDragEnd(id, finalX, finalY);

        // Clear the justDragged flag after a short delay
        setTimeout(() => {
          justDraggedRef.current = false;
        }, 150);
      }

      return memo;
    },
    {
      filterTaps: true,
      pointer: { touch: true, capture: true },
      shouldSnap: gridState !== "off",
      enabled: !isEditing && !isFormatting,
      preventScroll: true,
      eventOptions: { passive: false },
    }
  );

  const handleDoubleClick = useCallback(
    (event: React.MouseEvent) => {
      // Don't enter edit mode if we just finished dragging
      if (isDragging || justDraggedRef.current) return;

      event.preventDefault();
      event.stopPropagation();
      setIsEditing(true);
    },
    [isDragging]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Escape") {
        event.preventDefault();
        if (getPlainText(lastCommittedRef.current).length === 0) {
          deleteIfEmpty();
          return;
        }
        const editor = editorRef.current;
        if (editor) {
          editor.innerHTML = lastCommittedRef.current || EMPTY_PARAGRAPH;
        }
        setIsEditing(false);
        clearSelection();
        return;
      }

      if (
        (event.metaKey || event.ctrlKey) &&
        event.key.toLowerCase() === "enter"
      ) {
        event.preventDefault();
        commitChanges();
      }
    },
    [clearSelection, commitChanges, deleteIfEmpty]
  );

  const handleInput = useCallback(() => {
    saveSelection({ immediate: true });
  }, [saveSelection]);

  const handleBlur = useCallback(
    (event: React.FocusEvent<HTMLDivElement>) => {
      if (appliesToolbar(event.relatedTarget)) {
        return;
      }
      if (isEditing) {
        commitChanges();
      }
    },
    [commitChanges, isEditing]
  );

  const handleContextMenu = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      onTextRightClick?.();
    },
    [onTextRightClick]
  );

  const observeSize = useCallback(() => {
    if (
      typeof window === "undefined" ||
      typeof ResizeObserver === "undefined"
    ) {
      return undefined;
    }

    const wrapper = wrapperRef.current;
    if (!wrapper) return undefined;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width: rawWidth, height: rawHeight } = entry.contentRect;
      const nextWidth = Math.max(MIN_WIDTH, roundSize(rawWidth));
      const nextHeight = Math.max(MIN_HEIGHT, roundSize(rawHeight));
      const last = lastMeasuredRef.current;

      if (
        Math.abs(nextWidth - last.width) > 1 ||
        Math.abs(nextHeight - last.height) > 1
      ) {
        lastMeasuredRef.current = { width: nextWidth, height: nextHeight };
        onResize(id, nextWidth, nextHeight);
      }
    });

    observer.observe(wrapper);
    return () => observer.disconnect();
  }, [id, onResize]);

  useEffect(() => {
    const cleanup = observeSize();
    return () => {
      if (typeof cleanup === "function") {
        cleanup();
      }
    };
  }, [observeSize]);

  const displayHtml = useMemo(
    () => ensureEditableHTML(content),
    [content]
  );
  const textColor = color || (theme === "dark" ? "#ffffff" : "#111827");
  const focusBorderColor =
    theme === "dark" ? "rgba(59,130,246,0.6)" : "rgba(59,130,246,0.8)";

  const cursor = isEditing ? "text" : isDragging ? "grabbing" : "grab";

  return (
    <>
      <SnapGuide
        position={snapPosition}
        dimensions={lastMeasuredRef.current}
        show={showSnapGuide && gridState !== "off"}
      />

      <div
        ref={(node) => {
          wrapperRef.current = node;
          (noteRef as React.MutableRefObject<HTMLDivElement | null>).current =
            node;
        }}
        className="text-container absolute"
        style={{
          transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
          cursor,
          userSelect: isEditing ? ("text" as const) : ("none" as const),
          touchAction:
            isEditing || isFormatting ? ("auto" as const) : ("none" as const),
          minWidth: MIN_WIDTH,
          minHeight: MIN_HEIGHT,
          zIndex: isDragging ? 1000 : 5,
        }}
        {...bindDrag()}
        onDoubleClick={handleDoubleClick}
        onContextMenu={handleContextMenu}
      >
        <div
          ref={editorRef}
          className="relative"
          contentEditable={isEditing}
          onInput={handleInput}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onKeyUp={() => saveSelection({ immediate: true })}
          onMouseUp={() => saveSelection({ immediate: true })}
          style={{
            display: "inline-block",
            minWidth: MIN_WIDTH,
            minHeight: MIN_HEIGHT,
            color: textColor,
            backgroundColor: "transparent",
            border: isEditing
              ? `1px solid ${focusBorderColor}`
              : "1px solid transparent",
            borderRadius: "12px",
            padding: "10px 14px",
            fontSize: "16px",
            lineHeight: 1.4,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            outline: "none",
            transition: "border-color 0.2s ease",
          }}
          suppressContentEditableWarning
          dangerouslySetInnerHTML={
            !isEditing ? { __html: displayHtml } : undefined
          }
        />
      </div>

      {isEditing && (
        <RichTextEditor
          isVisible={isEditing}
          theme={theme}
          editorRef={editorRef as React.RefObject<HTMLElement>}
          restoreSelection={restoreSelection}
          saveSelection={saveSelection}
          onFormattingStart={() => setIsFormatting(true)}
          onFormattingEnd={() => {
            setIsFormatting(false);
            saveSelection({ immediate: true });
          }}
          onApplyFormatting={() => saveSelection({ immediate: true })}
        />
      )}
    </>
  );
};

const areTextPropsEqual = (prev: TextProps, next: TextProps) => {
  return (
    prev.id === next.id &&
    prev.x === next.x &&
    prev.y === next.y &&
    prev.width === next.width &&
    prev.height === next.height &&
    prev.content === next.content &&
    prev.color === next.color &&
    prev.theme === next.theme &&
    prev.scale === next.scale &&
    prev.gridState === next.gridState &&
    prev.gridSize === next.gridSize &&
    prev.onUpdateText === next.onUpdateText &&
    prev.onResize === next.onResize &&
    prev.onDragEnd === next.onDragEnd &&
    prev.onTextRightClick === next.onTextRightClick &&
    prev.onDelete === next.onDelete
  );
};

export const Text = React.memo(TextComponent, areTextPropsEqual);
