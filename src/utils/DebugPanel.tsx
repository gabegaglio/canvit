import React, { useState } from "react";

interface DebugPanelProps {
  isEnabled?: boolean;
  scale: number;
  positionX: number;
  positionY: number;
  gridState?: "off" | "lines" | "snap";
  hasContextMenu?: boolean;
  additionalInfo?: Record<string, any>;
}

const DebugPanel: React.FC<DebugPanelProps> = ({
  isEnabled = false, // Hidden by default
  scale,
  positionX,
  positionY,
  gridState = "off",
  hasContextMenu,
  additionalInfo = {},
}) => {
  const [showDebug, setShowDebug] = useState(false);

  if (!isEnabled) return null;

  return (
    <>
      {/* Debug button */}
      <button
        className="fixed bottom-4 left-4 bg-red-500 text-white px-3 py-1 rounded z-50"
        onClick={() => setShowDebug(!showDebug)}
        style={{ zIndex: 9999 }}
      >
        Debug
      </button>

      {/* Debug overlay */}
      {showDebug && (
        <div
          className="fixed bottom-16 left-4 bg-white p-4 rounded shadow-lg z-50"
          style={{ zIndex: 9999 }}
        >
          <h3 className="font-bold mb-2">Debug Info</h3>
          <p>Scale: {scale.toFixed(2)}</p>
          <p>
            Position: {positionX.toFixed(0)}, {positionY.toFixed(0)}
          </p>
          <p>Grid: {gridState}</p>
          <p>Context Menu: {hasContextMenu ? "Open" : "Closed"}</p>
          {Object.entries(additionalInfo).map(([key, value]) => (
            <p key={key}>
              {key}:{" "}
              {typeof value === "object"
                ? JSON.stringify(value)
                : String(value)}
            </p>
          ))}
          <button
            className="mt-2 px-2 py-1 bg-blue-500 text-white rounded"
            onClick={() => {
              console.log("Canvas state:", {
                scale,
                positionX,
                positionY,
                gridState,
                hasContextMenu,
                ...additionalInfo,
              });
            }}
          >
            Log to Console
          </button>
        </div>
      )}
    </>
  );
};

export default DebugPanel;
