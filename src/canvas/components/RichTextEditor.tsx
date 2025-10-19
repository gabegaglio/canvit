import React from "react";

interface RichTextEditorProps {
  placeholder?: string;
  isVisible: boolean;
  theme: "light" | "dark";
  editorRef: React.RefObject<HTMLElement>;
  restoreSelection?: () => void;
  saveSelection?: (options?: { immediate?: boolean }) => void;
  onApplyFormatting?: (html: string) => void;
  onFormattingStart?: () => void;
  onFormattingEnd?: () => void;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  isVisible,
  theme,
  editorRef,
  restoreSelection,
  saveSelection,
  onApplyFormatting,
  onFormattingStart,
  onFormattingEnd,
}) => {
  if (!isVisible) return null;

  const isDark = theme === "dark";

  const applyFormatting = (command: string, value?: string | number) => {
    const target = editorRef.current;
    if (!target) return;

    onFormattingStart?.();

    try {
      target.focus();
      restoreSelection?.();

      switch (command) {
        case "bold":
          document.execCommand("bold", false);
          break;
        case "italic":
          document.execCommand("italic", false);
          break;
        case "underline":
          document.execCommand("underline", false);
          break;
        case "strikethrough":
          document.execCommand("strikethrough", false);
          break;
        case "highlight": {
          const highlightColor = value || "#FDE68A";
          const highlightCommand = document.queryCommandSupported("hiliteColor")
            ? "hiliteColor"
            : "backColor";
          document.execCommand(highlightCommand, false, highlightColor);
          break;
        }
        case "clearHighlight": {
          const highlightCommand = document.queryCommandSupported("hiliteColor")
            ? "hiliteColor"
            : "backColor";
          document.execCommand(highlightCommand, false, "transparent");
          break;
        }
        case "bulletList":
          document.execCommand("insertUnorderedList", false);
          break;
        case "orderedList":
          document.execCommand("insertOrderedList", false);
          break;
        case "heading":
          document.execCommand("formatBlock", false, `<h${value}>`);
          break;
        case "textAlign":
          if (value === "left") document.execCommand("justifyLeft", false);
          else if (value === "center")
            document.execCommand("justifyCenter", false);
          else if (value === "right")
            document.execCommand("justifyRight", false);
          else if (value === "justify")
            document.execCommand("justifyFull", false);
          break;
        case "clearFormat":
          document.execCommand("removeFormat", false);
          break;
      }

      if (onApplyFormatting) {
        onApplyFormatting(target.innerHTML);
      }
      saveSelection?.({ immediate: true });
      restoreSelection?.();
    } finally {
      target.focus();
      onFormattingEnd?.();
    }
  };

  // Create theme-specific classes
  const toolbarClasses = isDark
    ? "rich-text-toolbar flex flex-wrap gap-2 p-3 rounded-lg border shadow-lg transition-colors bg-gray-800 border-gray-600 text-gray-100"
    : "rich-text-toolbar flex flex-wrap gap-2 p-3 rounded-lg border shadow-lg transition-colors bg-white border-gray-200 text-gray-900";

  const buttonClasses = isDark
    ? "p-2 rounded transition-colors hover:bg-gray-700 active:bg-gray-600"
    : "p-2 rounded transition-colors hover:bg-gray-100 active:bg-gray-200";

  const dividerClasses = isDark
    ? "w-px h-8 bg-gray-600"
    : "w-px h-8 bg-gray-300";

  return (
    <>
      <style>
        {`
          .rich-text-toolbar button:hover {
            background-color: ${isDark ? "#374151" : "#f3f4f6"} !important;
          }
          .rich-text-toolbar button:active {
            background-color: ${isDark ? "#4b5563" : "#e5e7eb"} !important;
          }
        `}
      </style>
      <div className="rich-text-editor-overlay fixed z-50 top-4 left-1/2 transform -translate-x-1/2">
        {/* Toolbar */}
        <div
          className={toolbarClasses}
          style={{
            backgroundColor: isDark ? "#1f2937" : "#ffffff",
            borderColor: isDark ? "#4b5563" : "#e5e7eb",
            color: isDark ? "#f9fafb" : "#111827",
          }}
          onMouseDown={(e) => {
            // Prevent blur event from firing when clicking toolbar buttons
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          {/* Text formatting */}
          <button
            onClick={() => applyFormatting("bold")}
            className={buttonClasses}
            style={{
              backgroundColor: "transparent",
              color: isDark ? "#f9fafb" : "#111827",
            }}
            title="Bold (Ctrl+B)"
          >
            <strong>B</strong>
          </button>
          <button
            onClick={() => applyFormatting("italic")}
            className={buttonClasses}
            style={{
              backgroundColor: "transparent",
              color: isDark ? "#f9fafb" : "#111827",
            }}
            title="Italic (Ctrl+I)"
          >
            <em>I</em>
          </button>
          <button
            onClick={() => applyFormatting("underline")}
            className={buttonClasses}
            style={{
              backgroundColor: "transparent",
              color: isDark ? "#f9fafb" : "#111827",
            }}
            title="Underline (Ctrl+U)"
          >
            <u>U</u>
          </button>
          <button
            onClick={() => applyFormatting("strikethrough")}
            className={buttonClasses}
            style={{
              backgroundColor: "transparent",
              color: isDark ? "#f9fafb" : "#111827",
            }}
            title="Strikethrough"
          >
            <s>S</s>
          </button>
          <button
            onClick={() => applyFormatting("highlight")}
            className={buttonClasses}
            style={{
              backgroundColor: "transparent",
              color: isDark ? "#f9fafb" : "#111827",
            }}
            title="Highlight"
          >
            HL
          </button>
          <button
            onClick={() => applyFormatting("clearHighlight")}
            className={buttonClasses}
            style={{
              backgroundColor: "transparent",
              color: isDark ? "#f9fafb" : "#111827",
            }}
            title="Clear Highlight"
          >
            ✕
          </button>

          <div className={dividerClasses} />

          {/* Lists */}
          <button
            onClick={() => applyFormatting("bulletList")}
            className={buttonClasses}
            title="Bullet List"
          >
            •
          </button>
          <button
            onClick={() => applyFormatting("orderedList")}
            className={buttonClasses}
            title="Numbered List"
          >
            1.
          </button>

          <div className={dividerClasses} />

          {/* Headings */}
          <button
            onClick={() => applyFormatting("heading", 1)}
            className={buttonClasses}
            title="Heading 1"
          >
            H1
          </button>
          <button
            onClick={() => applyFormatting("heading", 2)}
            className={buttonClasses}
            title="Heading 2"
          >
            H2
          </button>
          <button
            onClick={() => applyFormatting("heading", 3)}
            className={buttonClasses}
            title="Heading 3"
          >
            H3
          </button>

          <div className={dividerClasses} />

          {/* Text alignment */}
          <button
            onClick={() => applyFormatting("textAlign", "left")}
            className={buttonClasses}
            title="Left Align"
          >
            ⬅
          </button>
          <button
            onClick={() => applyFormatting("textAlign", "center")}
            className={buttonClasses}
            title="Center Align"
          >
            ↔
          </button>
          <button
            onClick={() => applyFormatting("textAlign", "right")}
            className={buttonClasses}
            title="Right Align"
          >
            ➡
          </button>
          <button
            onClick={() => applyFormatting("textAlign", "justify")}
            className={buttonClasses}
            title="Justify"
          >
            ⬌
          </button>

          <div className={dividerClasses} />

          {/* Clear formatting */}
          <button
            onClick={() => applyFormatting("clearFormat")}
            className={buttonClasses}
            title="Clear Formatting"
          >
            Clear
          </button>
        </div>
      </div>
    </>
  );
};

export default React.memo(RichTextEditor);
