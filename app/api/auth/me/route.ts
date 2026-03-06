import { NextRequest } from 'next/server';
import { handleMe } from '@/backend/controller/auth.controller';

export async function GET(req: NextRequest) {
  return handleMe(req);
}
