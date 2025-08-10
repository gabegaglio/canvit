import { useState, useCallback, useEffect } from "react";

export interface Settings {
  // General settings
  showLogo: boolean;
  autoSave: boolean;

  // Note settings
  noteRadius: number;
  notePadding: number;
  noteBorderStyle: "solid" | "dashed" | "dotted" | "none";

  // Grid settings
  gridSize: number;
  gridColor: string;
  gridOpacity: number;

  // Appearance settings
  theme: "light" | "dark" | "auto";
  canvasBackground: string;
  enableDropShadows: boolean;
  enableHoverEffects: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  // General settings
  showLogo: true,
  autoSave: true,

  // Note settings
  noteRadius: 8,
  notePadding: 12,
  noteBorderStyle: "solid",

  // Grid settings
  gridSize: 50,
  gridColor: "#ffffff",
  gridOpacity: 10,

  // Appearance settings
  theme: "light",
  canvasBackground: "#f1f5f9",
  enableDropShadows: true,
  enableHoverEffects: false,
};

const STORAGE_KEY = "canvit-settings";

export const useSettings = () => {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [isOpen, setIsOpen] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedSettings = JSON.parse(stored);
        // Merge with defaults to handle any missing properties
        setSettings({ ...DEFAULT_SETTINGS, ...parsedSettings });
      }
    } catch (error) {
      console.warn("Failed to load settings from localStorage:", error);
    }
  }, []);

  const openSettings = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeSettings = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggleSettings = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const updateSetting = useCallback(
    <K extends keyof Settings>(key: K, value: Settings[K]) => {
      setSettings((prev) => {
        const newSettings = { ...prev, [key]: value };
        // Save to localStorage
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
        } catch (error) {
          console.warn("Failed to save settings to localStorage:", error);
        }
        return newSettings;
      });
    },
    []
  );

  const updateMultipleSettings = useCallback((updates: Partial<Settings>) => {
    setSettings((prev) => {
      const newSettings = { ...prev, ...updates };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
      } catch (error) {
        console.warn("Failed to save settings to localStorage:", error);
      }
      return newSettings;
    });
  }, []);

  const resetToDefaults = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn("Failed to remove settings from localStorage:", error);
    }
  }, []);

  const saveSettings = useCallback(() => {
    // Settings are already saved automatically when updated
    closeSettings();
  }, [closeSettings]);

  return {
    settings,
    isOpen,
    openSettings,
    closeSettings,
    toggleSettings,
    updateSetting,
    updateMultipleSettings,
    resetToDefaults,
    saveSettings,
  };
};
