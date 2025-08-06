import React, { useEffect, useRef } from "react";
import { useCanvas } from "../../contexts/CanvasContext";

// Logo blue color
const LOGO_BLUE = "#00AEEF";

interface ImageContextMenuProps {
  x: number;
  y: number;
  imageId: string;
  onClose: () => void;
}

const ImageContextMenu: React.FC<ImageContextMenuProps> = ({
  x,
  y,
  imageId,
  onClose,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const { deleteImage } = useCanvas();

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
      className="absolute bg-white bg-opacity-80 backdrop-blur-md shadow-xl rounded-lg p-1.5 border border-gray-300 text-sm z-[9999]"
      style={{
        left: x,
        top: y,
        zIndex: 10000,
        minWidth: "180px",
      }}
    >
      <button
        className="block w-full text-left px-3 py-1.5 rounded text-black font-medium transition-all duration-200 hover:scale-105 cursor-pointer relative group"
        onClick={handleDelete}
      >
        <span className="relative text-red-500">
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
