/**
 * Home page - main dashboard for account management.
 */
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Fab,
  Typography,
  CircularProgress,
  Alert,
  AlertTitle,
  Button,
  Avatar,
  Card,
  CardContent,
  Skeleton,
  alpha,
  CardActionArea,
  Badge,
  Grid,
} from '@mui/material';
import { Add as AddIcon, Refresh as RefreshIcon, AdminPanelSettings as AdminIcon, AccountBalanceWallet as WalletIcon, ChevronRight as ChevronRightIcon, AccountCircle as AccountCircleIcon, Receipt as ReceiptIcon, Paid as PaidIcon, SupportAgent as SupportIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/Layout/AppLayout';
import { ChannelJoinRequired } from '@/components/Layout/ChannelJoinRequired';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import { useChannelMembership } from '@/hooks/useChannelMembership';
import { authApi, UserProfileResponse, supportApi } from '@/lib/api';
import { triggerHaptic } from '@/lib/telegram';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading, error } = useAuth();
  const { isAdmin, checkAdminStatus } = useAdmin();
  const { 
    isLoading: isChannelLoading, 
    allJoined, 
    channels, 
    recheckMembership 
  } = useChannelMembership(isAuthenticated);
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [isRechecking, setIsRechecking] = useState(false);
  const [unreadSupportCount, setUnreadSupportCount] = useState(0);


  // Fetch user profile when authenticated
  const fetchProfile = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setProfileLoading(true);
    try {
      const response = await authApi.getProfile();
      setProfile(response.data);
    } catch (err) {
      console.error('[Home] Failed to fetch profile:', err);
    } finally {
      setProfileLoading(false);
    }
  }, [isAuthenticated]);

  // Fetch unread support message count
  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      const response = await supportApi.getUnreadCount();
      setUnreadSupportCount(response.data.unread_count);
    } catch (err) {
      console.error('[Home] Failed to fetch unread count:', err);
    }
  }, [isAuthenticated]);

  // Check admin status when user is available
  useEffect(() => {
    if (isAuthenticated) {
      checkAdminStatus();
      fetchProfile();
      fetchUnreadCount();
    }
  }, [isAuthenticated, checkAdminStatus, fetchProfile, fetchUnreadCount]);

  const handleOpenCreate = () => {
    triggerHaptic('impact', 'medium');
    router.push('/accounts/add');
  };

  const handleOpenAdmin = () => {
    triggerHaptic('impact', 'medium');
    router.push('/admin');
  };

  const handleOpenAccounts = () => {
    triggerHaptic('impact', 'light');
    router.push('/accounts');
  };

  const handleOpenOrders = () => {
    triggerHaptic('impact', 'light');
    router.push('/orders');
  };

  const handleOpenPriced = () => {
    triggerHaptic('impact', 'light');
    router.push('/priced');
  };

  const handleOpenSupport = () => {
    triggerHaptic('impact', 'light');
    router.push('/support');
  };

  const handleRetry = () => {
    window.location.reload();
  };

  const handleRecheckChannels = async () => {
    setIsRechecking(true);
    await recheckMembership();
    setIsRechecking(false);
  };

  if (isLoading || isChannelLoading) {
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
          Initializing...
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

  // Check channel membership - show join required screen if not all channels are joined
  if (!allJoined && channels.length > 0) {
    return (
      <ChannelJoinRequired
        channels={channels}
        onRecheck={handleRecheckChannels}
        isRechecking={isRechecking}
      />
    );
  }

  // Get user display name and initial
  const displayName = profile?.first_name || profile?.username || 'User';
  const userInitial = displayName.charAt(0).toUpperCase();
  const profilePhotoUrl = profile?.photo_url;

  return (
    <AppLayout>
      <Box>
        {/* Profile Card */}
        <Card 
          sx={{ 
            mb: 3, 
            background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: 'white',
          }}
        >
          <CardContent sx={{ p: 2.5 }}>
            <Box display="flex" alignItems="center" gap={2}>
              {/* Avatar */}
              <Avatar
                src={profilePhotoUrl || undefined}
                sx={{
                  width: 60,
                  height: 60,
                  bgcolor: alpha('#fff', 0.2),
                  color: 'white',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                }}
              >
                {userInitial}
              </Avatar>

              {/* User Info */}
              <Box flex={1}>
                {profileLoading ? (
                  <>
                    <Skeleton width={120} height={28} sx={{ bgcolor: alpha('#fff', 0.2) }} />
                    <Skeleton width={80} height={20} sx={{ bgcolor: alpha('#fff', 0.2), mt: 0.5 }} />
                  </>
                ) : (
                  <>
                    <Typography variant="h6" fontWeight={600}>
                      {displayName}
                    </Typography>
                    {profile?.username && (
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        @{profile.username}
                      </Typography>
                    )}
                  </>
                )}
              </Box>

              {/* Balance */}
              <Box textAlign="right">
                <Box display="flex" alignItems="center" gap={0.5} justifyContent="flex-end" mb={0.5}>
                  <WalletIcon sx={{ fontSize: 18, opacity: 0.8 }} />
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    Balance
                  </Typography>
                </Box>
                {profileLoading ? (
                  <Skeleton width={80} height={32} sx={{ bgcolor: alpha('#fff', 0.2) }} />
                ) : (
                  <Typography variant="h5" fontWeight={700}>
                    ${profile?.balance.toFixed(2) || '0.00'}
                  </Typography>
                )}
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Navigation Cards Grid - 2 columns on desktop */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {/* My Accounts */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Card
              sx={{
                height: '100%',
                cursor: 'pointer',
                '&:hover': { bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04) },
              }}
            >
              <CardActionArea onClick={handleOpenAccounts} sx={{ height: '100%' }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                      <AccountCircleIcon />
                    </Avatar>
                    <Box flex={1}>
                      <Typography variant="h6" fontWeight={600}>My Accounts</Typography>
                      <Typography variant="body2" color="text.secondary">
                        View and manage your Telegram accounts
                      </Typography>
                    </Box>
                    <ChevronRightIcon color="action" />
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>

          {/* Orders */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Card
              sx={{
                height: '100%',
                cursor: 'pointer',
                '&:hover': { bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04) },
              }}
            >
              <CardActionArea onClick={handleOpenOrders} sx={{ height: '100%' }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar sx={{ bgcolor: 'success.main', width: 48, height: 48 }}>
                      <ReceiptIcon />
                    </Avatar>
                    <Box flex={1}>
                      <Typography variant="h6" fontWeight={600}>Orders</Typography>
                      <Typography variant="body2" color="text.secondary">
                        View your withdrawal history
                      </Typography>
                    </Box>
                    <ChevronRightIcon color="action" />
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>

          {/* Prices */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Card
              sx={{
                height: '100%',
                cursor: 'pointer',
                '&:hover': { bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04) },
              }}
            >
              <CardActionArea onClick={handleOpenPriced} sx={{ height: '100%' }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar sx={{ bgcolor: 'info.main', width: 48, height: 48 }}>
                      <PaidIcon />
                    </Avatar>
                    <Box flex={1}>
                      <Typography variant="h6" fontWeight={600}>Prices</Typography>
                      <Typography variant="body2" color="text.secondary">
                        View available countries and prices
                      </Typography>
                    </Box>
                    <ChevronRightIcon color="action" />
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>

          {/* Support */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Card
              sx={{
                height: '100%',
                cursor: 'pointer',
                '&:hover': { bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04) },
              }}
            >
              <CardActionArea onClick={handleOpenSupport} sx={{ height: '100%' }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Badge
                      badgeContent={unreadSupportCount}
                      color="error"
                      max={99}
                      sx={{ '& .MuiBadge-badge': { fontSize: '0.7rem', height: 18, minWidth: 18 } }}
                    >
                      <Avatar sx={{ bgcolor: 'warning.main', width: 48, height: 48 }}>
                        <SupportIcon />
                      </Avatar>
                    </Badge>
                    <Box flex={1}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="h6" fontWeight={600}>Support</Typography>
                        {unreadSupportCount > 0 && (
                          <Typography variant="caption" color="error.main" fontWeight={600}>
                            {unreadSupportCount} new
                          </Typography>
                        )}
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Get help from our support team
                      </Typography>
                    </Box>
                    <ChevronRightIcon color="action" />
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        </Grid>

        {/* Admin Floating Action Button - Bottom Left (mobile only, desktop uses nav) */}
        {isAdmin && (
          <Fab
            color="secondary"
            aria-label="admin panel"
            onClick={handleOpenAdmin}
            size="small"
            sx={{
              position: 'fixed',
              bottom: 16,
              left: 16,
              display: { xs: 'flex', md: 'none' },
            }}
          >
            <AdminIcon />
          </Fab>
        )}

        {/* Add Account Floating Action Button - Bottom Right */}
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
