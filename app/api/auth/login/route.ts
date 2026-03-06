import { NextRequest } from 'next/server';
import { handleLogin } from '@/backend/controller/auth.controller';

export async function POST(req: NextRequest) {
  return handleLogin(req);
}
