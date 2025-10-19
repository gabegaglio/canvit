# Rich Text Editor Feature for Notes

## Overview
Implement a rich text editor for notes using React Quill to provide advanced text formatting capabilities including bulleted lists, task lists, text color, alignment, and other formatting options.

## Features to Implement

### Core Rich Text Features
- **Bulleted Lists**: Create and manage bulleted lists
- **Task Lists**: Checkbox-style task lists with completion tracking
- **Text Color**: Change text color with color picker
- **Text Alignment**: Left, center, right, and justify alignment
- **Bold/Italic**: Basic text formatting
- **Underline/Strikethrough**: Additional text decorations
- **Font Size**: Adjustable font sizes
- **Font Family**: Different font options
- **Text Highlighting**: Background color for text

### User Experience
- **Toolbar**: Floating toolbar with formatting options
- **Keyboard Shortcuts**: Common shortcuts (Ctrl+B for bold, etc.)
- **Auto-save**: Save changes automatically
- **Format Preservation**: Maintain formatting when switching between edit/view modes

## Technical Implementation

### Dependencies
- `react-quill`: Rich text editor component
- `@types/react-quill`: TypeScript definitions

### Component Structure
1. **RichTextEditor**: Wrapper component using React Quill
2. **EditorToolbar**: Custom toolbar with formatting options
3. **ColorPicker**: Color selection for text and background
4. **FontControls**: Font family and size controls

### Integration Points
- Replace current textarea in Note component
- Update useNoteEditing hook to handle rich text content
- Modify note content storage to handle HTML content
- Update note display to render HTML content

### Data Format
- Store content as HTML string
- Convert HTML to plain text for search/filtering
- Maintain backward compatibility with existing plain text notes

## Implementation Steps

1. **Install Dependencies**: Add react-quill and types
2. **Remove Keyboard Conflicts**: Fix existing keyboard event handlers
3. **Create RichTextEditor Component**: Basic React Quill integration
4. **Customize Toolbar**: Add specific formatting options
5. **Integrate with Note Component**: Replace textarea with rich editor
6. **Update Hooks**: Modify editing logic for rich text
7. **Style Integration**: Match existing design system
8. **Testing**: Verify all formatting features work correctly

## Keyboard Shortcuts to Support
- `Ctrl/Cmd + B`: Bold
- `Ctrl/Cmd + I`: Italic
- `Ctrl/Cmd + U`: Underline
- `Ctrl/Cmd + Shift + L`: Left align
- `Ctrl/Cmd + Shift + C`: Center align
- `Ctrl/Cmd + Shift + R`: Right align
- `Ctrl/Cmd + Shift + J`: Justify
- `Ctrl/Cmd + Shift + 7`: Ordered list
- `Ctrl/Cmd + Shift + 8`: Bullet list

## Future Enhancements
- **Tables**: Insert and edit tables
- **Images**: Embed images in notes
- **Links**: Add hyperlinks
- **Code Blocks**: Syntax highlighting for code
- **Math Equations**: LaTeX support
- **Collaborative Editing**: Real-time collaboration
