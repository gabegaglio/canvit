import React, { createContext, useContext, useState, useEffect } from "react";

interface Note {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
  color?: string; // Background color of the note
  image?: string; // Image URL or data URL
}

interface CanvasImage {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  src: string;
}

interface CanvasContextType {
  scale: number;
  setScale: (scale: number) => void;
  positionX: number;
  positionY: number;
  setPosition: (x: number, y: number) => void;
  notes: Note[];
  images: CanvasImage[];
  addNote: (note: Omit<Note, "id">) => void;
  addImage: (image: Omit<CanvasImage, "id">) => void;
  updateNote: (id: string, content: string) => void;
  updateNotePosition: (id: string, x: number, y: number) => void;
  updateImagePosition: (id: string, x: number, y: number) => void;
  deleteNote: (id: string) => void;
  deleteImage: (id: string) => void;
  updateNoteDimensions: (id: string, width: number, height: number) => void;
  updateImageDimensions: (id: string, width: number, height: number) => void;
  updateNoteColor: (id: string, color: string) => void;
  updateNoteImage: (id: string, image: string) => void;
  removeNoteImage: (id: string) => void; // Added method to remove image from note
}

const CanvasContext = createContext<CanvasContextType | null>(null);

const CANVAS_SIZE = 100000;

export const CanvasProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [scale, setScale] = useState(1);
  const [positionX, setPositionX] = useState(0);
  const [positionY, setPositionY] = useState(0);
  const [notes, setNotes] = useState<Note[]>([]);
  const [images, setImages] = useState<CanvasImage[]>([]);

  useEffect(() => {
    setPositionX(window.innerWidth / 2 - CANVAS_SIZE / 2);
    setPositionY(window.innerHeight / 2 - CANVAS_SIZE / 2);
  }, []);

  const setPosition = (x: number, y: number) => {
    setPositionX(x);
    setPositionY(y);
  };

  const addNote = (note: Omit<Note, "id">) => {
    const id = Date.now().toString();
    const noteWithDefaults = {
      ...note,
      width: note.width || 200,
      height: note.height || 150,
    };
    setNotes((prevNotes) => [...prevNotes, { ...noteWithDefaults, id }]);
  };

  const addImage = (image: Omit<CanvasImage, "id">) => {
    const id = Date.now().toString();
    const imageWithDefaults = {
      ...image,
      width: image.width || 300,
      height: image.height || 200,
    };
    setImages((prevImages) => [...prevImages, { ...imageWithDefaults, id }]);
  };

  const updateNote = (id: string, content: string) => {
    setNotes((prevNotes) =>
      prevNotes.map((note) => (note.id === id ? { ...note, content } : note))
    );
  };

  const updateNotePosition = (id: string, x: number, y: number) => {
    setNotes((prevNotes) =>
      prevNotes.map((note) => (note.id === id ? { ...note, x, y } : note))
    );
  };

  const updateImagePosition = (id: string, x: number, y: number) => {
    setImages((prevImages) =>
      prevImages.map((image) => (image.id === id ? { ...image, x, y } : image))
    );
  };

  const deleteNote = (id: string) => {
    setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
  };

  const deleteImage = (id: string) => {
    setImages((prevImages) => prevImages.filter((image) => image.id !== id));
  };

  const updateNoteDimensions = (id: string, width: number, height: number) => {
    setNotes((prevNotes) =>
      prevNotes.map((note) =>
        note.id === id ? { ...note, width, height } : note
      )
    );
  };

  const updateImageDimensions = (id: string, width: number, height: number) => {
    setImages((prevImages) =>
      prevImages.map((image) =>
        image.id === id ? { ...image, width, height } : image
      )
    );
  };

  const updateNoteColor = (id: string, color: string) => {
    setNotes((prevNotes) =>
      prevNotes.map((note) => (note.id === id ? { ...note, color } : note))
    );
  };

  const updateNoteImage = (id: string, image: string) => {
    setNotes((prevNotes) =>
      prevNotes.map((note) => (note.id === id ? { ...note, image } : note))
    );
  };

  const removeNoteImage = (id: string) => {
    setNotes((prevNotes) =>
      prevNotes.map((note) =>
        note.id === id ? { ...note, image: undefined } : note
      )
    );
  };

  return (
    <CanvasContext.Provider
      value={{
        scale,
        setScale,
        positionX,
        positionY,
        setPosition,
        notes,
        images,
        addNote,
        addImage,
        updateNote,
        updateNotePosition,
        updateImagePosition,
        deleteNote,
        deleteImage,
        updateNoteDimensions,
        updateImageDimensions,
        updateNoteColor,
        updateNoteImage,
        removeNoteImage,
      }}
    >
      {children}
    </CanvasContext.Provider>
  );
};

export const useCanvas = () => {
  const context = useContext(CanvasContext);
  if (!context) {
    throw new Error("useCanvas must be used within a CanvasProvider");
  }
  return context;
};
