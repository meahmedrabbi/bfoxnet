/**
 * Admin Withdrawals page - manage user withdrawal requests.
 */
'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  Alert,
  AlertTitle,
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  Pagination,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Refresh as RefreshIcon,
  CheckCircle as SuccessIcon,
  Schedule as PendingIcon,
  Cancel as RejectedIcon,
  Check as ApproveIcon,
  Close as RejectIcon,
  Search as SearchIcon,
  List as ListIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/Layout/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import { triggerHaptic } from '@/lib/telegram';
import { 
  adminWithdrawalsApi, 
  WithdrawalDetailResponse,
  WithdrawalStatusType,
  WithdrawalSessionsResponse,
} from '@/lib/api';
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

// Country flag helper
const COUNTRY_FLAGS: Record<string, string> = {
  // Americas
  "US": "🇺🇸", "CA": "🇨🇦", "MX": "🇲🇽", "BR": "🇧🇷", "AR": "🇦🇷",
  "CO": "🇨🇴", "PE": "🇵🇪", "VE": "🇻🇪", "CL": "🇨🇱", "EC": "🇪🇨",
  // Europe
  "GB": "🇬🇧", "DE": "🇩🇪", "FR": "🇫🇷", "IT": "🇮🇹", "ES": "🇪🇸",
  "PT": "🇵🇹", "NL": "🇳🇱", "BE": "🇧🇪", "CH": "🇨🇭", "AT": "🇦🇹",
  "PL": "🇵🇱", "RU": "🇷🇺", "UA": "🇺🇦", "TR": "🇹🇷", "GR": "🇬🇷",
  // Asia
  "CN": "🇨🇳", "JP": "🇯🇵", "KR": "🇰🇷", "IN": "🇮🇳", "ID": "🇮🇩",
  "TH": "🇹🇭", "VN": "🇻🇳", "PH": "🇵🇭", "MY": "🇲🇾", "SG": "🇸🇬",
  "PK": "🇵🇰", "BD": "🇧🇩", "AE": "🇦🇪", "IL": "🇮🇱",
  // Africa
  "EG": "🇪🇬", "ZA": "🇿🇦", "NG": "🇳🇬", "KE": "🇰🇪",
  // Add more as needed
};

const getCountryFlag = (iso2: string | null) => {
  if (!iso2) return '🏳️';
  return COUNTRY_FLAGS[iso2.toUpperCase()] || '🏳️';
};

