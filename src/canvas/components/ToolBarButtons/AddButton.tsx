import React from "react";

interface AddButtonProps {
  onClick: () => void;
  theme: "light" | "dark";
}

const AddButton: React.FC<AddButtonProps> = ({ onClick, theme }) => {
  const isDark = theme === "dark";

  return (
    <button
      onClick={onClick}
      className={`backdrop-blur-xl shadow-md w-9 h-9 rounded-md flex items-center justify-center text-lg transition-all duration-200 cursor-pointer hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-md ${
        isDark
          ? "bg-transparent border border-transparent hover:border-white/30 hover:bg-blue-500/20 text-white/80"
          : "bg-transparent border border-transparent hover:border-black/30 hover:bg-blue-500/20 text-black/80"
      }`}
      title="Add Note"
    >
      <div className="w-5 h-5 flex items-center justify-center">
        <svg
          className={`w-5 h-5 ${isDark ? "text-white" : "text-black"}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
      </div>
    </button>
  );
};

export default AddButton;
