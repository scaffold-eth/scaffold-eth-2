import { useEffect, useState } from "react";
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
  const [prevIsDarkOs, setPrevIsDarkOs] = useState(isDarkOS);

  const initialStorageValue: boolean | null = useReadLocalStorage(LOCAL_STORAGE_THEME_KEY);
  const [isDarkMode, setIsDarkMode] = useLocalStorage<boolean>(LOCAL_STORAGE_THEME_KEY, Boolean(defaultValue));

  // set if no init value
  useEffect(() => {
    if (initialStorageValue === null) {
      setIsDarkMode(defaultValue || isDarkOS);
    }
  }, [defaultValue, isDarkOS, setIsDarkMode, initialStorageValue]);

  // update on os color change
  useEffect(() => {
    if (isDarkOS !== prevIsDarkOs) {
      setPrevIsDarkOs(isDarkOS);
      setIsDarkMode(isDarkOS);
    }
  }, [isDarkOS, prevIsDarkOs, setIsDarkMode]);

  return {
    isDarkMode,
    toggle: () => setIsDarkMode(prev => !prev),
    enable: () => setIsDarkMode(true),
    disable: () => setIsDarkMode(false),
  };
}
