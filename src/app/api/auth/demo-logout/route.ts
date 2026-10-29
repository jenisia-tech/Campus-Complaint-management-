import { NextResponse } from 'next/server';
import { DEMO_SESSION_COOKIE } from '@/lib/auth-demo';

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Signed out successfully' });
  response.cookies.delete(DEMO_SESSION_COOKIE);
  return response;
}

