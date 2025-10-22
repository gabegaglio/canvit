import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";

interface Note {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
  color?: string;
  image?: string;
}

interface CanvasImage {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  src: string;
}

interface CanvasText {
  id: string;
  x: number;
  y: number;
  content: string;
  width?: number;
  height?: number;
  color?: string;
}

interface CanvasContextType {
  scale: number;
  setScale: (scale: number) => void;
  positionX: number;
  positionY: number;
  setPosition: (x: number, y: number) => void;
  notes: Note[];
  images: CanvasImage[];
  texts: CanvasText[];
  addNote: (note: Omit<Note, "id">) => void;
  addImage: (image: Omit<CanvasImage, "id">) => void;
  addText: (text: Omit<CanvasText, "id">) => void;
  updateNote: (id: string, content: string) => void;
  updateText: (id: string, content: string) => void;
  updateNotePosition: (id: string, x: number, y: number) => void;
  updateImagePosition: (id: string, x: number, y: number) => void;
  updateTextPosition: (id: string, x: number, y: number) => void;
  deleteNote: (id: string) => void;
  deleteImage: (id: string) => void;
  deleteText: (id: string) => void;
  updateNoteDimensions: (id: string, width: number, height: number) => void;
  updateTextDimensions: (id: string, width: number, height: number) => void;
  updateImageDimensions: (id: string, width: number, height: number) => void;
  updateNoteColor: (id: string, color: string) => void;
  updateNoteImage: (id: string, image: string) => void;
  removeNoteImage: (id: string) => void;
  isAnyNoteEditing: boolean;
  setNoteEditing: (id: string, isEditing: boolean) => void;
}

const CanvasContext = createContext<CanvasContextType | null>(null);

interface PersistedCanvasState {
  version: number;
  scale: number;
  positionX: number;
  positionY: number;
  notes: Note[];
  images: CanvasImage[];
  texts: CanvasText[];
}

const CANVAS_SIZE = 100000;
const CANVAS_STORAGE_KEY = "canvit-canvas-state";
const CANVAS_STORAGE_VERSION = 1;
const CANVAS_METADATA_KEY = "canvit-metadata";
const NOTE_STORAGE_PREFIX = "canvit-note-";
const IMAGE_STORAGE_PREFIX = "canvit-image-";
const TEXT_STORAGE_PREFIX = "canvit-text-";
const STORAGE_BATCH_SIZE = 40;
const DEFAULT_NOTE_WIDTH = 200;
const DEFAULT_NOTE_HEIGHT = 150;
const DEFAULT_IMAGE_WIDTH = 300;
const DEFAULT_IMAGE_HEIGHT = 200;
const DEFAULT_TEXT_WIDTH = 100;
const DEFAULT_TEXT_HEIGHT = 24;

const safeStorageSet = (key: string, value: string) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch (error) {
    console.warn("Failed to save canvas data to localStorage:", error);
  }
};

const safeStorageRemove = (key: string) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.warn("Failed to remove canvas data from localStorage:", error);
  }
};

const safeStorageGet = (key: string) => {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch (error) {
    console.warn("Failed to read canvas data from localStorage:", error);
    return null;
  }
};

const toFiniteNumber = (value: unknown, fallback: number) =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback;

const sanitizeNotes = (raw: unknown): Note[] => {
  if (!Array.isArray(raw)) return [];

  const sanitized: Note[] = [];

  raw.forEach((item) => {
    if (!item || typeof item !== "object") return;
    const candidate = item as Partial<Note>;
    if (typeof candidate.id !== "string") return;

    const sanitizedNote: Note = {
      id: candidate.id,
      x: toFiniteNumber(candidate.x, 0),
      y: toFiniteNumber(candidate.y, 0),
      width: toFiniteNumber(candidate.width, DEFAULT_NOTE_WIDTH),
      height: toFiniteNumber(candidate.height, DEFAULT_NOTE_HEIGHT),
      content: typeof candidate.content === "string" ? candidate.content : "",
      color: typeof candidate.color === "string" ? candidate.color : undefined,
      image: typeof candidate.image === "string" ? candidate.image : undefined,
    };

    sanitized.push(sanitizedNote);
  });

  return sanitized;
};

