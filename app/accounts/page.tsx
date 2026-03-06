/**
 * Accounts page - displays the list of user's Telegram accounts.
 */
'use client';

import React from 'react';
import {
  Box,
  Typography,
  Fab,
  IconButton,
  CircularProgress,
  Alert,
  AlertTitle,
  Button,
} from '@mui/material';
import {
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/Layout/AppLayout';
import { AccountList } from '@/components/Account/AccountList';
import { useAuth } from '@/hooks/useAuth';
import { triggerHaptic } from '@/lib/telegram';

export default function AccountsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, error } = useAuth();

  const handleOpenCreate = () => {
    triggerHaptic('impact', 'medium');
    router.push('/accounts/add');
  };

  const handleBack = () => {
    triggerHaptic('selection');
    router.push('/');
  };

  const handleRetry = () => {
    window.location.reload();
  };

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        flexDirection="column"
        p={2}
      >
        <CircularProgress />
        <Typography variant="body2" color="text.secondary" mt={2}>
          Loading...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        flexDirection="column"
        p={2}
      >
        <Alert severity="error" sx={{ mb: 2, maxWidth: 400 }}>
          <AlertTitle>Authentication Error</AlertTitle>
          {error}
        </Alert>
        
        <Button 
          variant="contained" 
          startIcon={<RefreshIcon />}
          onClick={handleRetry}
        >
          Retry
        </Button>
      </Box>
    );
  }

  if (!isAuthenticated) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        flexDirection="column"
        p={2}
      >
        <Alert severity="warning" sx={{ maxWidth: 400 }}>
          <AlertTitle>Not Authenticated</AlertTitle>
          Sign in to access this page
        </Alert>
      </Box>
    );
  }

  return (
    <AppLayout>
      <Box>
        {/* Header */}
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <IconButton onClick={handleBack} edge="start" aria-label="back">
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" component="h1" fontWeight={600}>
            My Accounts
          </Typography>
        </Box>
        
        <AccountList />

        {/* Floating Action Button */}
        <Fab
          color="primary"
          aria-label="add account"
          onClick={handleOpenCreate}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
          }}
        >
          <AddIcon />
        </Fab>
      </Box>
    </AppLayout>
  );
}
