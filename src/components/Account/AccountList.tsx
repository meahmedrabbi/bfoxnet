/**
 * AccountList component - displays list of Telegram accounts with status tabs.
 */
'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Pagination,
  CircularProgress,
  Stack,
  IconButton,
  Chip,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  CheckCircle as SuccessIcon,
  Schedule as PendingIcon,
  Cancel as RejectedIcon,
  Apps as AllIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { AccountCard } from './AccountCard';
import { useUserAccounts } from '@/hooks/useUserAccounts';
import { AccountResponse, AccountStatusType } from '@/lib/api';
import { triggerHaptic } from '@/lib/telegram';

// Helper function to get status color
const getStatusColor = (status: AccountStatusType): 'success' | 'warning' | 'error' | 'default' => {
  switch (status) {
    case 'success': return 'success';
    case 'pending': return 'warning';
    case 'rejected': return 'error';
    default: return 'default';
  }
};

export const AccountList: React.FC = () => {
  const {
    accounts,
    counts,
    isLoading,
    page,
    totalPages,
    setStatus,
    setPage,
    refresh,
  } = useUserAccounts();

  const [tabValue, setTabValue] = useState(0);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<AccountResponse | null>(null);

  // Map tab index to status
  const tabToStatus: (AccountStatusType | undefined)[] = [undefined, 'success', 'pending', 'rejected'];

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    triggerHaptic('selection');
    setTabValue(newValue);
    setStatus(tabToStatus[newValue]);
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage);
  };

  const handleDetailsClick = (account: AccountResponse) => {
    triggerHaptic('impact', 'light');
    setSelectedAccount(account);
    setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedAccount(null);
  };

  // Get current count based on selected tab
  const getCurrentCount = () => {
    switch (tabValue) {
      case 0: return counts.total;
      case 1: return counts.success;
      case 2: return counts.pending;
      case 3: return counts.rejected;
      default: return 0;
    }
  };

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

  // Render empty state based on current tab
  const renderEmptyState = () => {
    const messages: Record<number, { title: string; description: string }> = {
      0: {
        title: 'No accounts yet',
        description: 'Add your first Telegram account to get started',
      },
      1: {
        title: 'No successful accounts',
        description: 'Accounts will appear here after verification completes',
      },
      2: {
        title: 'No pending accounts',
        description: 'Accounts waiting for verification will appear here',
      },
      3: {
        title: 'No rejected accounts',
        description: 'Rejected accounts will appear here',
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
    <Box>
      {/* Status Tabs */}
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        aria-label="account status tabs"
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
          icon={<AllIcon sx={{ fontSize: 18 }} />}
          iconPosition="start"
          label="All"
        />
        <Tab 
          icon={<SuccessIcon sx={{ fontSize: 18 }} />}
          iconPosition="start"
          label="Success"
        />
        <Tab 
          icon={<PendingIcon sx={{ fontSize: 18 }} />}
          iconPosition="start"
          label="Pending"
        />
        <Tab 
          icon={<RejectedIcon sx={{ fontSize: 18 }} />}
          iconPosition="start"
          label="Rejected"
        />
      </Tabs>

      {/* Content */}
      {isLoading ? (
        <Box display="flex" justifyContent="center" alignItems="center" py={4}>
          <CircularProgress size={24} />
        </Box>
      ) : accounts.length === 0 ? (
        renderEmptyState()
      ) : (
        <>
          {/* Count display */}
          <Box mb={1.5}>
            <Chip 
              label={`${getCurrentCount()} account${getCurrentCount() !== 1 ? 's' : ''}`}
              variant="outlined"
              size="small"
            />
          </Box>

          {/* Account Cards */}
          <Stack spacing={1.5}>
            {accounts.map((account) => (
              <AccountCard
                key={account.id}
                account={account}
                onRefresh={refresh}
                onDetailsClick={handleDetailsClick}
              />
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

      {/* Details Bottom Sheet */}
      <Drawer
        anchor="bottom"
        open={detailsOpen}
        onClose={handleCloseDetails}
        PaperProps={{
          sx: {
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            maxHeight: '50vh',
          },
        }}
      >
        {selectedAccount && (
          <Box>
            {/* Header */}
            <Box display="flex" alignItems="center" justifyContent="space-between" px={2} py={1.5}>
              <Typography variant="h6" fontWeight={600}>
                Account Details
              </Typography>
              <IconButton onClick={handleCloseDetails} size="small">
                <CloseIcon />
              </IconButton>
            </Box>
            <Divider />
            
            {/* Details List - Only essential info */}
            <List dense>
              <ListItem>
                <ListItemText 
                  primary="Phone Number" 
                  secondary={selectedAccount.phone}
                  primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                  secondaryTypographyProps={{ variant: 'body1', fontWeight: 500 }}
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Status" 
                  secondary={
                    <Chip
                      label={selectedAccount.account_status}
                      color={getStatusColor(selectedAccount.account_status)}
                      size="small"
                      sx={{ mt: 0.5 }}
                    />
                  }
                  primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Country" 
                  secondary={selectedAccount.country_iso2 || 'N/A'}
                  primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                  secondaryTypographyProps={{ variant: 'body1' }}
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Price" 
                  secondary={`$${selectedAccount.price.toFixed(2)}`}
                  primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                  secondaryTypographyProps={{ variant: 'body1', fontWeight: 600, color: 'success.main' }}
                />
              </ListItem>
              {/* Quality Reason - show translated SpamBot response */}
              {selectedAccount.quality_reason && (
                <ListItem>
                  <ListItemText 
                    primary="Quality Reason" 
                    secondary={selectedAccount.quality_reason}
                    primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                    secondaryTypographyProps={{ 
                      variant: 'body2', 
                      sx: { 
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        mt: 0.5,
                        p: 1,
                        bgcolor: 'action.hover',
                        borderRadius: 1,
                      }
                    }}
                  />
                </ListItem>
              )}
              <ListItem>
                <ListItemText 
                  primary="Created" 
                  secondary={formatDate(selectedAccount.created_at)}
                  primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                  secondaryTypographyProps={{ variant: 'body1' }}
                />
              </ListItem>
            </List>
          </Box>
        )}
      </Drawer>
    </Box>
  );
};
