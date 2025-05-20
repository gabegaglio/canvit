import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

interface CanvasContextType {
  scale: number;
  positionX: number;
  positionY: number;
  setScale: (s: number) => void;
  setPosition: (x: number, y: number) => void;
}

const CanvasContext = createContext<CanvasContextType | undefined>(undefined);

const CANVAS_SIZE = 100000;
const getInitialPosition = () => ({
  x: window.innerWidth / 2 - CANVAS_SIZE / 2,
  y: window.innerHeight / 2 - CANVAS_SIZE / 2,
});

export function CanvasProvider({ children }: { children: ReactNode }) {
  const [scale, setScale] = useState(1);
  const [position, setPositionState] = useState(getInitialPosition());

  const setPosition = (x: number, y: number) => setPositionState({ x, y });

  return (
    <CanvasContext.Provider
      value={{
        scale,
        positionX: position.x,
        positionY: position.y,
        setScale,
        setPosition,
      }}
    >
      {children}
    </CanvasContext.Provider>
  );
}

export function useCanvas() {
  const ctx = useContext(CanvasContext);
  if (!ctx) throw new Error("useCanvas must be used within a CanvasProvider");
  return ctx;
}
