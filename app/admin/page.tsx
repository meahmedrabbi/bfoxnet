/**
 * Admin Panel Dashboard - Modern mobile-first design with statistics.
 */
'use client';

import React, { useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  AlertTitle,
  Card,
  CardContent,
  CardActionArea,
  IconButton,
  Skeleton,
  useTheme,
  useMediaQuery,
  alpha,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  People as PeopleIcon,
  Storage as StorageIcon,
  Public as PublicIcon,
  Settings as SettingsIcon,
  TrendingUp as TrendingUpIcon,
  ArrowForwardIos as ArrowForwardIcon,
  Receipt as WithdrawalsIcon,
  SupportAgent as SupportIcon,
  Schedule as PendingIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { AdminLayout } from '@/components/Admin/AdminLayout';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import { triggerHaptic } from '@/lib/telegram';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  trend?: string;
  loading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, trend, loading }) => {
  const theme = useTheme();
  
  return (
    <Card
      sx={{
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[4],
        },
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 2.5 }, pb: { xs: 2, sm: 2.5 } + ' !important' }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontSize: '0.6875rem',
              }}
            >
              {title}
            </Typography>
            {loading ? (
              <Skeleton width={80} height={40} />
            ) : (
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  mt: 0.5,
                  color: 'text.primary',
                  fontSize: { xs: '1.75rem', sm: '2rem' },
                }}
              >
                {value}
              </Typography>
            )}
            {trend && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                <TrendingUpIcon sx={{ fontSize: 14, color: 'success.main', mr: 0.5 }} />
                <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 500 }}>
                  {trend}
                </Typography>
              </Box>
            )}
          </Box>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: alpha(color, 0.12),
              color: color,
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
      {/* Decorative gradient */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 3,
          bgcolor: color,
        }}
      />
    </Card>
  );
};

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  color: string;
}

const QuickActionCard: React.FC<QuickActionCardProps> = ({
  title,
  description,
  icon,
  onClick,
  color,
}) => {
  const theme = useTheme();
  
  return (
    <Card
      sx={{
        height: '100%',
        transition: 'all 0.2s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[4],
        },
      }}
    >
      <CardActionArea
        onClick={onClick}
        sx={{
          height: '100%',
          p: { xs: 2, sm: 2.5 },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', mb: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: alpha(color, 0.12),
              color: color,
              mr: 1.5,
            }}
          >
            {icon}
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 600,
                fontSize: '0.9375rem',
              }}
            >
              {title}
            </Typography>
          </Box>
          <ArrowForwardIcon
            sx={{
              fontSize: 18,
              color: 'text.secondary',
              opacity: 0.5,
            }}
          />
        </Box>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            fontSize: '0.8125rem',
            lineHeight: 1.4,
          }}
        >
          {description}
        </Typography>
      </CardActionArea>
    </Card>
  );
};

