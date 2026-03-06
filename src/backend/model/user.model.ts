/**
 * User model — all database operations for the users table.
 */
import { prisma } from '@/lib/prisma';
import type { User } from '@prisma/client';

export type { User };

export async function findUserByEmail(email: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { email } });
}

export async function findUserById(id: number): Promise<User | null> {
  return prisma.user.findUnique({ where: { id } });
}

export async function findUserByUsername(username: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { username } });
}

export interface CreateUserData {
  email: string;
  password: string; // already hashed
  username?: string | null;
  firstName?: string | null;
}

export async function createUser(data: CreateUserData): Promise<User> {
  return prisma.user.create({
    data: {
      email: data.email,
      password: data.password,
      username: data.username ?? null,
      firstName: data.firstName ?? null,
    },
  });
}

export async function updateUserBalance(id: number, balance: number): Promise<User> {
  return prisma.user.update({ where: { id }, data: { balance } });
}

export async function updateUserBanStatus(id: number, isBanned: boolean): Promise<User> {
  return prisma.user.update({ where: { id }, data: { isBanned } });
}

export async function listUsers(skip = 0, take = 50): Promise<User[]> {
  return prisma.user.findMany({ skip, take, orderBy: { createdAt: 'desc' } });
}

export async function countUsers(): Promise<number> {
  return prisma.user.count();
}
