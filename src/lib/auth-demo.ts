import type { Profile, UserRole } from '@/types/database';

export const DEMO_SESSION_COOKIE = 'campus_demo_session';

export const DEMO_STUDENT: Profile = {
  id: 'd0000000-0000-0000-0000-000000000001',
  role: 'student',
  name: 'Alex Johnson',
  email: 'student@campus.edu',
  student_id: 'STU-2026-0042',
  department: 'Computer Science and Engineering',
  hostel_block: 'Ganga Hostel Block B',
  room_number: 'Room 304',
  phone: '+91 98765 43210',
  created_at: '2026-10-25T09:00:00Z',
  updated_at: '2026-10-25T09:00:00Z',
};

export const DEMO_ADMIN: Profile = {
  id: 'd0000000-0000-0000-0000-000000000002',
  role: 'admin',
  name: 'Chief Administrator',
  email: 'admin@campus.edu',
  student_id: null,
  department: 'General Administration',
  phone: '+91 98765 00001',
  created_at: '2026-10-20T08:00:00Z',
  updated_at: '2026-10-20T08:00:00Z',
};

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
