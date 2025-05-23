import React from "react";

interface SnapGuideProps {
  position: {
    x: number;
    y: number;
  };
  dimensions: {
    width: number;
    height: number;
  };
  show: boolean;
}

/**
 * Component that shows a visual guide for grid snapping
 */
const SnapGuide: React.FC<SnapGuideProps> = ({
  position,
  dimensions,
  show,
}) => {
  if (!show) return null;

  return (
    <div
      className="absolute pointer-events-none border-2 border-dashed border-blue-500 bg-blue-100 bg-opacity-10"
      style={{
        left: position.x,
        top: position.y,
        width: dimensions.width,
        height: dimensions.height,
        zIndex: 4,
        transition: "all 0.1s ease-out",
      }}
    />
  );
};

export default React.memo(SnapGuide);