export default function AdminPage() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const {
    isLoading,
    isAdmin,
    stats,
    checkAdminStatus,
    fetchStats,
  } = useAdmin();

  // Check admin status when user is available
  useEffect(() => {
    if (isAuthenticated) {
      checkAdminStatus();
    }
  }, [isAuthenticated, checkAdminStatus]);

  // Load data when admin status is confirmed
  useEffect(() => {
    if (isAdmin) {
      fetchStats();
    }
  }, [isAdmin, fetchStats]);

  const handleRefresh = () => {
    fetchStats();
    triggerHaptic('impact', 'light');
  };

  const handleNavigate = (path: string) => {
    router.push(path);
    triggerHaptic('impact', 'light');
  };

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
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="100vh" gap={2}>
        <CircularProgress />
        <Typography variant="body2" color="text.secondary">
          Checking admin status...
        </Typography>
      </Box>
    );
  }

  if (!isAdmin) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" p={2}>
        <Alert severity="error" sx={{ maxWidth: 400 }}>
          <AlertTitle>Access Denied</AlertTitle>
          You do not have admin privileges. Please contact an administrator if you believe this is an error.
        </Alert>
      </Box>
    );
  }

  return (
    <AdminLayout title="Dashboard">
      <Box>
        {/* Header with Refresh */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 3,
          }}
        >
          <Box>
            <Typography
              variant={isMobile ? 'subtitle1' : 'h6'}
              sx={{
                fontWeight: 600,
                color: 'text.secondary',
              }}
            >
              Overview
            </Typography>
          </Box>
          <IconButton
            onClick={handleRefresh}
            disabled={isLoading}
            size="small"
            sx={{
              bgcolor: 'background.paper',
              boxShadow: 1,
              '&:hover': {
                bgcolor: 'background.paper',
                boxShadow: 2,
              },
            }}
          >
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Stats Grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(2, 1fr)',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(4, 1fr)',
            },
            gap: { xs: 1.5, sm: 2 },
            mb: 4,
          }}
        >
          <StatCard
            title="Total Users"
            value={stats?.total_users ?? 0}
            icon={<PeopleIcon />}
            color={theme.palette.primary.main}
            loading={isLoading}
          />
          <StatCard
            title="Ready Sessions"
            value={stats?.ready_sessions ?? 0}
            icon={<StorageIcon />}
            color={theme.palette.success.main}
            loading={isLoading}
          />
          <StatCard
            title="Pending Accounts"
            value={stats?.pending_accounts ?? 0}
            icon={<PendingIcon />}
            color={theme.palette.warning.main}
            loading={isLoading}
          />
          <StatCard
            title="Pending Withdrawals"
            value={stats?.pending_withdrawals ?? 0}
            icon={<WithdrawalsIcon />}
            color={theme.palette.info.main}
            loading={isLoading}
          />
        </Box>

        {/* Support Tickets Banner - Show if there are open tickets */}
        {stats && stats.open_support_tickets > 0 && (
          <Card 
            sx={{ 
              mb: 3, 
              bgcolor: alpha(theme.palette.warning.main, 0.1),
              border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`,
              cursor: 'pointer',
            }}
            onClick={() => handleNavigate('/admin/support')}
          >
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Box display="flex" alignItems="center" gap={2}>
                <SupportIcon color="warning" />
                <Box flex={1}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {stats.open_support_tickets} Open Support Ticket{stats.open_support_tickets !== 1 ? 's' : ''}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Click to view and respond
                  </Typography>
                </Box>
                <ArrowForwardIcon color="action" />
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Typography
          variant={isMobile ? 'subtitle1' : 'h6'}
          sx={{
            fontWeight: 600,
            mb: 2,
            color: 'text.secondary',
          }}
        >
          Quick Actions
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
            },
            gap: { xs: 1.5, sm: 2 },
          }}
        >
          <QuickActionCard
            title="Countries"
            description="Manage country settings and pricing"
            icon={<PublicIcon />}
            onClick={() => handleNavigate('/admin/countries')}
            color={theme.palette.primary.main}
          />
          <QuickActionCard
            title="Users"
            description="Manage user accounts and balances"
            icon={<PeopleIcon />}
            onClick={() => handleNavigate('/admin/users')}
            color={theme.palette.secondary.main}
          />
          <QuickActionCard
            title="Sessions"
            description="View and manage all sessions"
            icon={<StorageIcon />}
            onClick={() => handleNavigate('/admin/sessions')}
            color={theme.palette.info.main}
          />
          <QuickActionCard
            title="Withdrawals"
            description="Manage withdrawal requests"
            icon={<WithdrawalsIcon />}
            onClick={() => handleNavigate('/admin/withdrawals')}
            color={theme.palette.success.main}
          />
          <QuickActionCard
            title="Support"
            description="Manage support tickets"
            icon={<SupportIcon />}
            onClick={() => handleNavigate('/admin/support')}
            color={theme.palette.warning.main}
          />
          <QuickActionCard
            title="Settings"
            description="Configure app settings"
            icon={<SettingsIcon />}
            onClick={() => handleNavigate('/admin/settings')}
            color={theme.palette.grey[600]}
          />
        </Box>
      </Box>
    </AdminLayout>
  );
}
