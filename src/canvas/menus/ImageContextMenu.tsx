import React, { useEffect, useRef } from "react";
import { useCanvas } from "../../contexts/CanvasContext";

interface ImageContextMenuProps {
  x: number;
  y: number;
  imageId: string;
  onClose: () => void;
  theme: "light" | "dark";
}

const ImageContextMenu: React.FC<ImageContextMenuProps> = ({
  x,
  y,
  imageId,
  onClose,
  theme,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const { deleteImage } = useCanvas();
  const isDark = theme === "dark";

  // Handle deleting the image
  const handleDelete = () => {
    deleteImage(imageId);
    onClose();
  };

  // Close menu when clicking outside
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
      className={`absolute backdrop-blur-2xl shadow-2xl rounded-xl p-1.5 border text-sm z-[9999] ${
        isDark ? "bg-black/80 border-gray-700" : "bg-white/80 border-gray-300"
      }`}
      style={{
        left: x,
        top: y,
        zIndex: 10000,
        minWidth: "180px",
      }}
    >
      <button
        className={`block w-full text-left px-3 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 cursor-pointer relative group ${
          isDark
            ? "text-red-400 hover:bg-white/20"
            : "text-red-500 hover:bg-white/30"
        }`}
        onClick={handleDelete}
      >
        <span className="relative">
          Delete Image
          <span
            className="absolute bottom-0 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300 ease-in-out"
            style={{ backgroundColor: "#EF4444" }}
          ></span>
        </span>
      </button>
    </div>
  );
};

export default ImageContextMenu;
