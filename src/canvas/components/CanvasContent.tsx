import React from "react";
import Note from "./Note";

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
      {/* Render Note component in the middle of the canvas */}
      <Note
        className="absolute"
        style={{
          left: canvasSize / 2 - boxSize / 2,
          top: canvasSize / 2 - boxSize / 2,
          zIndex: 5,
        }}
      >
        <p>Note Content</p>
      </Note>
      {/* Center logo */}
      <img
        src={logoSrc}
        alt="Canvit Logo"
        className="absolute"
        style={{
          left: canvasSize / 2 - boxSize / 2,
          top: canvasSize / 2 - boxSize / 2,
          width: boxSize,
          height: boxSize,
          objectFit: "contain",
          zIndex: 1,
          pointerEvents: "none",
          userSelect: "none",
        }}
      />
    </div>
  );
};

export default CanvasContent;
