/**
 * Orders page - displays the list of user's withdrawal requests.
 */
'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Alert,
  AlertTitle,
  Button,
  Tabs,
  Tab,
  Card,
  CardContent,
  Chip,
  Stack,
  Pagination,
  Divider,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Refresh as RefreshIcon,
  CheckCircle as SuccessIcon,
  Schedule as PendingIcon,
  Cancel as RejectedIcon,
  AccountBalanceWallet as WalletIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/Layout/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { triggerHaptic } from '@/lib/telegram';
import { withdrawalsApi, authApi, WithdrawalResponse, WithdrawalStatusType, UserProfileResponse } from '@/lib/api';
import toast from 'react-hot-toast';

// Helper function to get status color
const getStatusColor = (status: WithdrawalStatusType): 'success' | 'warning' | 'error' | 'default' => {
  switch (status) {
    case 'completed': return 'success';
    case 'pending': return 'warning';
    case 'rejected': return 'error';
    default: return 'default';
  }
};

// Helper function to format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Helper function to get method display name
const getMethodName = (method: string) => {
  switch (method) {
    case 'card': return 'Card';
    case 'crypto': return 'Crypto';
    case 'binance': return 'Binance Pay';
    default: return method;
  }
};

export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, error: authError } = useAuth();
  
  const [withdrawals, setWithdrawals] = useState<WithdrawalResponse[]>([]);
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const perPage = 20;
  
  const initialFetchDone = useRef(false);

  // Map tab index to status
  const tabToStatus: (WithdrawalStatusType | undefined)[] = [undefined, 'pending', 'completed'];

  const fetchData = useCallback(async (status?: WithdrawalStatusType, pageNum: number = 1) => {
    setIsLoading(true);
    try {
      const [withdrawalsRes, profileRes] = await Promise.all([
        withdrawalsApi.list(status, pageNum, perPage),
        authApi.getProfile(),
      ]);
      setWithdrawals(withdrawalsRes.data.withdrawals);
      setTotalPages(Math.ceil(withdrawalsRes.data.total / perPage) || 1);
      setProfile(profileRes.data);
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { detail?: string } } }).response?.data?.detail || 
                      'Failed to fetch withdrawals';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    triggerHaptic('selection');
    setTabValue(newValue);
    setPage(1);
    fetchData(tabToStatus[newValue], 1);
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage);
    fetchData(tabToStatus[tabValue], newPage);
  };

  const handleBack = () => {
    triggerHaptic('selection');
    router.push('/');
  };

  const handleRetry = () => {
    window.location.reload();
  };

  const handleWithdrawalClick = (withdrawal: WithdrawalResponse) => {
    triggerHaptic('impact', 'light');
    router.push(`/orders/${withdrawal.id}`);
  };

  const handleWithdraw = () => {
    triggerHaptic('impact', 'medium');
    router.push('/withdraw');
  };

  // Initial fetch
  useEffect(() => {
    if (isAuthenticated && !initialFetchDone.current) {
      initialFetchDone.current = true;
      fetchData(undefined, 1);
    }
  }, [isAuthenticated, fetchData]);

  if (authLoading) {
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

  if (authError) {
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
          {authError}
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

  // Render empty state based on current tab
  const renderEmptyState = () => {
    const messages: Record<number, { title: string; description: string }> = {
      0: {
        title: 'No withdrawals yet',
        description: 'Your withdrawal history will appear here',
      },
      1: {
        title: 'No pending withdrawals',
        description: 'Pending withdrawals will appear here',
      },
      2: {
        title: 'No completed withdrawals',
        description: 'Completed withdrawals will appear here',
      },
    };

    const msg = messages[tabValue];
    return (
      <Box textAlign="center" py={4}>
        <Typography variant="h6" color="text.secondary">
          {msg.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={1}>
          {msg.description}
        </Typography>
      </Box>
    );
  };

  return (
    <AppLayout>
      <Box pb={10}>
        {/* Header */}
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <IconButton onClick={handleBack} edge="start" aria-label="back">
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" component="h1" fontWeight={600}>
            Orders
          </Typography>
        </Box>

        {/* Status Tabs */}
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="withdrawal status tabs"
          variant="fullWidth"
          sx={{
            mb: 2,
            '& .MuiTab-root': {
              minHeight: 48,
              textTransform: 'none',
            },
          }}
        >
          <Tab 
            icon={<RefreshIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
            label="All"
          />
          <Tab 
            icon={<PendingIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
            label="Pending"
          />
          <Tab 
            icon={<SuccessIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
            label="Success"
          />
        </Tabs>

        {/* Content */}
        {isLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" py={4}>
            <CircularProgress size={24} />
          </Box>
        ) : withdrawals.length === 0 ? (
          renderEmptyState()
        ) : (
          <>
            {/* Withdrawal Cards */}
            <Stack spacing={1.5}>
              {withdrawals.map((withdrawal) => (
                <Card 
                  key={withdrawal.id}
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                  onClick={() => handleWithdrawalClick(withdrawal)}
                >
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {withdrawal.transaction_id}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(withdrawal.created_at)}
                        </Typography>
                      </Box>
                      <Chip
                        label={withdrawal.status}
                        color={getStatusColor(withdrawal.status)}
                        size="small"
                      />
                    </Box>
                    
                    <Divider sx={{ my: 1 }} />
                    
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {getMethodName(withdrawal.method)}
                          {withdrawal.crypto_channel && ` (${withdrawal.crypto_channel})`}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 150 }}>
                          {withdrawal.address}
                        </Typography>
                      </Box>
                      <Box textAlign="right">
                        <Typography variant="h6" fontWeight={700} color="success.main">
                          ${withdrawal.amount.toFixed(2)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {withdrawal.total_accounts} accounts
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Stack>

            {/* Pagination */}
            {totalPages > 1 && (
              <Box display="flex" justifyContent="center" mt={3}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                  size="small"
                />
              </Box>
            )}
          </>
        )}

        {/* Withdraw Button - Full Width Fixed at Bottom */}
        <Box
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            p: 2,
            bgcolor: 'background.paper',
            borderTop: 1,
            borderColor: 'divider',
          }}
        >
          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={handleWithdraw}
            startIcon={<WalletIcon />}
            sx={{
              py: 1.5,
              background: (theme) => `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
              '&:hover': {
                background: (theme) => `linear-gradient(135deg, ${theme.palette.success.dark} 0%, ${theme.palette.success.main} 100%)`,
              },
            }}
          >
            Withdraw ${profile?.balance.toFixed(2) || '0.00'}
          </Button>
        </Box>
      </Box>
    </AppLayout>
  );
}
