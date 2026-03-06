/**
 * Theme context for dark/light mode management.
 * Persists preference to localStorage.
 */
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface ThemeContextValue {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  darkMode: false,
  toggleDarkMode: () => {},
});

export const useThemeMode = () => useContext(ThemeContext);

export const ThemeModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Read from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('bfoxnet-theme');
    if (stored === 'dark') {
      setDarkMode(true);
    } else if (stored === 'light') {
      setDarkMode(false);
    } else {
      // Use system preference if no stored preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(prefersDark);
    }
    setMounted(true);
  }, []);

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const next = !prev;
      localStorage.setItem('bfoxnet-theme', next ? 'dark' : 'light');
      return next;
    });
  };

  // Avoid flash of wrong theme
  if (!mounted) return null;

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};
