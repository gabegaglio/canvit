import React from "react";
import { useCanvas } from "../../../contexts/CanvasContext";
import { useAddText } from "../../hooks/text";

interface AddTextButtonProps {
  onClick: () => void;
  theme: "light" | "dark";
}

const AddTextButton: React.FC<AddTextButtonProps> = ({ theme }) => {
  const isDark = theme === "dark";
  const { positionX, positionY, scale, addText } = useCanvas();

  // Use our new useAddText hook
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
    gridState: "off", // Default grid state
    viewportCenter: {
      x: (window.innerWidth / 2 - positionX) / scale,
      y: (window.innerHeight / 2 - positionY) / scale,
    },
  });

  const handleTextClick = () => {
    // Create text at viewport center using our hook
    createText();
  };

  return (
    <button
      onClick={handleTextClick}
      className={`backdrop-blur-xl shadow-md w-9 h-9 rounded-md flex items-center justify-center text-lg transition-all duration-200 cursor-pointer hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-md ${
        isDark
          ? "bg-transparent border border-transparent hover:border-white/30 hover:bg-blue-500/20 text-white/80"
          : "bg-transparent border border-transparent hover:border-black/30 hover:bg-blue-500/20 text-black/80"
      }`}
      title="Add Text"
    >
      <div className="w-5 h-5 flex items-center justify-center">
        <span
          className={`text-lg font-bold ${
            isDark ? "text-white" : "text-black"
          }`}
        >
          T
        </span>
      </div>
    </button>
  );
};

export default AddTextButton;
