/**
 * Theme Provider component - handles Material-UI theme and dark mode.
 */
'use client';

import React, { useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';
import { Toaster } from 'react-hot-toast';
import { lightTheme, darkTheme } from '@/lib/theme';
import { ThemeModeProvider, useThemeMode } from '@/context/ThemeContext';

interface ThemeProviderProps {
  children: React.ReactNode;
}

const MuiWrapper: React.FC<ThemeProviderProps> = ({ children }) => {
  const { darkMode } = useThemeMode();

  const theme = useMemo(() => {
    return darkMode ? darkTheme : lightTheme;
  }, [darkMode]);

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: theme.palette.background.paper,
            color: theme.palette.text.primary,
            borderRadius: '12px',
          },
          success: {
            iconTheme: {
              primary: theme.palette.success.main,
              secondary: theme.palette.success.contrastText,
            },
          },
          error: {
            iconTheme: {
              primary: theme.palette.error.main,
              secondary: theme.palette.error.contrastText,
            },
          },
        }}
      />
      {children}
    </MuiThemeProvider>
  );
};

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  return (
    <ThemeModeProvider>
      <MuiWrapper>{children}</MuiWrapper>
    </ThemeModeProvider>
  );
};
