# Text Box Rebuild Plan

## Overview

Rebuild the text box component from scratch while reusing existing UI structure and hooks to reduce workload. Focus on creating a clean, maintainable implementation with proper separation of concerns.

## Current Issues Analysis

- Complex resize logic with multiple corner handlers
- Mixed concerns in the main Text component
- Inefficient width calculations
- Overly complex state management

## Reusable Components & Hooks

✅ **Keep and reuse:**

- `useGridSnap` - Grid snapping functionality
- `useGlobalClickHandler` - Global click handling for edit mode
- `SnapGuide` component - Visual grid snapping indicators
- Canvas positioning and drag logic
- Theme and color handling

🔄 **Refactor and simplify:**

- Text editing logic
- Resize functionality
- Width calculations

## Implementation Steps

### 1. User Creates Text Box via Toolbar or Context

**File:** `src/canvas/hooks/text/useAddText.ts` (new)

```typescript
interface UseAddTextProps {
  onAddText: (textData: TextData) => void;
  canvasScale: number;
  gridSize: number;
}

interface TextData {
  id: string;
  x: number;
  y: number;
  content: string;
  width: number;
  height: number;
  color?: string;
}
```

**Logic:**

- Generate unique ID for new text element
- Position at cursor location or center of viewport
- Apply grid snapping if enabled
- Initialize with empty content and default dimensions
- Call `onAddText` callback to add to canvas

### 2. Open Blank Text Box with Blinking Cursor

**File:** `src/canvas/hooks/text/useTextEditing.ts` (refactored)

```typescript
interface UseTextEditingProps {
  initialContent: string;
  onUpdateText: (id: string, content: string) => void;
  id: string;
  onResize?: (id: string, width: number, height: number) => void;
}

// Simplified state management
const [isEditing, setIsEditing] = useState(false);
const [content, setContent] = useState(initialContent);
const [cursorPosition, setCursorPosition] = useState(0);

// Auto-focus and cursor positioning
const textareaRef = useRef<HTMLTextAreaElement>(null);
```

**Key Features:**

- Immediate edit mode for new text boxes
- Proper cursor positioning and focus
- Keyboard navigation support (Enter, Escape, Tab)
- Auto-save on blur or Enter key

### 3. Dynamic Horizontal Sizing

**File:** `src/canvas/hooks/text/useTextSizing.ts` (new)

```typescript
interface UseTextSizingProps {
  content: string;
  fontFamily: string;
  fontSize: number;
  onWidthChange: (width: number) => void;
}

// Use native browser measurement
const measureTextWidth = (text: string) => {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (context) {
    context.font = `${fontSize}px ${fontFamily}`;
    return context.measureText(text).width;
  }
  return text.length * 8; // Fallback
};
```

**Implementation Strategy:**

- Use HTML5 Canvas `measureText()` for accurate width calculation
- Create hidden canvas element for measurements
- Apply padding and minimum width constraints
- Debounce width updates to prevent excessive recalculations
- Cache measurements for performance

### 4. Text Persistence and Display

**File:** `src/canvas/components/Text.tsx` (refactored)

```typescript
interface TextProps {
  id: string;
  x: number;
  y: number;
  content: string;
  width: number;
  height: number;
  color?: string;
  theme: "light" | "dark";
  onUpdateText: (id: string, content: string) => void;
  onResize: (id: string, width: number, height: number) => void;
  onDragEnd: (id: string, x: number, y: number) => void;
}
```

**Display Logic:**

- Clean separation between edit and display modes
- Proper text rendering with overflow handling
- Consistent styling across themes
- Smooth transitions between states

### 5. Resize Functionality

**File:** `src/canvas/hooks/text/useTextResize.ts` (simplified)

```typescript
interface UseTextResizeProps {
  onResize: (width: number, height: number) => void;
  scale: number;
  minWidth: number;
  minHeight: number;
}

// Simplified to just bottom-right handle initially
const bindResize = useDrag(({ movement: [mx, my], first, last, memo }) => {
  // Simple resize logic with constraints
});
```

**Resize Features:**

- Single resize handle (bottom-right) for simplicity
- Minimum size constraints
- Grid snapping integration
- Smooth resize experience

## File Structure

```
src/canvas/hooks/text/
├── index.ts                 # Export all text hooks
├── useAddText.ts           # Text creation logic
├── useTextEditing.ts       # Edit mode management
├── useTextSizing.ts        # Dynamic width calculations
└── useTextResize.ts        # Simplified resize logic

src/canvas/components/
├── Text.tsx                # Main text component (refactored)
└── TextInput.tsx           # Editable text input (new)
```

## Implementation Priority

1. **Phase 1:** Create `useAddText` hook and basic text creation
2. **Phase 2:** Implement `useTextSizing` with native text measurement
3. **Phase 3:** Refactor `useTextEditing` for better state management
4. **Phase 4:** Simplify `useTextResize` to single handle
5. **Phase 5:** Refactor main `Text` component
6. **Phase 6:** Create `TextInput` component for editing

## Technical Considerations

### Performance Optimizations

- Debounce width calculations (100ms)
- Cache text measurements
- Use `useCallback` for event handlers
- Minimize re-renders with proper dependency arrays

### Accessibility

- Proper ARIA labels
- Keyboard navigation support
- Screen reader compatibility
- Focus management

### Browser Compatibility

- Fallback for older browsers without Canvas API
- Progressive enhancement approach
- Graceful degradation for unsupported features

## Testing Strategy

1. **Unit Tests:** Test each hook independently
2. **Integration Tests:** Test text creation → editing → saving flow
3. **Performance Tests:** Measure text measurement performance
4. **Cross-browser Tests:** Ensure compatibility

## Success Metrics

- Text creation time < 100ms
- Smooth typing experience with no lag
- Accurate width calculations
- Proper text persistence
- Clean, maintainable code structure
