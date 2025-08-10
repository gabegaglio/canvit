import { useState, useCallback } from "react";

interface UseImageContextMenuProps {
  id?: string;
  onImageRightClick?: () => void;
}

export function useImageContextMenu({
  id,
  onImageRightClick,
}: UseImageContextMenuProps) {
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const handleRightClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (onImageRightClick) {
        onImageRightClick();
      }

      if (id) {
        const x = e.clientX;
        const y = e.clientY;
        setContextMenu({ x, y });
      }
    },
    [id, onImageRightClick]
  );

  const handleCloseContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  return {
    contextMenu,
    handleRightClick,
    handleCloseContextMenu,
  };
}
