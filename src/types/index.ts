/**
 * TypeScript type definitions for the application.
 */

// User types
export interface User {
  id: number;
  email: string;
  username?: string | null;
  firstName?: string | null;
  balance: number;
  role: 'USER' | 'ADMIN';
  isBanned: boolean;
  createdAt: string;
  updatedAt: string;
}

// Account types (Telegram session)
export interface Account {
  id: number;
  user_id: number;
  session_name: string; // Backend field name
  phone: string;
  api_id: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AccountInfo extends Account {
  is_connected: boolean;
  user_info?: {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    phone: string;
  } | null;
}

export interface CreateAccountData {
  session_name: string; // Backend field name
  phone: string;
  api_id: number;
  api_hash: string;
  phone_code?: string;
  phone_code_hash?: string;
  password?: string;
}

// ====== TelertX Types (Telethon-based Telegram Login) ======

export interface TelegramLoginData {
  phone: string;
  session_name?: string;
  platform?: string;  // android, iphone, desktop
}

export interface TelegramSession {
  session_id: string;
  phone: string;
  is_authorized: boolean;
  created_at: string;
  last_used: string;
  device_model?: string;
  system_version?: string;
}

// Auth types
export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

// API Response types
export interface ApiError {
  error: string;
  status_code: number;
  request_id?: string;
  details?: Record<string, unknown>;
}

export interface PaginationParams {
  skip?: number;
  limit?: number;
}

export interface AccountListParams extends PaginationParams {
  active_only?: boolean;
}

/**
 * Legacy type aliases for backward compatibility with existing code.
 * @deprecated Use Account, AccountInfo, CreateAccountData, and AccountListParams instead.
 * These aliases may be removed in a future version.
 */
export type Session = Account;
export type SessionInfo = AccountInfo;
export type CreateSessionData = CreateAccountData;
export type SessionListParams = AccountListParams;
