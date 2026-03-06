/**
 * Custom hook for authentication.
 * Checks session via /api/auth/me on mount; redirects to /login if unauthenticated.
 */
'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

const PUBLIC_PATHS = ['/login'];

export const useAuth = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading, error, checkSession, loginWithCredentials, register, logout, clearError } =
    useAuthStore();

  useEffect(() => {
    // Only check session once — if we already know the state, skip
    if (!isAuthenticated && !isLoading) {
      checkSession();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const isPublic = PUBLIC_PATHS.some((p) => pathname?.startsWith(p));
    if (!isLoading && !isAuthenticated && !isPublic) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    loginWithCredentials,
    register,
    logout,
    clearError,
  };
};
