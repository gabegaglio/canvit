import { useCallback } from "react";
import { useCanvas } from "../../contexts/CanvasContext";

interface UseAddNoteOptions {
  defaultPosition?: { x: number; y: number };
  onAddComplete?: () => void;
}

interface UseAddNoteReturn {
  addNote: (position?: { x: number; y: number }) => void;
}

export function useAddNote(options: UseAddNoteOptions = {}): UseAddNoteReturn {
  const { defaultPosition, onAddComplete } = options;
  const { addNote: addNoteToCanvas } = useCanvas();

  const addNote = useCallback(
    (position?: { x: number; y: number }) => {
      // Use provided position or default position or center of the screen
      const notePosition = position ||
        defaultPosition || {
          x: window.innerWidth / 2,
          y: window.innerHeight / 2,
        };

      // Add the note to the canvas through the context
      addNoteToCanvas({
        x: notePosition.x,
        y: notePosition.y,
        content: "New Note",
      });

      console.log("Added note at position:", notePosition);

      // Notify that add is complete if callback provided
      if (onAddComplete) {
        onAddComplete();
      }
    },
    [addNoteToCanvas, defaultPosition, onAddComplete]
  );

  return { addNote };
}
