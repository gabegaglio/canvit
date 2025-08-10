import React, { createContext, useContext, useEffect, useState } from "react";

export type Theme = "light" | "dark" | "auto";

interface ThemeContextType {
  theme: Theme;
  currentTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
  initialTheme?: Theme;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  initialTheme = "light",
}) => {
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const [currentTheme, setCurrentTheme] = useState<"light" | "dark">("light");

  // Determine the actual theme based on the setting and system preference
  useEffect(() => {
    const updateCurrentTheme = () => {
      if (theme === "auto") {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
          .matches
          ? "dark"
          : "light";
        setCurrentTheme(systemTheme);
      } else {
        setCurrentTheme(theme);
      }
    };

    updateCurrentTheme();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => updateCurrentTheme();
    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(currentTheme);
  }, [currentTheme]);

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        currentTheme,
        setTheme: handleSetTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
