import React, { useState } from "react";
import { useImageResize } from "../hooks/image";
import { useElementPosition } from "../../utils/dragUtils";
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
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isHoveringImage, setIsHoveringImage] = useState(false);

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
  } = useImageResize({
    id,
    scale,
    initialWidth: propWidth || 300,
    initialHeight: propHeight || 200,
    initialX: (style?.left as number) || 0,
    initialY: (style?.top as number) || 0,
    onResize,
    onPositionChange: onDragEnd,
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
      if (isResizing) return;
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

  const createHandleProps = () => {
    const resizeBindings = bindResize(
      "bottomRight",
      (newDimensions, newPosition) => {
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
      }
    );

    return resizeBindings();
  };

  const getCursor = () => {
    if (isResizing) return getResizeCursor() || "grab";
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
  };

  return (
    <>
      <SnapGuide
        position={snapPosition}
        dimensions={snapDimensions}
        show={showSnapGuide && gridState !== "off"}
      />
      <div
        className={`image-container backdrop-blur-lg shadow-lg relative ${className}`}
        style={{
          ...combinedStyle,
          borderRadius: `${radius}px`,
          padding: `${padding}px`,
        }}
        {...bindDrag()}
        onContextMenu={handleRightClick}
        onMouseEnter={() => setIsHoveringImage(true)}
        onMouseLeave={() => setIsHoveringImage(false)}
      >
        <img
          src={src}
          alt="Canvas image"
          className="w-full h-full object-cover"
          style={{ borderRadius: `${radius}px` }}
          draggable={false}
        />

        {/* Resize handle */}
        <div
          className={`absolute w-6 h-6 cursor-nwse-resize z-10 transition-opacity duration-200 ${
            isHoveringImage ? "opacity-100" : "opacity-0"
          }`}
          style={{
            bottom: `${Math.max(4, radius / 2)}px`,
            right: `${Math.max(4, radius / 2)}px`,
          }}
          {...createHandleProps()}
        >
          <svg
            className="w-full h-full opacity-50"
            viewBox="0 0 24 24"
            fill="currentColor"
            style={{ color: "black" }}
          >
            <path d="M22,22H20V20H22V22M22,18H20V16H22V18M18,22H16V20H18V22M18,18H16V16H18V18M14,22H12V20H14V22M22,14H20V12H22V14Z" />
          </svg>
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
