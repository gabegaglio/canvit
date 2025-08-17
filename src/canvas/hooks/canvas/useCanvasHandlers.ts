import { useState } from "react";
import { useCanvas } from "../../../contexts/CanvasContext";
import { getRandomIdea } from "../../../utils/ideaBank";

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

  const { addNote } = useCanvas();

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const handleAddNoteFromContextMenu = () => {
    if (contextMenu) {
      // Convert screen coordinates to canvas coordinates
      const canvasX = (contextMenu.x - positionX) / scale;
      const canvasY = (contextMenu.y - positionY) / scale;

      // Ensure the note is within reasonable bounds
      const boundedX = Math.max(0, Math.min(canvasX, 100000 - 200));
      const boundedY = Math.max(0, Math.min(canvasY, 100000 - 150));

      // Add note directly using the context
      addNote({
        x: boundedX,
        y: boundedY,
        content: getRandomIdea(),
        width: 200,
        height: 150,
        color: "#f8f9fa", // Use a light gray instead of white
      });

      setContextMenu(null);
    }
  };

  const handleAddNoteFromToolbar = () => {
    // Calculate the center of the visible canvas area
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Convert center of viewport to canvas coordinates
    const canvasX = (viewportWidth / 2 - positionX) / scale;
    const canvasY = (viewportHeight / 2 - positionY) / scale;

    // Ensure the note is within reasonable bounds
    const boundedX = Math.max(0, Math.min(canvasX, 100000 - 200));
    const boundedY = Math.max(0, Math.min(canvasY, 100000 - 150));

    console.log("Adding note at:", { boundedX, boundedY, positionX, positionY, scale });

    // Add note directly using the context
    addNote({
      x: boundedX,
      y: boundedY,
      content: getRandomIdea(),
      width: 200,
      height: 150,
      color: "#f8f9fa", // Use a light gray instead of white
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
