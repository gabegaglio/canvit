import React, { useCallback, useEffect, useMemo, useState } from "react";

const DEFAULT_HIGHLIGHT_COLOR = "#FDE68A";

interface RichTextEditorProps {
  placeholder?: string;
  isVisible: boolean;
  theme: "light" | "dark";
  editorRef: React.RefObject<HTMLElement | HTMLDivElement>;
  restoreSelection?: () => void;
  saveSelection?: (options?: { immediate?: boolean }) => void;
  onApplyFormatting?: () => void;
  onFormattingStart?: () => void;
  onFormattingEnd?: () => void;
}

type FormattingState = {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikethrough: boolean;
  bulletList: boolean;
  orderedList: boolean;
  heading: string;
  align: "left" | "center" | "right" | "justify";
  highlight: boolean;
};

const normalizeColor = (value: string) =>
  value.replace(/\s+/g, "").toLowerCase();

const isTransparentColor = (value: string) => {
  const normalized = normalizeColor(value);
  return (
    normalized === "" ||
    normalized === "transparent" ||
    normalized === "rgba(0,0,0,0)" ||
    normalized === "rgb(0,0,0,0)" ||
    normalized === "inherit" ||
    normalized === "initial"
  );
};

const executeCommand = (command: string, value?: string | number): boolean => {
  try {
    const result = document.execCommand(command, false, value?.toString());
    return result;
  } catch {
    return false;
  }
};

const executeHighlight = (color: string): boolean => {
  return (
    executeCommand("hiliteColor", color) || executeCommand("backColor", color)
  );
};

