/**
 * AccountCard component - displays a Telegram account with status, price, quality, and countdown.
 */
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  Stack,
  IconButton,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Schedule as PendingIcon,
  Cancel as RejectedIcon,
  AttachMoney as MoneyIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { AccountResponse, AccountStatusType, AccountQualityType } from '@/lib/api';

interface AccountCardProps {
  account: AccountResponse;
  onRefresh?: () => void;
  onDetailsClick?: (account: AccountResponse) => void;
}

// Constants
const REFRESH_DELAY_MS = 2000; // Delay before refresh after countdown reaches zero

// Helper function to format countdown time
const formatCountdown = (seconds: number): string => {
  if (seconds <= 0) return '00:00:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// Helper function to get status color
const getStatusColor = (status: AccountStatusType): 'success' | 'warning' | 'error' | 'default' => {
  switch (status) {
    case 'success':
      return 'success';
    case 'pending':
      return 'warning';
    case 'rejected':
      return 'error';
    default:
      return 'default';
  }
};

// Helper function to get status icon
const getStatusIcon = (status: AccountStatusType): React.ReactElement => {
  switch (status) {
    case 'success':
      return <CheckCircleIcon />;
    case 'pending':
      return <PendingIcon />;
    case 'rejected':
      return <RejectedIcon />;
    default:
      return <PendingIcon />;
  }
};

// Helper function to get quality chip color and style
const getQualityChipStyles = (quality: AccountQualityType | null): { color: string; borderColor: string; label: string } => {
  switch (quality) {
    case 'FREE':
      return { color: '#2e7d32', borderColor: '#4caf50', label: 'FREE' };
    case 'REGISTERED':
      return { color: '#ed6c02', borderColor: '#ff9800', label: 'REGISTERED' };
    case 'LIMITED':
      return { color: '#d32f2f', borderColor: '#f44336', label: 'LIMITED' };
    case 'FROZEN':
      return { color: '#424242', borderColor: '#616161', label: 'FROZEN' };
    default:
      return { color: '#757575', borderColor: '#9e9e9e', label: '' };
  }
};

// Helper to calculate remaining time
const calculateRemainingTime = (claimTimeEnd: string | null) => {
  if (!claimTimeEnd) {
    return 0;
  }
  
  const endTime = new Date(claimTimeEnd).getTime();
  const now = Date.now();
  return Math.max(0, Math.floor((endTime - now) / 1000));
};

export const AccountCard: React.FC<AccountCardProps> = ({
  account,
  onRefresh,
  onDetailsClick,
}) => {
  // Initial calculation based on current time
  const initialRemaining = useMemo(() => {
    if (account.account_status !== 'pending' || !account.claim_time_end) {
      return 0;
    }
    return calculateRemainingTime(account.claim_time_end);
  }, [account.account_status, account.claim_time_end]);
  
  const [countdown, setCountdown] = useState<number>(initialRemaining);
  
  // Update countdown timer for pending accounts
  useEffect(() => {
    if (account.account_status !== 'pending' || !account.claim_time_end) {
      return;
    }
    
    // Update every second
    const interval = setInterval(() => {
      const newRemaining = calculateRemainingTime(account.claim_time_end);
      setCountdown(newRemaining);
      
      // If countdown reaches 0, trigger refresh
      if (newRemaining === 0 && onRefresh) {
        clearInterval(interval);
        // Wait a moment for the backend to process, then refresh
        setTimeout(() => onRefresh(), REFRESH_DELAY_MS);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [account.account_status, account.claim_time_end, onRefresh]);

  // Get status label
  const getStatusLabel = () => {
    switch (account.account_status) {
      case 'success':
        return 'Success';
      case 'pending':
        return countdown > 0 ? formatCountdown(countdown) : 'Processing...';
      case 'rejected':
        return 'Rejected';
      default:
        return account.account_status;
    }
  };

  // Get quality chip styles
  const qualityStyles = getQualityChipStyles(account.quality);

  return (
    <Card
      variant="outlined"
      sx={{
        borderLeft: 4,
        borderLeftColor: `${getStatusColor(account.account_status)}.main`,
      }}
    >
      <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          {/* Left side: Phone, Price, Country, Quality */}
          <Stack spacing={0.5} flex={1}>
            {/* Phone */}
            <Typography variant="body1" fontWeight={600}>
              {account.phone}
            </Typography>
            
            {/* Price, Country, and Quality */}
            <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
              <Box display="flex" alignItems="center" gap={0.5}>
                <MoneyIcon sx={{ fontSize: 16, color: 'success.main' }} />
                <Typography variant="body2" fontWeight={600} color="success.main">
                  ${account.price.toFixed(2)}
                </Typography>
              </Box>
              
              {account.country_iso2 && (
                <Chip
                  label={account.country_iso2}
                  size="small"
                  variant="outlined"
                  sx={{ fontWeight: 500, height: 22, fontSize: '0.75rem' }}
                />
              )}
              
              {/* Quality chip - show only when quality is checked */}
              {account.quality && (
                <Chip
                  label={qualityStyles.label}
                  size="small"
                  variant="outlined"
                  sx={{
                    fontWeight: 600,
                    height: 22,
                    fontSize: '0.7rem',
                    color: qualityStyles.color,
                    borderColor: qualityStyles.borderColor,
                    borderWidth: 1,
                  }}
                />
              )}
            </Box>
          </Stack>

          {/* Right side: Status and Details icon */}
          <Box display="flex" alignItems="center" gap={1}>
            <Chip
              label={getStatusLabel()}
              color={getStatusColor(account.account_status)}
              size="small"
              icon={getStatusIcon(account.account_status)}
              sx={{
                fontWeight: 600,
                fontFamily: account.account_status === 'pending' ? 'monospace' : 'inherit',
              }}
            />
            {/* Only show details icon for non-pending accounts */}
            {onDetailsClick && account.account_status !== 'pending' && (
              <IconButton 
                size="small" 
                onClick={() => onDetailsClick(account)}
                sx={{ color: 'primary.main' }}
              >
                <InfoIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};
