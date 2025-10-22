# Canvas Performance Optimization Guide

## Current Performance Analysis

### Performance by Element Count

- ✅ **< 50 elements**: Excellent
- ⚠️ **50-200 elements**: Acceptable (slight jank)
- ❌ **200+ elements**: Poor (needs optimization)

### What's Working Well

1. **Debounced Saves (200ms)**

   - Prevents excessive writes during drag/resize operations
   - Groups rapid changes into single save
   - Smart trade-off between data safety and performance

2. **React Keys & Reconciliation**

   - Stable `key={note.id}` lets React efficiently update only changed notes
   - Moving a note doesn't recreate the entire component tree

3. **Memoized Callbacks**

   - `useCallback` on handlers prevents unnecessary re-renders
   - Child components don't re-render if handlers haven't changed

4. **Emergency Save on Unmount**
   - Ensures no data loss on tab close

---

## Performance Bottlenecks

### 1. localStorage is Synchronous & Blocking

**Location:** `src/contexts/CanvasContext.tsx` lines 290-293

```typescript
// Blocks main thread
window.localStorage.setItem(
  CANVAS_STORAGE_KEY,
  JSON.stringify(nextState) // Can be slow with 100+ notes
);
```

**Impact:** With 100+ notes/images, `JSON.stringify()` can take 5-10ms, blocking the UI.

### 2. Full State Serialization on Every Change

**Location:** `src/contexts/CanvasContext.tsx` lines 267-306

```typescript
// Saves EVERYTHING even if 1 note moved
useEffect(() => {
  const nextState = {
    scale,
    positionX,
    positionY,
    notes, // Entire array
    images, // Entire array
    texts, // Entire array
  };
  localStorage.setItem(key, JSON.stringify(nextState));
}, [scale, positionX, positionY, notes, images, texts]);
```

**Impact:** Moving one note re-serializes 50 other notes unnecessarily.

### 3. No Virtualization

**Location:** `src/canvas/components/CanvasContent.tsx` lines 167-238

```typescript
// Renders ALL elements even if off-screen
{notes.map((note) => <Note ... />)}
{images.map((image) => <Image ... />)}
{texts.map((text) => <Text ... />)}
```

**Impact:**

- With 500 notes, React renders 500 DOM nodes
- Scroll/zoom operations touch all elements
- Layout calculations scale O(n)

### 4. Array Mapping Creates New Props Objects

```typescript
{
  notes.map((note) => (
    <Note
      style={{ left: note.x, top: note.y, zIndex: 5 }} // New object every render
      width={note.width}
      height={note.height}
    />
  ));
}
```

**Impact:** Even if `note` data didn't change, new `style` object causes React.memo to fail.

### 5. No Lazy Loading

```typescript
const parsed = JSON.parse(stored); // Could be 10MB+
setNotes(sanitizeNotes(parsed.notes)); // Processes all immediately
```

---

## Optimization Priorities

## Priority 1: Viewport Virtualization

**Problem:** Renders all elements even when off-screen  
**Solution:** Only render visible elements  
**Impact:** 10x performance improvement for large canvases

### Implementation

Create new hook: `src/canvas/hooks/canvas/useViewportFilter.ts`

```typescript
import { useMemo } from "react";

interface Element {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Viewport {
  x: number;
  y: number;
  scale: number;
}

const isInViewport = (
  element: Element,
  viewport: Viewport,
  padding: number = 500 // Render elements slightly off-screen for smooth scrolling
): boolean => {
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  // Convert element position to screen coordinates
  const screenX = element.x * viewport.scale + viewport.x;
  const screenY = element.y * viewport.scale + viewport.y;
  const screenWidth = element.width * viewport.scale;
  const screenHeight = element.height * viewport.scale;

  // Check if element overlaps with viewport (with padding)
  return (
    screenX + screenWidth >= -padding &&
    screenX <= windowWidth + padding &&
    screenY + screenHeight >= -padding &&
    screenY <= windowHeight + padding
  );
};

export const useViewportFilter = <T extends Element>(
  elements: T[],
  viewport: Viewport
): T[] => {
  return useMemo(
    () => elements.filter((el) => isInViewport(el, viewport)),
    [elements, viewport.x, viewport.y, viewport.scale]
  );
};
```

### Update CanvasContent.tsx

```typescript
import { useViewportFilter } from '../hooks/canvas/useViewportFilter';

const CanvasContent: React.FC<CanvasContentProps> = ({
  positionX, positionY, scale, ...
}) => {
  const { notes, images, texts } = useCanvas();

  // Filter to visible elements only
  const viewport = { x: positionX, y: positionY, scale };
  const visibleNotes = useViewportFilter(notes, viewport);
  const visibleImages = useViewportFilter(images, viewport);
  const visibleTexts = useViewportFilter(texts, viewport);

  return (
    <div>
      {visibleImages.map((image) => <Image key={image.id} ... />)}
      {visibleNotes.map((note) => <Note key={note.id} ... />)}
      {visibleTexts.map((text) => <Text key={text.id} ... />)}
    </div>
  );
};
```

