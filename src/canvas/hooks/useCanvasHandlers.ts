import { useState } from "react";
import { useAddNote } from "./useAddNote";

interface CanvasPosition {
  positionX: number;
  positionY: number;
  scale: number;
}

export function useCanvasHandlers(position: CanvasPosition) {
  const { positionX, positionY, scale } = position;
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
  } | null>(null);

  // Use the hook for adding notes
  const { addNoteToCanvas } = useAddNote({
    onAddComplete: () => setContextMenu(null),
  });

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const handleAddNoteFromContextMenu = () => {
    if (contextMenu) {
      // Convert screen coordinates to canvas coordinates
      // The formula accounts for canvas position and scale
      const canvasX = (contextMenu.x - positionX) / scale;
      const canvasY = (contextMenu.y - positionY) / scale;
      addNoteToCanvas({ 
        x: canvasX, 
        y: canvasY
      });
    }
  };

  const handleAddNoteFromToolbar = () => {
    // Calculate the center of the visible canvas area
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Convert center of viewport to canvas coordinates
    const canvasX = (viewportWidth / 2 - positionX) / scale;
    const canvasY = (viewportHeight / 2 - positionY) / scale;

    addNoteToCanvas({ 
      x: canvasX, 
      y: canvasY
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  return {
    contextMenu,
    handleContextMenu,
    handleAddNoteFromContextMenu,
    handleAddNoteFromToolbar,
    handleCloseContextMenu,
  };
}
