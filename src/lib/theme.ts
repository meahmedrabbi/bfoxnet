/**
 * Material-UI theme configuration with BFoxNet branding.
 * Responsive for both mobile and desktop.
 */
import { createTheme, ThemeOptions } from '@mui/material/styles';

// BFoxNet color palette
const telegramColors = {
  primary: {
    main: '#0088cc',
    light: '#54a9eb',
    dark: '#006699',
  },
  secondary: {
    main: '#7c3aed',
    light: '#a78bfa',
    dark: '#5b21b6',
  },
  background: {
    default: '#ffffff',
    paper: '#ffffff',
    dark: '#17212b',
    darkPaper: '#1e2c3a',
  },
  text: {
    primary: '#000000',
    secondary: '#707579',
    dark: '#ffffff',
    darkSecondary: '#aaaaaa',
  },
};

// Common theme options
const commonTheme: ThemeOptions = {
  shape: {
    borderRadius: 6,
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontSize: '2rem', fontWeight: 700 },
    h2: { fontSize: '1.625rem', fontWeight: 700 },
    h3: { fontSize: '1.375rem', fontWeight: 600 },
    h4: { fontSize: '1.25rem', fontWeight: 600 },
    h5: { fontSize: '1.125rem', fontWeight: 600 },
    h6: { fontSize: '1rem', fontWeight: 600 },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          padding: '8px 16px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
          border: '1px solid rgba(0, 0, 0, 0.06)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 6,
        },
        elevation0: {
          boxShadow: 'none',
        },
        elevation1: {
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
        },
        elevation2: {
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.06)',
        },
        elevation3: {
          boxShadow: '0 3px 8px rgba(0, 0, 0, 0.08)',
        },
        elevation8: {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 4,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 6,
          },
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.16)',
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.12)',
        },
      },
    },
  },
};

// Light theme
export const lightTheme = createTheme({
  ...commonTheme,
  palette: {
    mode: 'light',
    primary: telegramColors.primary,
    secondary: telegramColors.secondary,
    background: {
      default: '#f5f7fa',
      paper: telegramColors.background.paper,
    },
    text: {
      primary: telegramColors.text.primary,
      secondary: telegramColors.text.secondary,
    },
  },
});

// Dark theme
export const darkTheme = createTheme({
  ...commonTheme,
  palette: {
    mode: 'dark',
    primary: telegramColors.primary,
    secondary: telegramColors.secondary,
    background: {
      default: telegramColors.background.dark,
      paper: telegramColors.background.darkPaper,
    },
    text: {
      primary: telegramColors.text.dark,
      secondary: telegramColors.text.darkSecondary,
    },
  },
  components: {
    ...commonTheme.components,
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          boxShadow: 'none',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        },
      },
    },
  },
});
