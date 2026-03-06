/**
 * Custom hook for channel membership verification.
 * 
 * Checks if the user is a member of all required Telegram channels
 * and provides the list of channels they need to join.
 */
import { useEffect, useState, useCallback } from 'react';
import { authApi, ChannelInfo, ChannelMembershipResponse } from '@/lib/api';
import { logger } from '@/lib/logger';

interface UseChannelMembershipResult {
  isLoading: boolean;
  allJoined: boolean;
  channels: ChannelInfo[];
  notJoinedChannels: ChannelInfo[];
  error: string | null;
  recheckMembership: () => Promise<void>;
}

export const useChannelMembership = (isAuthenticated: boolean): UseChannelMembershipResult => {
  const [isLoading, setIsLoading] = useState(true);
  const [allJoined, setAllJoined] = useState(true);
  const [channels, setChannels] = useState<ChannelInfo[]>([]);
  const [error, setError] = useState<string | null>(null);

  const checkMembership = useCallback(async () => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await authApi.checkChannelMembership();
      const data: ChannelMembershipResponse = response.data;
      
      setAllJoined(data.all_joined);
      setChannels(data.channels);
      
      logger.info('[useChannelMembership] Channel membership checked', {
        allJoined: data.all_joined,
        totalChannels: data.channels.length,
        notJoined: data.channels.filter(c => !c.is_member).length
      });
    } catch (err: unknown) {
      const error = err as { response?: { status?: number }; message?: string };
      logger.error('[useChannelMembership] Failed to check channel membership', {
        status: error.response?.status,
        message: error.message
      });
      // On error, allow access (graceful degradation)
      setAllJoined(true);
      setChannels([]);
      setError('Failed to verify channel membership');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    checkMembership();
  }, [checkMembership]);

  // Compute not joined channels
  const notJoinedChannels = channels.filter(c => !c.is_member);

  return {
    isLoading,
    allJoined,
    channels,
    notJoinedChannels,
    error,
    recheckMembership: checkMembership,
  };
};
