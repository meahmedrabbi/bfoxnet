/**
 * Test Area Page - Admin panel for various testing tools.
 * Contains sections for testing proxy connections and pushing test data.
 */
'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  AlertTitle,
  Card,
  CardContent,
  TextField,
  Button,
  useTheme,
  Chip,
  Grid,
  InputAdornment,
  alpha,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Speed as SpeedIcon,
  LocationOn as LocationIcon,
  Public as PublicIcon,
  Router as RouterIcon,
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  AccessTime as AccessTimeIcon,
  Dns as DnsIcon,
  NetworkCheck as NetworkCheckIcon,
  Science as ScienceIcon,
  AccountBalanceWallet as WalletIcon,
  Storage as StorageIcon,
} from '@mui/icons-material';
import { AdminLayout } from '@/components/Admin/AdminLayout';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import { proxyApi, adminApi, ProxyTestResponse, TestDataRequest, TestDataResponse } from '@/lib/api';
import { triggerHaptic } from '@/lib/telegram';
import toast from 'react-hot-toast';

interface ProxyInfoCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color?: string;
}

const ProxyInfoCard: React.FC<ProxyInfoCardProps> = ({ title, value, icon, color }) => {
  const theme = useTheme();
  
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 2, pb: '16px !important' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: alpha(color || theme.palette.primary.main, 0.1),
              color: color || theme.palette.primary.main,
            }}
          >
            {icon}
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              {title}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                fontSize: '0.875rem',
                wordBreak: 'break-all',
              }}
            >
              {value || 'N/A'}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default function TestAreaPage() {
  const theme = useTheme();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { isAdmin, checkAdminStatus } = useAdmin();

  // Proxy test state
  const [countryCode, setCountryCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<ProxyTestResponse | null>(null);

  // Test data state
  const [testDataLoading, setTestDataLoading] = useState(false);
  const [testDataResult, setTestDataResult] = useState<TestDataResponse | null>(null);
  const [testDataForm, setTestDataForm] = useState<TestDataRequest>({
    user_telegram_id: 0,
    balance_amount: 10.0,
    num_sessions: 5,
    session_status: 'success',
    country_code: 'US',
    session_price: 1.0,
  });

  // Check admin status when user is available
  useEffect(() => {
    if (isAuthenticated) {
      checkAdminStatus();
    }
  }, [isAuthenticated, checkAdminStatus]);

  const handleTest = async () => {
    if (!countryCode || countryCode.length !== 2) {
      toast.error('Please enter a valid 2-letter country code (e.g., BD, US, VN)');
      return;
    }

    setIsLoading(true);
    setTestResult(null);
    triggerHaptic('impact', 'light');

    try {
      // Fallback is always enabled (hardcoded)
      const response = await proxyApi.test(countryCode.toUpperCase(), true, 15);
      setTestResult(response.data);

      if (response.data.success) {
        toast.success(`Proxy test successful for ${countryCode.toUpperCase()}`);
        triggerHaptic('notification', 'success');
      } else {
        toast.error(response.data.error || 'Proxy test failed');
        triggerHaptic('notification', 'error');
      }
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Failed to test proxy';
      toast.error(errorMessage);
      triggerHaptic('notification', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePushTestData = async () => {
    if (!testDataForm.user_telegram_id || testDataForm.user_telegram_id <= 0) {
      toast.error('Please enter a valid Telegram User ID');
      return;
    }

    setTestDataLoading(true);
    setTestDataResult(null);
    triggerHaptic('impact', 'light');

    try {
      const response = await adminApi.pushTestData(testDataForm);
      setTestDataResult(response.data);
      toast.success(response.data.message);
      triggerHaptic('notification', 'success');
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Failed to push test data';
      toast.error(errorMessage);
      triggerHaptic('notification', 'error');
    } finally {
      setTestDataLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && countryCode.length === 2) {
      handleTest();
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
          You do not have admin privileges.
        </Alert>
      </Box>
    );
  }

  return (
    <AdminLayout title="Test Area">
      <Box>
        {/* Proxy Test Section */}
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                }}
              >
                <NetworkCheckIcon />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Proxy Test
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Test SOCKS5 proxy connections by country
                </Typography>
              </Box>
            </Box>
            <Divider sx={{ mb: 2 }} />

            {/* Test Input */}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
              <TextField
                label="Country Code (ISO2)"
                placeholder="e.g., BD, US, VN"
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value.toUpperCase().slice(0, 2))}
                onKeyPress={handleKeyPress}
                size="small"
                sx={{ flex: 1, maxWidth: 200 }}
                inputProps={{ maxLength: 2, style: { textTransform: 'uppercase' } }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PublicIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                variant="contained"
                onClick={handleTest}
                disabled={isLoading || countryCode.length !== 2}
                startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : <SearchIcon />}
                sx={{ minWidth: 100 }}
              >
                {isLoading ? 'Testing...' : 'Test'}
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Test Results */}
        {testResult && (
          <Box>
            {/* Status Card */}
            <Card sx={{ mb: 2 }}>
              <CardContent sx={{ p: 2, pb: '16px !important' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {testResult.success ? (
                    <CheckCircleIcon sx={{ fontSize: 48, color: theme.palette.success.main }} />
                  ) : (
                    <ErrorIcon sx={{ fontSize: 48, color: theme.palette.error.main }} />
                  )}
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {testResult.success ? 'Connection Successful' : 'Connection Failed'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Country requested: <strong>{testResult.country_requested}</strong>
                      {testResult.used_fallback && (
                        <>
                          {' '}
                          <Chip
                            label="Used Fallback"
                            size="small"
                            color="warning"
                            sx={{ height: 20, fontSize: '0.625rem', ml: 1 }}
                          />
                        </>
                      )}
                    </Typography>
                    {testResult.error && (
                      <Alert severity="error" sx={{ mt: 1 }}>
                        {testResult.error}
                      </Alert>
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* IP Info Cards */}
            {testResult.success && testResult.ip_info && (
              <>
                <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600, color: 'text.secondary' }}>
                  Connection Details
                </Typography>
                <Grid container spacing={1.5} sx={{ mb: 3 }}>
                  <Grid size={{ xs: 6, sm: 4 }}>
                    <ProxyInfoCard
                      title="IP Address"
                      value={testResult.ip_info.ip}
                      icon={<DnsIcon />}
                      color={theme.palette.info.main}
                    />
                  </Grid>
                  <Grid size={{ xs: 6, sm: 4 }}>
                    <ProxyInfoCard
                      title="Response Time"
                      value={`${testResult.response_time_ms?.toFixed(0) || '?'} ms`}
                      icon={<SpeedIcon />}
                      color={theme.palette.success.main}
                    />
                  </Grid>
                  <Grid size={{ xs: 6, sm: 4 }}>
                    <ProxyInfoCard
                      title="Country"
                      value={`${testResult.ip_info.country} (${testResult.ip_info.country_code})`}
                      icon={<LocationIcon />}
                      color={theme.palette.warning.main}
                    />
                  </Grid>
                  <Grid size={{ xs: 6, sm: 4 }}>
                    <ProxyInfoCard
                      title="City"
                      value={testResult.ip_info.city}
                      icon={<LocationIcon />}
                      color={theme.palette.secondary.main}
                    />
                  </Grid>
                  <Grid size={{ xs: 6, sm: 4 }}>
                    <ProxyInfoCard
                      title="ISP"
                      value={testResult.ip_info.isp}
                      icon={<RouterIcon />}
                      color={theme.palette.primary.main}
                    />
                  </Grid>
                  <Grid size={{ xs: 6, sm: 4 }}>
                    <ProxyInfoCard
                      title="Timezone"
                      value={testResult.ip_info.timezone}
                      icon={<AccessTimeIcon />}
                      color={theme.palette.info.main}
                    />
                  </Grid>
                </Grid>
              </>
            )}

            {/* Fallback Attempts */}
            {testResult.fallback_attempts && testResult.fallback_attempts.length > 0 && (
              <>
                <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600, color: 'text.secondary' }}>
                  Fallback Attempts
                </Typography>
                <Card>
                  <CardContent sx={{ p: 2, pb: '16px !important' }}>
                    {testResult.primary_error && (
                      <Alert severity="warning" sx={{ mb: 2 }}>
                        Primary ({testResult.original_country || testResult.country_requested}): {testResult.primary_error}
                      </Alert>
                    )}
                    {testResult.fallback_attempts.map((attempt, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          py: 0.5,
                          borderBottom: index < testResult.fallback_attempts!.length - 1
                            ? `1px solid ${theme.palette.divider}`
                            : 'none',
                        }}
                      >
                        {attempt.success ? (
                          <CheckCircleIcon sx={{ fontSize: 16, color: theme.palette.success.main }} />
                        ) : (
                          <ErrorIcon sx={{ fontSize: 16, color: theme.palette.error.main }} />
                        )}
                        <Typography variant="body2">
                          <strong>{attempt.country}</strong>
                          {attempt.error && (
                            <Typography component="span" color="text.secondary">
                              {' - '}{attempt.error}
                            </Typography>
                          )}
                        </Typography>
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              </>
            )}

            {/* Test Metadata */}
            <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
              Tested at: {new Date(testResult.tested_at).toLocaleString()}
            </Typography>
          </Box>
        )}

        {/* Test Data Push Section */}
        <Card sx={{ mt: 3 }}>
          <CardContent sx={{ p: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: alpha(theme.palette.secondary.main, 0.1),
                  color: theme.palette.secondary.main,
                }}
              >
                <ScienceIcon />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Push Test Data
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Add test balance and sessions for demonstration
                </Typography>
              </Box>
            </Box>
            <Divider sx={{ mb: 2 }} />

            {/* Test Data Form */}
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Telegram User ID"
                  type="number"
                  value={testDataForm.user_telegram_id || ''}
                  onChange={(e) => setTestDataForm({
                    ...testDataForm,
                    user_telegram_id: parseInt(e.target.value) || 0
                  })}
                  fullWidth
                  size="small"
                  placeholder="e.g., 123456789"
                  helperText="Target user's Telegram ID"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Balance to Add"
                  type="number"
                  value={testDataForm.balance_amount}
                  onChange={(e) => setTestDataForm({
                    ...testDataForm,
                    balance_amount: parseFloat(e.target.value) || 0
                  })}
                  fullWidth
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <WalletIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                  }}
                  helperText="Amount to add to user balance"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Number of Sessions"
                  type="number"
                  value={testDataForm.num_sessions}
                  onChange={(e) => setTestDataForm({
                    ...testDataForm,
                    num_sessions: Math.min(50, parseInt(e.target.value) || 0)
                  })}
                  fullWidth
                  size="small"
                  inputProps={{ min: 0, max: 50 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <StorageIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                  }}
                  helperText="Max 50 sessions per request"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Session Status</InputLabel>
                  <Select
                    value={testDataForm.session_status}
                    label="Session Status"
                    onChange={(e) => setTestDataForm({
                      ...testDataForm,
                      session_status: e.target.value as 'pending' | 'success' | 'rejected'
                    })}
                  >
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="success">Success</MenuItem>
                    <MenuItem value="rejected">Rejected</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Country Code (ISO2)"
                  value={testDataForm.country_code}
                  onChange={(e) => setTestDataForm({
                    ...testDataForm,
                    country_code: e.target.value.toUpperCase().slice(0, 2)
                  })}
                  fullWidth
                  size="small"
                  inputProps={{ maxLength: 2, style: { textTransform: 'uppercase' } }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PublicIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                  }}
                  helperText="e.g., US, BD, VN"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Price per Session"
                  type="number"
                  value={testDataForm.session_price}
                  onChange={(e) => setTestDataForm({
                    ...testDataForm,
                    session_price: parseFloat(e.target.value) || 0
                  })}
                  fullWidth
                  size="small"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  helperText="Price for each test session"
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handlePushTestData}
                  disabled={testDataLoading || !testDataForm.user_telegram_id}
                  startIcon={testDataLoading ? <CircularProgress size={16} color="inherit" /> : <ScienceIcon />}
                  fullWidth
                >
                  {testDataLoading ? 'Pushing...' : 'Push Test Data'}
                </Button>
              </Grid>
            </Grid>

            {/* Test Data Result */}
            {testDataResult && (
              <Alert 
                severity={testDataResult.success ? 'success' : 'error'} 
                sx={{ mt: 2 }}
                icon={testDataResult.success ? <CheckCircleIcon /> : <ErrorIcon />}
              >
                <AlertTitle>{testDataResult.success ? 'Success' : 'Error'}</AlertTitle>
                <Typography variant="body2">
                  {testDataResult.message}
                </Typography>
                {testDataResult.success && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="caption" display="block">
                      User ID: {testDataResult.user_telegram_id}
                    </Typography>
                    <Typography variant="caption" display="block">
                      Balance Added: ${testDataResult.balance_added.toFixed(2)}
                    </Typography>
                    <Typography variant="caption" display="block">
                      Sessions Created: {testDataResult.sessions_created}
                    </Typography>
                    <Typography variant="caption" display="block">
                      New Balance: ${testDataResult.new_balance.toFixed(2)}
                    </Typography>
                  </Box>
                )}
              </Alert>
            )}
          </CardContent>
        </Card>
      </Box>
    </AdminLayout>
  );
}
