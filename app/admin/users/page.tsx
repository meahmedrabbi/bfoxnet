/**
 * Users Management Page - Mobile-first admin design.
 */
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  AlertTitle,
  Card,
  CardContent,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  InputAdornment,
  useTheme,
  useMediaQuery,
  Skeleton,
  Avatar,
  Pagination,
  alpha,
  Collapse,
  Divider,
} from '@mui/material';
import {
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  AccountBalanceWallet as WalletIcon,
  Person as PersonIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { AdminLayout } from '@/components/Admin/AdminLayout';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import { usersAdminApi, UserAdminResponse } from '@/lib/api';
import toast from 'react-hot-toast';
import { triggerHaptic } from '@/lib/telegram';

interface UserCardProps {
  user: UserAdminResponse;
  onBanToggle: (user: UserAdminResponse) => void;
  onBalanceClick: (user: UserAdminResponse) => void;
  onDeleteClick: (user: UserAdminResponse) => void;
  loading: boolean;
}

const UserCard: React.FC<UserCardProps> = ({
  user,
  onBanToggle,
  onBalanceClick,
  onDeleteClick,
  loading,
}) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);

  const displayName = user.username || user.first_name || `User ${user.telegram_id}`;

  return (
    <Card
      sx={{
        mb: 1.5,
        transition: 'all 0.2s ease',
        border: user.is_banned ? `1px solid ${theme.palette.error.main}30` : 'none',
        '&:hover': {
          boxShadow: theme.shadows[3],
        },
      }}
    >
      <CardContent sx={{ p: 2, pb: '16px !important' }}>
        {/* Main Row */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar
            src={user.photo_url || undefined}
            sx={{
              width: 44,
              height: 44,
              bgcolor: user.is_banned
                ? alpha(theme.palette.error.main, 0.1)
                : alpha(theme.palette.primary.main, 0.1),
              color: user.is_banned
                ? theme.palette.error.main
                : theme.palette.primary.main,
              fontSize: '1rem',
              fontWeight: 600,
            }}
          >
            {displayName.charAt(0).toUpperCase()}
          </Avatar>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 600,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  fontSize: '0.9375rem',
                }}
              >
                {displayName}
              </Typography>
              {user.is_banned && (
                <Chip
                  label="Banned"
                  size="small"
                  color="error"
                  sx={{ height: 20, fontSize: '0.6875rem' }}
                />
              )}
            </Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}
            >
              ID: {user.telegram_id}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Chip
              label={`$${user.balance.toFixed(2)}`}
              size="small"
              color={user.balance > 0 ? 'success' : 'default'}
              variant={user.balance > 0 ? 'filled' : 'outlined'}
              sx={{ fontWeight: 600, fontSize: '0.75rem' }}
            />
            <IconButton
              size="small"
              onClick={() => setExpanded(!expanded)}
              sx={{ ml: 0.5 }}
            >
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
        </Box>

        {/* Expanded Details */}
        <Collapse in={expanded}>
          <Divider sx={{ my: 1.5 }} />
          
          {/* Stats Row */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 1.5,
              mb: 2,
            }}
          >
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.125rem' }}>
                {user.sessions_count}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Sessions
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.125rem' }}>
                ${user.balance.toFixed(2)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Balance
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, fontSize: '1.125rem' }}
                color={user.is_banned ? 'error.main' : 'success.main'}
              >
                {user.is_banned ? 'Banned' : 'Active'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Status
              </Typography>
            </Box>
          </Box>

          {/* Info */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Joined: {new Date(user.created_at).toLocaleDateString()}
            </Typography>
          </Box>

          {/* Actions */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<WalletIcon />}
              onClick={() => onBalanceClick(user)}
              disabled={loading}
              sx={{ flex: 1 }}
            >
              Balance
            </Button>
            <Button
              variant="outlined"
              size="small"
              color={user.is_banned ? 'success' : 'warning'}
              startIcon={user.is_banned ? <CheckCircleIcon /> : <BlockIcon />}
              onClick={() => onBanToggle(user)}
              disabled={loading}
              sx={{ flex: 1 }}
            >
              {user.is_banned ? 'Unban' : 'Ban'}
            </Button>
            <IconButton
              size="small"
              color="error"
              onClick={() => onDeleteClick(user)}
              disabled={loading}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
};

const UserCardSkeleton: React.FC = () => {
  return (
    <Card sx={{ mb: 1.5 }}>
      <CardContent sx={{ p: 2, pb: '16px !important' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Skeleton variant="circular" width={44} height={44} />
          <Box sx={{ flex: 1 }}>
            <Skeleton width="60%" height={24} />
            <Skeleton width="40%" height={16} />
          </Box>
          <Skeleton width={60} height={24} sx={{ borderRadius: 4 }} />
        </Box>
      </CardContent>
    </Card>
  );
};

export default function UsersPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const { isAdmin, checkAdminStatus } = useAdmin();

  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<UserAdminResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');

  // Dialog states
  const [balanceDialogOpen, setBalanceDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserAdminResponse | null>(null);

  // Balance form state
  const [balanceAmount, setBalanceAmount] = useState<number>(0);
  const [balanceOperation, setBalanceOperation] = useState<'add' | 'deduct'>('add');

  // Check admin status
  useEffect(() => {
    if (isAuthenticated) {
      checkAdminStatus();
    }
  }, [isAuthenticated, checkAdminStatus]);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    if (!isAdmin) return;

    setLoading(true);
    try {
      const response = await usersAdminApi.list(
        page,
        rowsPerPage,
        searchQuery || undefined
      );
      setUsers(response.data.users);
      setTotal(response.data.total);
    } catch {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [isAdmin, page, rowsPerPage, searchQuery]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = () => {
    setSearchQuery(searchInput);
    setPage(1);
    triggerHaptic('impact', 'light');
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearchQuery('');
    setPage(1);
    triggerHaptic('impact', 'light');
  };

  const handleBanToggle = async (userItem: UserAdminResponse) => {
    setLoading(true);
    try {
      await usersAdminApi.updateBanStatus(userItem.id, {
        is_banned: !userItem.is_banned,
      });
      toast.success(userItem.is_banned ? 'User unbanned' : 'User banned');
      triggerHaptic('notification', 'success');
      fetchUsers();
    } catch {
      toast.error('Failed to update ban status');
      triggerHaptic('notification', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenBalanceDialog = (userItem: UserAdminResponse) => {
    setSelectedUser(userItem);
    setBalanceAmount(0);
    setBalanceOperation('add');
    setBalanceDialogOpen(true);
    triggerHaptic('impact', 'light');
  };

  const handleSaveBalance = async () => {
    if (!selectedUser) return;

    setLoading(true);
    try {
      await usersAdminApi.updateBalance(selectedUser.id, {
        amount: balanceAmount,
        operation: balanceOperation,
      });
      toast.success('Balance updated');
      triggerHaptic('notification', 'success');
      setBalanceDialogOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      const err = error as { response?: { data?: { detail?: string } } };
      toast.error(err.response?.data?.detail || 'Failed to update balance');
      triggerHaptic('notification', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (userItem: UserAdminResponse) => {
    setSelectedUser(userItem);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser) return;

    setLoading(true);
    try {
      await usersAdminApi.delete(selectedUser.id);
      toast.success('User deleted');
      triggerHaptic('notification', 'success');
      setDeleteDialogOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch {
      toast.error('Failed to delete user');
      triggerHaptic('notification', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (_: React.ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage);
    triggerHaptic('impact', 'light');
  };

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(1); // Reset to first page when changing rows per page
    triggerHaptic('impact', 'light');
  };

  const totalPages = Math.ceil(total / rowsPerPage);
  const startIndex = (page - 1) * rowsPerPage + 1;
  const endIndex = Math.min(page * rowsPerPage, total);

  if (authLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" p={2}>
        <Alert severity="warning" sx={{ maxWidth: 400 }}>
          <AlertTitle>Not Authenticated</AlertTitle>
          Sign in to access this page
        </Alert>
      </Box>
    );
  }

  if (isAdmin === null) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!isAdmin) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" p={2}>
        <Alert severity="error" sx={{ maxWidth: 400 }}>
          <AlertTitle>Access Denied</AlertTitle>
          You do not have admin privileges.
        </Alert>
      </Box>
    );
  }

  return (
    <AdminLayout title="Users">
      <Box>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 2,
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 600, color: 'text.secondary' }}
          >
            {total} users total
          </Typography>
          <IconButton
            onClick={fetchUsers}
            disabled={loading}
            size="small"
            sx={{
              bgcolor: 'background.paper',
              boxShadow: 1,
              '&:hover': { bgcolor: 'background.paper' },
            }}
          >
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Search */}
        <Card sx={{ mb: 2, p: 0 }}>
          <Box sx={{ p: 1.5 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search users..."
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
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: 2,
                  '& fieldset': { border: 'none' },
                  bgcolor: alpha(theme.palette.text.primary, 0.04),
                },
              }}
            />
          </Box>
        </Card>

        {/* Users List */}
        {loading && users.length === 0 ? (
          <>
            {[...Array(5)].map((_, i) => (
              <UserCardSkeleton key={i} />
            ))}
          </>
        ) : users.length === 0 ? (
          <Card sx={{ p: 4, textAlign: 'center' }}>
            <PersonIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
            <Typography color="text.secondary">
              {searchQuery ? 'No users found matching your search' : 'No users found'}
            </Typography>
          </Card>
        ) : (
          <>
            {users.map((userItem) => (
              <UserCard
                key={userItem.id}
                user={userItem}
                onBanToggle={handleBanToggle}
                onBalanceClick={handleOpenBalanceDialog}
                onDeleteClick={handleDeleteClick}
                loading={loading}
              />
            ))}

            {/* Pagination */}
            {total > 0 && (
              <Card sx={{ mt: 3, p: 2 }}>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    flexDirection: isMobile ? 'column' : 'row',
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    gap: 2,
                  }}
                >
                  {/* Page Info */}
                  <Typography variant="body2" color="text.secondary">
                    Showing {startIndex}-{endIndex} of {total} users
                  </Typography>
                  
                  {/* Rows per page selector */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Per page:
                    </Typography>
                    <FormControl size="small" sx={{ minWidth: 70 }}>
                      <Select
                        value={rowsPerPage}
                        onChange={(e) => handleRowsPerPageChange(e.target.value as number)}
                        sx={{ height: 32 }}
                      >
                        <MenuItem value={10}>10</MenuItem>
                        <MenuItem value={20}>20</MenuItem>
                        <MenuItem value={50}>50</MenuItem>
                        <MenuItem value={100}>100</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </Box>
                
                {/* Page Navigation */}
                {totalPages > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                    <Pagination
                      count={totalPages}
                      page={page}
                      onChange={handlePageChange}
                      color="primary"
                      size={isMobile ? 'small' : 'medium'}
                      siblingCount={isMobile ? 0 : 1}
                    />
                  </Box>
                )}
              </Card>
            )}
          </>
        )}

        {/* Balance Dialog */}
        <Dialog
          open={balanceDialogOpen}
          onClose={() => setBalanceDialogOpen(false)}
          maxWidth="xs"
          fullWidth
          PaperProps={{
            sx: { borderRadius: 3, m: 2 },
          }}
        >
          <DialogTitle 
            sx={{ 
              pb: 1.5, 
              borderBottom: `1px solid ${theme.palette.divider}`,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
            }}
          >
            <Avatar
              sx={{
                bgcolor: alpha(theme.palette.success.main, 0.1),
                color: theme.palette.success.main,
                width: 40,
                height: 40,
              }}
            >
              <WalletIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                Manage Balance
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {selectedUser?.username || selectedUser?.first_name || `ID: ${selectedUser?.telegram_id}`}
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ pt: 2.5 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Current Balance Card */}
              <Card
                variant="outlined"
                sx={{
                  p: 2.5,
                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                  textAlign: 'center',
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                }}
              >
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Current Balance
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  ${selectedUser?.balance.toFixed(2)}
                </Typography>
              </Card>
              
              {/* Operation Section */}
              <Card variant="outlined" sx={{ p: 2, bgcolor: alpha(theme.palette.warning.main, 0.02) }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
                  Balance Operation
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Operation Type</InputLabel>
                    <Select
                      value={balanceOperation}
                      label="Operation Type"
                      onChange={(e) => setBalanceOperation(e.target.value as 'add' | 'deduct')}
                    >
                      <MenuItem value="add">➕ Add Balance</MenuItem>
                      <MenuItem value="deduct">➖ Deduct Balance</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <TextField
                    label="Amount"
                    type="number"
                    value={balanceAmount}
                    onChange={(e) => setBalanceAmount(parseFloat(e.target.value) || 0)}
                    inputProps={{ min: 0, step: 0.01 }}
                    fullWidth
                    size="small"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                    helperText={balanceAmount > 0 ? 
                      `New balance: $${(balanceOperation === 'add' 
                        ? (selectedUser?.balance || 0) + balanceAmount 
                        : Math.max(0, (selectedUser?.balance || 0) - balanceAmount)).toFixed(2)}` 
                      : 'Enter amount to modify'
                    }
                  />
                </Box>
              </Card>
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3, pt: 1.5, borderTop: `1px solid ${theme.palette.divider}` }}>
            <Button onClick={() => setBalanceDialogOpen(false)} variant="outlined">
              Cancel
            </Button>
            <Button
              onClick={handleSaveBalance}
              variant="contained"
              color={balanceOperation === 'deduct' ? 'warning' : 'primary'}
              disabled={loading || balanceAmount <= 0}
              startIcon={loading ? <CircularProgress size={16} /> : null}
            >
              {balanceOperation === 'add' ? 'Add Balance' : 'Deduct Balance'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          maxWidth="xs"
          fullWidth
          PaperProps={{
            sx: { borderRadius: 3, m: 2 },
          }}
        >
          <DialogTitle 
            sx={{ 
              pb: 1.5,
              borderBottom: `1px solid ${theme.palette.divider}`,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
            }}
          >
            <Avatar
              sx={{
                bgcolor: alpha(theme.palette.error.main, 0.1),
                color: theme.palette.error.main,
                width: 40,
                height: 40,
              }}
            >
              <DeleteIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                Delete User
              </Typography>
              <Typography variant="caption" color="text.secondary">
                This action cannot be undone
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ pt: 2.5 }}>
            <Typography sx={{ mb: 2 }}>
              Are you sure you want to delete{' '}
              <strong>
                {selectedUser?.username || selectedUser?.first_name || `User ${selectedUser?.telegram_id}`}
              </strong>
              ?
            </Typography>
            <Alert severity="error" icon={false}>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                ⚠️ Warning
              </Typography>
              <Typography variant="body2">
                This will permanently delete the user and all their sessions, data, and balance.
              </Typography>
            </Alert>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3, pt: 1.5, borderTop: `1px solid ${theme.palette.divider}` }}>
            <Button onClick={() => setDeleteDialogOpen(false)} variant="outlined">
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDelete}
              color="error"
              variant="contained"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={16} /> : <DeleteIcon />}
            >
              Delete User
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </AdminLayout>
  );
}
