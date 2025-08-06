import React, { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

interface Note {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
}

interface CanvasContextType {
  scale: number;
  setScale: (scale: number) => void;
  positionX: number;
  positionY: number;
  setPosition: (x: number, y: number) => void;
  notes: Note[];
  addNote: (note: Omit<Note, "id">) => void;
  updateNote: (id: string, content: string) => void;
  updateNotePosition: (id: string, x: number, y: number) => void;
  updateNoteDimensions: (id: string, width: number, height: number) => void;
  deleteNote: (id: string) => void;
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
    setNotes((prevNotes) => [...prevNotes, { ...note, id }]);
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

  const updateNoteDimensions = (id: string, width: number, height: number) => {
    setNotes((prevNotes) =>
      prevNotes.map((note) =>
        note.id === id ? { ...note, width, height } : note
      )
    );
  };

  const deleteNote = (id: string) => {
    setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
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
        addNote,
        updateNote,
        updateNotePosition,
        updateNoteDimensions,
        deleteNote,
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
