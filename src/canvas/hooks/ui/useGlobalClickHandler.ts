import { useEffect, useRef, useCallback } from "react";

interface UseGlobalClickHandlerProps {
  isEditing: boolean;
  onSave: () => void;
}

export function useGlobalClickHandler({
  isEditing,
  onSave,
}: UseGlobalClickHandlerProps) {
  const noteRef = useRef<HTMLDivElement>(null);

  // Memoize the onSave function to prevent unnecessary effect re-runs
  const memoizedOnSave = useCallback(() => {
    onSave();
  }, [onSave]);

  // Handle global clicks to exit edit mode
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      if (
        isEditing &&
        noteRef.current &&
        !noteRef.current.contains(e.target as Node)
      ) {
        // Don't save if clicking on toolbar
        const target = e.target as HTMLElement;
        if (target.closest(".rich-text-toolbar")) {
          return;
        }

        memoizedOnSave();
      }
    };

    if (isEditing) {
      // Use mousedown to catch the event before drag handlers
      document.addEventListener("mousedown", handleGlobalClick, {
        capture: true,
      });
      return () => {
        document.removeEventListener("mousedown", handleGlobalClick, {
          capture: true,
        });
      };
    }
  }, [isEditing, memoizedOnSave]);

  return { noteRef };
}
