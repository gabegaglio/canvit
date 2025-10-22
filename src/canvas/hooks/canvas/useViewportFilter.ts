import { useMemo } from "react";

interface Viewport {
  x: number;
  y: number;
  scale: number;
}

interface SizedElement {
  x: number;
  y: number;
  width: number;
  height: number;
}

const paddingDefault = 500;

const isInViewport = (
  element: SizedElement,
  viewport: Viewport,
  padding: number
) => {
  if (typeof window === "undefined") {
    return true;
  }

  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  const screenX = element.x * viewport.scale + viewport.x;
  const screenY = element.y * viewport.scale + viewport.y;
  const screenWidth = element.width * viewport.scale;
  const screenHeight = element.height * viewport.scale;

  return (
    screenX + screenWidth >= -padding &&
    screenX <= windowWidth + padding &&
    screenY + screenHeight >= -padding &&
    screenY <= windowHeight + padding
  );
};

export const useViewportFilter = <T extends SizedElement>(
  elements: T[],
  viewport: Viewport,
  padding: number = paddingDefault
): T[] => {
  const { x, y, scale } = viewport;

  const result = useMemo(() => {
    if (typeof window === "undefined") {
      return elements;
    }

    return elements.filter((element) =>
      isInViewport(element, { x, y, scale }, padding)
    );
  }, [elements, x, y, scale, padding]);

  return result;
};
