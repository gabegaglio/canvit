import { useCallback, useRef, useEffect, useMemo } from "react";

interface UseTextSizingProps {
  content: string;
  fontFamily: string;
  fontSize: number;
  onWidthChange: (width: number) => void;
  onHeightChange?: (height: number) => void;
  padding?: number;
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
}

interface TextMeasurement {
  width: number;
  height: number;
  baseline: number;
}

export const useTextSizing = ({
  content,
  fontFamily,
  fontSize,
  onWidthChange,
  onHeightChange,
  padding = 32, // Increased padding to ensure no text cut-off
  minWidth = 0,
  maxWidth = Infinity,
  minHeight = 0,
  maxHeight = Infinity,
}: UseTextSizingProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const measurementCache = useRef<Map<string, TextMeasurement>>(new Map());

  // Create and configure canvas for text measurement
  const getCanvas = useCallback(() => {
    if (!canvasRef.current) {
      canvasRef.current = document.createElement("canvas");
      canvasRef.current.style.position = "absolute";
      canvasRef.current.style.visibility = "hidden";
      canvasRef.current.style.pointerEvents = "none";
      document.body.appendChild(canvasRef.current);
    }
    return canvasRef.current;
  }, []);

  // Measure text using HTML5 Canvas API with generous measurements
  const measureText = useCallback(
    (text: string): TextMeasurement => {
      const canvas = getCanvas();
      const context = canvas.getContext("2d");

      if (!context) {
        // Fallback for browsers without Canvas API
        return {
          width: text.length * 10, // More generous fallback
          height: fontSize * 1.5, // More generous height
          baseline: fontSize * 0.8,
        };
      }

      // Set font for measurement
      context.font = `${fontSize}px ${fontFamily}`;

      // Measure text metrics
      const metrics = context.measureText(text);

      // Calculate full height including descenders and ascenders with generous margins
      const actualHeight =
        (metrics.actualBoundingBoxAscent || fontSize * 0.8) +
        (metrics.actualBoundingBoxDescent || fontSize * 0.2);

      // Add generous margins to ensure no text is cut off
      const safeHeight = Math.max(actualHeight * 1.3, fontSize * 1.5);

      return {
        width: metrics.width,
        height: safeHeight,
        baseline: metrics.actualBoundingBoxAscent || fontSize * 0.8,
      };
    },
    [fontFamily, fontSize, getCanvas]
  );

  // Calculate optimal width with generous padding
  const calculateWidth = useCallback(
    (text: string): number => {
      // Check cache first
      const cacheKey = `${text}_${fontFamily}_${fontSize}`;
      if (measurementCache.current.has(cacheKey)) {
        const cached = measurementCache.current.get(cacheKey)!;
        // Use generous padding to ensure no text cut-off
        return Math.max(cached.width + padding, minWidth);
      }

      // Measure and cache
      const measurement = measureText(text);
      measurementCache.current.set(cacheKey, measurement);

      // Calculate final width with generous padding
      const contentWidth = measurement.width + padding;
      const finalWidth = Math.max(Math.min(contentWidth, maxWidth), minWidth);

      return finalWidth;
    },
    [measureText, padding, minWidth, maxWidth]
  );

  // Calculate optimal height with generous padding
  const calculateHeight = useCallback(
    (text: string): number => {
      // Check cache first
      const cacheKey = `${text}_${fontFamily}_${fontSize}`;
      if (measurementCache.current.has(cacheKey)) {
        const cached = measurementCache.current.get(cacheKey)!;
        // Use generous padding to ensure no text cut-off
        return Math.max(cached.height + padding, minHeight);
      }

      // Measure and cache
      const measurement = measureText(text);
      measurementCache.current.set(cacheKey, measurement);

      // Calculate final height with generous padding
      const contentHeight = measurement.height + padding;
      const finalHeight = Math.max(
        Math.min(contentHeight, maxHeight),
        minHeight
      );

      return finalHeight;
    },
    [measureText, padding, minHeight, maxHeight]
  );

  // Update width when content changes
  useEffect(() => {
    if (content !== undefined) {
      // Always update width, not just debounced
      const width = calculateWidth(content);
      onWidthChange(width);
    }
  }, [content, calculateWidth, onWidthChange]);

  // Update height when content changes
  useEffect(() => {
    if (content !== undefined) {
      const height = calculateHeight(content);
      onHeightChange?.(height);
    }
  }, [content, calculateHeight, onHeightChange]);

  // Cleanup canvas on unmount
  useEffect(() => {
    return () => {
      if (canvasRef.current && document.body.contains(canvasRef.current)) {
        document.body.removeChild(canvasRef.current);
      }
    };
  }, []);

  // Memoized current width and height
  const currentWidth = useMemo(() => {
    return calculateWidth(content);
  }, [content, calculateWidth]);

  const currentHeight = useMemo(() => {
    return calculateHeight(content);
  }, [content, calculateHeight]);

  return {
    currentWidth,
    currentHeight,
    measureText,
    calculateWidth,
    calculateHeight,
    clearCache: () => measurementCache.current.clear(),
  };
};
