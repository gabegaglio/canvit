
# Step 2: Granular MVP Task Plan

This file outlines a step-by-step development plan for building an MVP of the Infinite Canvas App using **Vite**, **Supabase**, and **TailwindCSS**. Each task is small, testable, and focused on a single concern.

---

## 🔧 Project Setup

### 1. Initialize Vite project with React + TypeScript
- Start: Run `npm create vite@latest`
- End: `src/main.tsx` renders `<App />`

### 2. Set up TailwindCSS
- Start: Install Tailwind with PostCSS
- End: Basic Tailwind styling is working on test UI

### 3. Initialize Supabase project
- Start: Create project on supabase.io
- End: You have `SUPABASE_URL` and `SUPABASE_ANON_KEY` in `.env`

### 4. Set up Supabase client in `lib/supabase.ts`
- Start: Install `@supabase/supabase-js`
- End: Able to log in using Supabase from app

---

## 🔐 Auth Flow

### 5. Create `AuthContext` to track user session
- Start: Context + hook for session tracking
- End: Automatically redirects unauthenticated users to `/auth`

### 6. Build `Auth.tsx` page (login/signup)
- Start: Design simple form with email + password
- End: Able to create account and login via Supabase

---

## 🧭 Canvas Foundation

### 7. Create `CanvasContext` and `CanvasProvider`
- Start: State with `scale`, `positionX`, `positionY`
- End: Provide zoom and pan context to all children

### 8. Build basic `Canvas.tsx`
- Start: A large container that allows scroll/drag
- End: Drag-to-pan and zoom with mouse wheel works

---

## 🗃️ Notees: Core Units

### 9. Create `Note.tsx` component
- Start: A styled div rendered at x/y with size
- End: Can render multiple Notees on canvas

### 10. Add Note on click
- Start: Button or shortcut to add new Note
- End: Note appears at center of current viewport

### 11. Make Note draggable
- Start: Add `react-use-gesture` or manual drag logic
- End: Can reposition Notees on canvas

### 12. Make Note resizable
- Start: Add resize handles
- End: User can resize any Note from corners

---

## 📝 Modal Editor

### 13. Create `TextEditorModal.tsx`
- Start: Modal triggered on Note click
- End: Opens modal with text content loaded

### 14. Integrate Tiptap editor into modal
- Start: Basic setup with bold, italic, etc.
- End: Fully functional rich-text editor

### 15. Add toolbar with formatting buttons
- Start: Create `Toolbar.tsx`
- End: Supports bold, italic, underline, alignment, checklists

---

## 🎨 Note Customization

### 16. Add color picker to Note
- Start: Basic color selection UI
- End: Note background updates dynamically

### 17. Add image upload via Supabase storage
- Start: UI to upload/select image
- End: Note displays uploaded image in background

---

## 💾 Database Integration

### 18. Create `Notes` table in Supabase
- Start: Design schema with position, size, content, etc.
- End: Able to view records in Supabase Studio

### 19. Build `NoteService.ts` for DB interaction
- Start: Write CRUD methods (create, update, delete)
- End: Can persist Notees to DB

### 20. Sync canvas with Supabase on load
- Start: Fetch Notees on user login
- End: Boxes auto-render from Supabase data

---

## ✅ Final Touches

### 21. Add real-time sync (optional)
- Start: Set up Supabase subscriptions
- End: All note changes reflect in real time

### 22. Add mobile-friendly tweaks
- Start: Use responsive Tailwind utilities
- End: Canvas and modals usable on mobile

### 23. Polish UX: loading states, animations
- Start: Add `Framer Motion`, spinners, etc.
- End: App feels smooth and professional

---

Let me know when you're ready for **Step 3: Execute task 1.**