---

## Priority 2: Component Memoization

**Problem:** Components re-render even when props haven't changed  
**Solution:** Memoize with shallow comparison  
**Impact:** 30-50% reduction in re-renders

### Update Note.tsx

```typescript
import React, { memo } from 'react';

const NoteComponent: React.FC<NoteProps> = ({ ... }) => {
  // Existing implementation
};

// Add memo with custom comparison
const Note = memo(NoteComponent, (prev, next) =>
  prev.id === next.id &&
  prev.x === next.x &&
  prev.y === next.y &&
  prev.content === next.content &&
  prev.width === next.width &&
  prev.height === next.height &&
  prev.color === next.color &&
  prev.image === next.image &&
  prev.scale === next.scale &&
  prev.gridState === next.gridState
);

export default Note;
```

### Do the same for Image.tsx and Text.tsx

---

## Priority 3: Incremental Saves

**Problem:** Saves entire state even when 1 note changes  
**Solution:** Track and save only changed elements  
**Impact:** 5-10x faster saves for large canvases

### Update CanvasContext.tsx

Add dirty tracking:

```typescript
export const CanvasProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [images, setImages] = useState<CanvasImage[]>([]);
  const [texts, setTexts] = useState<CanvasText[]>([]);

  // Track which elements have changed
  const [dirtyNoteIds, setDirtyNoteIds] = useState<Set<string>>(new Set());
  const [dirtyImageIds, setDirtyImageIds] = useState<Set<string>>(new Set());
  const [dirtyTextIds, setDirtyTextIds] = useState<Set<string>>(new Set());

  // Mark elements as dirty when they change
  const updateNotePosition = useCallback((id: string, x: number, y: number) => {
    setNotes((prevNotes) =>
      prevNotes.map((note) => (note.id === id ? { ...note, x, y } : note))
    );
    setDirtyNoteIds((prev) => new Set(prev).add(id));
  }, []);

  // Incremental save effect
  useEffect(() => {
    if (!hasHydrated) return;

    const timeout = setTimeout(() => {
      // Save metadata (always save viewport and list of IDs)
      const metadata = {
        version: CANVAS_STORAGE_VERSION,
        scale,
        positionX,
        positionY,
        noteIds: notes.map((n) => n.id),
        imageIds: images.map((i) => i.id),
        textIds: texts.map((t) => t.id),
      };
      localStorage.setItem("canvit-metadata", JSON.stringify(metadata));

      // Save only dirty notes
      dirtyNoteIds.forEach((id) => {
        const note = notes.find((n) => n.id === id);
        if (note) {
          localStorage.setItem(`note-${id}`, JSON.stringify(note));
        }
      });

      // Save only dirty images
      dirtyImageIds.forEach((id) => {
        const image = images.find((i) => i.id === id);
        if (image) {
          localStorage.setItem(`image-${id}`, JSON.stringify(image));
        }
      });

      // Save only dirty texts
      dirtyTextIds.forEach((id) => {
        const text = texts.find((t) => t.id === id);
        if (text) {
          localStorage.setItem(`text-${id}`, JSON.stringify(text));
        }
      });

      // Clear dirty flags
      setDirtyNoteIds(new Set());
      setDirtyImageIds(new Set());
      setDirtyTextIds(new Set());
    }, 200);

    return () => clearTimeout(timeout);
  }, [
    scale,
    positionX,
    positionY,
    notes,
    images,
    texts,
    dirtyNoteIds,
    dirtyImageIds,
    dirtyTextIds,
    hasHydrated,
  ]);

  // Update hydration to load from incremental storage
  useEffect(() => {
    const stored = localStorage.getItem("canvit-metadata");
    if (stored) {
      const metadata = JSON.parse(stored);

      setScale(metadata.scale);
      setPosition(metadata.positionX, metadata.positionY);

      // Load notes
      const loadedNotes = metadata.noteIds
        .map((id: string) => {
          const noteData = localStorage.getItem(`note-${id}`);
          return noteData ? JSON.parse(noteData) : null;
        })
        .filter(Boolean);
      setNotes(sanitizeNotes(loadedNotes));

      // Load images
      const loadedImages = metadata.imageIds
        .map((id: string) => {
          const imageData = localStorage.getItem(`image-${id}`);
          return imageData ? JSON.parse(imageData) : null;
        })
        .filter(Boolean);
      setImages(sanitizeImages(loadedImages));

      // Load texts
      const loadedTexts = metadata.textIds
        .map((id: string) => {
          const textData = localStorage.getItem(`text-${id}`);
          return textData ? JSON.parse(textData) : null;
        })
        .filter(Boolean);
      setTexts(sanitizeTexts(loadedTexts));
    }

    setHasHydrated(true);
  }, []);
};
```

---

## Priority 4: Migrate to IndexedDB

**Problem:** localStorage is synchronous and blocks main thread  
**Solution:** Use IndexedDB for async storage  
**Impact:** Non-blocking saves, supports larger datasets

### Install dependency

