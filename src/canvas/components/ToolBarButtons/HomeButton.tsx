import React from "react";
import { useCanvas } from "../../../contexts/CanvasContext";

interface HomeButtonProps {
  theme: "light" | "dark";
}

const CANVAS_SIZE = 100000;

const HomeButton: React.FC<HomeButtonProps> = ({ theme }) => {
  const { setPosition, setScale } = useCanvas();
  const isDark = theme === "dark";

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
      className={`backdrop-blur-xl shadow-md w-9 h-9 rounded-md flex items-center justify-center text-lg transition-all duration-200 cursor-pointer hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-md ${
        isDark
          ? "bg-transparent border border-transparent hover:border-white/30 hover:bg-blue-500/20 text-white/80"
          : "bg-transparent border border-transparent hover:border-black/30 hover:bg-blue-500/20 text-black/80"
      }`}
      aria-label="Return to Origin"
      title="Return to Origin"
      type="button"
    >
      <div className="w-5 h-5 flex items-center justify-center">
        <svg
          className={`w-5 h-5 ${isDark ? "text-white" : "text-black"}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      </div>
    </button>
  );
};

export default HomeButton;
