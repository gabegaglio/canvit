import { useState, useCallback } from "react";
import { useCanvas } from "../../contexts/CanvasContext";
import { getRandomIdea } from "../../utils/ideaBank";

interface UseAddNoteOptions {
  defaultPosition?: { x: number; y: number };
  onAddComplete?: () => void;
}

interface UseAddNoteReturn {
  isAddingNote: boolean;
  toggleAddNote: () => void;
  setAddNotePosition: (x: number, y: number) => void;
  addNoteToCanvas: (note: {
    x: number;
    y: number;
    content?: string;
    width?: number;
    height?: number;
  }) => void;
  handleAddNote: () => void;
}

export function useAddNote(options: UseAddNoteOptions = {}): UseAddNoteReturn {
  const { onAddComplete } = options;
  const { addNote } = useCanvas();
  const [isAddingNote, setIsAddingNote] = useState(false);

  // Position where to add the note
  const [notePosition, setNotePosition] = useState({ x: 0, y: 0 });

  // Toggle add note mode
  const toggleAddNote = useCallback(() => {
    setIsAddingNote((prev) => !prev);
  }, []);

  // Set position before adding note
  const setAddNotePosition = useCallback((x: number, y: number) => {
    setNotePosition({ x, y });
  }, []);

  // Add note to canvas at the specified position
  const addNoteToCanvas = useCallback(
    (note: {
      x: number;
      y: number;
      content?: string;
      width?: number;
      height?: number;
    }) => {
      // Use provided content or generate random idea - ensure randomness each time
      const content =
        note.content !== undefined ? note.content : getRandomIdea();

      addNote({
        x: note.x,
        y: note.y,
        content,
        width: note.width || 200,
        height: note.height || 150,
      });

      setIsAddingNote(false);
      if (onAddComplete) {
        onAddComplete();
      }
    },
    [addNote, onAddComplete]
  );

  // Handle canvas click to add note
  const handleAddNote = useCallback(() => {
    if (isAddingNote) {
      addNoteToCanvas({
        x: notePosition.x,
        y: notePosition.y,
      });
    }
  }, [isAddingNote, notePosition.x, notePosition.y, addNoteToCanvas]);

  return {
    isAddingNote,
    toggleAddNote,
    setAddNotePosition,
    addNoteToCanvas,
    handleAddNote,
  };
}
