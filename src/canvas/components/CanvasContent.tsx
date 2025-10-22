import React, { useCallback, useMemo } from "react";
import Note from "./Note";
import Image from "./Image";
import { Text } from "./Text";
import { useCanvas } from "../../contexts/CanvasContext";
import { useViewportFilter } from "../hooks/canvas/useViewportFilter";

const DEFAULT_TEXT_WIDTH = 100;
const DEFAULT_TEXT_HEIGHT = 24;

interface CanvasContentProps {
  positionX: number;
  positionY: number;
  scale: number;
  canvasSize: number;
  gridSize: number;
  logoSize?: number;
  logoSrc: string;
  showGrid?: boolean;
  showSnap?: boolean;
  showLogo?: boolean;
  onCloseCanvasContextMenu?: () => void; // Callback to close canvas context menu
  theme: "light" | "dark";
  elementRadius: number;
}

const CanvasContent: React.FC<CanvasContentProps> = ({
  positionX,
  positionY,
  scale,
  canvasSize,
  gridSize,
  logoSize = gridSize * 3,
  logoSrc,
  showGrid = false,
  showSnap = false,
  showLogo = true,
  onCloseCanvasContextMenu,
  theme,
  elementRadius,
}) => {
  const {
    notes,
    images,
    texts,
    updateNotePosition,
    updateNoteDimensions,
    updateImagePosition,
    updateImageDimensions,
    updateTextPosition,
    updateText,
    updateTextDimensions,
    deleteText,
  } = useCanvas();

  const viewport = useMemo(
    () => ({
      x: positionX,
      y: positionY,
      scale,
    }),
    [positionX, positionY, scale]
  );

  const visibleNotes = useViewportFilter(notes, viewport);
  const visibleImages = useViewportFilter(images, viewport);

  const sizedTexts = useMemo(
    () =>
      texts.map((text) => ({
        ...text,
        width: text.width ?? DEFAULT_TEXT_WIDTH,
        height: text.height ?? DEFAULT_TEXT_HEIGHT,
      })),
    [texts]
  );

  const visibleTexts = useViewportFilter(sizedTexts, viewport);

  // Handle note drag end - memoized to avoid unnecessary recreations
  const handleNoteDragEnd = useCallback(
    (id: string, x: number, y: number) => {
      updateNotePosition(id, x, y);
    },
    [updateNotePosition]
  );

  // Handle note resize - memoized for better performance
  const handleNoteResize = useCallback(
    (id: string, width: number, height: number) => {
      updateNoteDimensions(id, width, height);
    },
    [updateNoteDimensions]
  );

  // Handle image drag end
  const handleImageDragEnd = useCallback(
    (id: string, x: number, y: number) => {
      updateImagePosition(id, x, y);
    },
    [updateImagePosition]
  );

  // Handle text drag end
  const handleTextDragEnd = useCallback(
    (id: string, x: number, y: number) => {
      updateTextPosition(id, x, y);
    },
    [updateTextPosition]
  );

  // Handle image resize
  const handleImageResize = useCallback(
    (id: string, width: number, height: number) => {
      updateImageDimensions(id, width, height);
    },
    [updateImageDimensions]
  );

  // Handle note right-click to close canvas context menu
  const handleNoteRightClick = useCallback(() => {
    if (onCloseCanvasContextMenu) {
      onCloseCanvasContextMenu();
    }
  }, [onCloseCanvasContextMenu]);

  // Handle image right-click to close canvas context menu
  const handleImageRightClick = useCallback(() => {
    if (onCloseCanvasContextMenu) {
      onCloseCanvasContextMenu();
    }
  }, [onCloseCanvasContextMenu]);

  // Generate the grid pattern if grid is enabled
  const renderGrid = () => {
    if (!showGrid) return null;

    const isDark = theme === "dark";
    const gridColor = isDark
      ? "rgba(255, 255, 255, 0.2)"
      : "rgba(0, 0, 0, 0.05)";

    // Create a grid pattern with the boxSize
    return (
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(to right, ${gridColor} 1px, transparent 1px),
              linear-gradient(to bottom, ${gridColor} 1px, transparent 1px)
            `,
            backgroundSize: `${gridSize}px ${gridSize}px`,
          }}
        />
      </div>
    );
  };

  return (
    <div
      className="absolute left-0 top-0"
      style={{
        width: canvasSize,
        height: canvasSize,
        transform: `translate(${positionX}px, ${positionY}px) scale(${scale})`,
        transformOrigin: "0 0",
        backgroundColor: theme === "dark" ? "#000000" : "transparent", // Make background transparent
      }}
    >
      {/* Grid pattern if enabled */}
      {renderGrid()}

      {/* Center logo - positioned exactly at the center of the canvas */}
      {showLogo && (
        <img
          src={logoSrc}
          alt="Canvit Logo"
          className="absolute"
          style={{
            left: canvasSize / 2,
            top: canvasSize / 2,
            width: logoSize,
            height: logoSize,
            objectFit: "contain",
            zIndex: 1,
            pointerEvents: "none",
            userSelect: "none",
            opacity: 0.8,
            transform: "translate(-50%, -50%)", // This centers the image based on its own dimensions
          }}
        />
      )}

      {/* Render images from the canvas context */}
      {visibleImages.map((image) => (
        <Image
          key={image.id}
          id={image.id}
          className="absolute"
          style={{
            zIndex: 5,
          }}
          x={image.x}
          y={image.y}
          width={image.width}
          height={image.height}
          onDragEnd={handleImageDragEnd}
          onResize={handleImageResize}
          scale={scale}
          src={image.src}
          gridState={showGrid ? "lines" : showSnap ? "snap" : "off"}
          gridSize={gridSize}
          onImageRightClick={handleImageRightClick}
          theme={theme}
          radius={elementRadius}
        />
      ))}

      {/* Render notes from the canvas context */}
      {visibleNotes.map((note) => (
        <Note
          key={note.id}
          id={note.id}
          className="absolute"
          style={{
            zIndex: 5,
          }}
          x={note.x}
          y={note.y}
          width={note.width}
          height={note.height}
          onDragEnd={handleNoteDragEnd}
          onResize={handleNoteResize}
          scale={scale}
          content={note.content}
          gridState={showGrid ? "lines" : showSnap ? "snap" : "off"}
          gridSize={gridSize}
          color={note.color}
          image={note.image}
          onNoteRightClick={handleNoteRightClick}
          theme={theme}
          radius={elementRadius}
        />
      ))}

      {/* Render texts from the canvas context */}
      {visibleTexts.map((text) => (
        <Text
          key={text.id}
          id={text.id}
          x={text.x}
          y={text.y}
          content={text.content}
          width={text.width ?? DEFAULT_TEXT_WIDTH}
          height={text.height ?? DEFAULT_TEXT_HEIGHT}
          color={text.color}
          theme={theme}
          onUpdateText={updateText}
          onResize={updateTextDimensions}
          onDragEnd={handleTextDragEnd}
          scale={scale}
          gridState={showGrid ? "lines" : showSnap ? "snap" : "off"}
          gridSize={gridSize}
          onTextRightClick={() => {}} // TODO: Implement text context menu
          onDelete={deleteText}
        />
      ))}
    </div>
  );
};

export default React.memo(CanvasContent);
