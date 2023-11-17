import type { FunctionComponent, ReactNode } from 'react';
import { createContext, useState } from 'react';
import { ThemeProvider } from 'styled-components';

import { dark, light } from './config/theme';
import { MetaMaskProvider } from './hooks';
import { getThemePreference, setLocalStorage } from './utils';

export type RootProps = {
  children: ReactNode;
};

type ToggleTheme = () => void;

export const ToggleThemeContext = createContext<ToggleTheme>(
  (): void => undefined,
);

export const Root: FunctionComponent<RootProps> = ({ children }) => {
  const [darkTheme, setDarkTheme] = useState(getThemePreference());

  const toggleTheme: ToggleTheme = () => {
    setLocalStorage('theme', darkTheme ? 'light' : 'dark');
    setDarkTheme(!darkTheme);
  };

  return (
    <ToggleThemeContext.Provider value={toggleTheme}>
      <ThemeProvider theme={darkTheme ? dark : light}>
        <MetaMaskProvider>{children}</MetaMaskProvider>
      </ThemeProvider>
    </ToggleThemeContext.Provider>
  );
};
