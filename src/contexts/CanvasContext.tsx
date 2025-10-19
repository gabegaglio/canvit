import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

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

interface CanvasText {
  id: string;
  x: number;
  y: number;
  content: string;
  width?: number;
  height?: number;
  color?: string;
}

interface CanvasContextType {
  scale: number;
  setScale: (scale: number) => void;
  positionX: number;
  positionY: number;
  setPosition: (x: number, y: number) => void;
  notes: Note[];
  images: CanvasImage[];
  texts: CanvasText[];
  addNote: (note: Omit<Note, "id">) => void;
  addImage: (image: Omit<CanvasImage, "id">) => void;
  addText: (text: Omit<CanvasText, "id">) => void;
  updateNote: (id: string, content: string) => void;
  updateText: (id: string, content: string) => void;
  updateNotePosition: (id: string, x: number, y: number) => void;
  updateImagePosition: (id: string, x: number, y: number) => void;
  updateTextPosition: (id: string, x: number, y: number) => void;
  deleteNote: (id: string) => void;
  deleteImage: (id: string) => void;
  deleteText: (id: string) => void;
  updateNoteDimensions: (id: string, width: number, height: number) => void;
  updateTextDimensions: (id: string, width: number, height: number) => void;
  updateImageDimensions: (id: string, width: number, height: number) => void;
  updateNoteColor: (id: string, color: string) => void;
  updateNoteImage: (id: string, image: string) => void;
  removeNoteImage: (id: string) => void; // Added method to remove image from note
  isAnyNoteEditing: boolean; // Track if any note is being edited
  setNoteEditing: (id: string, isEditing: boolean) => void; // Set editing state for a note
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
  const [texts, setTexts] = useState<CanvasText[]>([]);
  const [editingNotes, setEditingNotes] = useState<Set<string>>(new Set());

  useEffect(() => {
    setPositionX(window.innerWidth / 2 - CANVAS_SIZE / 2);
    setPositionY(window.innerHeight / 2 - CANVAS_SIZE / 2);
  }, []);

  const setPosition = useCallback((x: number, y: number) => {
    setPositionX(x);
    setPositionY(y);
  }, []);

  const addNote = useCallback((note: Omit<Note, "id">) => {
    const id = Date.now().toString();
    const noteWithDefaults = {
      ...note,
      width: note.width || 200,
      height: note.height || 150,
    };
    setNotes((prevNotes) => [...prevNotes, { ...noteWithDefaults, id }]);
  }, []);

  const addImage = useCallback((image: Omit<CanvasImage, "id">) => {
    const id = Date.now().toString();
    const imageWithDefaults = {
      ...image,
      width: image.width || 300,
      height: image.height || 200,
    };
    setImages((prevImages) => [...prevImages, { ...imageWithDefaults, id }]);
  }, []);

  const addText = useCallback((text: Omit<CanvasText, "id">) => {
    const id = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString();
    const textWithDefaults = {
      ...text,
      width: text.width || 100,
      height: text.height || 24, // Updated to match our new default
    };
    setTexts((prevTexts) => [...prevTexts, { ...textWithDefaults, id }]);
  }, []);

  const updateNote = useCallback((id: string, content: string) => {
    setNotes((prevNotes) =>
      prevNotes.map((note) => (note.id === id ? { ...note, content } : note))
    );
  }, []);

  const updateText = useCallback((id: string, content: string) => {
    setTexts((prevTexts) =>
      prevTexts.map((text) => (text.id === id ? { ...text, content } : text))
    );
  }, []);

  const updateNotePosition = useCallback((id: string, x: number, y: number) => {
    setNotes((prevNotes) =>
      prevNotes.map((note) => (note.id === id ? { ...note, x, y } : note))
    );
  }, []);

  const updateImagePosition = useCallback((id: string, x: number, y: number) => {
    setImages((prevImages) =>
      prevImages.map((image) => (image.id === id ? { ...image, x, y } : image))
    );
  }, []);

  const updateTextPosition = useCallback((id: string, x: number, y: number) => {
    setTexts((prevTexts) =>
      prevTexts.map((text) => (text.id === id ? { ...text, x, y } : text))
    );
  }, []);

  const deleteNote = useCallback((id: string) => {
    setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
  }, []);

  const deleteImage = useCallback((id: string) => {
    setImages((prevImages) => prevImages.filter((image) => image.id !== id));
  }, []);

  const deleteText = useCallback((id: string) => {
    setTexts((prevTexts) => prevTexts.filter((text) => text.id !== id));
  }, []);

  const updateNoteDimensions = useCallback((id: string, width: number, height: number) => {
    setNotes((prevNotes) =>
      prevNotes.map((note) =>
        note.id === id ? { ...note, width, height } : note
      )
    );
  }, []);

  const updateTextDimensions = useCallback((id: string, width: number, height: number) => {
    setTexts((prevTexts) =>
      prevTexts.map((text) =>
        text.id === id ? { ...text, width, height } : text
      )
    );
  }, []);

  const updateImageDimensions = useCallback((id: string, width: number, height: number) => {
    setImages((prevImages) =>
      prevImages.map((image) =>
        image.id === id ? { ...image, width, height } : image
      )
    );
  }, []);

  const updateNoteColor = useCallback((id: string, color: string) => {
    setNotes((prevNotes) =>
      prevNotes.map((note) => (note.id === id ? { ...note, color } : note))
    );
  }, []);

  const updateNoteImage = useCallback((id: string, image: string) => {
    setNotes((prevNotes) =>
      prevNotes.map((note) => (note.id === id ? { ...note, image } : note))
    );
  }, []);

  const removeNoteImage = useCallback((id: string) => {
    setNotes((prevNotes) =>
      prevNotes.map((note) =>
        note.id === id ? { ...note, image: undefined } : note
      )
    );
  }, []);

  // Track note editing state
  const isAnyNoteEditing = editingNotes.size > 0;

  const setNoteEditing = useCallback((id: string, isEditing: boolean) => {
    setEditingNotes((prev) => {
      const newSet = new Set(prev);
      if (isEditing) {
        newSet.add(id);
      } else {
        newSet.delete(id);
      }
      return newSet;
    });
  }, []);

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
        texts,
        addNote,
        addImage,
        addText,
        updateNote,
        updateText,
        updateNotePosition,
        updateImagePosition,
        updateTextPosition,
        deleteNote,
        deleteImage,
        deleteText,
        updateNoteDimensions,
        updateTextDimensions,
        updateImageDimensions,
        updateNoteColor,
        updateNoteImage,
        removeNoteImage,
        isAnyNoteEditing,
        setNoteEditing,
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
