/**
 * Auth controller — handles HTTP request parsing and response formatting.
 * Each method receives a NextRequest and returns a NextResponse.
 */
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { registerUser, loginUser, getUserFromToken } from '@/backend/service/auth.service';
import type { RegisterRequest, LoginRequest, ApiErrorResponse } from '@/backend/types/auth.types';

const COOKIE_NAME = process.env.AUTH_COOKIE_NAME ?? 'bfoxnet_token';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function setCookieOptions(token: string) {
  return {
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  };
}

function errorResponse(message: string, status: number): NextResponse<ApiErrorResponse> {
  return NextResponse.json({ error: message }, { status });
}

export async function handleRegister(req: NextRequest): Promise<NextResponse> {
  let body: RegisterRequest;
  try {
    body = await req.json();
  } catch {
    return errorResponse('Invalid JSON body', 400);
  }

  if (!body.email || !body.password) {
    return errorResponse('Email and password are required', 400);
  }

  try {
    const result = await registerUser(body);
    const cookieStore = await cookies();
    cookieStore.set(setCookieOptions(result.token));
    return NextResponse.json(result, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Registration failed';
    return errorResponse(message, 400);
  }
}

export async function handleLogin(req: NextRequest): Promise<NextResponse> {
  let body: LoginRequest;
  try {
    body = await req.json();
  } catch {
    return errorResponse('Invalid JSON body', 400);
  }

  if (!body.email || !body.password) {
    return errorResponse('Email and password are required', 400);
  }

  try {
    const result = await loginUser(body);
    const cookieStore = await cookies();
    cookieStore.set(setCookieOptions(result.token));
    return NextResponse.json(result, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Login failed';
    return errorResponse(message, 401);
  }
}

export async function handleLogout(): Promise<NextResponse> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  return NextResponse.json({ success: true });
}

export async function handleMe(req: NextRequest): Promise<NextResponse> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  // Also accept Bearer token in Authorization header
  const authHeader = req.headers.get('authorization');
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;

  const resolvedToken = token ?? bearerToken;
  if (!resolvedToken) {
    return errorResponse('Not authenticated', 401);
  }

  try {
    const user = await getUserFromToken(resolvedToken);
    return NextResponse.json({ user });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Authentication failed';
    return errorResponse(message, 401);
  }
}
