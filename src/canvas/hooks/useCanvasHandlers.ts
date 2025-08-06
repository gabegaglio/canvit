import { useState } from "react";

interface CanvasHandlersProps {
  positionX: number;
  positionY: number;
  scale: number;
}

interface ContextMenuState {
  x: number;
  y: number;
  isOpen: boolean;
}

export function useCanvasHandlers({
  positionX,
  positionY,
  scale,
}: CanvasHandlersProps) {
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setContextMenu({
      x,
      y,
      isOpen: true,
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  const handleAddNoteFromContextMenu = () => {
    if (!contextMenu) return;

    // Convert screen coordinates to canvas coordinates
    const canvasX = (contextMenu.x - positionX) / scale;
    const canvasY = (contextMenu.y - positionY) / scale;

    console.log("Adding note at canvas coordinates:", { canvasX, canvasY });
    // TODO: Implement note adding logic
    handleCloseContextMenu();
  };

  const handleAddNoteFromToolbar = () => {
    // Add note at center of viewport
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    const canvasX = (centerX - positionX) / scale;
    const canvasY = (centerY - positionY) / scale;

    console.log("Adding note at center:", { canvasX, canvasY });
    // TODO: Implement note adding logic
  };

  return {
    contextMenu,
    handleContextMenu,
    handleAddNoteFromContextMenu,
    handleAddNoteFromToolbar,
    handleCloseContextMenu,
  };
}
