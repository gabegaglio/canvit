
# Infinite Canvas App Architecture (Next.js + Supabase + TailwindCSS)

## 🧱 Overview
You're building an infinite scrollable and zoomable canvas app where users can:
- Create customizable boxes (notes)
- Edit rich-text (like Google Docs)
- Resize, move, recolor, and add images
- View and edit a rich modal interface on click
- Use Supabase for user authentication and storing content

Tech stack:
- **Frontend**: Next.js 14 (App Router), TypeScript, TailwindCSS
- **Database + Auth**: Supabase
- **Rich Text Editing**: [Tiptap](https://tiptap.dev/) or [Remirror](https://remirror.io/)

---

## 📁 File & Folder Structure
```bash
📦 app
├── 📁 api               # Route handlers (Next.js API routes)
├── 📁 dashboard         # Canvas and UI (protected routes)
│   ├── 📁 components     # Reusable UI components
│   ├── 📁 editor         # Rich-text modal editor
│   ├── 📁 canvas         # Canvas rendering and logic
│   ├── 📁 hooks          # Custom React hooks (zoom, pan, etc.)
│   ├── 📁 services       # Client-side logic for Supabase and app state
│   ├── 📄 page.tsx       # Main canvas page
├── 📁 auth              # Sign in/up logic
├── 📄 layout.tsx        # Shared layout
├── 📄 globals.css       # Tailwind base styles

📦 lib
├── 📄 supabase.ts       # Supabase client
├── 📄 types.ts          # Global TypeScript types

📦 public                # Static assets
📦 styles                # Tailwind config / custom styles
```

---

## 🧠 What Each Part Does

### `/app/dashboard`
- Main application UI, canvas, and editor components

#### `components`
- `Box.tsx`: UI for individual box elements
- `BoxControls.tsx`: Color, resize, image, delete options

#### `editor`
- `TextEditorModal.tsx`: Rich-text modal powered by Tiptap
- `Toolbar.tsx`: Formatting buttons (bold, italics, checklist, etc.)

#### `canvas`
- `Canvas.tsx`: Scrollable, zoomable wrapper using CSS transforms
- `CanvasProvider.tsx`: Manages pan/zoom state with context

#### `hooks`
- `usePanZoom.ts`: Custom hook for canvas interaction
- `useBoxes.ts`: Fetch, add, update, delete boxes

#### `services`
- `supabaseService.ts`: Abstraction for DB and auth actions
- `canvasService.ts`: Box and canvas-specific storage logic

### `/auth`
- Sign in/up routes using Supabase auth

### `/lib`
- `supabase.ts`: Initialized Supabase client for use across app
- `types.ts`: Box type, user session, canvas state types

---

## 🧠 State Management

### Global State (via Context or Zustand):
- **Canvas state**: zoom level, pan offset
- **Active box**: selected box for modal editing
- **Auth state**: Supabase user session

### Local State:
- **Rich-text content**: inside `TextEditorModal`
- **Hover / interaction**: inside `Box.tsx` and `BoxControls`

---

## 🔗 Supabase Connections

### Tables:
- `users`: Default auth users table
- `boxes`: `{ id, user_id, content, color, position, size, image_url, created_at }`

### Auth:
- Use Supabase Auth client to log in/out
- Protect `dashboard/` routes with session check middleware

### Storage:
- Store uploaded box images in Supabase Storage

### Real-time:
- Optional: Subscribe to `boxes` updates for collaboration

---

## 🧰 Third-Party Libraries

- **Tiptap**: Rich-text editing (bold, underline, alignment, checklist)
- **Framer Motion**: Animations for modals and transitions
- **react-use-gesture + zustand**: Smooth pan and zoom
- **shadcn/ui**: Styled UI components

---

## ✅ Summary
This structure gives you scalable separation between:
- Canvas rendering & interaction
- Rich modal editing
- Supabase-powered persistence & auth

Let me know when you're ready for **Step 2: Implementing the Canvas Layout**.
