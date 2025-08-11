import React, { useState } from "react";
import { useNoteResize, type ResizeHandle } from "../hooks/note";
import { useElementPosition } from "../hooks/canvas";
import { useDrag } from "@use-gesture/react";
import { useGridSnap } from "../hooks/canvas";
import SnapGuide from "./SnapGuide";
import { BOX_SIZE } from "../constants";
import { useImageContextMenu } from "../hooks/image";
import { Portal } from "../utils/PortalHelper";
import ImageContextMenu from "../menus/ImageContextMenu";

interface ImageProps {
  id?: string;
  className?: string;
  style?: React.CSSProperties;
  onDragEnd?: (id: string, x: number, y: number) => void;
  onResize?: (id: string, width: number, height: number) => void;
  scale?: number;
  width?: number;
  height?: number;
  src: string;
  gridState?: "off" | "lines" | "snap";
  gridSize?: number;
  onImageRightClick?: () => void;
  theme: "light" | "dark";
  radius?: number; // Border radius in pixels
  padding?: number; // Padding in pixels
  margin?: number; // Margin in pixels
}

const Image: React.FC<ImageProps> = ({
  id,
  className,
  style,
  onDragEnd,
  onResize,
  scale = 1,
  width: propWidth,
  height: propHeight,
  src,
  gridState = "off",
  gridSize = BOX_SIZE,
  onImageRightClick,
  theme,
  radius = 8,
  padding = 0,
  margin = 0,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isHoveringHandle, setIsHoveringHandle] = useState<ResizeHandle | null>(
    null
  );

  // Use image context menu hook
  const { contextMenu, handleRightClick, handleCloseContextMenu } =
    useImageContextMenu({
      id,
      onImageRightClick,
    });

  // Initialize resize hook
  const {
    dimensions,
    position,
    isResizing,
    updateDimensions,
    updatePosition,
    bindResize,
    getResizeCursor,
  } = useNoteResize({
    id,
    scale,
    initialWidth: propWidth || 300,
    initialHeight: propHeight || 200,
    initialX: (style?.left as number) || 0,
    initialY: (style?.top as number) || 0,
    onResize,
    onPositionChange: onDragEnd,
    content: "", // Images don't need content
  });

  // Use grid snap hook
  const { snapPosition, snapDimensions, showSnapGuide } = useGridSnap({
    x: position.x,
    y: position.y,
    width: dimensions.width,
    height: dimensions.height,
    gridSize,
    gridState,
    isDragging,
    isResizing,
  });

  useElementPosition(
    propWidth,
    propHeight,
    updateDimensions,
    style,
    position,
    updatePosition
  );

  const bindDrag = useDrag(
    ({ movement: [mx, my], first, last, memo, event, type }) => {
      if (isResizing || isHoveringHandle) return;
      if (type === "mousedown" && (event as MouseEvent).button !== 0) return;

      if (first) {
        setIsDragging(true);
        return { initialX: position.x, initialY: position.y };
      }

      const adjustedMx = mx / scale;
      const adjustedMy = my / scale;
      const x = memo.initialX + adjustedMx;
      const y = memo.initialY + adjustedMy;

      updatePosition(x, y);

      if (last) {
        setIsDragging(false);
        const isGridActive = gridState !== "off";
        const finalX = isGridActive ? snapPosition.x : x;
        const finalY = isGridActive ? snapPosition.y : y;
        updatePosition(finalX, finalY);
        if (id && onDragEnd) {
          onDragEnd(id, finalX, finalY);
        }
      }
      return memo;
    },
    {
      preventDefault: true,
      filterTaps: true,
      shouldSnap: gridState !== "off",
    }
  );

  const createHandleProps = (handle: ResizeHandle) => {
    const resizeBindings = bindResize(handle, (newDimensions, newPosition) => {
      if (gridState !== "off" && !isDragging) {
        return {
          width: newDimensions.width,
          height: newDimensions.height,
          x: newPosition.x,
          y: newPosition.y,
          snapWidth: snapDimensions.width,
          snapHeight: snapDimensions.height,
          snapX: snapPosition.x,
          snapY: snapPosition.y,
          shouldSnap: true,
        };
      }
      return {
        width: newDimensions.width,
        height: newDimensions.height,
        x: newPosition.x,
        y: newPosition.y,
        shouldSnap: false,
      };
    });

    return {
      ...resizeBindings(),
      onMouseEnter: () => setIsHoveringHandle(handle),
      onMouseLeave: () => setIsHoveringHandle(null),
    };
  };

  const getCursor = () => {
    if (isResizing) return getResizeCursor() || "grab";
    if (isHoveringHandle) {
      switch (isHoveringHandle) {
        case "topLeft":
          return "nwse-resize";
        case "topRight":
          return "nesw-resize";
        case "bottomLeft":
          return "nesw-resize";
        case "bottomRight":
          return "nwse-resize";
        default:
          return "nwse-resize";
      }
    }
    if (isDragging) return "grabbing";
    return "grab";
  };

  const combinedStyle = {
    ...style,
    left: position.x,
    top: position.y,
    width: dimensions.width,
    height: dimensions.height,
    cursor: getCursor(),
    userSelect: "none" as const,
    touchAction: "none" as const,
    position: "absolute" as const,
    backgroundColor: "transparent",
    border: "none",
  };

  return (
    <>
      <SnapGuide
        position={snapPosition}
        dimensions={snapDimensions}
        show={showSnapGuide && gridState !== "off"}
      />
      <div
        className={`image-container relative ${className}`}
        style={{
          ...combinedStyle,
          borderRadius: `${radius}px`,
          padding: `${padding}px`,
        }}
        {...bindDrag()}
        onContextMenu={handleRightClick}
      >
        <img
          src={src}
          alt="Canvas image"
          className="w-full h-full object-cover"
          style={{
            borderRadius: `${radius}px`,
            position: "absolute",
            left: `${margin}px`,
            top: `${margin}px`,
            width: `calc(100% - ${margin * 2}px)`,
            height: `calc(100% - ${margin * 2}px)`,
          }}
          draggable={false}
        />

        {/* Resize handles on all four corners */}
        {/* Top-left corner */}
        <div
          className="absolute w-3 h-3 cursor-nwse-resize z-10 opacity-0 hover:opacity-100 transition-opacity"
          style={{
            left: `${margin + 2}px`,
            top: `${margin + 2}px`,
            touchAction: "none",
          }}
          {...createHandleProps("topLeft")}
        >
          <div className="w-full h-full bg-white/80 rounded-sm border border-gray-300/50"></div>
        </div>

        {/* Top-right corner */}
        <div
          className="absolute w-3 h-3 cursor-nesw-resize z-10 opacity-0 hover:opacity-100 transition-opacity"
          style={{
            right: `${margin + 2}px`,
            top: `${margin + 2}px`,
            touchAction: "none",
          }}
          {...createHandleProps("topRight")}
        >
          <div className="w-full h-full bg-white/80 rounded-sm border border-gray-300/50"></div>
        </div>

        {/* Bottom-left corner */}
        <div
          className="absolute w-3 h-3 cursor-nesw-resize z-10 opacity-0 hover:opacity-100 transition-opacity"
          style={{
            left: `${margin + 2}px`,
            bottom: `${margin + 2}px`,
            touchAction: "none",
          }}
          {...createHandleProps("bottomLeft")}
        >
          <div className="w-full h-full bg-white/80 rounded-sm border border-gray-300/50"></div>
        </div>

        {/* Bottom-right corner */}
        <div
          className="absolute w-3 h-3 cursor-nwse-resize z-10 opacity-0 hover:opacity-100 transition-opacity"
          style={{
            right: `${margin + 2}px`,
            bottom: `${margin + 2}px`,
            touchAction: "none",
          }}
          {...createHandleProps("bottomRight")}
        >
          <div className="w-full h-full bg-white/80 rounded-sm border border-gray-300/50"></div>
        </div>
      </div>

      {/* Render context menu if open */}
      {contextMenu && id && (
        <Portal>
          <ImageContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            imageId={id}
            onClose={handleCloseContextMenu}
            theme={theme}
          />
        </Portal>
      )}
    </>
  );
};

export default Image;
