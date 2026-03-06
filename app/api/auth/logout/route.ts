import { handleLogout } from '@/backend/controller/auth.controller';

export async function POST() {
  return handleLogout();
}
