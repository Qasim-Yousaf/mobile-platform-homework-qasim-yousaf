import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFS_KEY = 'user_preferences';

type Theme = 'light' | 'dark';

type ThemeContextType = {
  theme: Theme;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  darkMode: false,
  setDarkMode: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [darkMode, setDarkModeState] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(PREFS_KEY).then(val => {
      if (val) {
        const prefs = JSON.parse(val);
        setDarkModeState(prefs.darkMode ?? false);
      }
    });
  }, []);

  function setDarkMode(val: boolean) {
    setDarkModeState(val);
    AsyncStorage.getItem(PREFS_KEY).then(existing => {
      const prefs = existing ? JSON.parse(existing) : {};
      AsyncStorage.setItem(PREFS_KEY, JSON.stringify({ ...prefs, darkMode: val }));
    });
  }

  return (
    <ThemeContext.Provider value={{ theme: darkMode ? 'dark' : 'light', darkMode, setDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
