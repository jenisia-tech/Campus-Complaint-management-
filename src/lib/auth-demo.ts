import type { Profile, UserRole } from '@/types/database';
import { DEMO_STUDENT, DEMO_ADMIN } from './demo-data';

export const DEMO_SESSION_COOKIE = 'campus_demo_session';

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return false;
  if (url.includes('placeholder.supabase.co')) return false;
  if (key === 'placeholder-key' || key.length < 20) return false;
  return true;
}

export function getDemoProfileByRole(role: UserRole): Profile {
  return role === 'admin' ? DEMO_ADMIN : DEMO_STUDENT;
}
