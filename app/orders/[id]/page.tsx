/**
 * Order detail page - displays withdrawal details with session tabs.
 */
'use client';

import React, { useState, useCallback, useEffect } from 'react';
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
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Refresh as RefreshIcon,
  CheckCircle as SuccessIcon,
  Cancel as RejectedIcon,
} from '@mui/icons-material';
import { useRouter, useParams } from 'next/navigation';
import { AppLayout } from '@/components/Layout/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { triggerHaptic } from '@/lib/telegram';
import { 
  withdrawalsApi, 
  WithdrawalResponse, 
  WithdrawalStatusType,
  WithdrawalSessionsResponse,
  SessionWithdrawalInfo,
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

// Country flag helper - all countries
const COUNTRY_FLAGS: Record<string, string> = {
  // Americas
  "US": "🇺🇸", "CA": "🇨🇦", "MX": "🇲🇽", "BR": "🇧🇷", "AR": "🇦🇷",
  "CO": "🇨🇴", "PE": "🇵🇪", "VE": "🇻🇪", "CL": "🇨🇱", "EC": "🇪🇨",
  "GT": "🇬🇹", "CU": "🇨🇺", "BO": "🇧🇴", "DO": "🇩🇴", "HN": "🇭🇳",
  "PY": "🇵🇾", "SV": "🇸🇻", "NI": "🇳🇮", "CR": "🇨🇷", "PA": "🇵🇦",
  "UY": "🇺🇾", "JM": "🇯🇲", "HT": "🇭🇹", "TT": "🇹🇹", "PR": "🇵🇷",
  "GY": "🇬🇾", "SR": "🇸🇷", "BZ": "🇧🇿", "BB": "🇧🇧", "BS": "🇧🇸",
  "LC": "🇱🇨", "GD": "🇬🇩", "VC": "🇻🇨", "AG": "🇦🇬", "DM": "🇩🇲",
  "KN": "🇰🇳", "AW": "🇦🇼", "CW": "🇨🇼", "TC": "🇹🇨", "VG": "🇻🇬",
  "VI": "🇻🇮", "AI": "🇦🇮", "MS": "🇲🇸", "KY": "🇰🇾", "BM": "🇧🇲",
  "GL": "🇬🇱", "PM": "🇵🇲", "MQ": "🇲🇶", "GP": "🇬🇵", "GF": "🇬🇫",
  "FK": "🇫🇰", "BQ": "🇧🇶", "SX": "🇸🇽", "MF": "🇲🇫", "BL": "🇧🇱",
  // Europe
  "GB": "🇬🇧", "DE": "🇩🇪", "FR": "🇫🇷", "IT": "🇮🇹", "ES": "🇪🇸",
  "PT": "🇵🇹", "NL": "🇳🇱", "BE": "🇧🇪", "CH": "🇨🇭", "AT": "🇦🇹",
  "PL": "🇵🇱", "RU": "🇷🇺", "UA": "🇺🇦", "TR": "🇹🇷", "GR": "🇬🇷",
  "SE": "🇸🇪", "NO": "🇳🇴", "DK": "🇩🇰", "FI": "🇫🇮", "IE": "🇮🇪",
  "CZ": "🇨🇿", "RO": "🇷🇴", "HU": "🇭🇺", "SK": "🇸🇰", "BG": "🇧🇬",
  "RS": "🇷🇸", "HR": "🇭🇷", "SI": "🇸🇮", "LT": "🇱🇹", "LV": "🇱🇻",
  "EE": "🇪🇪", "BY": "🇧🇾", "MD": "🇲🇩", "AL": "🇦🇱", "MK": "🇲🇰",
  "ME": "🇲🇪", "BA": "🇧🇦", "XK": "🇽🇰", "IS": "🇮🇸", "LU": "🇱🇺",
  "MT": "🇲🇹", "CY": "🇨🇾", "MC": "🇲🇨", "AD": "🇦🇩", "SM": "🇸🇲",
  "VA": "🇻🇦", "LI": "🇱🇮", "GI": "🇬🇮", "IM": "🇮🇲", "JE": "🇯🇪",
  "GG": "🇬🇬", "AX": "🇦🇽", "FO": "🇫🇴", "SJ": "🇸🇯",
  // Asia
  "CN": "🇨🇳", "JP": "🇯🇵", "KR": "🇰🇷", "IN": "🇮🇳", "ID": "🇮🇩",
  "TH": "🇹🇭", "VN": "🇻🇳", "PH": "🇵🇭", "MY": "🇲🇾", "SG": "🇸🇬",
  "PK": "🇵🇰", "BD": "🇧🇩", "IR": "🇮🇷", "IQ": "🇮🇶", "SA": "🇸🇦",
  "AE": "🇦🇪", "IL": "🇮🇱", "TW": "🇹🇼", "HK": "🇭🇰", "MO": "🇲🇴",
  "KP": "🇰🇵", "MM": "🇲🇲", "LA": "🇱🇦", "KH": "🇰🇭", "NP": "🇳🇵",
  "LK": "🇱🇰", "AF": "🇦🇫", "KZ": "🇰🇿", "UZ": "🇺🇿", "TM": "🇹🇲",
  "TJ": "🇹🇯", "KG": "🇰🇬", "AZ": "🇦🇿", "AM": "🇦🇲", "GE": "🇬🇪",
  "MN": "🇲🇳", "BT": "🇧🇹", "BN": "🇧🇳", "TL": "🇹🇱", "MV": "🇲🇻",
  "JO": "🇯🇴", "LB": "🇱🇧", "SY": "🇸🇾", "PS": "🇵🇸", "YE": "🇾🇪",
  "OM": "🇴🇲", "KW": "🇰🇼", "BH": "🇧🇭", "QA": "🇶🇦",
  // Africa
  "EG": "🇪🇬", "ZA": "🇿🇦", "NG": "🇳🇬", "KE": "🇰🇪", "ET": "🇪🇹",
  "GH": "🇬🇭", "TZ": "🇹🇿", "MA": "🇲🇦", "DZ": "🇩🇿", "SD": "🇸🇩",
  "UG": "🇺🇬", "MZ": "🇲🇿", "CI": "🇨🇮", "CM": "🇨🇲", "AO": "🇦🇴",
  "SN": "🇸🇳", "ZW": "🇿🇼", "RW": "🇷🇼", "TN": "🇹🇳", "LY": "🇱🇾",
  "MW": "🇲🇼", "ZM": "🇿🇲", "BW": "🇧🇼", "NA": "🇳🇦", "GA": "🇬🇦",
  "LS": "🇱🇸", "GM": "🇬🇲", "GN": "🇬🇳", "BJ": "🇧🇯", "TG": "🇹🇬",
  "SL": "🇸🇱", "LR": "🇱🇷", "MR": "🇲🇷", "ML": "🇲🇱", "BF": "🇧🇫",
  "NE": "🇳🇪", "TD": "🇹🇩", "CF": "🇨🇫", "CG": "🇨🇬", "CD": "🇨🇩",
  "GQ": "🇬🇶", "ST": "🇸🇹", "CV": "🇨🇻", "MU": "🇲🇺", "SC": "🇸🇨",
  "KM": "🇰🇲", "MG": "🇲🇬", "ER": "🇪🇷", "SO": "🇸🇴", "DJ": "🇩🇯",
  "SS": "🇸🇸", "BI": "🇧🇮", "SZ": "🇸🇿", "RE": "🇷🇪", "YT": "🇾🇹",
  "EH": "🇪🇭", "SH": "🇸🇭", "IO": "🇮🇴",
  // Oceania
  "AU": "🇦🇺", "NZ": "🇳🇿", "PG": "🇵🇬", "FJ": "🇫🇯", "SB": "🇸🇧",
  "VU": "🇻🇺", "NC": "🇳🇨", "PF": "🇵🇫", "WS": "🇼🇸", "TO": "🇹🇴",
  "FM": "🇫🇲", "KI": "🇰🇮", "MH": "🇲🇭", "PW": "🇵🇼", "NR": "🇳🇷",
  "TV": "🇹🇻", "AS": "🇦🇸", "GU": "🇬🇺", "MP": "🇲🇵", "CK": "🇨🇰",
  "NU": "🇳🇺", "TK": "🇹🇰", "WF": "🇼🇫", "PN": "🇵🇳", "NF": "🇳🇫",
  "CC": "🇨🇨", "CX": "🇨🇽", "HM": "🇭🇲",
  // Others
  "AQ": "🇦🇶", "TF": "🇹🇫", "GS": "🇬🇸", "BV": "🇧🇻", "UM": "🇺🇲",
};

const getCountryFlag = (iso2: string | null) => {
  if (!iso2) return '🏳️';
  return COUNTRY_FLAGS[iso2.toUpperCase()] || '🏳️';
};

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const withdrawalId = params.id as string;
  const { isAuthenticated, isLoading: authLoading, error: authError } = useAuth();
  
  const [withdrawal, setWithdrawal] = useState<WithdrawalResponse | null>(null);
  const [sessions, setSessions] = useState<WithdrawalSessionsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  const fetchData = useCallback(async () => {
    if (!withdrawalId) return;
    
    setIsLoading(true);
    try {
      const [withdrawalRes, sessionsRes] = await Promise.all([
        withdrawalsApi.get(parseInt(withdrawalId)),
        withdrawalsApi.getSessions(parseInt(withdrawalId)),
      ]);
      setWithdrawal(withdrawalRes.data);
      setSessions(sessionsRes.data);
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { detail?: string } } }).response?.data?.detail || 
                      'Failed to fetch withdrawal details';
      toast.error(message);
      router.push('/orders');
    } finally {
      setIsLoading(false);
    }
  }, [withdrawalId, router]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    triggerHaptic('selection');
    setTabValue(newValue);
  };

  const handleBack = () => {
    triggerHaptic('selection');
    router.push('/orders');
  };

  const handleRetry = () => {
    window.location.reload();
  };

  // Initial fetch
  useEffect(() => {
    if (isAuthenticated && withdrawalId) {
      fetchData();
    }
  }, [isAuthenticated, withdrawalId, fetchData]);

  if (authLoading || isLoading) {
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

  if (!withdrawal) {
    return (
      <AppLayout>
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="text.secondary">
            Withdrawal not found
          </Typography>
        </Box>
      </AppLayout>
    );
  }

  const renderSessionList = (sessionList: SessionWithdrawalInfo[]) => {
    if (sessionList.length === 0) {
      return (
        <Box textAlign="center" py={4}>
          <Typography variant="body2" color="text.secondary">
            No sessions found
          </Typography>
        </Box>
      );
    }

    return (
      <List dense>
        {sessionList.map((session) => (
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
        ))}
      </List>
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
            Order Details
          </Typography>
        </Box>

        {/* Payment Info Card */}
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Transaction ID
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {withdrawal.transaction_id}
                </Typography>
              </Box>
              <Chip
                label={withdrawal.status}
                color={getStatusColor(withdrawal.status)}
                size="medium"
              />
            </Box>

            <Divider sx={{ my: 2 }} />

            <Stack spacing={2}>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Amount</Typography>
                <Typography variant="h6" fontWeight={700} color="success.main">
                  ${withdrawal.amount.toFixed(2)}
                </Typography>
              </Box>

              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Method</Typography>
                <Typography variant="body1">
                  {getMethodName(withdrawal.method)}
                  {withdrawal.crypto_channel && ` (${withdrawal.crypto_channel})`}
                </Typography>
              </Box>

              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Address</Typography>
                <Typography variant="body1" sx={{ wordBreak: 'break-all', textAlign: 'right', maxWidth: '60%' }}>
                  {withdrawal.address}
                </Typography>
              </Box>

              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Total Accounts</Typography>
                <Typography variant="body1">{withdrawal.total_accounts}</Typography>
              </Box>

              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Created</Typography>
                <Typography variant="body1">{formatDate(withdrawal.created_at)}</Typography>
              </Box>

              {withdrawal.completed_at && (
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Completed</Typography>
                  <Typography variant="body1">{formatDate(withdrawal.completed_at)}</Typography>
                </Box>
              )}
            </Stack>

            {/* Country Breakdown */}
            {withdrawal.accounts_by_country && Object.keys(withdrawal.accounts_by_country).length > 0 && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" color="text.secondary" mb={1}>
                  Accounts by Country
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {Object.entries(withdrawal.accounts_by_country)
                    .sort((a, b) => b[1] - a[1])
                    .map(([country, count]) => (
                      <Chip
                        key={country}
                        label={`${getCountryFlag(country)} ${country}: ${count}`}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                </Box>
              </>
            )}
          </CardContent>
        </Card>

        {/* Sessions Tabs */}
        {sessions && (
          <>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="session status tabs"
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
                icon={<SuccessIcon sx={{ fontSize: 18 }} />}
                iconPosition="start"
                label={`Success (${sessions.total_success})`}
              />
              <Tab 
                icon={<RejectedIcon sx={{ fontSize: 18 }} />}
                iconPosition="start"
                label={`Rejected (${sessions.total_rejected})`}
              />
            </Tabs>

            <Card>
              {tabValue === 0 && renderSessionList(sessions.success_sessions)}
              {tabValue === 1 && renderSessionList(sessions.rejected_sessions)}
            </Card>
          </>
        )}
      </Box>
    </AppLayout>
  );
}
