import React, { forwardRef } from "react";

interface TextInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onSelect: (e: React.SyntheticEvent<HTMLTextAreaElement>) => void;
  onBlur: () => void;
  width: number;
  height: number;
  theme: "light" | "dark";
  color?: string;
  placeholder?: string;
  autoFocus?: boolean;
}

export const TextInput = forwardRef<HTMLTextAreaElement, TextInputProps>(
  (
    {
      value,
      onChange,
      onKeyDown,
      onSelect,
      onBlur,
      width,
      height,
      theme,
      color,
      placeholder = "Type here...",
      autoFocus = false,
    },
    ref
  ) => {
    const textColor = color || (theme === "dark" ? "#ffffff" : "#000000");
    const borderColor =
      theme === "dark" ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)";

    return (
      <textarea
        ref={ref}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onSelect={onSelect}
        onBlur={onBlur}
        placeholder={placeholder}
        autoFocus={autoFocus}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        className="outline-none resize-none bg-transparent rounded border"
        style={{
          color: textColor,
          width: `${width}px`,
          height: `${height}px`,
          minWidth: "80px",
          minHeight: "24px",
          border: `1px solid ${borderColor}`,
          fontFamily: "inherit",
          fontSize: "inherit",
          lineHeight: "1.4", // Increased line height for better text visibility
          padding: "12px", // Increased padding to ensure no text cut-off
          userSelect: "text",
          cursor: "text",
          resize: "none",
          overflow: "hidden",
          wordBreak: "keep-all", // Prevent text wrapping
          whiteSpace: "nowrap", // Keep text on single line
        }}
      />
    );
  }
);

TextInput.displayName = "TextInput";