const sanitizeImages = (raw: unknown): CanvasImage[] => {
  if (!Array.isArray(raw)) return [];

  const sanitized: CanvasImage[] = [];

  raw.forEach((item) => {
    if (!item || typeof item !== "object") return;
    const candidate = item as Partial<CanvasImage>;
    if (typeof candidate.id !== "string" || typeof candidate.src !== "string")
      return;

    const sanitizedImage: CanvasImage = {
      id: candidate.id,
      src: candidate.src,
      x: toFiniteNumber(candidate.x, 0),
      y: toFiniteNumber(candidate.y, 0),
      width: toFiniteNumber(candidate.width, DEFAULT_IMAGE_WIDTH),
      height: toFiniteNumber(candidate.height, DEFAULT_IMAGE_HEIGHT),
    };

    sanitized.push(sanitizedImage);
  });

  return sanitized;
};

const sanitizeTexts = (raw: unknown): CanvasText[] => {
  if (!Array.isArray(raw)) return [];

  const sanitized: CanvasText[] = [];

  raw.forEach((item) => {
    if (!item || typeof item !== "object") return;
    const candidate = item as Partial<CanvasText>;
    if (typeof candidate.id !== "string") return;

    const sanitizedText: CanvasText = {
      id: candidate.id,
      x: toFiniteNumber(candidate.x, 0),
      y: toFiniteNumber(candidate.y, 0),
      content: typeof candidate.content === "string" ? candidate.content : "",
      width:
        candidate.width !== undefined
          ? toFiniteNumber(candidate.width, DEFAULT_TEXT_WIDTH)
          : DEFAULT_TEXT_WIDTH,
      height:
        candidate.height !== undefined
          ? toFiniteNumber(candidate.height, DEFAULT_TEXT_HEIGHT)
          : DEFAULT_TEXT_HEIGHT,
      color: typeof candidate.color === "string" ? candidate.color : undefined,
    };

    sanitized.push(sanitizedText);
  });

  return sanitized;
};

