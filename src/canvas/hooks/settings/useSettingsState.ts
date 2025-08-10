import { useState, useCallback, useEffect } from "react";
import type { Settings } from "./useSettings";
import { DEFAULT_SETTINGS } from "./useSettings";

export const useSettingsState = (
  initialSettings: Settings = DEFAULT_SETTINGS
) => {
  const [localSettings, setLocalSettings] = useState<Settings>(initialSettings);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Sync localSettings with initialSettings when they change
  useEffect(() => {
    setLocalSettings(initialSettings);
  }, [initialSettings]);

  // Track changes by comparing with initial settings
  useEffect(() => {
    const hasChanges =
      JSON.stringify(localSettings) !== JSON.stringify(initialSettings);
    setHasUnsavedChanges(hasChanges);
  }, [localSettings, initialSettings]);

  const updateLocalSetting = useCallback(
    <K extends keyof Settings>(key: K, value: Settings[K]) => {
      setLocalSettings((prev) => ({
        ...prev,
        [key]: value,
      }));
    },
    []
  );

  const updateMultipleLocalSettings = useCallback(
    (updates: Partial<Settings>) => {
      setLocalSettings((prev) => ({
        ...prev,
        ...updates,
      }));
    },
    []
  );

  const resetLocalSettings = useCallback(() => {
    setLocalSettings(initialSettings);
    setHasUnsavedChanges(false);
  }, [initialSettings]);

  const applyLocalSettings = useCallback(() => {
    // This will be called when settings are saved
    setHasUnsavedChanges(false);
    return localSettings;
  }, [localSettings]);

  return {
    localSettings,
    hasUnsavedChanges,
    updateLocalSetting,
    updateMultipleLocalSettings,
    resetLocalSettings,
    applyLocalSettings,
  };
};
