import { useRef } from "react";
import { useCanvas } from "../../contexts/CanvasContext";

interface UsePictureUploadProps {
  noteId: string;
  onClose: () => void;
}

export function usePictureUpload({ noteId, onClose }: UsePictureUploadProps) {
  const pictureInputRef = useRef<HTMLInputElement>(null);
  const { updateNoteImage } = useCanvas();

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
          updateNoteImage(noteId, event.target.result);
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
