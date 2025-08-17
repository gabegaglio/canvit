import React from "react";

interface SettingsButtonProps {
  onClick: () => void;
  theme: "light" | "dark";
}

const SettingsButton: React.FC<SettingsButtonProps> = ({ onClick, theme }) => {
  const isDark = theme === "dark";

  return (
    <button
      onClick={onClick}
      className={`backdrop-blur-xl shadow-md w-9 h-9 rounded-md flex items-center justify-center text-lg transition-all duration-200 cursor-pointer hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-md ${
        isDark
          ? "bg-transparent border border-transparent hover:border-white/30 hover:bg-blue-500/20 text-white/80"
          : "bg-transparent border border-transparent hover:border-black/30 hover:bg-blue-500/20 text-black/80"
      }`}
      title="Settings"
    >
      <div className="w-5 h-5 flex items-center justify-center">
        <svg
          className={`w-4 h-4 ${isDark ? "text-white" : "text-black"}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </div>
    </button>
  );
};

export default SettingsButton;
