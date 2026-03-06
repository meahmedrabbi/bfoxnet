/**
 * Authentication store using Zustand.
 * Uses real email/password auth via /api/auth/* routes.
 */
import { create } from 'zustand';
import { User } from '@/types';
import { logger } from '@/lib/logger';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  checkSession: () => Promise<void>;
  loginWithCredentials: (email: string, password: string) => Promise<boolean>;
  register: (data: { email: string; password: string; username?: string; firstName?: string }) => Promise<boolean>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  clearError: () => void;
}

function mapUser(u: Record<string, unknown>): User {
  return {
    id: u.id as number,
    email: u.email as string,
    username: u.username as string | null,
    firstName: u.firstName as string | null,
    balance: u.balance as number,
    role: u.role as 'USER' | 'ADMIN',
    isBanned: u.isBanned as boolean,
    createdAt: u.createdAt as string,
    updatedAt: u.updatedAt as string,
  };
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  checkSession: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        set({ user: mapUser(data.user), isAuthenticated: true, isLoading: false });
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  loginWithCredentials: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        set({ isLoading: false, error: data.error ?? 'Login failed' });
        return false;
      }
      set({ user: mapUser(data.user), isAuthenticated: true, isLoading: false, error: null });
      logger.info('[authStore] Login successful');
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Network error';
      set({ isLoading: false, error: msg });
      return false;
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      const body = await res.json();
      if (!res.ok) {
        set({ isLoading: false, error: body.error ?? 'Registration failed' });
        return false;
      }
      set({ user: mapUser(body.user), isAuthenticated: true, isLoading: false, error: null });
      logger.info('[authStore] Registration successful');
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Network error';
      set({ isLoading: false, error: msg });
      return false;
    }
  },

  logout: async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch {
      // ignore network errors on logout
    }
    logger.info('[authStore] Logout');
    set({ user: null, isAuthenticated: false, error: null });
  },

  setUser: (user) => set({ user }),
  clearError: () => set({ error: null }),
}));
