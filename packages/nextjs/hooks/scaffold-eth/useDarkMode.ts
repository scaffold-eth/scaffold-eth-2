import { useEffect } from "react";
import { useLocalStorage, useMediaQuery, useReadLocalStorage } from "usehooks-ts";

const COLOR_SCHEME_QUERY = "(prefers-color-scheme: dark)";

interface UseDarkModeOutput {
  isDarkMode: boolean;
  toggle: () => void;
  enable: () => void;
  disable: () => void;
}

const LOCAL_STORAGE_THEME_KEY = "usehooks-ts-dark-mode";

export function useDarkMode(defaultValue?: boolean): UseDarkModeOutput {
  const isDarkOS = useMediaQuery(COLOR_SCHEME_QUERY);
  const storageValue: boolean | null = useReadLocalStorage(LOCAL_STORAGE_THEME_KEY);

  const [isDarkMode, setDarkMode] = useLocalStorage<boolean>(LOCAL_STORAGE_THEME_KEY, defaultValue ?? false);

  useEffect(() => {
    if (storageValue === null && isDarkOS) {
      setDarkMode(isDarkOS);
    }
  }, [isDarkOS, setDarkMode, storageValue]);

  return {
    isDarkMode,
    toggle: () => setDarkMode(prev => !prev),
    enable: () => setDarkMode(true),
    disable: () => setDarkMode(false),
  };
}
