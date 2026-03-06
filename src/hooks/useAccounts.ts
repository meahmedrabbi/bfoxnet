/**
 * Custom hook for Telegram account management.
 * 
 * Provides functionality to manage Telegram accounts including:
 * - Fetching list of accounts
 * - Creating new accounts
 * - Deleting accounts
 * - Validating account status
 * - Getting detailed account information
 * 
 * @returns {Object} Account management functions and state
 * @returns {Array} accounts - List of Telegram accounts
 * @returns {boolean} isLoading - Loading state indicator
 * @returns {string|null} error - Error message if any
 * @returns {Function} fetchAccounts - Fetch accounts list
 * @returns {Function} createAccount - Create a new account
 * @returns {Function} deleteAccount - Delete an account
 * @returns {Function} validateAccount - Validate account status
 * @returns {Function} getAccountInfo - Get detailed account information
 * 
 * @example
 * const { accounts, createAccount, deleteAccount } = useAccounts();
 * 
 * // Fetch accounts on component mount
 * useEffect(() => {
 *   fetchAccounts();
 * }, []);
 * 
 * // Create a new account
 * await createAccount({ phone: '+1234567890', ... });
 */
import { useState, useCallback } from 'react';
import { sessionsApi, SessionResponse, SessionInfoResponse } from '@/lib/api';
import { CreateAccountData } from '@/types';
import toast from 'react-hot-toast';

export const useAccounts = () => {
  const [accounts, setAccounts] = useState<SessionResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAccounts = useCallback(async (activeOnly = false) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await sessionsApi.list({ active_only: activeOnly });
      setAccounts(response.data.sessions);
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { error?: string; detail?: string } } }).response?.data?.error || 
                      (err as { response?: { data?: { error?: string; detail?: string } } }).response?.data?.detail || 
                      'Failed to fetch accounts';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createAccount = useCallback(async (data: CreateAccountData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await sessionsApi.create(data);
      
      // Check if it's a completed session or pending response
      const responseData = response.data;
      if ('status' in responseData) {
        // It's a SessionPendingResponse - return it so caller can handle
        return response;
      } else {
        // It's a completed SessionResponse
        toast.success('Account created successfully');
        
        // Refresh accounts list
        await fetchAccounts();
        
        return response;
      }
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { error?: string; detail?: string } } }).response?.data?.error || 
                      (err as { response?: { data?: { error?: string; detail?: string } } }).response?.data?.detail || 
                      'Failed to create account';
      setError(message);
      
      // Show toast for actual errors
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchAccounts]);

  const deleteAccount = useCallback(async (accountId: number) => {
    setIsLoading(true);
    setError(null);

    try {
      await sessionsApi.delete(accountId);
      toast.success('Account deleted successfully');
      
      // Remove from local state
      setAccounts(prev => prev.filter(s => s.id !== accountId));
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { error?: string; detail?: string } } }).response?.data?.error || 
                      (err as { response?: { data?: { error?: string; detail?: string } } }).response?.data?.detail || 
                      'Failed to delete account';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const validateAccount = useCallback(async (accountId: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await sessionsApi.validate(accountId);
      return response.data;
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { error?: string; detail?: string } } }).response?.data?.error || 
                      (err as { response?: { data?: { error?: string; detail?: string } } }).response?.data?.detail || 
                      'Failed to validate account';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getAccountInfo = useCallback(async (accountId: number): Promise<SessionInfoResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await sessionsApi.getInfo(accountId);
      return response.data;
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { error?: string; detail?: string } } }).response?.data?.error || 
                      (err as { response?: { data?: { error?: string; detail?: string } } }).response?.data?.detail || 
                      'Failed to get account info';
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    accounts,
    isLoading,
    error,
    fetchAccounts,
    createAccount,
    deleteAccount,
    validateAccount,
    getAccountInfo,
  };
};
