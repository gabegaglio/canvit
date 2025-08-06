import React, { useCallback } from "react";
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
  onCloseCanvasContextMenu?: () => void;
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
      {/* Center logo - positioned exactly at the center of the canvas */}
      <img
        src={logoSrc}
        alt="Canvit Logo"
        className="absolute"
        style={{
          left: canvasSize / 2,
          top: canvasSize / 2,
          width: boxSize * 1.5,
          height: boxSize * 1.5,
          objectFit: "contain",
          zIndex: 1,
          pointerEvents: "none",
          userSelect: "none",
          opacity: 1,
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
        >
          {note.content}
        </Note>
      ))}
    </div>
  );
};

export default React.memo(CanvasContent);
