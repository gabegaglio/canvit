import { useRef } from "react";
import { useCanvas } from "../../../contexts/CanvasContext";

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
          // Create a temporary image to get dimensions
          const img = new window.Image();
          img.onload = () => {
            // Convert screen coordinates to canvas coordinates
            // The formula accounts for canvas position and scale
            const canvasX = (positionX - canvasPositionX) / scale;
            const canvasY = (positionY - canvasPositionY) / scale;

            // Get the actual image dimensions
            const naturalWidth = img.naturalWidth;
            const naturalHeight = img.naturalHeight;

            // Use actual dimensions if available, otherwise fallback
            let finalWidth = naturalWidth || 300;
            let finalHeight = naturalHeight || 200;

            // Scale down very large images while maintaining aspect ratio
            const maxWidth = 600;
            const maxHeight = 450;

            if (finalWidth > maxWidth || finalHeight > maxHeight) {
              const aspectRatio = finalWidth / finalHeight;
              if (aspectRatio > maxWidth / maxHeight) {
                finalWidth = maxWidth;
                finalHeight = finalWidth / aspectRatio;
              } else {
                finalHeight = maxHeight;
                finalWidth = finalHeight * aspectRatio;
              }
            }

            // Round to whole pixels
            finalWidth = Math.round(finalWidth);
            finalHeight = Math.round(finalHeight);

            // Add an image with proper dimensions
            if (event.target && typeof event.target.result === "string") {
              addImage({
                x: canvasX,
                y: canvasY,
                width: finalWidth,
                height: finalHeight,
                src: event.target.result,
              });
            }

            onClose();
          };

          img.onerror = () => {
            console.error("Failed to load image for dimension calculation");
            // Fallback to default dimensions
            const canvasX = (positionX - canvasPositionX) / scale;
            const canvasY = (positionY - canvasPositionY) / scale;

            addImage({
              x: canvasX,
              y: canvasY,
              width: 300,
              height: 200,
              src: event.target.result,
            });
            onClose();
          };

          if (event.target && typeof event.target.result === "string") {
            img.src = event.target.result;
          }
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