export default function AdminWithdrawalsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, error: authError } = useAuth();
  const { isAdmin, isLoading: adminLoading, checkAdminStatus } = useAdmin();
  
  const [withdrawals, setWithdrawals] = useState<WithdrawalDetailResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pendingCount, setPendingCount] = useState(0);
  const perPage = 20;
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  
  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<WithdrawalDetailResponse | null>(null);
  const [dialogAction, setDialogAction] = useState<'approve' | 'reject'>('approve');
  const [isProcessing, setIsProcessing] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  
  // Numbers dialog state
  const [numbersDialogOpen, setNumbersDialogOpen] = useState(false);
  const [selectedWithdrawalForNumbers, setSelectedWithdrawalForNumbers] = useState<WithdrawalDetailResponse | null>(null);
  const [withdrawalSessions, setWithdrawalSessions] = useState<WithdrawalSessionsResponse | null>(null);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [numbersTabValue, setNumbersTabValue] = useState(0);
  
  const initialFetchDone = useRef(false);

  // Map tab index to status
  const tabToStatus: (WithdrawalStatusType | undefined)[] = [undefined, 'pending', 'completed', 'rejected'];

  const fetchWithdrawals = useCallback(async (status?: WithdrawalStatusType, pageNum: number = 1, search?: string) => {
    setIsLoading(true);
    try {
      const [withdrawalsRes, pendingCountRes] = await Promise.all([
        adminWithdrawalsApi.list(status, pageNum, perPage, search),
        adminWithdrawalsApi.getPendingCount(),
      ]);
      
      // TODO: TEMPORARY DEBUG LOGGING - Remove after debugging
      console.log('[fetchWithdrawals] Raw response:', withdrawalsRes.data);
      console.log('[fetchWithdrawals] First withdrawal:', withdrawalsRes.data.withdrawals[0]);
      if (withdrawalsRes.data.withdrawals[0]) {
        console.log('[fetchWithdrawals] User data in first withdrawal:', {
          user_telegram_id: withdrawalsRes.data.withdrawals[0].user_telegram_id,
          user_username: withdrawalsRes.data.withdrawals[0].user_username,
          user_first_name: withdrawalsRes.data.withdrawals[0].user_first_name,
        });
      }
      
      // No type cast needed - API now correctly returns WithdrawalDetailResponse[]
      setWithdrawals(withdrawalsRes.data.withdrawals);
      setTotalPages(Math.ceil(withdrawalsRes.data.total / perPage) || 1);
      setPendingCount(pendingCountRes.data.pending_count);
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
    setSearchQuery('');
    setSearchInput('');
    fetchWithdrawals(tabToStatus[newValue], 1);
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage);
    fetchWithdrawals(tabToStatus[tabValue], newPage, searchQuery);
  };

  const handleSearch = () => {
    setSearchQuery(searchInput);
    setPage(1);
    fetchWithdrawals(tabToStatus[tabValue], 1, searchInput);
    triggerHaptic('impact', 'light');
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearchQuery('');
    setPage(1);
    fetchWithdrawals(tabToStatus[tabValue], 1);
    triggerHaptic('impact', 'light');
  };

  const handleBack = () => {
    triggerHaptic('selection');
    router.push('/admin');
  };

  const handleRetry = () => {
    window.location.reload();
  };

  const handleOpenDialog = (withdrawal: WithdrawalDetailResponse, action: 'approve' | 'reject') => {
    triggerHaptic('impact', 'light');
    setSelectedWithdrawal(withdrawal);
    setDialogAction(action);
    setRejectionReason('');
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedWithdrawal(null);
    setRejectionReason('');
  };

  const handleOpenNumbersDialog = async (withdrawal: WithdrawalDetailResponse) => {
    triggerHaptic('impact', 'light');
    setSelectedWithdrawalForNumbers(withdrawal);
    setNumbersDialogOpen(true);
    setNumbersTabValue(0);
    
    // Fetch sessions for this withdrawal
    setIsLoadingSessions(true);
    try {
      const response = await adminWithdrawalsApi.getSessions(withdrawal.id);
      setWithdrawalSessions(response.data);
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { detail?: string } } }).response?.data?.detail || 
                      'Failed to fetch withdrawal sessions';
      toast.error(message);
      setWithdrawalSessions(null);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  const handleCloseNumbersDialog = () => {
    setNumbersDialogOpen(false);
    setSelectedWithdrawalForNumbers(null);
    setWithdrawalSessions(null);
  };

  const handleNumbersTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    triggerHaptic('selection');
    setNumbersTabValue(newValue);
  };

  const handleConfirmAction = async () => {
    if (!selectedWithdrawal) return;
    
    // For rejection, require a reason
    if (dialogAction === 'reject' && !rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    
    setIsProcessing(true);
    triggerHaptic('impact', 'medium');
    
    try {
      await adminWithdrawalsApi.updateStatus(selectedWithdrawal.id, {
        status: dialogAction === 'approve' ? 'completed' : 'rejected',
        rejection_reason: dialogAction === 'reject' ? rejectionReason.trim() : undefined,
      });
      
      toast.success(`Withdrawal ${dialogAction === 'approve' ? 'approved' : 'rejected'} successfully`);
      handleCloseDialog();
      fetchWithdrawals(tabToStatus[tabValue], page, searchQuery);
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { detail?: string } } }).response?.data?.detail || 
                      `Failed to ${dialogAction} withdrawal`;
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Check admin status when authenticated
  useEffect(() => {
    if (isAuthenticated && isAdmin === null) {
      checkAdminStatus();
    }
  }, [isAuthenticated, isAdmin, checkAdminStatus]);

  // Initial fetch
  useEffect(() => {
    if (isAuthenticated && isAdmin && !initialFetchDone.current) {
      initialFetchDone.current = true;
      fetchWithdrawals(undefined, 1);
    }
  }, [isAuthenticated, isAdmin, fetchWithdrawals]);

  if (authLoading || adminLoading || isAdmin === null) {
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

  if (!isAuthenticated || !isAdmin) {
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
          <AlertTitle>Access Denied</AlertTitle>
          You do not have permission to access this page.
        </Alert>
      </Box>
    );
  }

  // Render empty state based on current tab
  const renderEmptyState = () => {
    const messages: Record<number, { title: string; description: string }> = {
      0: {
        title: 'No withdrawals',
        description: 'No withdrawal requests have been made yet',
      },
      1: {
        title: 'No pending withdrawals',
        description: 'All withdrawals have been processed',
      },
      2: {
        title: 'No completed withdrawals',
        description: 'No withdrawals have been approved yet',
      },
      3: {
        title: 'No rejected withdrawals',
        description: 'No withdrawals have been rejected',
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
      <Box>
        {/* Header */}
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <IconButton onClick={handleBack} edge="start" aria-label="back">
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" component="h1" fontWeight={600}>
            Withdrawals
          </Typography>
          {pendingCount > 0 && (
            <Chip 
              label={`${pendingCount} pending`} 
              color="warning" 
              size="small" 
            />
          )}
        </Box>

        {/* Status Tabs */}
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="withdrawal status tabs"
          variant="scrollable"
          scrollButtons="auto"
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
            label={`Pending${pendingCount > 0 ? ` (${pendingCount})` : ''}`}
          />
          <Tab 
            icon={<SuccessIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
            label="Completed"
          />
          <Tab 
            icon={<RejectedIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
            label="Rejected"
          />
        </Tabs>

        {/* Search */}
        <Card sx={{ mb: 2, p: 0 }}>
          <Box sx={{ p: 1.5 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by Transaction ID or Telegram ID..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                  </InputAdornment>
                ),
                endAdornment: searchInput && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={handleClearSearch}>
                      <RejectIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: 2,
                  '& fieldset': { border: 'none' },
                  bgcolor: (theme) => alpha(theme.palette.text.primary, 0.04),
                },
              }}
            />
          </Box>
        </Card>

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
                <Card key={withdrawal.id}>
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
                    
                    {/* User Info */}
                    <Box mb={1}>
                      <Typography variant="body2" color="text.secondary">
                        User: {withdrawal.user_first_name || withdrawal.user_telegram_id}
                        {withdrawal.user_username && ` (@${withdrawal.user_username})`}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Telegram ID: {withdrawal.user_telegram_id}
                      </Typography>
                    </Box>
                    
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

                    {/* View Numbers Button */}
                    <Box mt={1.5}>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<ListIcon />}
                        onClick={() => handleOpenNumbersDialog(withdrawal)}
                        fullWidth
                      >
                        View Numbers ({withdrawal.total_accounts})
                      </Button>
                    </Box>

                    {/* Show rejection reason if rejected */}
                    {withdrawal.status === 'rejected' && withdrawal.rejection_reason && (
                      <Alert severity="error" sx={{ mt: 1.5 }} icon={false}>
                        <Typography variant="caption" fontWeight={600}>
                          Rejection Reason:
                        </Typography>
                        <Typography variant="body2">
                          {withdrawal.rejection_reason}
                        </Typography>
                      </Alert>
                    )}

                    {/* Action Buttons for Pending */}
                    {withdrawal.status === 'pending' && (
                      <Box display="flex" gap={1} mt={2}>
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          startIcon={<ApproveIcon />}
                          onClick={() => handleOpenDialog(withdrawal, 'approve')}
                          fullWidth
                        >
                          Approve
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          startIcon={<RejectIcon />}
                          onClick={() => handleOpenDialog(withdrawal, 'reject')}
                          fullWidth
                        >
                          Reject
                        </Button>
                      </Box>
                    )}
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

        {/* Confirmation Dialog */}
        <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {dialogAction === 'approve' ? 'Approve Withdrawal' : 'Reject Withdrawal'}
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ mb: dialogAction === 'reject' ? 2 : 0 }}>
              {dialogAction === 'approve' 
                ? `Are you sure you want to approve this withdrawal of $${selectedWithdrawal?.amount.toFixed(2)}?`
                : `Are you sure you want to permanently reject this withdrawal of $${selectedWithdrawal?.amount.toFixed(2)}? This action cannot be undone and the balance will NOT be refunded.`
              }
            </DialogContentText>
            {dialogAction === 'reject' && (
              <TextField
                fullWidth
                label="Rejection Reason"
                placeholder="Enter the reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                multiline
                rows={3}
                required
                helperText="This reason will be shown to the user"
              />
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} disabled={isProcessing}>
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmAction} 
              color={dialogAction === 'approve' ? 'success' : 'error'}
              variant="contained"
              disabled={isProcessing || (dialogAction === 'reject' && !rejectionReason.trim())}
            >
              {isProcessing ? <CircularProgress size={20} /> : (dialogAction === 'approve' ? 'Approve' : 'Reject')}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Numbers Dialog */}
        <Dialog open={numbersDialogOpen} onClose={handleCloseNumbersDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            Withdrawal Numbers
            {selectedWithdrawalForNumbers && (
              <Typography variant="body2" color="text.secondary">
                {selectedWithdrawalForNumbers.transaction_id}
              </Typography>
            )}
          </DialogTitle>
          <DialogContent sx={{ p: 0 }}>
            {isLoadingSessions ? (
              <Box display="flex" justifyContent="center" alignItems="center" py={4}>
                <CircularProgress size={24} />
              </Box>
            ) : withdrawalSessions ? (
              <>
                <Tabs
                  value={numbersTabValue}
                  onChange={handleNumbersTabChange}
                  aria-label="session status tabs"
                  variant="fullWidth"
                  sx={{
                    borderBottom: 1,
                    borderColor: 'divider',
                    '& .MuiTab-root': {
                      minHeight: 48,
                      textTransform: 'none',
                    },
                  }}
                >
                  <Tab 
                    icon={<SuccessIcon sx={{ fontSize: 18 }} />}
                    iconPosition="start"
                    label={`Success (${withdrawalSessions.total_success})`}
                  />
                  <Tab 
                    icon={<RejectedIcon sx={{ fontSize: 18 }} />}
                    iconPosition="start"
                    label={`Rejected (${withdrawalSessions.total_rejected})`}
                  />
                </Tabs>
                
                {numbersTabValue === 0 && (
                  <List dense>
                    {withdrawalSessions.success_sessions.length === 0 ? (
                      <Box textAlign="center" py={4}>
                        <Typography variant="body2" color="text.secondary">
                          No success sessions found
                        </Typography>
                      </Box>
                    ) : (
                      withdrawalSessions.success_sessions.map((session) => (
                        <React.Fragment key={session.id}>
                          <ListItem>
                            <ListItemText
                              primary={
                                <Box display="flex" alignItems="center" gap={1}>
                                  <Typography variant="body2" fontWeight={500}>
                                    {getCountryFlag(session.country_iso2)} {session.phone}
                                  </Typography>
                                  {session.quality && (
                                    <Chip label={session.quality} size="small" variant="outlined" />
                                  )}
                                </Box>
                              }
                              secondary={
                                <Typography variant="caption" color="text.secondary">
                                  ${session.price.toFixed(2)} • {formatDate(session.created_at)}
                                </Typography>
                              }
                            />
                          </ListItem>
                          <Divider component="li" />
                        </React.Fragment>
                      ))
                    )}
                  </List>
                )}
                
                {numbersTabValue === 1 && (
                  <List dense>
                    {withdrawalSessions.rejected_sessions.length === 0 ? (
                      <Box textAlign="center" py={4}>
                        <Typography variant="body2" color="text.secondary">
                          No rejected sessions found
                        </Typography>
                      </Box>
                    ) : (
                      withdrawalSessions.rejected_sessions.map((session) => (
                        <React.Fragment key={session.id}>
                          <ListItem>
                            <ListItemText
                              primary={
                                <Box display="flex" alignItems="center" gap={1}>
                                  <Typography variant="body2" fontWeight={500}>
                                    {getCountryFlag(session.country_iso2)} {session.phone}
                                  </Typography>
                                  {session.quality && (
                                    <Chip label={session.quality} size="small" variant="outlined" />
                                  )}
                                </Box>
                              }
                              secondary={
                                <Typography variant="caption" color="text.secondary">
                                  ${session.price.toFixed(2)} • {formatDate(session.created_at)}
                                </Typography>
                              }
                            />
                          </ListItem>
                          <Divider component="li" />
                        </React.Fragment>
                      ))
                    )}
                  </List>
                )}
              </>
            ) : (
              <Box textAlign="center" py={4}>
                <Typography variant="body2" color="text.secondary">
                  Failed to load sessions
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseNumbersDialog}>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </AppLayout>
  );
}
