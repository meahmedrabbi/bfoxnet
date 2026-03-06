/**
 * Prices page - displays available countries and their prices.
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
  Card,
  CardContent,
  Stack,
  Chip,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/Layout/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { triggerHaptic } from '@/lib/telegram';
import { accountsApi, PublicCountryResponse } from '@/lib/api';
import { getCountryFlag } from '@/lib/country';
import toast from 'react-hot-toast';

export default function PricesPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, error: authError } = useAuth();
  
  const [countries, setCountries] = useState<PublicCountryResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const initialFetchDone = useRef(false);

  const fetchCountries = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await accountsApi.listCountries();
      setCountries(response.data.countries);
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { detail?: string } } }).response?.data?.detail || 
                      'Failed to fetch countries';
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

  const handleRefresh = () => {
    triggerHaptic('impact', 'light');
    fetchCountries();
  };

  // Initial fetch
  useEffect(() => {
    if (isAuthenticated && !initialFetchDone.current) {
      initialFetchDone.current = true;
      fetchCountries();
    }
  }, [isAuthenticated, fetchCountries]);

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

  // Render empty state
  const renderEmptyState = () => (
    <Box textAlign="center" py={4}>
      <Typography variant="h6" color="text.secondary">
        No countries available
      </Typography>
      <Typography variant="body2" color="text.secondary" mt={1}>
        Available countries with prices will appear here
      </Typography>
    </Box>
  );

  return (
    <AppLayout>
      <Box pb={4}>
        {/* Header */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <IconButton onClick={handleBack} edge="start" aria-label="back">
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h5" component="h1" fontWeight={600}>
              Prices
            </Typography>
          </Box>
          <IconButton onClick={handleRefresh} aria-label="refresh" disabled={isLoading}>
            <RefreshIcon />
          </IconButton>
        </Box>

        {/* Description */}
        <Typography variant="body2" color="text.secondary" mb={3}>
          View available countries and their prices by quality level
        </Typography>

        {/* Content */}
        {isLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" py={4}>
            <CircularProgress size={24} />
          </Box>
        ) : countries.length === 0 ? (
          renderEmptyState()
        ) : (
          <Stack spacing={1.5}>
            {countries.map((country) => (
              <Card 
                key={country.iso2}
                sx={{ 
                  '&:hover': { bgcolor: 'action.hover' }
                }}
              >
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <Typography variant="h5" component="span">
                        {getCountryFlag(country.iso2)}
                      </Typography>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={600}>
                          {country.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {country.iso2}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  
                  {/* Quality Prices */}
                  <Box display="flex" gap={1} mt={2} flexWrap="wrap">
                    <Chip
                      label={`Free: $${country.quality_prices.FREE.toFixed(2)}`}
                      color="success"
                      size="small"
                      variant="outlined"
                    />
                    <Chip
                      label={`Registered: $${country.quality_prices.SPAM.toFixed(2)}`}
                      color="warning"
                      size="small"
                      variant="outlined"
                    />
                    <Chip
                      label={`Limit: $${country.quality_prices.LIMIT.toFixed(2)}`}
                      color="error"
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
      </Box>
    </AppLayout>
  );
}
