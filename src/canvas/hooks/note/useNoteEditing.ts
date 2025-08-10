import { useState, useCallback, useEffect, useRef } from "react";
import { useCanvas } from "../../../contexts/CanvasContext";

interface UseNoteEditingProps {
  id?: string;
  content: string;
}

export function useNoteEditing({ id, content }: UseNoteEditingProps) {
  const { updateNote } = useCanvas();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(content);

  // Update editContent when content changes
  useEffect(() => {
    setEditContent(content);
  }, [content]);

  // Handle save on blur or enter
  const handleSave = useCallback(() => {
    if (id) {
      updateNote(id, editContent);
    }
    setIsEditing(false);
  }, [id, editContent, updateNote]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    setEditContent(content);
    setIsEditing(false);
  }, [content]);

  // Handle keyboard events
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        handleCancel();
      } else if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        handleSave();
      }
    },
    [handleCancel, handleSave]
  );

  // Handle double click to start editing
  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsEditing(true);
      setEditContent(content);
      // Focus the textarea after a short delay
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(
            textareaRef.current.value.length,
            textareaRef.current.value.length
          );
        }
      }, 10);
    },
    [content]
  );

  // Handle textarea click to prevent bubbling
  const handleTextareaClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  return {
    isEditing,
    editContent,
    setEditContent,
    textareaRef,
    handleSave,
    handleCancel,
    handleKeyDown,
    handleDoubleClick,
    handleTextareaClick,
  };
}
