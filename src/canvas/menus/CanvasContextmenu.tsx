import React, { useEffect, useRef } from "react";

interface CanvasContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onAddNote: () => void;
}

const CanvasContextMenu: React.FC<CanvasContextMenuProps> = ({ x, y, onClose, onAddNote }) => {
  const menuRef = useRef<HTMLDivElement>(null);

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
      className="absolute bg-white-200 backdrop-blur-lg shadow-lg rounded-lg p-2"
      style={{ left: x, top: y, zIndex: 1000 }}
    >
      <button
        className="block w-full text-left px-4 py-2 rounded text-black font-small transition-all duration-200 hover:bg-opacity-30 hover:scale-105 cursor-pointer relative group"
        onClick={onAddNote}
      >
        <span className="relative">
          Add Note
          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-black group-hover:w-full transition-all duration-300 ease-in-out"></span>
        </span>
      </button>
    </div>
  );
};

export default CanvasContextMenu;
