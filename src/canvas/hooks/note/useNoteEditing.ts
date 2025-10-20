import { useState, useCallback, useMemo } from "react";
import { useCanvas } from "../../../contexts/CanvasContext";

interface UseNoteEditingProps {
  id?: string;
  content: string;
}

export function useNoteEditing({ id, content }: UseNoteEditingProps) {
  const { updateNote, setNoteEditing } = useCanvas();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(content);

  // Memoize the canvas functions to prevent unnecessary re-renders
  const memoizedUpdateNote = useMemo(() => updateNote, [updateNote]);
  const memoizedSetNoteEditing = useMemo(
    () => setNoteEditing,
    [setNoteEditing]
  );

  // Start editing
  const startEditing = useCallback(() => {
    setEditContent(content);
    setIsEditing(true);
    if (id) {
      memoizedSetNoteEditing(id, true);
    }
  }, [content, id, memoizedSetNoteEditing]);

  // Stop editing without saving
  const cancelEditing = useCallback(() => {
    setEditContent(content);
    setIsEditing(false);
    if (id) {
      memoizedSetNoteEditing(id, false);
    }
  }, [content, id, memoizedSetNoteEditing]);

  // Save and stop editing
  const saveAndStop = useCallback(
    (nextContent?: string) => {
      const finalContent = nextContent ?? editContent;
      if (id) {
        memoizedUpdateNote(id, finalContent);
        memoizedSetNoteEditing(id, false);
      }
      setEditContent(finalContent);
      setIsEditing(false);
    },
    [id, editContent, memoizedUpdateNote, memoizedSetNoteEditing]
  );

  // Handle content changes during editing
  const handleContentChange = useCallback((newContent: string) => {
    setEditContent(newContent);
  }, []);

  // Handle blur (clicking away)
  const handleBlur = useCallback(() => {
    if (isEditing) {
      saveAndStop();
    }
  }, [isEditing, saveAndStop]);

  // Handle escape key
  const handleEscape = useCallback(() => {
    if (isEditing) {
      cancelEditing();
    }
  }, [isEditing, cancelEditing]);

  return {
    isEditing,
    editContent,
    startEditing,
    cancelEditing,
    saveAndStop,
    handleContentChange,
    handleBlur,
    handleEscape,
  };
}
