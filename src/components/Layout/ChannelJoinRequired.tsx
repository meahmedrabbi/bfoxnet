/**
 * ChannelJoinRequired component - displays when user needs to join required channels.
 */
'use client';

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  AlertTitle,
  CircularProgress,
  alpha,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Telegram as TelegramIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { ChannelInfo } from '@/lib/api';
import { triggerHaptic } from '@/lib/telegram';

interface ChannelJoinRequiredProps {
  channels: ChannelInfo[];
  onRecheck: () => Promise<void>;
  isRechecking?: boolean;
}

export const ChannelJoinRequired: React.FC<ChannelJoinRequiredProps> = ({
  channels,
  onRecheck,
  isRechecking = false,
}) => {
  const handleJoinChannel = (username: string) => {
    triggerHaptic('impact', 'medium');
    const channelUrl = `https://t.me/${username}`;
    window.open(channelUrl, '_blank');
  };

  const handleRecheck = async () => {
    triggerHaptic('impact', 'light');
    await onRecheck();
  };

  const notJoinedCount = channels.filter(c => !c.is_member).length;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        bgcolor: 'background.default',
      }}
    >
      <Card
        sx={{
          maxWidth: 400,
          width: '100%',
          textAlign: 'center',
        }}
      >
        <CardContent sx={{ p: 3 }}>
          {/* Telegram Icon */}
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
            }}
          >
            <TelegramIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          </Box>

          {/* Title */}
          <Typography variant="h5" fontWeight={600} gutterBottom>
            Join Required Channels
          </Typography>

          {/* Description */}
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            To access this app, you need to join {notJoinedCount > 1 ? 'the following channels' : 'the following channel'}. 
            Please join {notJoinedCount > 1 ? 'them' : 'it'} and click &ldquo;I&apos;ve Joined&rdquo; to continue.
          </Typography>

          {/* Channel List */}
          <List sx={{ mb: 2 }}>
            {channels.map((channel) => (
              <ListItem
                key={channel.username}
                sx={{
                  borderRadius: 1,
                  mb: 1,
                  bgcolor: (theme) =>
                    channel.is_member
                      ? alpha(theme.palette.success.main, 0.1)
                      : alpha(theme.palette.warning.main, 0.1),
                }}
                secondaryAction={
                  !channel.is_member && (
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleJoinChannel(channel.username)}
                      startIcon={<TelegramIcon />}
                    >
                      Join
                    </Button>
                  )
                }
              >
                <ListItemIcon>
                  {channel.is_member ? (
                    <CheckCircleIcon color="success" />
                  ) : (
                    <CancelIcon color="warning" />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={`@${channel.username}`}
                  secondary={
                    channel.type === 'main' ? 'Main Channel' : 'Backup Channel'
                  }
                />
              </ListItem>
            ))}
          </List>

          {/* Info Alert */}
          <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
            <AlertTitle>Why join?</AlertTitle>
            Joining our channels ensures you receive important updates about the platform, 
            promotions, and announcements.
          </Alert>

          {/* Recheck Button */}
          <Button
            variant="contained"
            fullWidth
            size="large"
            onClick={handleRecheck}
            disabled={isRechecking}
            startIcon={
              isRechecking ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <RefreshIcon />
              )
            }
          >
            {isRechecking ? 'Checking...' : "I've Joined"}
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};
