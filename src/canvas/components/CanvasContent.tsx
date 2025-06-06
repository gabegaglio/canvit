import React, { useCallback, useState } from "react";
import Note from "./Note";
import { useCanvas } from "../../contexts/CanvasContext";

interface CanvasContentProps {
  positionX: number;
  positionY: number;
  scale: number;
  canvasSize: number;
  boxSize: number;
  logoSrc: string;
  showGrid?: boolean;
  onCloseCanvasContextMenu?: () => void; // Callback to close canvas context menu
}

const CanvasContent: React.FC<CanvasContentProps> = ({
  positionX,
  positionY,
  scale,
  canvasSize,
  boxSize,
  logoSrc,
  showGrid = false,
  onCloseCanvasContextMenu,
}) => {
  const { notes, updateNotePosition, updateNoteDimensions, updateNote } =
    useCanvas();

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

  // Handle note right-click to close canvas context menu
  const handleNoteRightClick = useCallback(() => {
    if (onCloseCanvasContextMenu) {
      onCloseCanvasContextMenu();
    }
  }, [onCloseCanvasContextMenu]);

  // Generate the grid pattern if grid is enabled
  const renderGrid = () => {
    if (!showGrid) return null;

    // Create a grid pattern with the boxSize
    return (
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(0, 0, 0, 0.05) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0, 0, 0, 0.05) 1px, transparent 1px)
            `,
            backgroundSize: `${boxSize}px ${boxSize}px`,
          }}
        />
      </div>
    );
  };

  return (
    <div
      className="absolute left-0 top-0 bg-white"
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
          isGridActive={showGrid}
          gridSize={boxSize}
          color={note.color}
          image={note.image}
          onNoteRightClick={handleNoteRightClick}
        >
          {note.content}
        </Note>
      ))}
    </div>
  );
};

export default React.memo(CanvasContent);
