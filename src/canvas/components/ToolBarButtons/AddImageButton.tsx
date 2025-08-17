import React, { useRef } from "react";
import { useCanvas } from "../../../contexts/CanvasContext";

interface AddImageButtonProps {
  onClick: () => void;
  theme: "light" | "dark";
}

const AddImageButton: React.FC<AddImageButtonProps> = ({ onClick, theme }) => {
  const isDark = theme === "dark";
  const { positionX, positionY, scale, addImage } = useCanvas();
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleImageClick = () => {
    if (imageInputRef.current) {
      imageInputRef.current.click();
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
            // Calculate the center of the visible canvas area
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            // Convert center of viewport to canvas coordinates
            const canvasX = (viewportWidth / 2 - positionX) / scale;
            const canvasY = (viewportHeight / 2 - positionY) / scale;

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

            // Ensure the image is within reasonable bounds
            const boundedX = Math.max(
              0,
              Math.min(canvasX, 100000 - finalWidth)
            );
            const boundedY = Math.max(
              0,
              Math.min(canvasY, 100000 - finalHeight)
            );

            // Add an image with proper dimensions
            if (event.target && typeof event.target.result === "string") {
              addImage({
                x: boundedX,
                y: boundedY,
                width: finalWidth,
                height: finalHeight,
                src: event.target.result,
              });
            }
          };

          img.onerror = () => {
            console.error("Failed to load image for dimension calculation");
            // Fallback to default dimensions
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            const canvasX = (viewportWidth / 2 - positionX) / scale;
            const canvasY = (viewportHeight / 2 - positionY) / scale;

            if (event.target && typeof event.target.result === "string") {
              addImage({
                x: canvasX,
                y: canvasY,
                width: 300,
                height: 200,
                src: event.target.result,
              });
            }
          };
          if (event.target && typeof event.target.result === "string") {
            img.src = event.target.result;
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <button
        onClick={handleImageClick}
        className={`backdrop-blur-xl shadow-md w-9 h-9 rounded-md flex items-center justify-center text-lg transition-all duration-200 cursor-pointer hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-md ${
          isDark
            ? "bg-transparent border border-transparent hover:border-white/30 hover:bg-blue-500/20 text-white/80"
            : "bg-transparent border border-transparent hover:border-black/30 hover:bg-blue-500/20 text-black/80"
        }`}
        title="Add Image"
      >
        <div className="w-5 h-5 flex items-center justify-center">
          <svg
            className={`w-5 h-5 ${isDark ? "text-white" : "text-black"}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      </button>
      <input
        ref={imageInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        className="hidden"
        onChange={handleImageChange}
      />
    </>
  );
};

export default AddImageButton;
