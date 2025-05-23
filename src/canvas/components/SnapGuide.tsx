import React from "react";

// Logo blue color
const LOGO_BLUE = "#00AEEF";

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
      className="absolute pointer-events-none border-2 border-dashed bg-opacity-10"
      style={{
        left: position.x,
        top: position.y,
        width: dimensions.width,
        height: dimensions.height,
        zIndex: 4,
        transition: "all 0.1s ease-out",
        borderColor: LOGO_BLUE,
        backgroundColor: `${LOGO_BLUE}20`, // 20 is hex for 12% opacity
      }}
    />
  );
};

export default React.memo(SnapGuide);
