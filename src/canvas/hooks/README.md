# Canvas Hooks Organization

This directory contains all the custom React hooks used by the Canvas components, organized by functionality for better maintainability and discoverability.

## 📁 Folder Structure

### **`note/` - Note-related hooks**

Hooks that handle note-specific functionality:

- `useNoteResize` - Handles note resizing with grid snapping
- `useNoteEditing` - Manages note editing state and text input
- `useNoteContextMenu` - Controls note context menu display
- `useAddNote` - Handles adding new notes to the canvas

### **`image/` - Image-related hooks**

Hooks that handle image uploads and management:

- `useImageUpload` - Basic image upload functionality
- `usePictureUpload` - Enhanced picture upload with preview
- `useCanvasPictureUpload` - Canvas-specific picture upload
- `useImageContextMenu` - Controls image context menu display

### **`canvas/` - Canvas interaction hooks**

Hooks that handle canvas-level interactions:

- `useCanvasPanAndZoom` - Manages canvas panning and zooming
- `useCanvasHandlers` - Handles canvas-level events and interactions
- `useGridSnap` - Provides grid snapping calculations

### **`ui/` - UI interaction hooks**

Hooks that handle general UI interactions:

- `useColorPicker` - Manages color picker state and functionality
- `useGlobalClickHandler` - Handles global click events

## 🚀 Usage

### **Import from specific category:**

```typescript
import { useNoteResize } from "../hooks/note";
import { useImageUpload } from "../hooks/image";
import { useCanvasPanAndZoom } from "../hooks/canvas";
import { useColorPicker } from "../hooks/ui";
```

### **Import from main hooks index:**

```typescript
import { useNoteResize, useImageUpload, useCanvasPanAndZoom } from "../hooks";
```

### **Import all hooks from a category:**

```typescript
import * as NoteHooks from "../hooks/note";
import * as ImageHooks from "../hooks/image";
```

## 🔧 Adding New Hooks

When adding new hooks:

1. **Identify the category** based on functionality
2. **Place the hook** in the appropriate folder
3. **Export it** in the category's `index.ts`
4. **Update the main** `index.ts` if needed
5. **Update this README** to document the new hook

## 📋 Benefits of This Organization

- **Easier Navigation** - Developers know exactly where to find specific functionality
- **Better Maintainability** - Related hooks are grouped together
- **Clearer Dependencies** - Easier to see relationships between hooks
- **Scalability** - Easy to add new hooks in the right category
- **Code Reviews** - Easier to review related changes together
- **Team Collaboration** - Multiple developers can work on different hook categories without conflicts

## 🎯 Future Considerations

- Consider adding **hook testing** in each category folder
- Add **performance monitoring** hooks in a separate `performance/` category
- Consider **hook composition** patterns for complex interactions
- Add **hook documentation** with JSDoc comments for each hook
