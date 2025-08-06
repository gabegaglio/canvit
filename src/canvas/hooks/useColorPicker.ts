import { useState, useEffect } from "react";
import { useCanvas } from "../../contexts/CanvasContext";
import type { ColorResult } from "react-color";

interface UseColorPickerProps {
  noteId: string;
}

export function useColorPicker({ noteId }: UseColorPickerProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedColor, setSelectedColor] = useState("#ffffff");
  const { updateNoteColor, notes } = useCanvas();

  // Initialize selected color from the note's current color
  useEffect(() => {
    const note = notes.find((note) => note.id === noteId);
    if (note && note.color) {
      setSelectedColor(note.color);
    }
  }, [noteId, notes]);

  // Handle showing color picker
  const handleShowColorPicker = () => {
    setShowColorPicker(true);
  };

  // Handle color change from SliderPicker - update immediately on any change
  const handleColorChange = (color: ColorResult) => {
    const newColor = color.hex;
    setSelectedColor(newColor);
    updateNoteColor(noteId, newColor);
  };

  // Handle preset color selection - update immediately
  const handlePresetColorClick = (color: string) => {
    setSelectedColor(color);
    updateNoteColor(noteId, color);
  };

  return {
    showColorPicker,
    selectedColor,
    handleShowColorPicker,
    handleColorChange,
    handlePresetColorClick,
  };
}
