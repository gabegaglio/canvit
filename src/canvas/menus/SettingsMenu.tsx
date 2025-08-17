import React from "react";

interface SettingsMenuProps {
  closeSettings: () => void;
  theme: "light" | "dark";
  onThemeToggle: () => void;
  showLogo: boolean;
  onLogoToggle: () => void;
  elementRadius: number;
  noteMargin: number;
  imageMargin: number;
  onElementRadiusChange: (radius: number) => void;
  onNoteMarginChange: (margin: number) => void;
  onImageMarginChange: (margin: number) => void;
  onResetSettings: () => void;
}

const SettingsMenu: React.FC<SettingsMenuProps> = ({
  closeSettings,
  theme,
  onThemeToggle,
  showLogo,
  onLogoToggle,
  elementRadius,
  noteMargin,
  imageMargin,
  onElementRadiusChange,
  onNoteMarginChange,
  onImageMarginChange,
  onResetSettings,
}) => {
  const isDark = theme === "dark";

  return (
    <div className="fixed top-8 left-8 z-[9998]">
      <div
        className={`backdrop-blur-2xl shadow-2xl rounded-2xl border min-w-[320px] max-w-[380px] overflow-hidden ${
          isDark ? "bg-black/80 border-gray-700" : "bg-white/20 border-white/30"
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between p-6 border-b ${
            isDark
              ? "border-gray-700 bg-gradient-to-r from-gray-800/50 to-gray-900/30"
              : "border-white/20 bg-gradient-to-r from-white/30 to-white/10"
          }`}
        >
          <div>
            <h2
              className={`text-xl font-bold drop-shadow-sm cursor-default ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              Settings
            </h2>
            <p
              className={`text-sm mt-1 drop-shadow-sm cursor-default ${
                isDark ? "text-gray-300" : "text-gray-800"
              }`}
            >
              Quick preferences
            </p>
          </div>
          <button
            onClick={closeSettings}
            className={`transition-colors p-2 rounded-full hover:bg-white/30 cursor-pointer ${
              isDark
                ? "text-gray-300 hover:text-white"
                : "text-gray-700 hover:text-gray-900"
            }`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div
          className={`p-6 space-y-6 ${
            isDark ? "bg-gray-900/50" : "bg-white/15"
          }`}
        >
          {/* Dark Mode Toggle */}
          <div className="space-y-3">
            <h3
              className={`text-md font-semibold border-b pb-2 drop-shadow-sm cursor-default ${
                isDark
                  ? "text-white border-gray-700"
                  : "text-gray-900 border-white/20"
              }`}
            >
              Theme
            </h3>
            <div className="flex items-center justify-between">
              <label
                className={`text-sm drop-shadow-sm cursor-pointer transition-colors ${
                  isDark
                    ? "text-gray-300 hover:text-white"
                    : "text-gray-800 hover:text-gray-900"
                }`}
              >
                Dark Mode
              </label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={theme === "dark"}
                  onChange={onThemeToggle}
                />
                <div className="w-11 h-6 bg-gray-400 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-400 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
              </label>
            </div>
          </div>

          {/* Logo Toggle */}
          <div className="space-y-3">
            <h3
              className={`text-md font-semibold border-b pb-2 drop-shadow-sm cursor-default ${
                isDark
                  ? "text-white border-gray-700"
                  : "text-gray-900 border-white/20"
              }`}
            >
              Display
            </h3>
            <div className="flex items-center justify-between">
              <label
                className={`text-sm drop-shadow-sm cursor-pointer transition-colors ${
                  isDark
                    ? "text-gray-300 hover:text-white"
                    : "text-gray-800 hover:text-gray-900"
                }`}
              >
                Show Logo
              </label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={showLogo}
                  onChange={onLogoToggle}
                />
                <div className="w-11 h-6 bg-gray-400 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-400 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
              </label>
            </div>
          </div>

          {/* Styling Controls */}
          <div className="space-y-3">
            <h3
              className={`text-md font-semibold border-b pb-2 drop-shadow-sm cursor-default ${
                isDark
                  ? "text-white border-gray-700"
                  : "text-gray-900 border-white/20"
              }`}
            >
              Styling
            </h3>

            {/* Element Radius */}
            <div className="space-y-2">
              <label
                className={`text-sm drop-shadow-sm cursor-pointer transition-colors ${
                  isDark
                    ? "text-gray-300 hover:text-white"
                    : "text-gray-800 hover:text-gray-900"
                }`}
              >
                Element Radius: {elementRadius}px
              </label>
              <input
                type="range"
                min="0"
                max="50"
                step="1"
                value={elementRadius}
                onChange={(e) => onElementRadiusChange(Number(e.target.value))}
                className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${
                  isDark
                    ? "bg-gray-700 slider-thumb-dark"
                    : "bg-gray-200 slider-thumb-light"
                }`}
              />
            </div>

            {/* Note Margin */}
            <div className="space-y-2">
              <label
                className={`text-sm drop-shadow-sm cursor-pointer transition-colors ${
                  isDark
                    ? "text-gray-300 hover:text-white"
                    : "text-gray-800 hover:text-gray-900"
                }`}
              >
                Note Margin: {noteMargin}px
              </label>
              <input
                type="range"
                min="0"
                max="32"
                step="2"
                value={noteMargin}
                onChange={(e) => onNoteMarginChange(Number(e.target.value))}
                className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${
                  isDark
                    ? "bg-gray-700 slider-thumb-dark"
                    : "bg-gray-200 slider-thumb-light"
                }`}
              />
            </div>

            {/* Image Margin */}
            <div className="space-y-2">
              <label
                className={`text-sm drop-shadow-sm cursor-pointer transition-colors ${
                  isDark
                    ? "text-gray-300 hover:text-white"
                    : "text-gray-800 hover:text-gray-900"
                }`}
              >
                Image Margin: {imageMargin}px
              </label>
              <input
                type="range"
                min="0"
                max="32"
                step="2"
                value={imageMargin}
                onChange={(e) => onImageMarginChange(Number(e.target.value))}
                className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${
                  isDark
                    ? "bg-gray-700 slider-thumb-dark"
                    : "bg-gray-200 slider-thumb-light"
                }`}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`flex justify-between items-center p-6 border-t ${
            isDark
              ? "border-gray-700 bg-gradient-to-r from-gray-800/50 to-gray-900/30"
              : "border-white/20 bg-gradient-to-r from-white/30 to-white/10"
          }`}
        >
          <button
            onClick={onResetSettings}
            className={`px-4 py-2 text-sm font-medium transition-all duration-200 cursor-pointer rounded-md ${
              isDark
                ? "bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl"
                : "bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl"
            }`}
          >
            Reset
          </button>
          <button
            onClick={closeSettings}
            className="px-6 py-2 text-sm font-medium bg-blue-500 text-white hover:bg-blue-600 shadow-lg hover:shadow-xl rounded-md transition-all duration-200 cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsMenu;
