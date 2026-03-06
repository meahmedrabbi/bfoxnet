/**
 * Broadcast Management Page - Mobile-first admin design with rich text editor.
 * 
 * Features:
 * - Rich text editor supporting all Telegram HTML formatting
 * - Photo/image attachment support via URL
 * - File/document attachment support via URL
 * - Preview functionality with rendered HTML
 * - Broadcast history with status tracking and rendered messages
 * - Queue-based sending with progress updates
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
  Card,
  CardContent,
  IconButton,
  useTheme,
  useMediaQuery,
  alpha,
  Skeleton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tooltip,
  LinearProgress,
  Divider,
  List,
  CardMedia,
} from '@mui/material';
import {
  Send as SendIcon,
  Refresh as RefreshIcon,
  Campaign as CampaignIcon,
  FormatBold as BoldIcon,
  FormatItalic as ItalicIcon,
  FormatUnderlined as UnderlineIcon,
  StrikethroughS as StrikethroughIcon,
  Code as CodeIcon,
  Link as LinkIcon,
  Preview as PreviewIcon,
  Cancel as CancelIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  HourglassEmpty as PendingIcon,
  PlayArrow as InProgressIcon,
  Image as ImageIcon,
  FormatQuote as QuoteIcon,
  VisibilityOff as SpoilerIcon,
  DataObject as PreCodeIcon,
  AttachFile as FileIcon,
  InsertDriveFile as DocumentIcon,
} from '@mui/icons-material';
import { AdminLayout } from '@/components/Admin/AdminLayout';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import { 
  broadcastApi, 
  BroadcastResponse, 
  BroadcastStatusType,
  BroadcastPreviewResponse 
} from '@/lib/api';
import toast from 'react-hot-toast';
import { triggerHaptic } from '@/lib/telegram';

// Helper to get status color and icon
const getStatusInfo = (status: BroadcastStatusType) => {
  switch (status) {
    case 'pending':
      return { color: 'warning', icon: <PendingIcon fontSize="small" />, label: 'Pending' };
    case 'in_progress':
      return { color: 'info', icon: <InProgressIcon fontSize="small" />, label: 'Sending' };
    case 'completed':
      return { color: 'success', icon: <CheckCircleIcon fontSize="small" />, label: 'Completed' };
    case 'failed':
      return { color: 'error', icon: <ErrorIcon fontSize="small" />, label: 'Failed' };
    case 'cancelled':
      return { color: 'default', icon: <CancelIcon fontSize="small" />, label: 'Cancelled' };
    default:
      return { color: 'default', icon: <PendingIcon fontSize="small" />, label: status };
  }
};

// Spoiler style constant
const SPOILER_STYLE = 'background-color: currentColor; color: transparent; border-radius: 2px;';

// Escape HTML entities to prevent XSS
const escapeHtml = (text: string): string => {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
};

// Convert Telegram HTML to safe displayable HTML
// This function first escapes all HTML, then selectively converts safe Telegram tags
const renderTelegramHtml = (html: string): string => {
  if (!html) return '';
  
  // First escape all HTML to prevent XSS
  let rendered = escapeHtml(html);
  
  // Now selectively convert escaped Telegram tags back to HTML
  // Bold
  rendered = rendered.replace(/&lt;b&gt;/gi, '<strong>');
  rendered = rendered.replace(/&lt;\/b&gt;/gi, '</strong>');
  rendered = rendered.replace(/&lt;strong&gt;/gi, '<strong>');
  rendered = rendered.replace(/&lt;\/strong&gt;/gi, '</strong>');
  
  // Italic
  rendered = rendered.replace(/&lt;i&gt;/gi, '<em>');
  rendered = rendered.replace(/&lt;\/i&gt;/gi, '</em>');
  rendered = rendered.replace(/&lt;em&gt;/gi, '<em>');
  rendered = rendered.replace(/&lt;\/em&gt;/gi, '</em>');
  
  // Underline
  rendered = rendered.replace(/&lt;u&gt;/gi, '<u>');
  rendered = rendered.replace(/&lt;\/u&gt;/gi, '</u>');
  rendered = rendered.replace(/&lt;ins&gt;/gi, '<u>');
  rendered = rendered.replace(/&lt;\/ins&gt;/gi, '</u>');
  
  // Strikethrough
  rendered = rendered.replace(/&lt;s&gt;/gi, '<del>');
  rendered = rendered.replace(/&lt;\/s&gt;/gi, '</del>');
  rendered = rendered.replace(/&lt;strike&gt;/gi, '<del>');
  rendered = rendered.replace(/&lt;\/strike&gt;/gi, '</del>');
  rendered = rendered.replace(/&lt;del&gt;/gi, '<del>');
  rendered = rendered.replace(/&lt;\/del&gt;/gi, '</del>');
  
  // Spoiler
  rendered = rendered.replace(/&lt;tg-spoiler&gt;/gi, `<span style="${SPOILER_STYLE}">`);
  rendered = rendered.replace(/&lt;\/tg-spoiler&gt;/gi, '</span>');
  rendered = rendered.replace(/&lt;span class=&quot;tg-spoiler&quot;&gt;/gi, `<span style="${SPOILER_STYLE}">`);
  
  // Code
  rendered = rendered.replace(/&lt;code&gt;/gi, '<code style="background: #f4f4f4; padding: 2px 4px; border-radius: 2px; font-family: monospace;">');
  rendered = rendered.replace(/&lt;\/code&gt;/gi, '</code>');
  
  // Pre blocks
  rendered = rendered.replace(/&lt;pre&gt;/gi, '<pre style="background: #f4f4f4; padding: 8px; border-radius: 4px; overflow-x: auto;">');
  rendered = rendered.replace(/&lt;\/pre&gt;/gi, '</pre>');
  
  // Blockquote
  rendered = rendered.replace(/&lt;blockquote&gt;/gi, '<blockquote style="border-left: 3px solid #ccc; margin: 0.5em 0; padding-left: 1em; color: #666;">');
  rendered = rendered.replace(/&lt;blockquote expandable&gt;/gi, '<blockquote style="border-left: 3px solid #ccc; margin: 0.5em 0; padding-left: 1em; color: #666;">');
  rendered = rendered.replace(/&lt;\/blockquote&gt;/gi, '</blockquote>');
  
  // Links - only allow http/https URLs
  rendered = rendered.replace(
    /&lt;a href=&quot;(https?:\/\/[^&]+)&quot;&gt;([^&]+)&lt;\/a&gt;/gi,
    '<a href="$1" target="_blank" rel="noopener noreferrer" style="color: inherit;">$2</a>'
  );
  
  // Remove tg-emoji (show content only)
  rendered = rendered.replace(/&lt;tg-emoji[^&]*&gt;([^&]*)&lt;\/tg-emoji&gt;/gi, '$1');
  
  // Preserve newlines
  rendered = rendered.replace(/\n/g, '<br>');
  
  return rendered;
};

// Telegram HTML formatting toolbar button
interface FormatButtonProps {
  icon: React.ReactNode;
  tooltip: string;
  onClick: () => void;
  active?: boolean;
}

const FormatButton: React.FC<FormatButtonProps> = ({ icon, tooltip, onClick }) => {
  const theme = useTheme();
  
  return (
    <Tooltip title={tooltip} arrow>
      <IconButton
        size="small"
        onClick={onClick}
        sx={{
          color: theme.palette.text.secondary,
          '&:hover': {
            bgcolor: alpha(theme.palette.primary.main, 0.1),
          },
        }}
      >
        {icon}
      </IconButton>
    </Tooltip>
  );
};

export default function BroadcastPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { isAdmin, checkAdminStatus } = useAdmin();

  const [loading, setLoading] = useState(false);
  const [broadcasts, setBroadcasts] = useState<BroadcastResponse[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Editor state
  const [message, setMessage] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [documentUrl, setDocumentUrl] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<BroadcastPreviewResponse | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [sending, setSending] = useState(false);
  
  // Link dialog state
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  
  // Image dialog state
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  
  // File dialog state
  const [fileDialogOpen, setFileDialogOpen] = useState(false);
  
  // Text area reference for cursor position
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // Check admin status
  useEffect(() => {
    if (isAuthenticated) {
      checkAdminStatus();
    }
  }, [isAuthenticated, checkAdminStatus]);

  // Fetch broadcasts
  const fetchBroadcasts = useCallback(async (page: number = 1) => {
    if (!isAdmin) return;

    setLoading(true);
    try {
      const response = await broadcastApi.list(page, 10);
      setBroadcasts(response.data.broadcasts);
      setCurrentPage(response.data.page);
    } catch {
      toast.error('Failed to fetch broadcasts');
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchBroadcasts();
  }, [fetchBroadcasts]);

  // Auto-refresh for in-progress broadcasts
  useEffect(() => {
    const hasInProgress = broadcasts.some(b => 
      b.status === 'pending' || b.status === 'in_progress'
    );
    
    if (hasInProgress) {
      const interval = setInterval(() => {
        fetchBroadcasts(currentPage);
      }, 5000); // Refresh every 5 seconds
      
      return () => clearInterval(interval);
    }
  }, [broadcasts, currentPage, fetchBroadcasts]);

  // Insert formatting at cursor position
  const insertFormat = (openTag: string, closeTag: string) => {
    const textarea = textAreaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = message.substring(start, end);
    
    const newText = message.substring(0, start) + 
                    openTag + selectedText + closeTag + 
                    message.substring(end);
    
    setMessage(newText);
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + openTag.length + selectedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
    
    triggerHaptic('impact', 'light');
  };

  // Format handlers for all Telegram-supported tags
  const handleBold = () => insertFormat('<b>', '</b>');
  const handleItalic = () => insertFormat('<i>', '</i>');
  const handleUnderline = () => insertFormat('<u>', '</u>');
  const handleStrikethrough = () => insertFormat('<s>', '</s>');
  const handleCode = () => insertFormat('<code>', '</code>');
  const handlePre = () => insertFormat('<pre>', '</pre>');
  const handleSpoiler = () => insertFormat('<tg-spoiler>', '</tg-spoiler>');
  const handleBlockquote = () => insertFormat('<blockquote>', '</blockquote>');
  
  const handleLinkInsert = () => {
    if (!linkUrl.trim()) {
      toast.error('Please enter a URL');
      return;
    }
    
    const displayText = linkText.trim() || linkUrl;
    const linkHtml = `<a href="${linkUrl}">${displayText}</a>`;
    
    const textarea = textAreaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const newText = message.substring(0, start) + linkHtml + message.substring(start);
      setMessage(newText);
    } else {
      setMessage(message + linkHtml);
    }
    
    setLinkDialogOpen(false);
    setLinkUrl('');
    setLinkText('');
    triggerHaptic('impact', 'light');
  };

  const handlePreview = async () => {
    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    setPreviewLoading(true);
    try {
      const response = await broadcastApi.preview({ 
        message,
        photo_url: photoUrl || null,
        document_url: documentUrl || null
      });
      setPreviewData(response.data);
      setPreviewOpen(true);
      triggerHaptic('impact', 'light');
    } catch {
      toast.error('Failed to generate preview');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleSend = async () => {
    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    setSending(true);
    try {
      await broadcastApi.create({ 
        message,
        photo_url: photoUrl || null,
        document_url: documentUrl || null
      });
      toast.success('Broadcast queued successfully');
      triggerHaptic('notification', 'success');
      setMessage('');
      setPhotoUrl('');
      setDocumentUrl('');
      setSendDialogOpen(false);
      fetchBroadcasts();
    } catch {
      toast.error('Failed to send broadcast');
      triggerHaptic('notification', 'error');
    } finally {
      setSending(false);
    }
  };

  const handleCancel = async (broadcastId: number) => {
    try {
      await broadcastApi.cancel(broadcastId);
      toast.success('Broadcast cancelled');
      triggerHaptic('notification', 'success');
      fetchBroadcasts(currentPage);
    } catch {
      toast.error('Failed to cancel broadcast');
    }
  };

  const handleDelete = async (broadcastId: number) => {
    try {
      await broadcastApi.delete(broadcastId);
      toast.success('Broadcast deleted');
      triggerHaptic('impact', 'light');
      fetchBroadcasts(currentPage);
    } catch {
      toast.error('Failed to delete broadcast');
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
    <AdminLayout title="Broadcast">
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CampaignIcon sx={{ color: theme.palette.primary.main }} />
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 600, color: 'text.secondary' }}
            >
              Send Message to All Users
            </Typography>
          </Box>
          <IconButton
            onClick={() => fetchBroadcasts(currentPage)}
            disabled={loading}
            size="small"
            sx={{
              bgcolor: 'background.paper',
              '&:hover': { bgcolor: 'background.paper' },
            }}
          >
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Message Editor */}
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: 2, pb: '16px !important' }}>
            {/* Formatting Toolbar */}
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 0.5,
                p: 1,
                mb: 1,
                bgcolor: alpha(theme.palette.background.default, 0.5),
                borderRadius: 1,
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <FormatButton icon={<BoldIcon />} tooltip="Bold <b>" onClick={handleBold} />
              <FormatButton icon={<ItalicIcon />} tooltip="Italic <i>" onClick={handleItalic} />
              <FormatButton icon={<UnderlineIcon />} tooltip="Underline <u>" onClick={handleUnderline} />
              <FormatButton icon={<StrikethroughIcon />} tooltip="Strikethrough <s>" onClick={handleStrikethrough} />
              <FormatButton icon={<CodeIcon />} tooltip="Inline Code <code>" onClick={handleCode} />
              <FormatButton icon={<PreCodeIcon />} tooltip="Code Block <pre>" onClick={handlePre} />
              <FormatButton icon={<SpoilerIcon />} tooltip="Spoiler <tg-spoiler>" onClick={handleSpoiler} />
              <FormatButton icon={<QuoteIcon />} tooltip="Quote <blockquote>" onClick={handleBlockquote} />
              <FormatButton icon={<LinkIcon />} tooltip="Insert Link" onClick={() => setLinkDialogOpen(true)} />
              <FormatButton icon={<ImageIcon />} tooltip="Attach Image (URL)" onClick={() => setImageDialogOpen(true)} />
              <FormatButton icon={<FileIcon />} tooltip="Attach File (URL)" onClick={() => setFileDialogOpen(true)} />
            </Box>

            {/* Photo URL Preview */}
            {photoUrl && (
              <Box sx={{ mb: 2, position: 'relative' }}>
                <CardMedia
                  component="img"
                  image={photoUrl}
                  alt="Attached image"
                  sx={{ 
                    maxHeight: 200, 
                    objectFit: 'contain',
                    borderRadius: 1,
                    border: `1px solid ${theme.palette.divider}`,
                  }}
                  onError={() => {
                    toast.error('Invalid image URL');
                    setPhotoUrl('');
                  }}
                />
                <IconButton
                  size="small"
                  onClick={() => setPhotoUrl('')}
                  sx={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    bgcolor: 'rgba(0,0,0,0.5)',
                    color: 'white',
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            )}

            {/* Document URL Preview */}
            {documentUrl && (
              <Box sx={{ 
                mb: 2, 
                p: 1.5,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                bgcolor: alpha(theme.palette.info.main, 0.1),
                borderRadius: 1,
                border: `1px solid ${theme.palette.divider}`,
              }}>
                <DocumentIcon sx={{ color: theme.palette.info.main }} />
                <Typography 
                  variant="body2" 
                  sx={{ 
                    flex: 1, 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap' 
                  }}
                >
                  {documentUrl.split('/').pop() || 'Attached file'}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => setDocumentUrl('')}
                  sx={{ color: theme.palette.error.main }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            )}

            {/* Message Input */}
            <TextField
              inputRef={textAreaRef}
              multiline
              rows={6}
              fullWidth
              placeholder={'Enter your broadcast message here...\n\nSupported Telegram formatting:\n• <b>Bold</b>\n• <i>Italic</i>\n• <u>Underline</u>\n• <s>Strikethrough</s>\n• <code>Inline code</code>\n• <pre>Code block</pre>\n• <tg-spoiler>Spoiler</tg-spoiler>\n• <blockquote>Quote</blockquote>\n• <a href="url">Link</a>'}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                },
              }}
            />

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 1, mt: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                startIcon={<PreviewIcon />}
                onClick={handlePreview}
                disabled={previewLoading || !message.trim()}
                size={isMobile ? 'small' : 'medium'}
              >
                Preview
              </Button>
              <Button
                variant="contained"
                startIcon={<SendIcon />}
                onClick={() => setSendDialogOpen(true)}
                disabled={!message.trim()}
                size={isMobile ? 'small' : 'medium'}
              >
                Send
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Broadcast History */}
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 600, mb: 2, color: 'text.secondary' }}
        >
          Broadcast History
        </Typography>

        {loading && broadcasts.length === 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent>
                  <Skeleton width="60%" height={20} />
                  <Skeleton width="40%" height={16} sx={{ mt: 1 }} />
                  <Skeleton width="80%" height={40} sx={{ mt: 2 }} />
                </CardContent>
              </Card>
            ))}
          </Box>
        ) : broadcasts.length === 0 ? (
          <Alert severity="info">
            No broadcasts yet. Send your first message to all users!
          </Alert>
        ) : (
          <List sx={{ p: 0 }}>
            {broadcasts.map((broadcast) => {
              const statusInfo = getStatusInfo(broadcast.status);
              const progress = broadcast.total_users > 0 
                ? ((broadcast.sent_count + broadcast.failed_count) / broadcast.total_users) * 100 
                : 0;
              
              return (
                <Card key={broadcast.id} sx={{ mb: 1.5 }}>
                  <CardContent sx={{ p: 2, pb: '12px !important' }}>
                    {/* Status and Date */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Chip
                        size="small"
                        icon={statusInfo.icon}
                        label={statusInfo.label}
                        color={statusInfo.color as 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'}
                        variant="outlined"
                      />
                      <Typography variant="caption" color="text.secondary">
                        {new Date(broadcast.created_at).toLocaleString()}
                      </Typography>
                    </Box>
                    
                    {/* Photo Preview */}
                    {broadcast.photo_url && (
                      <Box sx={{ mb: 1.5 }}>
                        <CardMedia
                          component="img"
                          image={broadcast.photo_url}
                          alt="Broadcast image"
                          sx={{ 
                            maxHeight: 120, 
                            objectFit: 'contain',
                            borderRadius: 1,
                            border: `1px solid ${theme.palette.divider}`,
                          }}
                        />
                      </Box>
                    )}
                    
                    {/* Document Preview */}
                    {broadcast.document_url && (
                      <Box sx={{ 
                        mb: 1.5, 
                        p: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        bgcolor: alpha(theme.palette.info.main, 0.1),
                        borderRadius: 1,
                        border: `1px solid ${theme.palette.divider}`,
                      }}>
                        <DocumentIcon sx={{ color: theme.palette.info.main, fontSize: 18 }} />
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            flex: 1, 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap' 
                          }}
                        >
                          {broadcast.document_url.split('/').pop() || 'Attached file'}
                        </Typography>
                      </Box>
                    )}
                    
                    {/* Message Preview - Rendered HTML */}
                    <Box
                      sx={{
                        mb: 1.5,
                        overflow: 'hidden',
                        maxHeight: 80,
                        color: 'text.secondary',
                        fontSize: '0.8rem',
                        bgcolor: alpha(theme.palette.background.default, 0.5),
                        p: 1,
                        borderRadius: 1,
                        '& a': {
                          color: theme.palette.primary.main,
                          textDecoration: 'none',
                        },
                        '& pre': {
                          margin: 0,
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                        },
                        '& code': {
                          fontSize: '0.75rem',
                        },
                      }}
                      dangerouslySetInnerHTML={{ __html: renderTelegramHtml(broadcast.message) }}
                    />
                    
                    {/* Progress (for in-progress broadcasts) */}
                    {(broadcast.status === 'in_progress' || broadcast.status === 'pending') && (
                      <Box sx={{ mb: 1.5 }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={progress} 
                          sx={{ height: 6, borderRadius: 3 }}
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                          {broadcast.sent_count} / {broadcast.total_users} sent
                          {broadcast.failed_count > 0 && ` (${broadcast.failed_count} failed)`}
                        </Typography>
                      </Box>
                    )}
                    
                    {/* Stats for completed broadcasts */}
                    {broadcast.status === 'completed' && (
                      <Typography variant="caption" color="text.secondary">
                        Sent: {broadcast.sent_count} | Failed: {broadcast.failed_count} | Total: {broadcast.total_users}
                      </Typography>
                    )}
                    
                    {/* Error message */}
                    {broadcast.status === 'failed' && broadcast.error_message && (
                      <Alert severity="error" sx={{ mt: 1, py: 0 }}>
                        <Typography variant="caption">{broadcast.error_message}</Typography>
                      </Alert>
                    )}
                    
                    {/* Actions */}
                    <Box sx={{ display: 'flex', gap: 1, mt: 1.5, justifyContent: 'flex-end' }}>
                      {(broadcast.status === 'pending' || broadcast.status === 'in_progress') && (
                        <Button
                          size="small"
                          variant="outlined"
                          color="warning"
                          startIcon={<CancelIcon />}
                          onClick={() => handleCancel(broadcast.id)}
                        >
                          Cancel
                        </Button>
                      )}
                      {(broadcast.status === 'completed' || broadcast.status === 'failed' || broadcast.status === 'cancelled') && (
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={() => handleDelete(broadcast.id)}
                        >
                          Delete
                        </Button>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              );
            })}
          </List>
        )}

        {/* Preview Dialog */}
        <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Message Preview</DialogTitle>
          <DialogContent>
            {previewData && (
              <>
                {/* Photo Preview */}
                {previewData.photo_url && (
                  <Box sx={{ mb: 2 }}>
                    <CardMedia
                      component="img"
                      image={previewData.photo_url}
                      alt="Preview image"
                      sx={{ 
                        maxHeight: 200, 
                        objectFit: 'contain',
                        borderRadius: 1,
                        border: `1px solid ${theme.palette.divider}`,
                      }}
                    />
                  </Box>
                )}
                {/* Document Preview */}
                {previewData.document_url && (
                  <Box sx={{ 
                    mb: 2, 
                    p: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    bgcolor: alpha(theme.palette.info.main, 0.1),
                    borderRadius: 1,
                    border: `1px solid ${theme.palette.divider}`,
                  }}>
                    <DocumentIcon sx={{ color: theme.palette.info.main }} />
                    <Typography variant="body2">
                      {previewData.document_url.split('/').pop() || 'Attached file'}
                    </Typography>
                  </Box>
                )}
                <Box
                  sx={{
                    p: 2,
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                    borderRadius: 2,
                    border: `1px solid ${theme.palette.divider}`,
                    mb: 2,
                    '& a': {
                      color: theme.palette.primary.main,
                    },
                    '& pre': {
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    },
                  }}
                  dangerouslySetInnerHTML={{ __html: renderTelegramHtml(previewData.preview_html) }}
                />
                <Divider sx={{ my: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  <strong>Recipients:</strong> {previewData.total_users} users
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Estimated time:</strong> ~{previewData.estimated_time_minutes} minutes
                </Typography>
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPreviewOpen(false)}>Close</Button>
            <Button 
              variant="contained" 
              onClick={() => {
                setPreviewOpen(false);
                setSendDialogOpen(true);
              }}
            >
              Send Now
            </Button>
          </DialogActions>
        </Dialog>

        {/* Send Confirmation Dialog */}
        <Dialog open={sendDialogOpen} onClose={() => !sending && setSendDialogOpen(false)}>
          <DialogTitle>Confirm Broadcast</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to send this message to all users? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSendDialogOpen(false)} disabled={sending}>
              Cancel
            </Button>
            <Button 
              variant="contained" 
              onClick={handleSend} 
              disabled={sending}
              startIcon={sending ? <CircularProgress size={16} /> : <SendIcon />}
            >
              {sending ? 'Sending...' : 'Confirm Send'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Link Insert Dialog */}
        <Dialog open={linkDialogOpen} onClose={() => setLinkDialogOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle>Insert Link</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="URL"
              type="url"
              fullWidth
              variant="outlined"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com"
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="Display Text (optional)"
              fullWidth
              variant="outlined"
              value={linkText}
              onChange={(e) => setLinkText(e.target.value)}
              placeholder="Click here"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setLinkDialogOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleLinkInsert}>
              Insert
            </Button>
          </DialogActions>
        </Dialog>

        {/* Image URL Dialog */}
        <Dialog open={imageDialogOpen} onClose={() => setImageDialogOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle>Attach Image</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, mt: 1 }}>
              Enter a direct URL to an image:
            </Typography>
            <TextField
              autoFocus
              margin="dense"
              label="Image URL"
              type="url"
              fullWidth
              variant="outlined"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
              Supports: JPEG, PNG, GIF, WebP images
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setImageDialogOpen(false)}>Cancel</Button>
            <Button 
              variant="contained" 
              onClick={() => setImageDialogOpen(false)}
              disabled={!photoUrl.trim()}
            >
              Attach
            </Button>
          </DialogActions>
        </Dialog>

        {/* File URL Dialog */}
        <Dialog open={fileDialogOpen} onClose={() => setFileDialogOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle>Attach File</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, mt: 1 }}>
              Enter a direct URL to a file:
            </Typography>
            <TextField
              autoFocus
              margin="dense"
              label="File URL"
              type="url"
              fullWidth
              variant="outlined"
              value={documentUrl}
              onChange={(e) => setDocumentUrl(e.target.value)}
              placeholder="https://example.com/document.pdf"
            />
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
              Supports: Any file accessible via URL
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setFileDialogOpen(false)}>Cancel</Button>
            <Button 
              variant="contained" 
              onClick={() => setFileDialogOpen(false)}
              disabled={!documentUrl.trim()}
            >
              Attach
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </AdminLayout>
  );
}
