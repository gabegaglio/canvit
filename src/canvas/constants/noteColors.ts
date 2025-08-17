/**
 * Predefined note color options
 */

export interface NoteColorOption {
  id: string;
  name: string;
  value: string;
  textColor: string;
}

// Logo blue color
const LOGO_BLUE = "#00AEEF";

export const NOTE_COLORS: NoteColorOption[] = [
  {
    id: "default",
    name: "Default",
    value: "#f8f9fa",
    textColor: "black",
  },
  {
    id: "blue",
    name: "Blue",
    value: LOGO_BLUE,
    textColor: "white",
  },
  {
    id: "lightblue",
    name: "Light Blue",
    value: "#E6F7FF",
    textColor: "black",
  },
  {
    id: "green",
    name: "Green",
    value: "#B5F5CA",
    textColor: "black",
  },
  {
    id: "yellow",
    name: "Yellow",
    value: "#FFF8E1",
    textColor: "black",
  },
  {
    id: "orange",
    name: "Orange",
    value: "#FFEAD1",
    textColor: "black",
  },
  {
    id: "red",
    name: "Red",
    value: "#FFCDD2",
    textColor: "black",
  },
  {
    id: "purple",
    name: "Purple",
    value: "#E1BEE7",
    textColor: "black",
  },
];
