import React, { useState } from "react";

interface DebugPanelProps {
  isEnabled?: boolean;
  scale: number;
  positionX: number;
  positionY: number;
  gridState?: "off" | "lines" | "snap";
  hasContextMenu?: boolean;
  additionalInfo?: Record<string, string | number | boolean>;
  theme: "light" | "dark";
}

const DebugPanel: React.FC<DebugPanelProps> = ({
  isEnabled = false, // Hidden by default
  scale,
  positionX,
  positionY,
  gridState = "off",
  hasContextMenu,
  additionalInfo = {},
  theme,
}) => {
  const [showDebug, setShowDebug] = useState(false);
  const isDark = theme === "dark";

  if (!isEnabled) return null;

  return (
    <>
      {/* Debug button */}
      <button
        className={`fixed bottom-4 left-4 px-3 py-1 rounded z-50 backdrop-blur-2xl shadow-2xl border transition-all duration-200 cursor-pointer ${
          isDark
            ? "bg-black/80 border-gray-700 text-white hover:bg-white/20"
            : "bg-white/20 border-white/30 text-gray-900 hover:bg-white/30"
        }`}
        onClick={() => setShowDebug(!showDebug)}
        style={{ zIndex: 9999 }}
      >
        Debug
      </button>

      {/* Debug overlay */}
      {showDebug && (
        <div
          className={`fixed bottom-16 left-4 p-4 rounded-lg shadow-2xl z-50 backdrop-blur-2xl border min-w-[280px] ${
            isDark
              ? "bg-black/80 border-gray-700 text-white"
              : "bg-white/20 border-white/30 text-gray-900"
          }`}
          style={{ zIndex: 9999 }}
        >
          <h3
            className={`font-bold mb-2 ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            Debug Info
          </h3>
          <p className={isDark ? "text-gray-300" : "text-gray-700"}>
            Scale: {scale.toFixed(2)}
          </p>
          <p className={isDark ? "text-gray-300" : "text-gray-700"}>
            Position: {positionX.toFixed(0)}, {positionY.toFixed(0)}
          </p>
          <p className={isDark ? "text-gray-300" : "text-gray-700"}>
            Grid: {gridState}
          </p>
          <p className={isDark ? "text-gray-300" : "text-gray-700"}>
            Context Menu: {hasContextMenu ? "Open" : "Closed"}
          </p>
          {Object.entries(additionalInfo).map(([key, value]) => (
            <p key={key} className={isDark ? "text-gray-300" : "text-gray-700"}>
              {key}:{" "}
              {typeof value === "object"
                ? JSON.stringify(value)
                : String(value)}
            </p>
          ))}
          <button
            className={`mt-2 px-2 py-1 rounded transition-all duration-200 cursor-pointer ${
              isDark
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
            onClick={() => {
              // console.log("Canvas state:", {
              //   scale,
              //   positionX,
              //   positionY,
              //   gridState,
              //   hasContextMenu,
              //   ...additionalInfo,
              // });
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
