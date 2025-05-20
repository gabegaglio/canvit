import React, { useEffect, useRef } from "react";
import { useCanvas } from "../../contexts/CanvasContext";

// Canvas size constant
const CANVAS_SIZE = 100000;

interface CanvasContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onAddNote: () => void;
}

const CanvasContextMenu: React.FC<CanvasContextMenuProps> = ({
  x,
  y,
  onClose,
  onAddNote,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const { setPosition, setScale } = useCanvas();

  // Same functionality as the Home button
  const handleGoToOrigin = () => {
    setPosition(
      window.innerWidth / 2 - CANVAS_SIZE / 2,
      window.innerHeight / 2 - CANVAS_SIZE / 2
    );
    setScale(1);
    onClose();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="absolute bg-white bg-opacity-20 backdrop-blur-md shadow-lg rounded-lg p-1.5 border border-white border-opacity-30 text-sm"
      style={{ left: x, top: y, zIndex: 1000 }}
    >
      <button
        className="block w-full text-left px-3 py-1.5 rounded text-black font-medium transition-all duration-200 hover:scale-105 cursor-pointer relative group"
        onClick={onAddNote}
      >
        <span className="relative">
          Add Note
          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-black group-hover:w-full transition-all duration-300 ease-in-out"></span>
        </span>
      </button>

      <button
        className="block w-full text-left px-3 py-1.5 rounded text-black font-medium transition-all duration-200 hover:scale-105 cursor-pointer relative group"
        onClick={handleGoToOrigin}
      >
        <span className="relative">
          Go to Origin
          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-black group-hover:w-full transition-all duration-300 ease-in-out"></span>
        </span>
      </button>
    </div>
  );
};

export default CanvasContextMenu;
