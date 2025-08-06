import React from "react";

interface SnapGuideProps {
  show: boolean;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  gridSize: number;
}

const SnapGuide: React.FC<SnapGuideProps> = ({
  show,
  x = 0,
  y = 0,
  width = 0,
  height = 0,
  gridSize,
}) => {
  if (!show) return null;

  return (
    <div
      className="absolute pointer-events-none z-50"
      style={{
        left: x,
        top: y,
        width,
        height,
        border: `2px dashed rgba(255, 255, 255, 0.6)`,
        backgroundColor: "rgba(255, 255, 255, 0.1)",
      }}
    >
      {/* Grid snap indicators */}
      <div
        className="absolute w-full h-px bg-white opacity-40"
        style={{ top: "50%" }}
      />
      <div
        className="absolute w-px h-full bg-white opacity-40"
        style={{ left: "50%" }}
      />
    </div>
  );
};

export default SnapGuide;
