import { useCallback } from "react";

interface UseAddNoteOptions {
  defaultPosition?: { x: number; y: number };
  onAddComplete?: () => void;
}

interface UseAddNoteReturn {
  addNote: (position?: { x: number; y: number }) => void;
}

export function useAddNote(options: UseAddNoteOptions = {}): UseAddNoteReturn {
  const { defaultPosition, onAddComplete } = options;

  const addNote = useCallback(
    (position?: { x: number; y: number }) => {
      // Use provided position or default position or center of the screen
      const notePosition = position ||
        defaultPosition || {
          x: window.innerWidth / 2,
          y: window.innerHeight / 2,
        };

      // Here we would add the note to the canvas
      console.log("Adding note at position:", notePosition);

      // In a real implementation, this would create a new note
      // example: dispatch(addNote({ position: notePosition }));

      // Notify that add is complete if callback provided
      if (onAddComplete) {
        onAddComplete();
      }
    },
    [defaultPosition, onAddComplete]
  );

  return { addNote };
}
