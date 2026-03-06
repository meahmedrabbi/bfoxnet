import { NextRequest } from 'next/server';
import { handleRegister } from '@/backend/controller/auth.controller';

export async function POST(req: NextRequest) {
  return handleRegister(req);
}
