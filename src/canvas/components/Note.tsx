import React from "react";

interface NoteProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const Note: React.FC<NoteProps> = ({ children, className, style }) => {
  return (
    <div
      className={`bg-white-200 backdrop-blur-lg rounded-lg shadow-lg p-4 text-black ${className}`}
      style={style}
    >
      {children}
    </div>
  );
};

export default Note;
