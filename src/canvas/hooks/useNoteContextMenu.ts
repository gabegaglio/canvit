import { useState, useCallback } from "react";

interface UseNoteContextMenuProps {
  id?: string;
  onNoteRightClick?: () => void;
}

export function useNoteContextMenu({
  id,
  onNoteRightClick,
}: UseNoteContextMenuProps) {
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
  } | null>(null);

  // Handle right click to show context menu
  const handleRightClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // Call parent callback to close canvas context menu if needed
      if (onNoteRightClick) {
        onNoteRightClick();
      }

      // Only show context menu if we have a valid id
      if (id) {
        // Position relative to the viewport
        const x = e.clientX;
        const y = e.clientY;

        setContextMenu({ x, y });
      }
    },
    [id, onNoteRightClick]
  );

  // Close the context menu
  const handleCloseContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  return {
    contextMenu,
    handleRightClick,
    handleCloseContextMenu,
  };
}
