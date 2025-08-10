import React, { useCallback } from "react";
import Note from "./Note";
import Image from "./Image";
import { useCanvas } from "../../contexts/CanvasContext";

interface CanvasContentProps {
  positionX: number;
  positionY: number;
  scale: number;
  canvasSize: number;
  boxSize: number;
  logoSrc: string;
  showGrid?: boolean;
  showSnap?: boolean;
  showLogo?: boolean;
  onCloseCanvasContextMenu?: () => void; // Callback to close canvas context menu
  theme: "light" | "dark";
}

const CanvasContent: React.FC<CanvasContentProps> = ({
  positionX,
  positionY,
  scale,
  canvasSize,
  boxSize,
  logoSrc,
  showGrid = false,
  showSnap = false,
  showLogo = true,
  onCloseCanvasContextMenu,
  theme,
}) => {
  const {
    notes,
    images,
    updateNotePosition,
    updateNoteDimensions,
    updateImagePosition,
    updateImageDimensions,
  } = useCanvas();

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
            backgroundSize: `${boxSize}px ${boxSize}px`,
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
            width: boxSize * 3,
            height: boxSize * 3,
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
      {images.map((image) => (
        <Image
          key={image.id}
          id={image.id}
          className="absolute"
          style={{
            left: image.x,
            top: image.y,
            zIndex: 5,
          }}
          width={image.width}
          height={image.height}
          onDragEnd={handleImageDragEnd}
          onResize={handleImageResize}
          scale={scale}
          src={image.src}
          gridState={showGrid ? "lines" : showSnap ? "snap" : "off"}
          gridSize={boxSize}
          onImageRightClick={handleImageRightClick}
          theme={theme}
        />
      ))}

      {/* Render notes from the canvas context */}
      {notes.map((note) => (
        <Note
          key={note.id}
          id={note.id}
          className="absolute"
          style={{
            left: note.x,
            top: note.y,
            zIndex: 5,
          }}
          width={note.width}
          height={note.height}
          onDragEnd={handleNoteDragEnd}
          onResize={handleNoteResize}
          scale={scale}
          content={note.content}
          gridState={showGrid ? "lines" : showSnap ? "snap" : "off"}
          gridSize={boxSize}
          color={note.color}
          image={note.image}
          onNoteRightClick={handleNoteRightClick}
          theme={theme}
        />
      ))}
    </div>
  );
};

export default React.memo(CanvasContent);
