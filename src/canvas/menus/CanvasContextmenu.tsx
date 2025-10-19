import React, { useEffect, useRef } from "react";
import { useCanvas } from "../../contexts/CanvasContext";
import { useCanvasPictureUpload } from "../hooks/image";
import { useAddText } from "../hooks/text";

// Canvas size constant
const CANVAS_SIZE = 100000;
// Logo blue color
const LOGO_BLUE = "#00AEEF";

interface CanvasContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onAddNote: () => void;
  gridState: "off" | "lines" | "snap";
  onToggleGrid: (gridState: "off" | "lines" | "snap") => void;
  theme: "light" | "dark";
  positionX: number;
  positionY: number;
  scale: number;
}

const CanvasContextMenu: React.FC<CanvasContextMenuProps> = ({
  x,
  y,
  onClose,
  onAddNote,
  gridState,
  onToggleGrid,
  theme,
  positionX,
  positionY,
  scale,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const { setPosition, setScale, addText } = useCanvas();
  const isDark = theme === "dark";

  // Use our new useAddText hook for consistency with toolbar
  const { createText } = useAddText({
    onAddText: (textData) => {
      addText({
        x: textData.x,
        y: textData.y,
        content: textData.content,
        width: textData.width,
        height: textData.height,
        color: textData.color,
      });
    },
    canvasScale: scale,
    gridSize: 20, // Default grid size
    gridState,
    viewportCenter: {
      x: (x - positionX) / scale,
      y: (y - positionY) / scale,
    },
  });

  // Use picture upload hook
  const { pictureInputRef, handlePictureClick, handlePictureChange } =
    useCanvasPictureUpload({
      onClose,
      positionX: x,
      positionY: y,
      scale,
    });

  // Same functionality as the Home button
  const handleGoToOrigin = () => {
    setPosition(
      window.innerWidth / 2 - CANVAS_SIZE / 2,
      window.innerHeight / 2 - CANVAS_SIZE / 2
    );
    setScale(1);
    onClose();
  };

  // Toggle grid and close menu
  const handleToggleGrid = () => {
    // Cycle through the three states: off -> lines -> snap -> off
    const nextState =
      gridState === "off" ? "lines" : gridState === "lines" ? "snap" : "off";
    onToggleGrid(nextState);
    onClose();
  };

  // Add text at context menu position using the same hook as toolbar
  const handleAddText = () => {
    // Create text at the context menu position using our hook
    createText();
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
      className={`absolute backdrop-blur-2xl shadow-2xl rounded-xl p-1.5 border min-w-[160px] ${
        isDark ? "bg-black/80 border-gray-700" : "bg-white/20 border-white/30"
      }`}
      style={{ left: x, top: y, zIndex: 1000 }}
    >
      <button
        className={`block w-full text-left px-3 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 cursor-pointer relative group ${
          isDark
            ? "text-white hover:bg-white/20"
            : "text-gray-900 hover:bg-white/30"
        }`}
        onClick={onAddNote}
      >
        <span className="relative">
          Add Note
          <span
            className="absolute bottom-0 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300 ease-in-out"
            style={{ backgroundColor: LOGO_BLUE }}
          ></span>
        </span>
      </button>

      <button
        className={`block w-full text-left px-3 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 cursor-pointer relative group ${
          isDark
            ? "text-white hover:bg-white/20"
            : "text-gray-900 hover:bg-white/30"
        }`}
        onClick={handlePictureClick}
      >
        <span className="relative">
          Add Image
          <span
            className="absolute bottom-0 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300 ease-in-out"
            style={{ backgroundColor: LOGO_BLUE }}
          ></span>
        </span>
        <input
          ref={pictureInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
          className="hidden"
          onChange={handlePictureChange}
        />
      </button>

      <button
        className={`block w-full text-left px-3 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 cursor-pointer relative group ${
          isDark
            ? "text-white hover:bg-white/20"
            : "text-gray-900 hover:bg-white/30"
        }`}
        onClick={handleAddText}
      >
        <span className="relative">
          Add Text
          <span
            className="absolute bottom-0 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300 ease-in-out"
            style={{ backgroundColor: LOGO_BLUE }}
          ></span>
        </span>
      </button>

      <button
        className={`block w-full text-left px-3 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 cursor-pointer relative group ${
          isDark
            ? "text-white hover:bg-white/20"
            : "text-gray-900 hover:bg-white/30"
        }`}
        onClick={handleGoToOrigin}
      >
        <span className="relative">
          Go to Origin
          <span
            className="absolute bottom-0 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300 ease-in-out"
            style={{ backgroundColor: LOGO_BLUE }}
          ></span>
        </span>
      </button>

      <button
        className={`block w-full text-left px-3 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 cursor-pointer relative group ${
          isDark
            ? "text-white hover:bg-white/20"
            : "text-gray-900 hover:bg-white/30"
        }`}
        onClick={handleToggleGrid}
      >
        <span className="relative">
          {gridState === "off"
            ? "Grid & Snap"
            : gridState === "lines"
            ? "Snap Only"
            : "No Grid"}
          <span className="absolute -right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
        </span>
      </button>
    </div>
  );
};

export default CanvasContextMenu;
