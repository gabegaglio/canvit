import React, { useEffect, useRef, useState } from "react";
import { useCanvas } from "../../contexts/CanvasContext";
import { NOTE_COLORS } from "../constants/noteColors";
import type { NoteColorOption } from "../constants/noteColors";

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const { deleteNote, updateNoteColor, updateNoteImage } = useCanvas();

  // Handle deleting the note
  const handleDelete = () => {
    deleteNote(noteId);
    onClose();
  };

  // Handle showing color picker
  const handleShowColorPicker = () => {
    setShowColorPicker(true);
  };

  // Handle selecting a color
  const handleSelectColor = (color: NoteColorOption) => {
    updateNoteColor(noteId, color.value);
    setShowColorPicker(false);
    onClose();
  };

  // Handle image upload click
  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle image file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];

      // Check file type
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file.");
        return;
      }

      // Read the file and convert to data URL
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && typeof event.target.result === "string") {
          updateNoteImage(noteId, event.target.result);
          onClose();
        }
      };
      reader.readAsDataURL(file);
    }
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
      className="absolute bg-white bg-opacity-20 backdrop-blur-md shadow-lg rounded-lg p-1.5 border border-white border-opacity-30 text-sm z-50"
      style={{ left: x, top: y, zIndex: 1000 }}
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
        <div className="p-2">
          <div className="mb-2 font-medium">Select Color</div>
          <div className="grid grid-cols-4 gap-2">
            {NOTE_COLORS.map((color) => (
              <div
                key={color.id}
                className="w-6 h-6 rounded-full cursor-pointer border border-gray-300 transition-transform hover:scale-110"
                style={{ backgroundColor: color.value }}
                onClick={() => handleSelectColor(color)}
                title={color.name}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NoteContextMenu;
