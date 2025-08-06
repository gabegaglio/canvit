import { useRef } from "react";
import { useCanvas } from "../../contexts/CanvasContext";

interface UseImageUploadProps {
  noteId: string;
  onClose: () => void;
}

export function useImageUpload({ noteId, onClose }: UseImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { updateNoteImage } = useCanvas();

  // Handle image upload click
  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle image file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];

      // Check file type
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file.");
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
    fileInputRef,
    handleImageClick,
    handleImageChange,
  };
}
