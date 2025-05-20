import React from "react";
import houseIcon from "../../../assets/house.svg";
import { useCanvas } from "../../../contexts/CanvasContext";

const CANVAS_SIZE = 100000;

const HomeButton: React.FC = () => {
  const { setPosition, setScale } = useCanvas();
  const handleHome = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPosition(
      window.innerWidth / 2 - CANVAS_SIZE / 2,
      window.innerHeight / 2 - CANVAS_SIZE / 2
    );
    setScale(1);
  };

  return (
    <button
      onClick={handleHome}
      className="glass-icon-button"
      aria-label="Return to Origin"
      title="Return to Origin"
      type="button"
    >
      <img
        src={houseIcon}
        alt="Home"
        className="w-6 h-6 pointer-events-none select-none"
        draggable={false}
      />
    </button>
  );
};

export default HomeButton;
