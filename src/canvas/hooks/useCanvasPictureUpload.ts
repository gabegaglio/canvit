import { useRef } from "react";
import { useCanvas } from "../../contexts/CanvasContext";

interface UseCanvasPictureUploadProps {
  onClose: () => void;
  positionX: number;
  positionY: number;
  scale: number;
}

export function useCanvasPictureUpload({
  onClose,
  positionX,
  positionY,
  scale,
}: UseCanvasPictureUploadProps) {
  const pictureInputRef = useRef<HTMLInputElement>(null);
  const {
    addImage,
    positionX: canvasPositionX,
    positionY: canvasPositionY,
  } = useCanvas();

  // Handle picture upload click
  const handlePictureClick = () => {
    if (pictureInputRef.current) {
      pictureInputRef.current.click();
    }
  };

  // Handle picture file selection
  const handlePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];

      // Check file type - accept common picture formats
      const validTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!validTypes.includes(file.type)) {
        alert("Please select a valid picture file (JPEG, PNG, GIF, or WebP).");
        return;
      }

      // Read the file and convert to data URL
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && typeof event.target.result === "string") {
          // Convert screen coordinates to canvas coordinates
          // The formula accounts for canvas position and scale
          const canvasX = (positionX - canvasPositionX) / scale;
          const canvasY = (positionY - canvasPositionY) / scale;

          // Add an image with the picture
          addImage({
            x: canvasX,
            y: canvasY,
            width: 300,
            height: 200,
            src: event.target.result,
          });

          onClose();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return {
    pictureInputRef,
    handlePictureClick,
    handlePictureChange,
  };
}
