import React, { useEffect, useRef } from "react";
import { useCanvas } from "../../contexts/CanvasContext";
import { SliderPicker } from "react-color";
import { useColorPicker } from "../hooks/useColorPicker";
import { useImageUpload } from "../hooks/useImageUpload";

// Logo blue color
const LOGO_BLUE = "#00AEEF";

interface NoteContextMenuProps {
  x: number;
  y: number;
  noteId: string;
  onClose: () => void;
}

const NoteContextMenu: React.FC<NoteContextMenuProps> = ({
  x,
  y,
  noteId,
  onClose,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const { deleteNote } = useCanvas();

  // Use custom hooks
  const {
    showColorPicker,
    selectedColor,
    handleShowColorPicker,
    handleColorChange,
    handlePresetColorClick,
  } = useColorPicker({ noteId });

  const { fileInputRef, handleImageClick, handleImageChange } = useImageUpload({
    noteId,
    onClose,
  });

  // Handle deleting the note
  const handleDelete = () => {
    deleteNote(noteId);
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
        minWidth: "220px",
      }}
    >
      {!showColorPicker ? (
        <>
          <button
            className="block w-full text-left px-3 py-1.5 rounded text-black font-medium transition-all duration-200 hover:scale-105 cursor-pointer relative group"
            onClick={handleShowColorPicker}
          >
            <span className="relative">
              Change Color
              <span
                className="absolute bottom-0 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300 ease-in-out"
                style={{ backgroundColor: LOGO_BLUE }}
              ></span>
            </span>
          </button>

          <button
            className="block w-full text-left px-3 py-1.5 rounded text-black font-medium transition-all duration-200 hover:scale-105 cursor-pointer relative group"
            onClick={handleImageClick}
          >
            <span className="relative">
              Add Image
              <span
                className="absolute bottom-0 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300 ease-in-out"
                style={{ backgroundColor: LOGO_BLUE }}
              ></span>
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </button>

          <button
            className="block w-full text-left px-3 py-1.5 rounded text-black font-medium transition-all duration-200 hover:scale-105 cursor-pointer relative group"
            onClick={handleDelete}
          >
            <span className="relative text-red-500">
              Delete Note
              <span
                className="absolute bottom-0 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300 ease-in-out"
                style={{ backgroundColor: "#EF4444" }}
              ></span>
            </span>
          </button>
        </>
      ) : (
        <div className="p-2 space-y-3">
          {/* React-color SliderPicker */}
          <div className="w-full">
            <SliderPicker color={selectedColor} onChange={handleColorChange} />
          </div>

          {/* Preset colors */}
          <div className="grid grid-cols-5 gap-1 mt-2">
            {[
              "#ffffff",
              "#00AEEF",
              "#FF9F43",
              "#EE5253",
              "#10AC84",
              "#5f27cd",
              "#FF9FF3",
              "#F8EFBA",
              "#D6A2E8",
              "#54a0ff",
            ].map((color) => (
              <div
                key={color}
                className="w-6 h-6 rounded-full cursor-pointer border border-gray-300 transition-transform hover:scale-110"
                style={{ backgroundColor: color }}
                onClick={() => handlePresetColorClick(color)}
                title={color}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NoteContextMenu;
