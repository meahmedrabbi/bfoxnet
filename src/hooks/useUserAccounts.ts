/**
 * Custom hook for user account management with status filtering.
 * 
 * Provides functionality to manage user accounts including:
 * - Fetching list of accounts with status filter
 * - Getting account counts by status
 * - Supporting pagination
 * 
 * @returns {Object} Account management functions and state
 */
import { useState, useCallback, useEffect, useRef } from 'react';
import { 
  accountsApi, 
  AccountResponse, 
  AccountStatusType, 
  AccountCountsResponse 
} from '@/lib/api';
import toast from 'react-hot-toast';

export interface UseUserAccountsReturn {
  accounts: AccountResponse[];
  counts: AccountCountsResponse;
  isLoading: boolean;
  error: string | null;
  currentStatus: AccountStatusType | undefined;
  page: number;
  totalPages: number;
  fetchAccounts: (status?: AccountStatusType, page?: number) => Promise<void>;
  fetchCounts: () => Promise<void>;
  setStatus: (status: AccountStatusType | undefined) => void;
  setPage: (page: number) => void;
  refresh: () => Promise<void>;
}

export const useUserAccounts = (): UseUserAccountsReturn => {
  const [accounts, setAccounts] = useState<AccountResponse[]>([]);
  const [counts, setCounts] = useState<AccountCountsResponse>({
    pending: 0,
    success: 0,
    rejected: 0,
    total: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStatus, setCurrentStatus] = useState<AccountStatusType | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const perPage = 30;
  
  // Ref to track if initial fetch has been done
  const initialFetchDone = useRef(false);

  const fetchCounts = useCallback(async () => {
    try {
      const response = await accountsApi.getCounts();
      setCounts(response.data);
    } catch (err: unknown) {
      console.error('[useUserAccounts] Failed to fetch counts:', err);
    }
  }, []);

  const fetchAccounts = useCallback(async (
    status?: AccountStatusType, 
    pageNum: number = 1
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await accountsApi.list(status, pageNum, perPage);
      setAccounts(response.data.accounts);
      setTotalPages(Math.ceil(response.data.total / perPage) || 1);
      
      // Also fetch counts
      await fetchCounts();
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { error?: string; detail?: string } } }).response?.data?.error || 
                      (err as { response?: { data?: { error?: string; detail?: string } } }).response?.data?.detail || 
                      'Failed to fetch accounts';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [fetchCounts]);

  const setStatus = useCallback((status: AccountStatusType | undefined) => {
    setCurrentStatus(status);
    setPage(1);
    fetchAccounts(status, 1);
  }, [fetchAccounts]);

  const setPageNum = useCallback((newPage: number) => {
    setPage(newPage);
    fetchAccounts(currentStatus, newPage);
  }, [currentStatus, fetchAccounts]);

  const refresh = useCallback(async () => {
    await fetchAccounts(currentStatus, page);
  }, [currentStatus, page, fetchAccounts]);

  // Initial fetch
  useEffect(() => {
    if (!initialFetchDone.current) {
      initialFetchDone.current = true;
      fetchAccounts(undefined, 1);
    }
  }, [fetchAccounts]);

  return {
    accounts,
    counts,
    isLoading,
    error,
    currentStatus,
    page,
    totalPages,
    fetchAccounts,
    fetchCounts,
    setStatus,
    setPage: setPageNum,
    refresh,
  };
};
