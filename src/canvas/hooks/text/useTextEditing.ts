import { useState, useCallback, useRef, useEffect } from "react";

interface UseTextEditingProps {
  initialContent: string;
  onUpdateText: (id: string, content: string) => void;
  id: string;
  autoFocus?: boolean;
}

export const useTextEditing = ({
  initialContent,
  onUpdateText,
  id,
  autoFocus = false,
}: UseTextEditingProps) => {
  const [isEditing, setIsEditing] = useState(autoFocus);
  const [content, setContent] = useState(initialContent);
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus for new text boxes
  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(0, 0);
    }
  }, [autoFocus]);

  // Handle double-click to enter edit mode
  const handleDoubleClick = useCallback(() => {
    setIsEditing(true);
    setContent(initialContent);
    setCursorPosition(initialContent.length);

    // Focus and position cursor after state update
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(cursorPosition, cursorPosition);
      }
    }, 0);
  }, [initialContent, cursorPosition]);

  // Save text and exit edit mode
  const handleSave = useCallback(() => {
    setIsEditing(false);

    // Only update if content actually changed
    if (content !== initialContent && onUpdateText) {
      try {
        onUpdateText(id, content);
      } catch (error) {
        console.error("Error updating text:", error);
        // Revert on error
        setContent(initialContent);
      }
    }
  }, [content, initialContent, onUpdateText, id]);

  // Cancel editing and revert changes
  const handleCancel = useCallback(() => {
    setIsEditing(false);
    setContent(initialContent);
    setCursorPosition(initialContent.length);
  }, [initialContent]);

  // Handle keyboard events - only essential ones to avoid interfering with text selection
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      switch (e.key) {
        case "Escape":
          e.preventDefault();
          handleCancel();
          break;
        // Removed Enter and Tab handling to allow normal text editing behavior
        // Enter now allows line breaks, Tab allows normal tabbing
      }
    },
    [handleCancel]
  );

  // Handle text changes
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newContent = e.target.value;
      setContent(newContent);
      setCursorPosition(e.target.selectionStart || 0);
    },
    []
  );

  // Handle selection changes
  const handleSelect = useCallback(
    (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
      const target = e.target as HTMLTextAreaElement;
      setCursorPosition(target.selectionStart || 0);
    },
    []
  );

  // Handle blur (click outside)
  const handleBlur = useCallback(() => {
    // Small delay to allow for other click handlers
    setTimeout(() => {
      if (isEditing) {
        handleSave();
      }
    }, 100);
  }, [isEditing, handleSave]);

  return {
    isEditing,
    content,
    cursorPosition,
    textareaRef,
    handleDoubleClick,
    handleSave,
    handleCancel,
    handleKeyDown,
    handleChange,
    handleSelect,
    handleBlur,
    setContent,
    setIsEditing,
  };
};
