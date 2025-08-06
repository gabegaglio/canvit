import React from "react";
import plusIcon from "../../../assets/note.svg";

interface AddButtonProps {
  onClick: () => void;
}

const AddButton: React.FC<AddButtonProps> = ({ onClick }) => {
  return (
    <button onClick={onClick} className="glass-icon-button" title="Add Note">
      <img
        src={plusIcon}
        alt="Add Note"
        className="w-6 h-6 pointer-events-none select-none"
        draggable={false}
      />
    </button>
  );
};

export default AddButton;
