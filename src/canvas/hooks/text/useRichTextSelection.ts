import { useCallback, useEffect, useRef } from "react";

interface UseRichTextSelectionOptions {
  isActive: boolean;
}

interface SaveSelectionOptions {
  immediate?: boolean;
}

/**
 * Manages the current selection inside a contentEditable region.
 * Useful when toolbar interactions temporarily steal focus.
 */
export function useRichTextSelection({
  isActive,
}: UseRichTextSelectionOptions) {
  const selectionRef = useRef<Range | null>(null);
  const frameRef = useRef<number | null>(null);

  const runSave = useCallback(() => {
    if (!isActive) return;
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    selectionRef.current = range.cloneRange();
  }, [isActive]);

  const saveSelection = useCallback(
    (options?: SaveSelectionOptions) => {
      if (!isActive) return;
      if (options?.immediate) {
        runSave();
        return;
      }
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
      frameRef.current = requestAnimationFrame(runSave);
    },
    [isActive, runSave]
  );

  const restoreSelection = useCallback(() => {
    if (!isActive) return;
    const selection = window.getSelection();
    const stored = selectionRef.current;
    if (!selection || !stored) return;
    selection.removeAllRanges();
    selection.addRange(stored);
  }, [isActive]);

  const clearSelection = useCallback(() => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
    selectionRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  return {
    saveSelection,
    restoreSelection,
    clearSelection,
  };
}
