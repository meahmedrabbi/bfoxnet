/**
 * AppLayout component - responsive main application layout.
 * Shows Navbar on both mobile and desktop.
 */
'use client';

import React from 'react';
import { Box, Container, useTheme, useMediaQuery } from '@mui/material';
import { Navbar } from './Navbar';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navbarHeight = isMobile ? 56 : 64;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          mt: `${navbarHeight}px`,
          bgcolor: theme.palette.mode === 'dark' ? 'background.default' : '#f5f7fa',
          minHeight: `calc(100vh - ${navbarHeight}px)`,
        }}
      >
        <Container
          maxWidth="lg"
          sx={{
            py: { xs: 2, md: 4 },
            px: { xs: 2, sm: 3, md: 4 },
          }}
        >
          {children}
        </Container>
      </Box>
    </Box>
  );
};
