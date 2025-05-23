import React, { useEffect, useRef, useState } from "react";
import { useCanvas } from "../../contexts/CanvasContext";
import type { NoteColorOption } from "../constants/noteColors";
import { SliderPicker } from "react-color";
import type { ColorResult } from "react-color";

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
  const [selectedColor, setSelectedColor] = useState("#ffffff");
  const { deleteNote, updateNoteColor, updateNoteImage, notes } = useCanvas();

  // Initialize selected color from the note's current color
  useEffect(() => {
    const note = notes.find((note) => note.id === noteId);
    if (note && note.color) {
      setSelectedColor(note.color);
    }
  }, [noteId, notes]);

  console.log("NoteContextMenu rendered", { x, y, noteId });

  // Handle deleting the note
  const handleDelete = () => {
    console.log("Deleting note", noteId);
    deleteNote(noteId);
    onClose();
  };

  // Handle showing color picker
  const handleShowColorPicker = () => {
    console.log("Showing color picker");
    setShowColorPicker(true);
  };

  // Handle color change from SliderPicker - update immediately on any change
  const handleColorChange = (color: ColorResult) => {
    console.log("Color changing:", color.hex);
    const newColor = color.hex;
    setSelectedColor(newColor);
    updateNoteColor(noteId, newColor);
  };

  // Handle preset color selection - update immediately
  const handlePresetColorClick = (color: string) => {
    setSelectedColor(color);
    updateNoteColor(noteId, color);
  };

  // Handle image upload click
  const handleImageClick = () => {
    console.log("Clicked image upload");
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
          console.log("Uploading image for note", noteId);
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
        console.log("Clicked outside note context menu");
        onClose();
      }
    };

    console.log("Adding click outside listener for note context menu");
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      console.log("Removing click outside listener for note context menu");
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
