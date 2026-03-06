/**
 * Admin Support page - manage support tickets.
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
  Tabs,
  Tab,
  Card,
  CardContent,
  Chip,
  Stack,
  Pagination,
  Divider,
  TextField,
  Paper,
  alpha,
  useTheme,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Refresh as RefreshIcon,
  CheckCircle as ClosedIcon,
  Schedule as OpenIcon,
  Send as SendIcon,
  Close as CloseIcon,
  LockOpen as ReopenIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/Layout/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import { triggerHaptic } from '@/lib/telegram';
import { 
  adminSupportApi, 
  SupportTicketDetailResponse,
  SupportMessageResponse,
  TicketStatusType,
} from '@/lib/api';
import toast from 'react-hot-toast';

// Helper function to format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Message bubble component
interface MessageBubbleProps {
  message: SupportMessageResponse;
  isFromAdmin: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isFromAdmin }) => {
  const theme = useTheme();
  
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isFromAdmin ? 'flex-end' : 'flex-start',
        mb: 1.5,
      }}
    >
      <Box
        sx={{
          maxWidth: '80%',
          p: 1.5,
          borderRadius: 2,
          bgcolor: isFromAdmin 
            ? theme.palette.primary.main 
            : theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.08) : alpha(theme.palette.common.black, 0.04),
          color: isFromAdmin ? 'white' : 'text.primary',
        }}
      >
        {isFromAdmin && message.admin_username && (
          <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
            {message.admin_username} (Admin)
          </Typography>
        )}
        {!isFromAdmin && (
          <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.5, color: 'text.secondary' }}>
            User
          </Typography>
        )}
        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
          {message.message}
        </Typography>
        <Typography 
          variant="caption" 
          sx={{ 
            display: 'block', 
            mt: 0.5, 
            opacity: 0.7,
            textAlign: isFromAdmin ? 'right' : 'left',
          }}
        >
          {formatDate(message.created_at)}
        </Typography>
      </Box>
    </Box>
  );
};

export default function AdminSupportPage() {
  const router = useRouter();
  const theme = useTheme();
  const { isAuthenticated, isLoading: authLoading, error: authError } = useAuth();
  const { isAdmin, isLoading: adminLoading, checkAdminStatus } = useAdmin();
  
  const [tickets, setTickets] = useState<SupportTicketDetailResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [openCount, setOpenCount] = useState(0);
  const perPage = 20;
  
  // Selected ticket state
  const [selectedTicket, setSelectedTicket] = useState<SupportTicketDetailResponse | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initialFetchDone = useRef(false);

  // Map tab index to status
  const tabToStatus: (TicketStatusType | undefined)[] = [undefined, 'open', 'closed'];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchTickets = useCallback(async (status?: TicketStatusType, pageNum: number = 1) => {
    setIsLoading(true);
    try {
      const [ticketsRes, openCountRes] = await Promise.all([
        adminSupportApi.list(status, undefined, pageNum, perPage),
        adminSupportApi.getOpenCount(),
      ]);
      setTickets(ticketsRes.data.tickets);
      setTotalPages(Math.ceil(ticketsRes.data.total / perPage) || 1);
      setOpenCount(openCountRes.data.open_count);
    } catch {
      toast.error('Failed to fetch support tickets');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchTicketDetail = useCallback(async (ticketId: number) => {
    try {
      const response = await adminSupportApi.get(ticketId);
      setSelectedTicket(response.data);
      setTimeout(scrollToBottom, 100);
    } catch {
      toast.error('Failed to fetch ticket details');
    }
  }, []);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    triggerHaptic('selection');
    setTabValue(newValue);
    setPage(1);
    fetchTickets(tabToStatus[newValue], 1);
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage);
    fetchTickets(tabToStatus[tabValue], newPage);
  };

  const handleBack = () => {
    if (selectedTicket) {
      setSelectedTicket(null);
      setReplyMessage('');
      fetchTickets(tabToStatus[tabValue], page);
    } else {
      router.push('/admin');
    }
    triggerHaptic('selection');
  };

  const handleRetry = () => {
    window.location.reload();
  };

  const handleSelectTicket = (ticket: SupportTicketDetailResponse) => {
    triggerHaptic('impact', 'light');
    fetchTicketDetail(ticket.id);
  };

  const handleSendReply = async () => {
    if (!selectedTicket || !replyMessage.trim()) return;
    
    setIsSending(true);
    triggerHaptic('impact', 'medium');
    
    try {
      await adminSupportApi.reply(selectedTicket.id, { message: replyMessage.trim() });
      setReplyMessage('');
      await fetchTicketDetail(selectedTicket.id);
      toast.success('Reply sent');
    } catch {
      toast.error('Failed to send reply');
    } finally {
      setIsSending(false);
    }
  };

  const handleCloseTicket = async () => {
    if (!selectedTicket) return;
    
    setIsClosing(true);
    triggerHaptic('impact', 'medium');
    
    try {
      const response = await adminSupportApi.close(selectedTicket.id);
      setSelectedTicket(response.data);
      toast.success('Ticket closed');
    } catch {
      toast.error('Failed to close ticket');
    } finally {
      setIsClosing(false);
    }
  };

  const handleReopenTicket = async () => {
    if (!selectedTicket) return;
    
    setIsClosing(true);
    triggerHaptic('impact', 'medium');
    
    try {
      const response = await adminSupportApi.reopen(selectedTicket.id);
      setSelectedTicket(response.data);
      toast.success('Ticket reopened');
    } catch {
      toast.error('Failed to reopen ticket');
    } finally {
      setIsClosing(false);
    }
  };

  // Check admin status when authenticated
  useEffect(() => {
    if (isAuthenticated && isAdmin === null) {
      checkAdminStatus();
    }
  }, [isAuthenticated, isAdmin, checkAdminStatus]);

  // Initial fetch
  useEffect(() => {
    if (isAuthenticated && isAdmin && !initialFetchDone.current) {
      initialFetchDone.current = true;
      fetchTickets(undefined, 1);
    }
  }, [isAuthenticated, isAdmin, fetchTickets]);

  if (authLoading || adminLoading || isAdmin === null) {
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

  if (!isAuthenticated || !isAdmin) {
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
          <AlertTitle>Access Denied</AlertTitle>
          You do not have permission to access this page.
        </Alert>
      </Box>
    );
  }

  // Ticket detail view
  if (selectedTicket) {
    return (
      <AppLayout>
        <Box sx={{ height: 'calc(100vh - 48px)', display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <IconButton onClick={handleBack} edge="start" aria-label="back">
              <ArrowBackIcon />
            </IconButton>
            <Box flex={1}>
              <Typography variant="h6" component="h1" fontWeight={600} noWrap>
                {selectedTicket.subject}
              </Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <Chip 
                  size="small"
                  label={selectedTicket.status === 'open' ? 'Open' : 'Closed'}
                  color={selectedTicket.status === 'open' ? 'success' : 'default'}
                  icon={selectedTicket.status === 'open' ? <OpenIcon /> : <ClosedIcon />}
                />
                <Typography variant="caption" color="text.secondary">
                  {selectedTicket.user_username ? `@${selectedTicket.user_username}` : `ID: ${selectedTicket.user_telegram_id}`}
                </Typography>
              </Box>
            </Box>
            {selectedTicket.status === 'open' ? (
              <Button
                size="small"
                variant="outlined"
                color="error"
                startIcon={<CloseIcon />}
                onClick={handleCloseTicket}
                disabled={isClosing}
              >
                Close
              </Button>
            ) : (
              <Button
                size="small"
                variant="outlined"
                color="success"
                startIcon={<ReopenIcon />}
                onClick={handleReopenTicket}
                disabled={isClosing}
              >
                Reopen
              </Button>
            )}
          </Box>

          {/* User Info */}
          <Card sx={{ mb: 2 }}>
            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Typography variant="body2">
                <strong>User:</strong> {selectedTicket.user_first_name || 'N/A'} 
                {selectedTicket.user_username && ` (@${selectedTicket.user_username})`}
              </Typography>
              <Typography variant="body2">
                <strong>Telegram ID:</strong> {selectedTicket.user_telegram_id}
              </Typography>
            </CardContent>
          </Card>

          {/* Messages */}
          <Box 
            sx={{ 
              flex: 1, 
              overflowY: 'auto',
              pb: 2,
              px: 1,
            }}
          >
            {selectedTicket.messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isFromAdmin={message.is_from_admin}
              />
            ))}
            <div ref={messagesEndRef} />
          </Box>

          {/* Reply input */}
          {selectedTicket.status === 'open' && (
            <Paper 
              elevation={0}
              sx={{ 
                p: 1.5, 
                display: 'flex', 
                gap: 1,
                borderTop: `1px solid ${theme.palette.divider}`,
              }}
            >
              <TextField
                fullWidth
                size="small"
                placeholder="Type your reply..."
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendReply()}
                multiline
                maxRows={3}
                disabled={isSending}
              />
              <IconButton 
                color="primary" 
                onClick={handleSendReply}
                disabled={isSending || !replyMessage.trim()}
              >
                {isSending ? <CircularProgress size={20} /> : <SendIcon />}
              </IconButton>
            </Paper>
          )}
          
          {selectedTicket.status === 'closed' && (
            <Alert severity="info" sx={{ mx: 1, mb: 1 }}>
              This ticket is closed. Reopen it to send a reply.
            </Alert>
          )}
        </Box>
      </AppLayout>
    );
  }

  // Render empty state based on current tab
  const renderEmptyState = () => {
    const messages: Record<number, { title: string; description: string }> = {
      0: {
        title: 'No support tickets',
        description: 'No support tickets have been created yet',
      },
      1: {
        title: 'No open tickets',
        description: 'All tickets have been resolved',
      },
      2: {
        title: 'No closed tickets',
        description: 'No tickets have been closed yet',
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
    <AppLayout>
      <Box>
        {/* Header */}
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <IconButton onClick={handleBack} edge="start" aria-label="back">
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" component="h1" fontWeight={600}>
            Support Tickets
          </Typography>
          {openCount > 0 && (
            <Chip 
              label={`${openCount} open`} 
              color="success" 
              size="small" 
            />
          )}
        </Box>

        {/* Status Tabs */}
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="support ticket status tabs"
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
            icon={<RefreshIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
            label="All"
          />
          <Tab 
            icon={<OpenIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
            label={`Open${openCount > 0 ? ` (${openCount})` : ''}`}
          />
          <Tab 
            icon={<ClosedIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
            label="Closed"
          />
        </Tabs>

        {/* Content */}
        {isLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" py={4}>
            <CircularProgress size={24} />
          </Box>
        ) : tickets.length === 0 ? (
          renderEmptyState()
        ) : (
          <>
            {/* Ticket Cards */}
            <Stack spacing={1.5}>
              {tickets.map((ticket) => (
                <Card 
                  key={ticket.id}
                  sx={{ cursor: 'pointer' }}
                  onClick={() => handleSelectTicket(ticket)}
                >
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                      <Box flex={1} mr={1}>
                        <Typography variant="subtitle2" fontWeight={600} noWrap>
                          {ticket.subject}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {ticket.user_first_name || ticket.user_telegram_id}
                          {ticket.user_username && ` (@${ticket.user_username})`}
                        </Typography>
                      </Box>
                      <Chip
                        label={ticket.status === 'open' ? 'Open' : 'Closed'}
                        color={ticket.status === 'open' ? 'success' : 'default'}
                        size="small"
                      />
                    </Box>
                    
                    <Divider sx={{ my: 1 }} />
                    
                    {ticket.last_message && (
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        noWrap
                        sx={{ mb: 1 }}
                      >
                        {ticket.last_message.is_from_admin ? 'Admin: ' : 'User: '}
                        {ticket.last_message.message}
                      </Typography>
                    )}
                    
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(ticket.updated_at)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {ticket.messages_count} message{ticket.messages_count !== 1 ? 's' : ''}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
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
      </Box>
    </AppLayout>
  );
}
