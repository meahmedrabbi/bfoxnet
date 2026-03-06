/**
 * Support page - users can create and view support tickets.
 */
'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  AlertTitle,
  Button,
  TextField,
  Card,
  CardContent,
  Chip,
  Stack,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Fab,
  Paper,
  alpha,
  useTheme,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Send as SendIcon,
  SupportAgent as SupportIcon,
  CheckCircle as ClosedIcon,
  Schedule as OpenIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/Layout/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { triggerHaptic } from '@/lib/telegram';
import { 
  supportApi, 
  SupportTicketResponse,
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
  isFromUser: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isFromUser }) => {
  const theme = useTheme();
  
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isFromUser ? 'flex-end' : 'flex-start',
        mb: 1.5,
      }}
    >
      <Box
        sx={{
          maxWidth: '80%',
          p: 1.5,
          borderRadius: 2,
          bgcolor: isFromUser 
            ? theme.palette.primary.main 
            : theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.08) : alpha(theme.palette.common.black, 0.04),
          color: isFromUser ? 'white' : 'text.primary',
        }}
      >
        {!isFromUser && (
          <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
            Support
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
            textAlign: isFromUser ? 'right' : 'left',
          }}
        >
          {formatDate(message.created_at)}
        </Typography>
      </Box>
    </Box>
  );
};

// Constants
const TICKETS_PER_PAGE = 50;

