/**
 * Withdraw page - allows users to withdraw their balance.
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
  Card,
  CardContent,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Divider,
  Stack,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Refresh as RefreshIcon,
  CreditCard as CardIcon,
  CurrencyBitcoin as CryptoIcon,
  AccountBalanceWallet as BinanceIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/Layout/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { triggerHaptic } from '@/lib/telegram';
import { 
  withdrawalsApi, 
  authApi,
  WithdrawalSettingsResponse,
  WithdrawalMethodType,
  CryptoChannelType,
  UserProfileResponse,
} from '@/lib/api';
import toast from 'react-hot-toast';

export default function WithdrawPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, error: authError } = useAuth();
  
  const [settings, setSettings] = useState<WithdrawalSettingsResponse | null>(null);
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [method, setMethod] = useState<WithdrawalMethodType | ''>('');
  const [address, setAddress] = useState('');
  const [cryptoChannel, setCryptoChannel] = useState<CryptoChannelType | ''>('');
  
  const [errors, setErrors] = useState<{
    method?: string;
    address?: string;
    cryptoChannel?: string;
  }>({});

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [settingsRes, profileRes] = await Promise.all([
        withdrawalsApi.getSettings(),
        authApi.getProfile(),
      ]);
      setSettings(settingsRes.data);
      setProfile(profileRes.data);
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { detail?: string } } }).response?.data?.detail || 
                      'Failed to load withdrawal settings';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleBack = () => {
    triggerHaptic('selection');
    router.push('/');
  };

  const handleRetry = () => {
    window.location.reload();
  };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};
    
    if (!method) {
      newErrors.method = 'Please select a withdrawal method';
    }
    
    if (!address || address.trim().length < 2) {
      newErrors.address = 'Address must be at least 2 characters';
    }
    
    if (method === 'crypto' && !cryptoChannel) {
      newErrors.cryptoChannel = 'Please select a crypto channel';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !settings || !profile || !method) return;
    
    // Check minimum amount
    let minAmount = 0;
    if (method === 'card') minAmount = settings.min_withdraw_card;
    else if (method === 'crypto') minAmount = settings.min_withdraw_crypto;
    else if (method === 'binance') minAmount = settings.min_withdraw_binance;
    
    if (profile.balance < minAmount) {
      toast.error(`Minimum withdrawal amount is $${minAmount.toFixed(2)}`);
      return;
    }
    
    setIsSubmitting(true);
    triggerHaptic('impact', 'medium');
    
    try {
      const response = await withdrawalsApi.create({
        method,
        address: address.trim(),
        crypto_channel: method === 'crypto' ? cryptoChannel as CryptoChannelType : undefined,
      });
      
      if (response.data.status === 'completed') {
        toast.success('Withdrawal completed successfully!');
      } else {
        toast.success('Withdrawal request submitted. Pending admin approval.');
      }
      
      router.push('/orders');
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { detail?: string } } }).response?.data?.detail || 
                      'Failed to create withdrawal';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, fetchData]);

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

  if (!settings || !profile) {
    return (
      <AppLayout>
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="text.secondary">
            Failed to load withdrawal settings
          </Typography>
          <Button 
            variant="contained" 
            onClick={fetchData}
            sx={{ mt: 2 }}
          >
            Retry
          </Button>
        </Box>
      </AppLayout>
    );
  }

  const hasEnabledMethods = settings.is_card_withdraw_enabled || 
                           settings.is_crypto_withdraw_enabled || 
                           settings.is_binance_pay_withdraw_enabled;

  return (
    <AppLayout>
      <Box pb={10}>
        {/* Header */}
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <IconButton onClick={handleBack} edge="start" aria-label="back">
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" component="h1" fontWeight={600}>
            Withdraw
          </Typography>
        </Box>

        {/* Balance Card */}
        <Card 
          sx={{ 
            mb: 3, 
            background: (theme) => `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
            color: 'white',
          }}
        >
          <CardContent>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              Available Balance
            </Typography>
            <Typography variant="h3" fontWeight={700}>
              ${profile.balance.toFixed(2)}
            </Typography>
          </CardContent>
        </Card>

        {!hasEnabledMethods ? (
          <Alert severity="info">
            <AlertTitle>Withdrawals Disabled</AlertTitle>
            No withdrawal methods are currently enabled. Please contact support.
          </Alert>
        ) : (
          <Stack spacing={3}>
            {/* Withdrawal Method Selection */}
            <Card>
              <CardContent>
                <FormControl component="fieldset" error={!!errors.method} fullWidth>
                  <FormLabel component="legend" sx={{ mb: 2, fontWeight: 600 }}>
                    Select Withdrawal Method
                  </FormLabel>
                  <RadioGroup
                    value={method}
                    onChange={(e) => {
                      setMethod(e.target.value as WithdrawalMethodType);
                      setErrors((prev) => ({ ...prev, method: undefined }));
                    }}
                  >
                    {settings.is_card_withdraw_enabled && (
                      <FormControlLabel
                        value="card"
                        control={<Radio />}
                        label={
                          <Box display="flex" alignItems="center" gap={1}>
                            <CardIcon color="action" />
                            <Box>
                              <Typography variant="body1">Card</Typography>
                              <Typography variant="caption" color="text.secondary">
                                Minimum: ${settings.min_withdraw_card.toFixed(2)}
                              </Typography>
                            </Box>
                          </Box>
                        }
                        sx={{ 
                          border: '1px solid',
                          borderColor: method === 'card' ? 'primary.main' : 'divider',
                          borderRadius: 1,
                          mb: 1,
                          mx: 0,
                          p: 1,
                        }}
                      />
                    )}
                    
                    {settings.is_crypto_withdraw_enabled && (
                      <FormControlLabel
                        value="crypto"
                        control={<Radio />}
                        label={
                          <Box display="flex" alignItems="center" gap={1}>
                            <CryptoIcon color="action" />
                            <Box>
                              <Typography variant="body1">Crypto</Typography>
                              <Typography variant="caption" color="text.secondary">
                                Minimum: ${settings.min_withdraw_crypto.toFixed(2)}
                              </Typography>
                            </Box>
                          </Box>
                        }
                        sx={{ 
                          border: '1px solid',
                          borderColor: method === 'crypto' ? 'primary.main' : 'divider',
                          borderRadius: 1,
                          mb: 1,
                          mx: 0,
                          p: 1,
                        }}
                      />
                    )}
                    
                    {settings.is_binance_pay_withdraw_enabled && (
                      <FormControlLabel
                        value="binance"
                        control={<Radio />}
                        label={
                          <Box display="flex" alignItems="center" gap={1}>
                            <BinanceIcon color="action" />
                            <Box>
                              <Typography variant="body1">Binance Pay</Typography>
                              <Typography variant="caption" color="text.secondary">
                                Minimum: ${settings.min_withdraw_binance.toFixed(2)}
                              </Typography>
                            </Box>
                          </Box>
                        }
                        sx={{ 
                          border: '1px solid',
                          borderColor: method === 'binance' ? 'primary.main' : 'divider',
                          borderRadius: 1,
                          mx: 0,
                          p: 1,
                        }}
                      />
                    )}
                  </RadioGroup>
                  {errors.method && (
                    <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                      {errors.method}
                    </Typography>
                  )}
                </FormControl>
              </CardContent>
            </Card>

            {/* Crypto Channel Selection (only for crypto method) */}
            {method === 'crypto' && (
              <Card>
                <CardContent>
                  <FormControl component="fieldset" error={!!errors.cryptoChannel} fullWidth>
                    <FormLabel component="legend" sx={{ mb: 2, fontWeight: 600 }}>
                      Select Crypto Channel
                    </FormLabel>
                    <RadioGroup
                      value={cryptoChannel}
                      onChange={(e) => {
                        setCryptoChannel(e.target.value as CryptoChannelType);
                        setErrors((prev) => ({ ...prev, cryptoChannel: undefined }));
                      }}
                      row
                    >
                      <FormControlLabel
                        value="TRC20"
                        control={<Radio />}
                        label="TRC20 (TRON)"
                        sx={{ 
                          border: '1px solid',
                          borderColor: cryptoChannel === 'TRC20' ? 'primary.main' : 'divider',
                          borderRadius: 1,
                          mr: 1,
                          px: 2,
                          py: 1,
                        }}
                      />
                      <FormControlLabel
                        value="BEP20"
                        control={<Radio />}
                        label="BEP20 (BSC)"
                        sx={{ 
                          border: '1px solid',
                          borderColor: cryptoChannel === 'BEP20' ? 'primary.main' : 'divider',
                          borderRadius: 1,
                          px: 2,
                          py: 1,
                        }}
                      />
                    </RadioGroup>
                    {errors.cryptoChannel && (
                      <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                        {errors.cryptoChannel}
                      </Typography>
                    )}
                  </FormControl>
                </CardContent>
              </Card>
            )}

            {/* Address Input */}
            {method && (
              <Card>
                <CardContent>
                  <TextField
                    fullWidth
                    label={
                      method === 'card' ? 'Card Name (e.g., TN, TN BESO)' :
                      method === 'crypto' ? 'Wallet Address' :
                      'Binance Pay ID'
                    }
                    placeholder={
                      method === 'card' ? 'Enter your card name' :
                      method === 'crypto' ? 'Enter your wallet address' :
                      'Enter your Binance Pay ID'
                    }
                    value={address}
                    onChange={(e) => {
                      setAddress(e.target.value);
                      setErrors((prev) => ({ ...prev, address: undefined }));
                    }}
                    error={!!errors.address}
                    helperText={errors.address || (method === 'card' ? 'Minimum 2 characters' : '')}
                    inputProps={{ minLength: 2 }}
                  />
                </CardContent>
              </Card>
            )}

            {/* Submit Button */}
            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={handleSubmit}
              disabled={!method || !address || isSubmitting}
              sx={{ py: 1.5 }}
            >
              {isSubmitting ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                `Withdraw $${profile.balance.toFixed(2)}`
              )}
            </Button>
          </Stack>
        )}
      </Box>
    </AppLayout>
  );
}
