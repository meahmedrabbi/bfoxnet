/**
 * Settings Management Page - Mobile-first admin design.
 */
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  AlertTitle,
  TextField,
  Switch,
  FormControlLabel,
  Button,
  Divider,
  Card,
  CardContent,
  IconButton,
  useTheme,
  useMediaQuery,
  alpha,
  Skeleton,
} from '@mui/material';
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Security as SecurityIcon,
  Payment as PaymentIcon,
  Telegram as TelegramIcon,
} from '@mui/icons-material';
import { AdminLayout } from '@/components/Admin/AdminLayout';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import { settingsApi, SettingsResponse, SettingsUpdate } from '@/lib/api';
import toast from 'react-hot-toast';
import { triggerHaptic } from '@/lib/telegram';

interface SettingsSectionProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({
  title,
  subtitle,
  icon,
  children,
}) => {
  const theme = useTheme();

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent sx={{ p: 2, pb: '16px !important' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
            }}
          >
            {icon}
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '0.9375rem' }}>
              {title}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          </Box>
        </Box>
        {children}
      </CardContent>
    </Card>
  );
};

export default function SettingsPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const { isAdmin, checkAdminStatus } = useAdmin();

  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<SettingsResponse | null>(null);
  const [formData, setFormData] = useState<SettingsUpdate>({
    twofa_enabled: '',
    is_card_withdraw_enabled: false,
    is_crypto_withdraw_enabled: false,
    is_binance_pay_withdraw_enabled: false,
    min_withdraw_card: 5.0,
    min_withdraw_crypto: 10.0,
    min_withdraw_binance: 5.0,
    claim_channel_id: '',
    withdraw_channel_id: '',
    main_channel_username: '',
    backup_channel_username: '',
  });

  // Check admin status
  useEffect(() => {
    if (isAuthenticated) {
      checkAdminStatus();
    }
  }, [isAuthenticated, checkAdminStatus]);

  // Fetch settings
  const fetchSettings = useCallback(async () => {
    if (!isAdmin) return;

    setLoading(true);
    try {
      const response = await settingsApi.get();
      setSettings(response.data);
      setFormData({
        twofa_enabled: response.data.twofa_enabled,
        is_card_withdraw_enabled: response.data.is_card_withdraw_enabled,
        is_crypto_withdraw_enabled: response.data.is_crypto_withdraw_enabled,
        is_binance_pay_withdraw_enabled: response.data.is_binance_pay_withdraw_enabled,
        min_withdraw_card: response.data.min_withdraw_card,
        min_withdraw_crypto: response.data.min_withdraw_crypto,
        min_withdraw_binance: response.data.min_withdraw_binance,
        claim_channel_id: response.data.claim_channel_id || '',
        withdraw_channel_id: response.data.withdraw_channel_id || '',
        main_channel_username: response.data.main_channel_username || '',
        backup_channel_username: response.data.backup_channel_username || '',
      });
    } catch {
      toast.error('Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await settingsApi.update(formData);
      setSettings(response.data);
      toast.success('Settings saved');
      triggerHaptic('notification', 'success');
    } catch {
      toast.error('Failed to save settings');
      triggerHaptic('notification', 'error');
    } finally {
      setLoading(false);
    }
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
    <AdminLayout title="Settings">
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
            App Configuration
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton
              onClick={fetchSettings}
              disabled={loading}
              size="small"
              sx={{
                bgcolor: 'background.paper',
                '&:hover': { bgcolor: 'background.paper' },
              }}
            >
              <RefreshIcon fontSize="small" />
            </IconButton>
            <Button
              variant="contained"
              size="small"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={loading}
            >
              Save
            </Button>
          </Box>
        </Box>

        {loading && !settings ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[...Array(3)].map((_, i) => (
              <Card key={i} sx={{ mb: 2 }}>
                <CardContent>
                  <Skeleton width="40%" height={24} />
                  <Skeleton width="60%" height={20} sx={{ mt: 1 }} />
                  <Skeleton width="100%" height={40} sx={{ mt: 2 }} />
                </CardContent>
              </Card>
            ))}
          </Box>
        ) : (
          <>
            {/* Security Settings */}
            <SettingsSection
              title="Security"
              subtitle="Authentication settings"
              icon={<SecurityIcon fontSize="small" />}
            >
              <TextField
                label="Two-Factor Authentication"
                value={formData.twofa_enabled || ''}
                onChange={(e) =>
                  setFormData({ ...formData, twofa_enabled: e.target.value })
                }
                fullWidth
                size="small"
                placeholder="Enter 2FA configuration value"
                helperText="Enter a value to enable 2FA for sensitive actions (leave empty to disable)"
              />
            </SettingsSection>

            {/* Withdrawal Settings */}
            <SettingsSection
              title="Withdrawals"
              subtitle="Payment methods and minimum amounts"
              icon={<PaymentIcon fontSize="small" />}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.is_card_withdraw_enabled || false}
                      onChange={(e) =>
                        setFormData({ ...formData, is_card_withdraw_enabled: e.target.checked })
                      }
                    />
                  }
                  label={<Typography variant="body2">Card Withdrawal (Instant)</Typography>}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.is_crypto_withdraw_enabled || false}
                      onChange={(e) =>
                        setFormData({ ...formData, is_crypto_withdraw_enabled: e.target.checked })
                      }
                    />
                  }
                  label={<Typography variant="body2">Crypto Withdrawal (Pending Approval)</Typography>}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.is_binance_pay_withdraw_enabled || false}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          is_binance_pay_withdraw_enabled: e.target.checked,
                        })
                      }
                    />
                  }
                  label={<Typography variant="body2">Binance Pay (Pending Approval)</Typography>}
                />
                
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle2" color="text.secondary">
                  Minimum Withdrawal Amounts
                </Typography>
                
                <TextField
                  label="Min Card Withdrawal ($)"
                  type="number"
                  value={formData.min_withdraw_card || 5}
                  onChange={(e) =>
                    setFormData({ ...formData, min_withdraw_card: parseFloat(e.target.value) || 0 })
                  }
                  fullWidth
                  size="small"
                  inputProps={{ min: 0, step: 0.01 }}
                />
                <TextField
                  label="Min Crypto Withdrawal ($)"
                  type="number"
                  value={formData.min_withdraw_crypto || 10}
                  onChange={(e) =>
                    setFormData({ ...formData, min_withdraw_crypto: parseFloat(e.target.value) || 0 })
                  }
                  fullWidth
                  size="small"
                  inputProps={{ min: 0, step: 0.01 }}
                />
                <TextField
                  label="Min Binance Pay Withdrawal ($)"
                  type="number"
                  value={formData.min_withdraw_binance || 5}
                  onChange={(e) =>
                    setFormData({ ...formData, min_withdraw_binance: parseFloat(e.target.value) || 0 })
                  }
                  fullWidth
                  size="small"
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Box>
            </SettingsSection>

            {/* Channel Settings */}
            <SettingsSection
              title="Telegram Channels"
              subtitle="Channel configuration"
              icon={<TelegramIcon fontSize="small" />}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Claim Channel ID"
                  value={formData.claim_channel_id || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, claim_channel_id: e.target.value })
                  }
                  placeholder="-1001234567890"
                  fullWidth
                  size="small"
                  helperText="Channel for claims"
                />
                <TextField
                  label="Withdraw Channel ID"
                  value={formData.withdraw_channel_id || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, withdraw_channel_id: e.target.value })
                  }
                  placeholder="-1001234567890"
                  fullWidth
                  size="small"
                  helperText="Channel for withdrawals"
                />
                <Divider />
                <TextField
                  label="Main Channel Username"
                  value={formData.main_channel_username || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, main_channel_username: e.target.value })
                  }
                  placeholder="yourchannel"
                  fullWidth
                  size="small"
                  helperText="Without @ symbol"
                />
                <TextField
                  label="Backup Channel Username"
                  value={formData.backup_channel_username || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, backup_channel_username: e.target.value })
                  }
                  placeholder="backupchannel"
                  fullWidth
                  size="small"
                  helperText="Without @ symbol"
                />
              </Box>
            </SettingsSection>

            {/* Last Updated Info */}
            {settings && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Last updated: {new Date(settings.updated_at).toLocaleString()}
              </Typography>
            )}
          </>
        )}
      </Box>
    </AdminLayout>
  );
}
