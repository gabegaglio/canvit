import React from "react";

interface AddButtonProps {
  onClick: () => void;
  theme: "light" | "dark";
}

const AddButton: React.FC<AddButtonProps> = ({ onClick, theme }) => {
  const isDark = theme === "dark";

  return (
    <button onClick={onClick} className="glass-icon-button" title="Add Note">
      <div className="w-6 h-6 flex items-center justify-center">
        <svg
          className={`w-6 h-6 ${isDark ? "text-white" : "text-black"}`}
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