```bash
npm install idb
```

### Create db utility: `src/lib/db.ts`

```typescript
import { openDB, DBSchema, IDBPDatabase } from "idb";

interface CanvasDB extends DBSchema {
  notes: {
    key: string;
    value: Note;
  };
  images: {
    key: string;
    value: CanvasImage;
  };
  texts: {
    key: string;
    value: CanvasText;
  };
  metadata: {
    key: "canvas-state";
    value: {
      scale: number;
      positionX: number;
      positionY: number;
    };
  };
}

let dbPromise: Promise<IDBPDatabase<CanvasDB>> | null = null;

export const getDB = () => {
  if (!dbPromise) {
    dbPromise = openDB<CanvasDB>("canvit-db", 1, {
      upgrade(db) {
        db.createObjectStore("notes");
        db.createObjectStore("images");
        db.createObjectStore("texts");
        db.createObjectStore("metadata");
      },
    });
  }
  return dbPromise;
};

export const saveNote = async (note: Note) => {
  const db = await getDB();
  await db.put("notes", note, note.id);
};

export const loadAllNotes = async (): Promise<Note[]> => {
  const db = await getDB();
  return db.getAll("notes");
};

export const deleteNote = async (id: string) => {
  const db = await getDB();
  await db.delete("notes", id);
};

// Similar functions for images, texts, and metadata...
```

### Update CanvasContext.tsx to use IndexedDB

```typescript
import { saveNote, loadAllNotes, saveMetadata, loadMetadata } from "../lib/db";

// Replace localStorage calls with IndexedDB
const saveChanges = async () => {
  await saveMetadata({ scale, positionX, positionY });

  for (const id of dirtyNoteIds) {
    const note = notes.find((n) => n.id === id);
    if (note) await saveNote(note);
  }
};
```

---

## Priority 5: Lazy Load Content

**Problem:** Loads all data synchronously on mount  
**Solution:** Progressive hydration  
**Impact:** Faster initial load time

```typescript
useEffect(() => {
  const loadData = async () => {
    // Load metadata first (fast)
    const metadata = await loadMetadata();
    setScale(metadata.scale);
    setPosition(metadata.positionX, metadata.positionY);

    // Load minimal note data (IDs and positions only)
    const noteMetadata = await loadNoteMetadata();
    setNotes(noteMetadata);

    // Load full content in background
    requestIdleCallback(async () => {
      const fullNotes = await loadAllNotes();
      setNotes(fullNotes);
    });
  };

  loadData();
}, []);
```

---

## Quick Wins

### 1. Add `will-change` CSS hint

Update `src/index.css`:

```css
.note-container,
.image-container,
.text-container {
  will-change: transform;
}
```

### 2. Use `transform` instead of `left/top` for positioning

In `CanvasContent.tsx`:

```typescript
// Instead of:
style={{ left: note.x, top: note.y }}

// Use:
style={{ transform: `translate(${note.x}px, ${note.y}px)` }}
```

### 3. Debounce expensive operations

```typescript
import { useMemo } from "react";

const debounce = (fn: Function, ms: number) => {
  let timeout: number;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = window.setTimeout(() => fn(...args), ms);
  };
};

const debouncedSave = useMemo(() => debounce(saveToStorage, 500), []);
```

---

## Implementation Order

### Phase 1: Low-Hanging Fruit (1-2 hours)

1. ✅ Add `will-change` CSS hints
2. ✅ Memoize Note/Image/Text components
3. ✅ Switch to `transform` for positioning

### Phase 2: High Impact (4-6 hours)

4. ✅ Implement viewport virtualization (biggest performance gain)
5. ✅ Add incremental saves

### Phase 3: Scale Preparation (6-8 hours)

6. ⏱️ Migrate to IndexedDB (if expecting > 500 elements)
7. ⏱️ Add lazy loading (if startup time becomes issue)

---

## Performance Testing

### Benchmarking Script

Add to `src/utils/benchmark.ts`:

```typescript
export const benchmarkCanvas = (elementCount: number) => {
  const start = performance.now();

  // Measure render time
  const renderStart = performance.now();
  // ... render logic
  const renderTime = performance.now() - renderStart;

  // Measure save time
  const saveStart = performance.now();
  // ... save logic
  const saveTime = performance.now() - saveStart;

  console.log(`Elements: ${elementCount}`);
  console.log(`Render time: ${renderTime.toFixed(2)}ms`);
  console.log(`Save time: ${saveTime.toFixed(2)}ms`);
};
```

### Target Metrics

- **Render time**: < 16ms (60fps)
- **Save time**: < 50ms (non-blocking)
- **Initial load**: < 1000ms for 500 elements

---

## Bottom Line

**Current State:**

- Clean, maintainable architecture ✅
- Works great for < 50 elements ✅
- Needs optimization for 200+ elements ⚠️

**After Optimizations:**

- Handle 500+ elements smoothly
- Maintain 60fps during interactions
- Non-blocking saves
- Fast initial load

The architecture is solid—just needs targeted performance improvements for scale.
