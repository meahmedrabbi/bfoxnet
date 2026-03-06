/**
 * Auth service — business logic for registration, login and session validation.
 */
import bcrypt from 'bcryptjs';
import { signToken, verifyToken, JwtPayload } from '@/lib/jwt';
import {
  findUserByEmail,
  findUserById,
  findUserByUsername,
  createUser,
  User,
} from '@/backend/model/user.model';
import type { RegisterRequest, LoginRequest, AuthUser, AuthResponse } from '@/backend/types/auth.types';

const SALT_ROUNDS = 12;

/** Maps a Prisma User to the public AuthUser shape */
export function toAuthUser(user: User): AuthUser {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    firstName: user.firstName,
    balance: user.balance,
    role: user.role,
    isBanned: user.isBanned,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

export async function registerUser(data: RegisterRequest): Promise<AuthResponse> {
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    throw new Error('Invalid email address');
  }

  // Password strength: min 8 chars
  if (data.password.length < 8) {
    throw new Error('Password must be at least 8 characters');
  }

  // Check uniqueness
  const existingEmail = await findUserByEmail(data.email);
  if (existingEmail) throw new Error('Email is already registered');

  if (data.username) {
    const existingUsername = await findUserByUsername(data.username);
    if (existingUsername) throw new Error('Username is already taken');
  }

  const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

  const user = await createUser({
    email: data.email,
    password: hashedPassword,
    username: data.username ?? null,
    firstName: data.firstName ?? null,
  });

  const token = signToken({ userId: user.id, email: user.email, role: user.role });
  return { user: toAuthUser(user), token };
}

export async function loginUser(data: LoginRequest): Promise<AuthResponse> {
  const user = await findUserByEmail(data.email);
  if (!user) throw new Error('Invalid email or password');

  const passwordValid = await bcrypt.compare(data.password, user.password);
  if (!passwordValid) throw new Error('Invalid email or password');

  if (user.isBanned) throw new Error('Your account has been suspended');

  const token = signToken({ userId: user.id, email: user.email, role: user.role });
  return { user: toAuthUser(user), token };
}

export async function getUserFromToken(token: string): Promise<AuthUser> {
  let payload: JwtPayload;
  try {
    payload = verifyToken(token);
  } catch {
    throw new Error('Invalid or expired token');
  }

  const user = await findUserById(payload.userId);
  if (!user) throw new Error('User not found');
  if (user.isBanned) throw new Error('Your account has been suspended');

  return toAuthUser(user);
}
