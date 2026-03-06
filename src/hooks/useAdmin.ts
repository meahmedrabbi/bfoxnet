/**
 * Custom hook for admin panel functionality.
 * 
 * Provides admin functions:
 * - Check admin status
 * - View all sessions
 * - View statistics
 * - Delete sessions
 * 
 * All admin operations require JWT authentication with admin privileges.
 */
import { useState, useCallback, useRef, useEffect } from 'react';
import { 
  adminApi, 
  AdminSessionResponse, 
  AdminStatsResponse,
  AdminTelegramSessionResponse 
} from '@/lib/api';
import toast from 'react-hot-toast';

// Maximum number of retries for admin check
const MAX_ADMIN_CHECK_RETRIES = 5;
// Delay between retries (ms) - increases with each retry
const ADMIN_CHECK_RETRY_BASE_DELAY = 300;

export const useAdmin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [stats, setStats] = useState<AdminStatsResponse | null>(null);
  const [sessions, setSessions] = useState<AdminSessionResponse[]>([]);
  const [telegramSessions, setTelegramSessions] = useState<AdminTelegramSessionResponse[]>([]);
  const [totalSessions, setTotalSessions] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Track retry count
  const retryCountRef = useRef(0);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup retry timeout on unmount
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  /**
   * Check if an error indicates the user needs to authenticate (vs being denied as non-admin)
   */
  const isAuthenticationError = (status: number | undefined, message: string): boolean => {
    // 401 is always an auth error
    if (status === 401) return true;
    
    // 403 with specific messages indicating auth issue (not admin denial)
    if (status === 403) {
      const authMessages = [
        'not authenticated',
        'could not validate credentials',
        'not authorized', // generic auth failure
        'invalid token',
        'token expired',
        'missing token',
      ];
      const lowerMessage = message.toLowerCase();
      // If it says "not authorized as admin", that's a definitive admin denial
      if (lowerMessage.includes('not authorized as admin')) {
        return false;
      }
      return authMessages.some(m => lowerMessage.includes(m));
    }
    
    return false;
  };

  /**
   * Check if the current user is an admin.
   * Uses JWT authentication to verify admin status.
   * Automatically retries on authentication errors until JWT token is ready.
   */
  const checkAdminStatus = useCallback(async () => {
    setIsLoading(true);
    // Don't clear error here - we only set error for actual errors, not for non-admin status

    try {
      const response = await adminApi.checkAdmin();
      setIsAdmin(response.data.is_admin);
      setError(null); // Clear any previous error on success
      retryCountRef.current = 0; // Reset retry count on success
      return response.data.is_admin;
    } catch (err: unknown) {
      const errorResponse = err as { response?: { status?: number; data?: { detail?: string } } };
      const status = errorResponse.response?.status;
      const message = errorResponse.response?.data?.detail || 'Failed to check admin status';
      
      // Check if this is definitely a non-admin user (authenticated but not admin)
      // This is expected behavior - don't set error, just set isAdmin to false
      if (status === 403 && message.toLowerCase().includes('not authorized as admin')) {
        // Don't set error - this is normal for non-admin users
        setIsAdmin(false);
        retryCountRef.current = 0;
        return false;
      }
      
      // For authentication errors, schedule a retry if we haven't exceeded max retries
      // This handles the race condition where admin check happens before JWT is ready
      if (isAuthenticationError(status, message) && retryCountRef.current < MAX_ADMIN_CHECK_RETRIES) {
        retryCountRef.current++;
        // Exponential backoff: 300ms, 600ms, 900ms, 1200ms, 1500ms
        const delay = ADMIN_CHECK_RETRY_BASE_DELAY * retryCountRef.current;
        console.log(`[useAdmin] Admin check failed with auth error (attempt ${retryCountRef.current}/${MAX_ADMIN_CHECK_RETRIES}), retrying in ${delay}ms...`);
        
        // Schedule retry
        retryTimeoutRef.current = setTimeout(() => {
          checkAdminStatus();
        }, delay);
        
        return null;
      }
      
      // For other errors or max retries exceeded, don't change isAdmin state
      console.log('[useAdmin] Admin check failed:', message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Fetch admin statistics.
   * Requires JWT authentication with admin privileges.
   */
  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await adminApi.getStats();
      setStats(response.data);
      return response.data;
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { detail?: string } } }).response?.data?.detail || 
                      'Failed to fetch statistics';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Fetch all sessions (paginated).
   * Requires JWT authentication with admin privileges.
   */
  const fetchSessions = useCallback(async (page: number = 1, perPage: number = 20) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await adminApi.listSessions(page, perPage);
      setSessions(response.data.sessions);
      setTotalSessions(response.data.total);
      setCurrentPage(response.data.page);
      return response.data;
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { detail?: string } } }).response?.data?.detail || 
                      'Failed to fetch sessions';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Fetch all in-memory Telegram sessions.
   * Requires JWT authentication with admin privileges.
   */
  const fetchTelegramSessions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await adminApi.listTelegramSessions();
      setTelegramSessions(response.data.sessions);
      return response.data;
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { detail?: string } } }).response?.data?.detail || 
                      'Failed to fetch Telegram sessions';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Delete a session.
   * Requires JWT authentication with admin privileges.
   */
  const deleteSession = useCallback(async (sessionId: number) => {
    setIsLoading(true);
    setError(null);

    try {
      await adminApi.deleteSession(sessionId);
      toast.success('Session deleted successfully');
      
      // Remove from local state
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      setTotalSessions(prev => prev - 1);
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { detail?: string } } }).response?.data?.detail || 
                      'Failed to delete session';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Delete an in-memory Telegram session.
   * Requires JWT authentication with admin privileges.
   */
  const deleteTelegramSession = useCallback(async (sessionId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await adminApi.deleteTelegramSession(sessionId);
      toast.success('Telegram session closed successfully');
      
      // Remove from local state
      setTelegramSessions(prev => prev.filter(s => s.session_id !== sessionId));
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { detail?: string } } }).response?.data?.detail || 
                      'Failed to close Telegram session';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    // State
    isLoading,
    error,
    isAdmin,
    stats,
    sessions,
    telegramSessions,
    totalSessions,
    currentPage,
    
    // Functions
    checkAdminStatus,
    fetchStats,
    fetchSessions,
    fetchTelegramSessions,
    deleteSession,
    deleteTelegramSession,
  };
};