export default function SupportPage() {
  const router = useRouter();
  const theme = useTheme();
  const { isAuthenticated, isLoading: authLoading, error: authError } = useAuth();
  
  const [tickets, setTickets] = useState<SupportTicketResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicketDetailResponse | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  
  // New ticket dialog
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newInitialMessage, setNewInitialMessage] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initialFetchDone = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchTickets = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await supportApi.list(undefined, 1, TICKETS_PER_PAGE);
      setTickets(response.data.tickets);
    } catch {
      toast.error('Failed to fetch support tickets');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchTicketDetail = useCallback(async (ticketId: number) => {
    try {
      const response = await supportApi.get(ticketId);
      setSelectedTicket(response.data);
      setTimeout(scrollToBottom, 100);
    } catch {
      toast.error('Failed to fetch ticket details');
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    if (isAuthenticated && !initialFetchDone.current) {
      initialFetchDone.current = true;
      fetchTickets();
    }
  }, [isAuthenticated, fetchTickets]);

  const handleBack = () => {
    if (selectedTicket) {
      setSelectedTicket(null);
      fetchTickets();
    } else {
      router.push('/');
    }
    triggerHaptic('selection');
  };

  const handleRetry = () => {
    window.location.reload();
  };

  const handleSelectTicket = (ticket: SupportTicketResponse) => {
    triggerHaptic('impact', 'light');
    fetchTicketDetail(ticket.id);
  };

  const handleCreateTicket = async () => {
    if (!newSubject.trim() || !newInitialMessage.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    
    setIsCreating(true);
    triggerHaptic('impact', 'medium');
    
    try {
      const response = await supportApi.create({
        subject: newSubject.trim(),
        message: newInitialMessage.trim(),
      });
      toast.success('Ticket created successfully');
      setCreateDialogOpen(false);
      setNewSubject('');
      setNewInitialMessage('');
      setSelectedTicket(response.data);
    } catch {
      toast.error('Failed to create ticket');
    } finally {
      setIsCreating(false);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedTicket || !newMessage.trim()) return;
    
    if (selectedTicket.status === 'closed') {
      toast.error('Cannot send message to closed ticket');
      return;
    }
    
    setIsSending(true);
    triggerHaptic('impact', 'light');
    
    try {
      await supportApi.addMessage(selectedTicket.id, { message: newMessage.trim() });
      setNewMessage('');
      await fetchTicketDetail(selectedTicket.id);
    } catch {
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

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
              <Chip 
                size="small"
                label={selectedTicket.status === 'open' ? 'Open' : 'Closed'}
                color={selectedTicket.status === 'open' ? 'success' : 'default'}
                icon={selectedTicket.status === 'open' ? <OpenIcon /> : <ClosedIcon />}
              />
            </Box>
          </Box>

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
                isFromUser={!message.is_from_admin}
              />
            ))}
            <div ref={messagesEndRef} />
          </Box>

          {/* Message input */}
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
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                multiline
                maxRows={3}
                disabled={isSending}
              />
              <IconButton 
                color="primary" 
                onClick={handleSendMessage}
                disabled={isSending || !newMessage.trim()}
              >
                {isSending ? <CircularProgress size={20} /> : <SendIcon />}
              </IconButton>
            </Paper>
          )}
          
          {selectedTicket.status === 'closed' && (
            <Alert severity="info" sx={{ mx: 1, mb: 1 }}>
              This ticket has been closed. Create a new ticket if you need further assistance.
            </Alert>
          )}
        </Box>
      </AppLayout>
    );
  }

  // Tickets list view
  return (
    <AppLayout>
      <Box>
        {/* Header */}
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <IconButton onClick={handleBack} edge="start" aria-label="back">
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" component="h1" fontWeight={600} flex={1}>
            Support
          </Typography>
          <IconButton onClick={fetchTickets} disabled={isLoading}>
            <RefreshIcon />
          </IconButton>
        </Box>

        {/* Content */}
        {isLoading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress size={24} />
          </Box>
        ) : tickets.length === 0 ? (
          <Card sx={{ textAlign: 'center', py: 6 }}>
            <SupportIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No support tickets
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Need help? Create a new ticket to get in touch with our support team.
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateDialogOpen(true)}
            >
              Create Ticket
            </Button>
          </Card>
        ) : (
          <Stack spacing={1.5}>
            {tickets.map((ticket) => (
              <Card 
                key={ticket.id}
                sx={{ cursor: 'pointer' }}
                onClick={() => handleSelectTicket(ticket)}
              >
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                    <Typography variant="subtitle1" fontWeight={600} noWrap sx={{ flex: 1, mr: 1 }}>
                      {ticket.subject}
                    </Typography>
                    <Chip 
                      size="small"
                      label={ticket.status === 'open' ? 'Open' : 'Closed'}
                      color={ticket.status === 'open' ? 'success' : 'default'}
                    />
                  </Box>
                  {ticket.last_message && (
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      noWrap
                      sx={{ mb: 1 }}
                    >
                      {ticket.last_message.is_from_admin ? 'Support: ' : 'You: '}
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
        )}

        {/* FAB for creating new ticket */}
        {tickets.length > 0 && (
          <Fab
            color="primary"
            aria-label="create ticket"
            onClick={() => setCreateDialogOpen(true)}
            sx={{
              position: 'fixed',
              bottom: 16,
              right: 16,
            }}
          >
            <AddIcon />
          </Fab>
        )}

        {/* Create Ticket Dialog */}
        <Dialog 
          open={createDialogOpen} 
          onClose={() => setCreateDialogOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: { borderRadius: 3, m: 2 },
          }}
        >
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SupportIcon color="primary" />
            Create Support Ticket
            <Box flex={1} />
            <IconButton onClick={() => setCreateDialogOpen(false)} size="small">
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <Divider />
          <DialogContent sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Subject"
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              placeholder="Brief description of your issue"
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Message"
              value={newInitialMessage}
              onChange={(e) => setNewInitialMessage(e.target.value)}
              placeholder="Describe your issue in detail..."
              multiline
              rows={4}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setCreateDialogOpen(false)} disabled={isCreating}>
              Cancel
            </Button>
            <Button 
              variant="contained" 
              onClick={handleCreateTicket}
              disabled={isCreating || !newSubject.trim() || !newInitialMessage.trim()}
              startIcon={isCreating ? <CircularProgress size={16} /> : <SendIcon />}
            >
              Create Ticket
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </AppLayout>
  );
}