const clearHighlight = (): boolean => {
  return executeHighlight("transparent") || executeCommand("removeFormat");
};

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
  const isDark = theme === "dark";

  const defaultFormatting: FormattingState = useMemo(
    () => ({
      bold: false,
      italic: false,
      underline: false,
      strikethrough: false,
      bulletList: false,
      orderedList: false,
      heading: "p",
      align: "left",
      highlight: false,
    }),
    []
  );

  const [activeFormatting, setActiveFormatting] =
    useState<FormattingState>(defaultFormatting);

  const updateFormattingState = useCallback(() => {
    const target = editorRef.current;
    if (!target) {
      setActiveFormatting(defaultFormatting);
      return;
    }

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      setActiveFormatting(defaultFormatting);
      return;
    }

    const range = selection.getRangeAt(0);
    if (!target.contains(range.commonAncestorContainer)) {
      setActiveFormatting(defaultFormatting);
      return;
    }

    const queryState = (command: string) => {
      try {
        return document.queryCommandState(command);
      } catch {
        return false;
      }
    };

    const queryValue = (command: string) => {
      try {
        return document.queryCommandValue(command);
      } catch {
        return "";
      }
    };

    const align: FormattingState["align"] = queryState("justifyCenter")
      ? "center"
      : queryState("justifyRight")
      ? "right"
      : queryState("justifyFull")
      ? "justify"
      : "left";

    const headingResult = queryValue("formatBlock");
    const heading =
      typeof headingResult === "string" && headingResult.length > 0
        ? headingResult.toLowerCase()
        : "p";

    const selectionAnchor =
      range.startContainer instanceof HTMLElement
        ? range.startContainer
        : range.startContainer.parentElement;

    const rootBackground = window.getComputedStyle(target).backgroundColor;
    const normalizedRootBackground = normalizeColor(rootBackground || "");

    const hasHighlightAncestor = () => {
      let current = selectionAnchor as HTMLElement | null;
      while (current && current !== target) {
        const background = window.getComputedStyle(current).backgroundColor;
        const normalized = normalizeColor(background || "");
        if (
          normalized &&
          !isTransparentColor(normalized) &&
          normalized !== normalizedRootBackground
        ) {
          return true;
        }
        current = current.parentElement;
      }
      return false;
    };

    const highlightActive = hasHighlightAncestor();

    setActiveFormatting({
      bold: queryState("bold"),
      italic: queryState("italic"),
      underline: queryState("underline"),
      strikethrough: queryState("strikeThrough"),
      bulletList: queryState("insertUnorderedList"),
      orderedList: queryState("insertOrderedList"),
      heading,
      align,
      highlight: highlightActive,
    });
  }, [defaultFormatting, editorRef]);

  const applyFormatting = useCallback(
    (command: string, value?: string | number) => {
      const target = editorRef.current;
      if (!target) return;

      onFormattingStart?.();

      try {
        target.focus();
        restoreSelection?.();

        let handled = false;

        switch (command) {
          case "highlight": {
            const color = (value as string) || DEFAULT_HIGHLIGHT_COLOR;
            handled = executeHighlight(color);
            break;
          }
          case "clearHighlight": {
            handled = clearHighlight();
            break;
          }
          case "bold":
          case "italic":
          case "underline":
          case "strikethrough":
            handled = executeCommand(
              command === "strikethrough" ? "strikeThrough" : command
            );
            break;
          case "bulletList":
            handled = executeCommand("insertUnorderedList");
            break;
          case "orderedList":
            handled = executeCommand("insertOrderedList");
            break;
          case "heading":
            handled = executeCommand("formatBlock", `<h${value}>`);
            break;
          case "textAlign":
            if (value === "left") handled = executeCommand("justifyLeft");
            else if (value === "center")
              handled = executeCommand("justifyCenter");
            else if (value === "right")
              handled = executeCommand("justifyRight");
            else if (value === "justify")
              handled = executeCommand("justifyFull");
            break;
          case "clearFormat":
            handled = executeCommand("removeFormat");
            break;
          default:
            break;
        }

        if (handled) {
          onApplyFormatting?.();
          saveSelection?.({ immediate: true });
        }
      } finally {
        target.focus();
        updateFormattingState();
        onFormattingEnd?.();
      }
    },
    [
      editorRef,
      onApplyFormatting,
      onFormattingEnd,
      onFormattingStart,
      restoreSelection,
      saveSelection,
      updateFormattingState,
    ]
  );

  useEffect(() => {
    const handleSelectionChange = () => {
      updateFormattingState();
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, [updateFormattingState]);

  useEffect(() => {
    updateFormattingState();
  }, [updateFormattingState]);

  if (!isVisible) {
    return null;
  }

  const baseButtonClasses = isDark
    ? "p-2 rounded transition-colors hover:bg-gray-700 active:bg-gray-600"
    : "p-2 rounded transition-colors hover:bg-gray-100 active:bg-gray-200";

  const activeButtonClasses = isDark
    ? "bg-white/10 border border-white/30"
    : "bg-gray-200/80 border border-gray-300";

  const getButtonClasses = (isActive: boolean) =>
    `${baseButtonClasses} ${isActive ? activeButtonClasses : ""}`;

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
        <div
          className={`rich-text-toolbar flex flex-wrap gap-2 p-3 rounded-lg border shadow-lg transition-colors ${
            isDark
              ? "bg-gray-800 border-gray-600 text-gray-100"
              : "bg-white border-gray-200 text-gray-900"
          }`}
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <button
            onClick={() => applyFormatting("bold")}
            className={getButtonClasses(activeFormatting.bold)}
            title="Bold (Ctrl+B)"
          >
            <strong>B</strong>
          </button>
          <button
            onClick={() => applyFormatting("italic")}
            className={getButtonClasses(activeFormatting.italic)}
            title="Italic (Ctrl+I)"
          >
            <em>I</em>
          </button>
          <button
            onClick={() => applyFormatting("underline")}
            className={getButtonClasses(activeFormatting.underline)}
            title="Underline (Ctrl+U)"
          >
            <u>U</u>
          </button>
          <button
            onClick={() => applyFormatting("strikethrough")}
            className={getButtonClasses(activeFormatting.strikethrough)}
            title="Strikethrough"
          >
            <s>S</s>
          </button>
          <button
            onClick={() => applyFormatting("highlight")}
            className={getButtonClasses(activeFormatting.highlight)}
            title="Highlight"
          >
            HL
          </button>
          <button
            onClick={() => applyFormatting("clearHighlight")}
            className={getButtonClasses(false)}
            title="Clear Highlight"
          >
            ✕
          </button>

          <div className={dividerClasses} />

          <button
            onClick={() => applyFormatting("bulletList")}
            className={getButtonClasses(activeFormatting.bulletList)}
            title="Bullet List"
          >
            •
          </button>
          <button
            onClick={() => applyFormatting("orderedList")}
            className={getButtonClasses(activeFormatting.orderedList)}
            title="Numbered List"
          >
            1.
          </button>

          <div className={dividerClasses} />

          <button
            onClick={() => applyFormatting("heading", 1)}
            className={getButtonClasses(activeFormatting.heading === "h1")}
            title="Heading 1"
          >
            H1
          </button>
          <button
            onClick={() => applyFormatting("heading", 2)}
            className={getButtonClasses(activeFormatting.heading === "h2")}
            title="Heading 2"
          >
            H2
          </button>
          <button
            onClick={() => applyFormatting("heading", 3)}
            className={getButtonClasses(activeFormatting.heading === "h3")}
            title="Heading 3"
          >
            H3
          </button>

          <div className={dividerClasses} />

          <button
            onClick={() => applyFormatting("textAlign", "left")}
            className={getButtonClasses(activeFormatting.align === "left")}
            title="Left Align"
          >
            ⬅
          </button>
          <button
            onClick={() => applyFormatting("textAlign", "center")}
            className={getButtonClasses(activeFormatting.align === "center")}
            title="Center Align"
          >
            ↔
          </button>
          <button
            onClick={() => applyFormatting("textAlign", "right")}
            className={getButtonClasses(activeFormatting.align === "right")}
            title="Right Align"
          >
            ➡
          </button>
          <button
            onClick={() => applyFormatting("textAlign", "justify")}
            className={getButtonClasses(activeFormatting.align === "justify")}
            title="Justify"
          >
            ⬌
          </button>

          <div className={dividerClasses} />

          <button
            onClick={() => applyFormatting("clearFormat")}
            className={getButtonClasses(false)}
            title="Clear Formatting"
          >
            Clear
          </button>
        </div>
      </div>
    </>
  );
};

export default RichTextEditor;