export const CanvasProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [scaleState, setScaleState] = useState(1);
  const [positionState, setPositionState] = useState({ x: 0, y: 0 });
  const [notes, setNotesState] = useState<Note[]>([]);
  const [images, setImagesState] = useState<CanvasImage[]>([]);
  const [texts, setTextsState] = useState<CanvasText[]>([]);
  const [editingNotes, setEditingNotes] = useState<Set<string>>(new Set());

  const scaleRef = useRef(scaleState);
  const positionRef = useRef(positionState);
  const notesRef = useRef<Note[]>([]);
  const imagesRef = useRef<CanvasImage[]>([]);
  const textsRef = useRef<CanvasText[]>([]);
  const dirtyNoteIdsRef = useRef<Set<string>>(new Set());
  const dirtyImageIdsRef = useRef<Set<string>>(new Set());
  const dirtyTextIdsRef = useRef<Set<string>>(new Set());
  const deletedNoteIdsRef = useRef<Set<string>>(new Set());
  const deletedImageIdsRef = useRef<Set<string>>(new Set());
  const deletedTextIdsRef = useRef<Set<string>>(new Set());
  const saveTimeoutRef = useRef<number | null>(null);
  const hasHydratedRef = useRef(false);
  const isHydratingRef = useRef(false);
  const writeQueueRef = useRef<Array<() => void>>([]);
  const isProcessingWritesRef = useRef(false);
  const idleCallbackIdRef = useRef<number | null>(null);
  const lastSavedMetadataRef = useRef<string | null>(null);

  const scale = scaleState;
  const positionX = positionState.x;
  const positionY = positionState.y;

  const scheduleWriteProcessing = useCallback(function scheduleWriteProcessingInner(): void {
    if (typeof window === "undefined") {
      return;
    }
    if (writeQueueRef.current.length === 0) {
      return;
    }
    if (isProcessingWritesRef.current) {
      return;
    }

    const processQueue = (deadline?: any) => {
      isProcessingWritesRef.current = true;
      const start = typeof performance !== "undefined" ? performance.now() : 0;

      while (writeQueueRef.current.length > 0) {
        if (deadline) {
          if (deadline.timeRemaining() <= 1) {
            break;
          }
        } else if (
          typeof performance !== "undefined" &&
          performance.now() - start > 6
        ) {
          break;
        }

        const task = writeQueueRef.current.shift();
        try {
          task?.();
        } catch (error) {
          console.warn("Failed to persist canvas data:", error);
        }
      }

      isProcessingWritesRef.current = false;

      if (writeQueueRef.current.length > 0) {
        scheduleWriteProcessingInner();
      }
    };

    const requestIdle =
      typeof (window as any).requestIdleCallback === "function"
        ? (window as any).requestIdleCallback
        : null;

    if (requestIdle) {
      idleCallbackIdRef.current = requestIdle((deadline: any) => {
        idleCallbackIdRef.current = null;
        processQueue(deadline);
      });
    } else {
      idleCallbackIdRef.current = window.setTimeout(() => {
        idleCallbackIdRef.current = null;
        processQueue();
      }, 0);
    }
  }, []);

  const persistState = useCallback(() => {
    if (typeof window === "undefined" || !hasHydratedRef.current) {
      return;
    }

    const metadata = {
      version: CANVAS_STORAGE_VERSION,
      scale: scaleRef.current,
      positionX: positionRef.current.x,
      positionY: positionRef.current.y,
      noteIds: notesRef.current.map((note) => note.id),
      imageIds: imagesRef.current.map((image) => image.id),
      textIds: textsRef.current.map((text) => text.id),
    };

    const dirtyNotes = Array.from(dirtyNoteIdsRef.current);
    const dirtyImages = Array.from(dirtyImageIdsRef.current);
    const dirtyTexts = Array.from(dirtyTextIdsRef.current);
    const deletedNotes = Array.from(deletedNoteIdsRef.current);
    const deletedImages = Array.from(deletedImageIdsRef.current);
    const deletedTexts = Array.from(deletedTextIdsRef.current);

    const metadataString = JSON.stringify(metadata);
    const metadataChanged = lastSavedMetadataRef.current !== metadataString;

    const hasDirtyChanges =
      dirtyNotes.length > 0 ||
      dirtyImages.length > 0 ||
      dirtyTexts.length > 0 ||
      deletedNotes.length > 0 ||
      deletedImages.length > 0 ||
      deletedTexts.length > 0;

    if (!metadataChanged && !hasDirtyChanges) {
      return;
    }

    if (metadataChanged) {
      lastSavedMetadataRef.current = metadataString;
      writeQueueRef.current.push(() =>
        safeStorageSet(CANVAS_METADATA_KEY, metadataString)
      );
    }

    dirtyNotes.forEach((id) => {
      const note = notesRef.current.find((entry) => entry.id === id);
      if (note) {
        const serialized = JSON.stringify(note);
        writeQueueRef.current.push(() =>
          safeStorageSet(NOTE_STORAGE_PREFIX + id, serialized)
        );
      }
    });

    dirtyImages.forEach((id) => {
      const image = imagesRef.current.find((entry) => entry.id === id);
      if (image) {
        const serialized = JSON.stringify(image);
        writeQueueRef.current.push(() =>
          safeStorageSet(IMAGE_STORAGE_PREFIX + id, serialized)
        );
      }
    });

    dirtyTexts.forEach((id) => {
      const text = textsRef.current.find((entry) => entry.id === id);
      if (text) {
        const serialized = JSON.stringify(text);
        writeQueueRef.current.push(() =>
          safeStorageSet(TEXT_STORAGE_PREFIX + id, serialized)
        );
      }
    });

    deletedNotes.forEach((id) =>
      writeQueueRef.current.push(() => safeStorageRemove(NOTE_STORAGE_PREFIX + id))
    );
    deletedImages.forEach((id) =>
      writeQueueRef.current.push(() =>
        safeStorageRemove(IMAGE_STORAGE_PREFIX + id)
      )
    );
    deletedTexts.forEach((id) =>
      writeQueueRef.current.push(() =>
        safeStorageRemove(TEXT_STORAGE_PREFIX + id)
      )
    );

    if (writeQueueRef.current.length > 0) {
      scheduleWriteProcessing();
    }

    dirtyNoteIdsRef.current.clear();
    dirtyImageIdsRef.current.clear();
    dirtyTextIdsRef.current.clear();
    deletedNoteIdsRef.current.clear();
    deletedImageIdsRef.current.clear();
    deletedTextIdsRef.current.clear();
  }, []);

  const scheduleSave = useCallback(() => {
    if (
      typeof window === "undefined" ||
      !hasHydratedRef.current ||
      isHydratingRef.current
    ) {
      return;
    }

    if (saveTimeoutRef.current) {
      window.clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = window.setTimeout(() => {
      persistState();
      saveTimeoutRef.current = null;
    }, 200);
  }, [persistState]);

  const flushPendingSave = useCallback(() => {
    if (typeof window === "undefined") return;
    if (saveTimeoutRef.current) {
      window.clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
    persistState();
    if (idleCallbackIdRef.current !== null) {
      const cancelIdle =
        typeof (window as any).cancelIdleCallback === "function"
          ? (window as any).cancelIdleCallback
          : null;
      if (cancelIdle) {
        cancelIdle(idleCallbackIdRef.current);
      } else {
        window.clearTimeout(idleCallbackIdRef.current);
      }
      idleCallbackIdRef.current = null;
      isProcessingWritesRef.current = false;
    }
    while (writeQueueRef.current.length > 0) {
      const task = writeQueueRef.current.shift();
      try {
        task?.();
      } catch (error) {
        console.warn("Failed to persist canvas data:", error);
      }
    }
  }, [persistState]);

  const markNoteDirty = useCallback(
    (id: string) => {
      if (isHydratingRef.current) return;
      dirtyNoteIdsRef.current.add(id);
      deletedNoteIdsRef.current.delete(id);
      scheduleSave();
    },
    [scheduleSave]
  );

  const markImageDirty = useCallback(
    (id: string) => {
      if (isHydratingRef.current) return;
      dirtyImageIdsRef.current.add(id);
      deletedImageIdsRef.current.delete(id);
      scheduleSave();
    },
    [scheduleSave]
  );

  const markTextDirty = useCallback(
    (id: string) => {
      if (isHydratingRef.current) return;
      dirtyTextIdsRef.current.add(id);
      deletedTextIdsRef.current.delete(id);
      scheduleSave();
    },
    [scheduleSave]
  );

  const markNoteDeleted = useCallback(
    (id: string) => {
      if (isHydratingRef.current) return;
      dirtyNoteIdsRef.current.delete(id);
      deletedNoteIdsRef.current.add(id);
      scheduleSave();
    },
    [scheduleSave]
  );

  const markImageDeleted = useCallback(
    (id: string) => {
      if (isHydratingRef.current) return;
      dirtyImageIdsRef.current.delete(id);
      deletedImageIdsRef.current.add(id);
      scheduleSave();
    },
    [scheduleSave]
  );

  const markTextDeleted = useCallback(
    (id: string) => {
      if (isHydratingRef.current) return;
      dirtyTextIdsRef.current.delete(id);
      deletedTextIdsRef.current.add(id);
      scheduleSave();
    },
    [scheduleSave]
  );

  const updateNotesState = useCallback(
    (updater: (prev: Note[]) => Note[]) => {
      setNotesState((prev) => {
        const next = updater(prev);
        notesRef.current = next;
        return next;
      });
    },
    [setNotesState]
  );

  const updateImagesState = useCallback(
    (updater: (prev: CanvasImage[]) => CanvasImage[]) => {
      setImagesState((prev) => {
        const next = updater(prev);
        imagesRef.current = next;
        return next;
      });
    },
    [setImagesState]
  );

  const updateTextsState = useCallback(
    (updater: (prev: CanvasText[]) => CanvasText[]) => {
      setTextsState((prev) => {
        const next = updater(prev);
        textsRef.current = next;
        return next;
      });
    },
    [setTextsState]
  );

  const setScale = useCallback(
    (next: number) => {
      setScaleState(next);
      scaleRef.current = next;
      if (hasHydratedRef.current && !isHydratingRef.current) {
        scheduleSave();
      }
    },
    [scheduleSave]
  );

  const setPosition = useCallback(
    (x: number, y: number) => {
      const nextPosition = { x, y };
      setPositionState(nextPosition);
      positionRef.current = nextPosition;
      if (hasHydratedRef.current && !isHydratingRef.current) {
        scheduleSave();
      }
    },
    [scheduleSave]
  );

  const addNote = useCallback(
    (note: Omit<Note, "id">) => {
      const id = Date.now().toString();
      const noteWithDefaults = {
        ...note,
        width: note.width || DEFAULT_NOTE_WIDTH,
        height: note.height || DEFAULT_NOTE_HEIGHT,
      };
      updateNotesState((prev) => [...prev, { ...noteWithDefaults, id }]);
      markNoteDirty(id);
    },
    [markNoteDirty, updateNotesState]
  );

  const addImage = useCallback(
    (image: Omit<CanvasImage, "id">) => {
      const id = Date.now().toString();
      const imageWithDefaults = {
        ...image,
        width: image.width || DEFAULT_IMAGE_WIDTH,
        height: image.height || DEFAULT_IMAGE_HEIGHT,
      };
      updateImagesState((prev) => [...prev, { ...imageWithDefaults, id }]);
      markImageDirty(id);
    },
    [markImageDirty, updateImagesState]
  );

  const addText = useCallback(
    (text: Omit<CanvasText, "id">) => {
      const id =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : Date.now().toString();
      const textWithDefaults = {
        ...text,
        width: text.width || DEFAULT_TEXT_WIDTH,
        height: text.height || DEFAULT_TEXT_HEIGHT,
      };
      updateTextsState((prev) => [...prev, { ...textWithDefaults, id }]);
      markTextDirty(id);
    },
    [markTextDirty, updateTextsState]
  );

  const updateNote = useCallback(
    (id: string, content: string) => {
      updateNotesState((prev) =>
        prev.map((note) => (note.id === id ? { ...note, content } : note))
      );
      markNoteDirty(id);
    },
    [markNoteDirty, updateNotesState]
  );

  const updateText = useCallback(
    (id: string, content: string) => {
      updateTextsState((prev) =>
        prev.map((text) => (text.id === id ? { ...text, content } : text))
      );
      markTextDirty(id);
    },
    [markTextDirty, updateTextsState]
  );

  const updateNotePosition = useCallback(
    (id: string, x: number, y: number) => {
      updateNotesState((prev) =>
        prev.map((note) => (note.id === id ? { ...note, x, y } : note))
      );
      markNoteDirty(id);
    },
    [markNoteDirty, updateNotesState]
  );

  const updateImagePosition = useCallback(
    (id: string, x: number, y: number) => {
      updateImagesState((prev) =>
        prev.map((image) => (image.id === id ? { ...image, x, y } : image))
      );
      markImageDirty(id);
    },
    [markImageDirty, updateImagesState]
  );

  const updateTextPosition = useCallback(
    (id: string, x: number, y: number) => {
      updateTextsState((prev) =>
        prev.map((text) => (text.id === id ? { ...text, x, y } : text))
      );
      markTextDirty(id);
    },
    [markTextDirty, updateTextsState]
  );

  const deleteNote = useCallback(
    (id: string) => {
      updateNotesState((prev) => prev.filter((note) => note.id !== id));
      setEditingNotes((prev) => {
        if (!prev.has(id)) return prev;
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      markNoteDeleted(id);
    },
    [markNoteDeleted, updateNotesState]
  );

  const deleteImage = useCallback(
    (id: string) => {
      updateImagesState((prev) => prev.filter((image) => image.id !== id));
      markImageDeleted(id);
    },
    [markImageDeleted, updateImagesState]
  );

  const deleteText = useCallback(
    (id: string) => {
      updateTextsState((prev) => prev.filter((text) => text.id !== id));
      markTextDeleted(id);
    },
    [markTextDeleted, updateTextsState]
  );

  const updateNoteDimensions = useCallback(
    (id: string, width: number, height: number) => {
      updateNotesState((prev) =>
        prev.map((note) =>
          note.id === id ? { ...note, width, height } : note
        )
      );
      markNoteDirty(id);
    },
    [markNoteDirty, updateNotesState]
  );

  const updateTextDimensions = useCallback(
    (id: string, width: number, height: number) => {
      updateTextsState((prev) =>
        prev.map((text) =>
          text.id === id ? { ...text, width, height } : text
        )
      );
      markTextDirty(id);
    },
    [markTextDirty, updateTextsState]
  );

  const updateImageDimensions = useCallback(
    (id: string, width: number, height: number) => {
      updateImagesState((prev) =>
        prev.map((image) =>
          image.id === id ? { ...image, width, height } : image
        )
      );
      markImageDirty(id);
    },
    [markImageDirty, updateImagesState]
  );

  const updateNoteColor = useCallback(
    (id: string, color: string) => {
      updateNotesState((prev) =>
        prev.map((note) => (note.id === id ? { ...note, color } : note))
      );
      markNoteDirty(id);
    },
    [markNoteDirty, updateNotesState]
  );

  const updateNoteImage = useCallback(
    (id: string, image: string) => {
      updateNotesState((prev) =>
        prev.map((note) => (note.id === id ? { ...note, image } : note))
      );
      markNoteDirty(id);
    },
    [markNoteDirty, updateNotesState]
  );

  const removeNoteImage = useCallback(
    (id: string) => {
      updateNotesState((prev) =>
        prev.map((note) =>
          note.id === id ? { ...note, image: undefined } : note
        )
      );
      markNoteDirty(id);
    },
    [markNoteDirty, updateNotesState]
  );

  const isAnyNoteEditing = editingNotes.size > 0;

  const setNoteEditing = useCallback((id: string, isEditing: boolean) => {
    setEditingNotes((prev) => {
      const next = new Set(prev);
      if (isEditing) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }, []);

  useEffect(() => {
    scaleRef.current = scaleState;
  }, [scaleState]);

  useEffect(() => {
    positionRef.current = positionState;
  }, [positionState]);

  useEffect(() => {
    if (typeof window === "undefined") {
      hasHydratedRef.current = true;
      return;
    }

    let isCancelled = false;

    const loadCollection = async <T,>(
      ids: string[],
      prefix: string,
      sanitize: (raw: unknown) => T[]
    ): Promise<T[]> => {
      if (!ids.length) return [];
      const rawItems: unknown[] = [];

      for (let index = 0; index < ids.length; index += STORAGE_BATCH_SIZE) {
        const sliceEnd = Math.min(ids.length, index + STORAGE_BATCH_SIZE);
        for (let i = index; i < sliceEnd; i += 1) {
          const stored = safeStorageGet(prefix + ids[i]);
          if (!stored) continue;
          try {
            rawItems.push(JSON.parse(stored));
          } catch (error) {
            console.warn(`Failed to parse stored canvas item ${ids[i]}:`, error);
          }
        }
        if (sliceEnd < ids.length) {
          await new Promise<void>((resolve) => window.setTimeout(resolve, 0));
        }
        if (isCancelled) {
          return [];
        }
      }

      return sanitize(rawItems);
    };

    const centerCanvas = () => {
      const centeredX = window.innerWidth / 2 - CANVAS_SIZE / 2;
      const centeredY = window.innerHeight / 2 - CANVAS_SIZE / 2;
      return { x: centeredX, y: centeredY };
    };

    const hydrate = async () => {
      isHydratingRef.current = true;

      const metadataRaw = safeStorageGet(CANVAS_METADATA_KEY);
      let metadata:
        | {
            version?: number;
            scale?: number;
            positionX?: number;
            positionY?: number;
            noteIds?: string[];
            imageIds?: string[];
            textIds?: string[];
          }
        | null = null;
      let legacyState: PersistedCanvasState | null = null;
      let needsMigration = false;

      if (metadataRaw) {
        try {
          metadata = JSON.parse(metadataRaw);
        } catch (error) {
          console.warn("Failed to parse canvas metadata:", error);
        }
      } else {
        const legacyRaw = safeStorageGet(CANVAS_STORAGE_KEY);
        if (legacyRaw) {
          try {
            legacyState = JSON.parse(legacyRaw) as PersistedCanvasState;
            metadata = {
              version: CANVAS_STORAGE_VERSION,
              scale: legacyState.scale,
              positionX: legacyState.positionX,
              positionY: legacyState.positionY,
              noteIds: legacyState.notes.map((note) => note.id),
              imageIds: legacyState.images.map((image) => image.id),
              textIds: legacyState.texts.map((text) => text.id),
            };
            needsMigration = true;
          } catch (error) {
            console.warn("Failed to parse legacy canvas state:", error);
          }
        }
      }

      if (!metadata) {
        const centered = centerCanvas();
        setPositionState(centered);
        positionRef.current = centered;
        notesRef.current = [];
        imagesRef.current = [];
        textsRef.current = [];
        setNotesState([]);
        setImagesState([]);
        setTextsState([]);
        isHydratingRef.current = false;
        hasHydratedRef.current = true;
        return;
      }

      const nextScale =
        typeof metadata.scale === "number" && Number.isFinite(metadata.scale)
          ? metadata.scale
          : 1;
      const defaultPosition = centerCanvas();
      const nextPositionX =
        typeof metadata.positionX === "number" &&
        Number.isFinite(metadata.positionX)
          ? metadata.positionX
          : defaultPosition.x;
      const nextPositionY =
        typeof metadata.positionY === "number" &&
        Number.isFinite(metadata.positionY)
          ? metadata.positionY
          : defaultPosition.y;

      setScaleState(nextScale);
      scaleRef.current = nextScale;
      const nextPosition = { x: nextPositionX, y: nextPositionY };
      setPositionState(nextPosition);
      positionRef.current = nextPosition;

      let nextNotes: Note[] = [];
      let nextImages: CanvasImage[] = [];
      let nextTexts: CanvasText[] = [];

      if (legacyState) {
        nextNotes = sanitizeNotes(legacyState.notes);
        nextImages = sanitizeImages(legacyState.images);
        nextTexts = sanitizeTexts(legacyState.texts);
      } else {
        nextNotes = await loadCollection(
          Array.isArray(metadata.noteIds) ? metadata.noteIds : [],
          NOTE_STORAGE_PREFIX,
          sanitizeNotes
        );
        nextImages = await loadCollection(
          Array.isArray(metadata.imageIds) ? metadata.imageIds : [],
          IMAGE_STORAGE_PREFIX,
          sanitizeImages
        );
        nextTexts = await loadCollection(
          Array.isArray(metadata.textIds) ? metadata.textIds : [],
          TEXT_STORAGE_PREFIX,
          sanitizeTexts
        );
      }

      if (isCancelled) {
        return;
      }

      notesRef.current = nextNotes;
      imagesRef.current = nextImages;
      textsRef.current = nextTexts;
      setNotesState(nextNotes);
      setImagesState(nextImages);
      setTextsState(nextTexts);

      if (needsMigration) {
        safeStorageRemove(CANVAS_STORAGE_KEY);
        metadata.noteIds = nextNotes.map((note) => note.id);
        metadata.imageIds = nextImages.map((image) => image.id);
        metadata.textIds = nextTexts.map((text) => text.id);
        safeStorageSet(CANVAS_METADATA_KEY, JSON.stringify(metadata));
        nextNotes.forEach((note) => dirtyNoteIdsRef.current.add(note.id));
        nextImages.forEach((image) => dirtyImageIdsRef.current.add(image.id));
        nextTexts.forEach((text) => dirtyTextIdsRef.current.add(text.id));
        scheduleSave();
      }

      isHydratingRef.current = false;
      hasHydratedRef.current = true;
    };

    hydrate();

    return () => {
      isCancelled = true;
    };
  }, [scheduleSave]);

  useEffect(() => {
    return () => {
      flushPendingSave();
    };
  }, [flushPendingSave]);

  return (
    <CanvasContext.Provider
      value={{
        scale,
        setScale,
        positionX,
        positionY,
        setPosition,
        notes,
        images,
        texts,
        addNote,
        addImage,
        addText,
        updateNote,
        updateText,
        updateNotePosition,
        updateImagePosition,
        updateTextPosition,
        deleteNote,
        deleteImage,
        deleteText,
        updateNoteDimensions,
        updateTextDimensions,
        updateImageDimensions,
        updateNoteColor,
        updateNoteImage,
        removeNoteImage,
        isAnyNoteEditing,
        setNoteEditing,
      }}
    >
      {children}
    </CanvasContext.Provider>
  );
};

export const useCanvas = () => {
  const context = useContext(CanvasContext);
  if (!context) {
    throw new Error("useCanvas must be used within a CanvasProvider");
  }
  return context;
};
