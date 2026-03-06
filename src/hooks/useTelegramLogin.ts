/**
 * Custom hook for TelertX Telegram authentication.
 * 
 * Provides functionality for Telegram login using Telethon:
 * - Initiate login with phone number
 * - Submit verification code
 * - Submit 2FA password
 * - Manage sessions
 * 
 * @returns {Object} Telegram authentication functions and state
 */
import { useState, useCallback } from 'react';
import { 
  telegramApi, 
  TelegramLoginRequest, 
  TelegramLoginResponse,
  TelegramSessionInfo,
  TelegramSessionListResponse 
} from '@/lib/api';
import toast from 'react-hot-toast';

export interface TelegramLoginState {
  sessionId: string | null;
  status: string;
  phone: string;
  message: string;
}

export const useTelegramLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loginState, setLoginState] = useState<TelegramLoginState>({
    sessionId: null,
    status: '',
    phone: '',
    message: '',
  });
  const [sessions, setSessions] = useState<TelegramSessionInfo[]>([]);

  /**
   * Initiate Telegram login process.
   * Sends phone number and API credentials to start authentication.
   */
  const initiateLogin = useCallback(async (data: TelegramLoginRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await telegramApi.login(data);
      const result = response.data;
      
      setLoginState({
        sessionId: result.session_id || null,
        status: result.status,
        phone: data.phone,
        message: result.message,
      });

      if (result.status === 'authorized') {
        toast.success('Successfully logged in!');
      } else if (result.status === 'awaiting_code') {
        toast.success('Verification code sent to your Telegram app');
      } else if (result.status === 'error') {
        // Handle error status returned from backend
        setError(result.message || 'Failed to initiate login');
        throw new Error(result.message || 'Failed to initiate login');
      }

      return result;
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { detail?: string } } }).response?.data?.detail || 
                      (err as Error).message ||
                      'Failed to initiate login';
      setError(message);
      // Don't show toast here - let the component handle the error display
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Submit authentication code.
   * Called after receiving code on Telegram app.
   */
  const submitCode = useCallback(async (sessionId: string, code: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await telegramApi.submitCode({ session_id: sessionId, code });
      const result = response.data;
      
      setLoginState(prev => ({
        ...prev,
        status: result.status,
        message: result.message,
      }));

      if (result.status === 'authorized') {
        toast.success('Successfully authenticated!');
      } else if (result.status === 'awaiting_password') {
        toast('2FA password required', { icon: 'ℹ️' });
      } else if (result.status === 'error') {
        // Handle error status returned from backend
        setError(result.message || 'Verification failed');
        throw new Error(result.message || 'Verification failed');
      }

      return result;
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { detail?: string } } }).response?.data?.detail || 
                      (err as Error).message ||
                      'Failed to verify code';
      setError(message);
      // Don't show toast here - let the component handle the error display
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Submit 2FA password.
   * Called when account has 2FA enabled.
   */
  const submitPassword = useCallback(async (sessionId: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await telegramApi.submitPassword({ session_id: sessionId, password });
      const result = response.data;
      
      setLoginState(prev => ({
        ...prev,
        status: result.status,
        message: result.message,
      }));

      if (result.status === 'authorized') {
        toast.success('Successfully authenticated with 2FA!');
      } else if (result.status === 'error') {
        // Handle error status returned from backend
        setError(result.message || 'Password verification failed');
        throw new Error(result.message || 'Password verification failed');
      }

      return result;
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { detail?: string } } }).response?.data?.detail || 
                      (err as Error).message ||
                      'Failed to verify password';
      setError(message);
      // Don't show toast here - let the component handle the error display
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Fetch all Telegram sessions.
   */
  const fetchSessions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await telegramApi.listSessions();
      setSessions(response.data.sessions);
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
   * Get information about a specific session.
   */
  const getSession = useCallback(async (sessionId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await telegramApi.getSession(sessionId);
      return response.data;
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { detail?: string } } }).response?.data?.detail || 
                      'Failed to get session';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Close a specific session.
   */
  const closeSession = useCallback(async (sessionId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await telegramApi.closeSession(sessionId);
      toast.success('Session closed successfully');
      
      // Remove from local state
      setSessions(prev => prev.filter(s => s.session_id !== sessionId));
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { detail?: string } } }).response?.data?.detail || 
                      'Failed to close session';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Close all sessions.
   */
  const closeAllSessions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await telegramApi.closeAllSessions();
      toast.success('All sessions closed');
      setSessions([]);
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { detail?: string } } }).response?.data?.detail || 
                      'Failed to close sessions';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Reset login state.
   */
  const resetLoginState = useCallback(() => {
    setLoginState({
      sessionId: null,
      status: '',
      phone: '',
      message: '',
    });
    setError(null);
  }, []);

  return {
    // State
    isLoading,
    error,
    loginState,
    sessions,
    
    // Login flow
    initiateLogin,
    submitCode,
    submitPassword,
    resetLoginState,
    
    // Session management
    fetchSessions,
    getSession,
    closeSession,
    closeAllSessions,
  };
};
