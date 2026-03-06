/**
 * Auth middleware — higher-order function to protect API routes.
 *
 * Usage:
 *   export const GET = withAuth(async (req, user) => {
 *     return NextResponse.json({ data: '...' });
 *   });
 */
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getUserFromToken } from '@/backend/service/auth.service';
import type { AuthUser } from '@/backend/types/auth.types';

type AuthenticatedHandler = (
  req: NextRequest,
  user: AuthUser,
) => Promise<NextResponse> | NextResponse;

type AdminHandler = (
  req: NextRequest,
  user: AuthUser,
) => Promise<NextResponse> | NextResponse;

const COOKIE_NAME = process.env.AUTH_COOKIE_NAME ?? 'bfoxnet_token';

async function resolveToken(req: NextRequest): Promise<string | null> {
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get(COOKIE_NAME)?.value;
  if (cookieToken) return cookieToken;

  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) return authHeader.slice(7);

  return null;
}

/** Wraps a route handler and injects the authenticated user */
export function withAuth(handler: AuthenticatedHandler) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const token = await resolveToken(req);
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    try {
      const user = await getUserFromToken(token);
      return await handler(req, user);
    } catch {
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
    }
  };
}

/** Wraps a route handler and requires ADMIN role */
export function withAdmin(handler: AdminHandler) {
  return withAuth(async (req, user) => {
    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return handler(req, user);
  });
}
