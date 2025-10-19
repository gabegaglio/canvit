# Text Feature Implementation Tasks

## 1. Change Add Button Logo to "T"

- [x] Update AddTextButton.tsx to use "T" instead of current icon

## 2. Add Text to Right-Click Canvas Context Menu

- [x] Update CanvasContextmenu.tsx to include "Add Text" option
- [x] Ensure it uses the same logic as toolbar button

## 3. Add Border Around Text Box in Edit Mode

- [x] Update Text.tsx to show border when isEditing is true
- [x] Style the border appropriately for the theme

## 4. Make "New Text" Disappear When Text is Entered

- [x] Update Text.tsx to hide placeholder text when content exists
- [x] Ensure placeholder only shows when content is empty

## 5. Prevent Text Wrapping Unless User Manually Shrinks Box

- [x] Update Text.tsx to use white-space: nowrap by default
- [x] Only allow wrapping when user manually constrains width
- [x] Ensure text container sizes to content width

## Implementation Order:

1. Logo change (visual)
2. Context menu addition (functionality)
3. Edit mode border (visual)
4. Placeholder text logic (UX)
5. Text wrapping behavior (layout)

## Additional Fixes Applied:

### ✅ Fixed Text Sizing Issues

- Text container now fits content exactly using `width: fit-content`
- Textarea width dynamically adjusts to content length using `ch` units
- Removed unnecessary `w-auto h-auto` classes

### ✅ Fixed Text Persistence Issues

- Added `onUpdateText` prop to Text component
- Text content now properly saves when editing ends
- Connected to CanvasContext's `updateText` function
- Text no longer reverts to "New Text" after editing
