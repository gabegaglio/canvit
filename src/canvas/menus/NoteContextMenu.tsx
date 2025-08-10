import React, { useEffect, useRef } from "react";
import { useCanvas } from "../../contexts/CanvasContext";
import { SliderPicker } from "react-color";
import { useColorPicker } from "../hooks/ui";
import { useImageUpload } from "../hooks/image";

// Logo blue color
const LOGO_BLUE = "#00AEEF";

interface NoteContextMenuProps {
  x: number;
  y: number;
  noteId: string;
  hasImage: boolean; // Added prop to check if note has an image
  onClose: () => void;
  theme: "light" | "dark";
}

const NoteContextMenu: React.FC<NoteContextMenuProps> = ({
  x,
  y,
  noteId,
  hasImage, // Added prop
  onClose,
  theme,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const { deleteNote, removeNoteImage } = useCanvas(); // Added removeNoteImage
  const isDark = theme === "dark";

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

  // Handle removing the image from the note
  const handleRemoveImage = () => {
    removeNoteImage(noteId);
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
        minWidth: "220px",
      }}
    >
      {!showColorPicker ? (
        <>
          <button
            className={`block w-full text-left px-3 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 cursor-pointer relative group ${
              isDark
                ? "text-white hover:bg-white/20"
                : "text-gray-900 hover:bg-white/30"
            }`}
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
            className={`block w-full text-left px-3 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 cursor-pointer relative group ${
              isDark
                ? "text-white hover:bg-white/20"
                : "text-gray-900 hover:bg-white/30"
            }`}
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

          {hasImage && (
            <button
              className={`block w-full text-left px-3 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 cursor-pointer relative group ${
                isDark
                  ? "text-red-400 hover:bg-white/20"
                  : "text-red-500 hover:bg-white/30"
              }`}
              onClick={handleRemoveImage}
            >
              <span className="relative">
                Remove Image
                <span
                  className="absolute bottom-0 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300 ease-in-out"
                  style={{ backgroundColor: "#EF4444" }}
                ></span>
              </span>
            </button>
          )}

          <button
            className={`block w-full text-left px-3 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 cursor-pointer relative group ${
              isDark
                ? "text-red-400 hover:bg-white/20"
                : "text-red-500 hover:bg-white/30"
            }`}
            onClick={handleDelete}
          >
            <span className="relative">
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
                className={`w-6 h-6 rounded-full cursor-pointer border transition-transform hover:scale-110 ${
                  isDark ? "border-gray-600" : "border-gray-300"
                }`}
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
