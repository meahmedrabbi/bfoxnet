/**
 * Auth DTOs (Data Transfer Objects).
 * Defines the shapes for request bodies and API responses.
 */

export interface RegisterRequest {
  email: string;
  password: string;
  username?: string;
  firstName?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

/** Returned by /api/auth/me and embedded in login/register responses */
export interface AuthUser {
  id: number;
  email: string;
  username: string | null;
  firstName: string | null;
  balance: number;
  role: string;
  isBanned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}

export interface ApiErrorResponse {
  error: string;
}
