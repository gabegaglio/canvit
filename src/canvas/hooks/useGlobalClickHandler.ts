import { useEffect, useRef } from "react";

interface UseGlobalClickHandlerProps {
  isEditing: boolean;
  onSave: () => void;
}

export function useGlobalClickHandler({
  isEditing,
  onSave,
}: UseGlobalClickHandlerProps) {
  const noteRef = useRef<HTMLDivElement>(null);

  // Handle global clicks to exit edit mode
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      if (
        isEditing &&
        noteRef.current &&
        !noteRef.current.contains(e.target as Node)
      ) {
        onSave();
      }
    };

    if (isEditing) {
      document.addEventListener("mousedown", handleGlobalClick);
      return () => {
        document.removeEventListener("mousedown", handleGlobalClick);
      };
    }
  }, [isEditing, onSave]);

  return { noteRef };
}
