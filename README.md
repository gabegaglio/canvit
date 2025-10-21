# Canvit

**Live Demo:** [https://gabegaglio.github.io/canvit/](https://gabegaglio.github.io/canvit/)

Canvit is an infinite canvas workspace for organizing thoughts, notes, and images. Pan, zoom, and arrange content freely in an unbounded 2D space.

## Features

- **Infinite Canvas**: Scroll and zoom smoothly across an unbounded workspace
- **Notes**: Create, edit, resize, and color-code sticky notes with rich text support
- **Text Boxes**: Add standalone text elements with formatting options (bold, italic, underline, alignment)
- **Images**: Upload and position images anywhere on the canvas
- **Grid Snapping**: Optional grid lines and snap-to-grid for precise alignment
- **Themes**: Light and dark mode with glassmorphic UI
- **Context Menus**: Right-click for quick actions on canvas elements
- **Customizable**: Adjust note radius, margins, and visual styling

## Tech Stack

- **React 19** + **TypeScript**
- **Vite** for fast builds and HMR
- **TailwindCSS 4** for styling with glassmorphic design
- **Tiptap** for rich text editing
- **Supabase** for authentication and data persistence
- **Lucide React** for icons

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view the app.

For device testing on your local network:

```bash
npm run dev -- --host
```

### Build

```bash
npm run build
```

Outputs to `dist/` directory. Preview the production build:

```bash
npm run preview
```

### Lint

```bash
npm run lint
```

## Project Structure

```
src/
├── canvas/
│   ├── components/     # Canvas UI elements (Note, Text, Image, Toolbar)
│   ├── hooks/          # Canvas logic (pan/zoom, snapping, editing)
│   ├── menus/          # Context menus and settings
│   └── utils/          # Canvas utilities
├── components/ui/      # Reusable UI primitives (shadcn-inspired)
├── contexts/           # React contexts (Canvas, Auth)
├── lib/                # Supabase client and utilities
└── Canvas.tsx          # Main canvas orchestrator
```

## Usage

- **Pan**: Click and drag anywhere on the canvas
- **Zoom**: Scroll to zoom in/out
- **Add Note**: Click the '+' button or right-click → 'Add Note'
- **Add Text**: Click the 'T' button in the toolbar
- **Add Image**: Click the image button and upload a file
- **Edit**: Click any element to edit its content
- **Resize**: Drag the bottom-right corner of notes and text boxes
- **Context Menu**: Right-click elements for color, delete, and other options
- **Grid**: Toggle grid lines or snap-to-grid from toolbar or context menu
- **Settings**: Click the settings icon to customize appearance

## License

MIT
