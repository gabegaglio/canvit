import React from "react";
import Note from "./Note";
import { useCanvas } from "../../contexts/CanvasContext";

interface CanvasContentProps {
  positionX: number;
  positionY: number;
  scale: number;
  canvasSize: number;
  boxSize: number;
  logoSrc: string;
}

const CanvasContent: React.FC<CanvasContentProps> = ({
  positionX,
  positionY,
  scale,
  canvasSize,
  boxSize,
  logoSrc,
}) => {
  const { notes, updateNotePosition } = useCanvas();

  // Handle note drag end
  const handleNoteDragEnd = (id: string, x: number, y: number) => {
    console.log(`Note ${id} moved to ${x}, ${y}`);
    updateNotePosition(id, x, y);
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
            minWidth: "200px",
            minHeight: "150px",
          }}
          onDragEnd={handleNoteDragEnd}
          scale={scale}
        >
          <div className="min-h-full">{note.content}</div>
        </Note>
      ))}
    </div>
  );
};

export default CanvasContent;
