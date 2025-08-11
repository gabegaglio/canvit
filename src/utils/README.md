# Utils Directory

This directory contains general utility functions and components that are used across the application.

## Files

### `dragUtils.ts`

Contains utility functions for drag and drop functionality:

- `createDragHandler` - Creates drag handlers for elements
- `getCursorStyle` - Determines appropriate cursor styles based on interaction state

### `DebugPanel.tsx`

A debug component for development purposes.

### `ideaBank.ts`

Utility functions for managing idea bank functionality.

## Organization Notes

- **Hooks** are organized by feature in `src/canvas/hooks/`
- **Canvas-specific utilities** are in `src/canvas/hooks/canvas/`
- **General utilities** remain in this directory

The `useElementPosition` hook was moved to `src/canvas/hooks/canvas/` since it's specifically used by canvas components and follows the feature-based organization pattern.
