import React, { useState, useEffect } from "react";

interface ZoomIndicatorProps {
  scale: number;
  theme: "light" | "dark";
}

const ZoomIndicator: React.FC<ZoomIndicatorProps> = ({ scale, theme }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const isDark = theme === "dark";

  // Calculate zoom percentage
  const zoomPercentage = Math.round(scale * 100);

  useEffect(() => {
    // Show indicator when scale changes
    setIsVisible(true);

    // Clear existing timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Hide indicator after 2 seconds
    const newTimeoutId = setTimeout(() => {
      setIsVisible(false);
    }, 2000);

    setTimeoutId(newTimeoutId);

    // Cleanup on unmount
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [scale]);

  return (
    <div className="fixed top-4 right-4 z-50 pointer-events-none">
      <div
        className={`px-3 py-2 rounded-lg transition-all duration-500 ease-in-out backdrop-blur-2xl shadow-2xl border ${
          isVisible ? "opacity-100" : "opacity-0"
        } ${
          isDark
            ? "bg-black/80 border-gray-700 text-white"
            : "bg-white/20 border-white/30 text-gray-900"
        }`}
      >
        <span className="text-sm font-medium">{zoomPercentage}%</span>
      </div>
    </div>
  );
};

export default ZoomIndicator;
