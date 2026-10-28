import { NextRequest, NextResponse } from 'next/server';
import { DEMO_SESSION_COOKIE, getDemoProfileByRole } from '@/lib/auth-demo';
import type { UserRole } from '@/types/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const role: UserRole = body.role === 'admin' ? 'admin' : 'student';
    const baseProfile = getDemoProfileByRole(role);
    const profile = {
      ...baseProfile,
      ...(body.name ? { name: body.name } : {}),
      ...(body.student_id ? { student_id: body.student_id } : {}),
      ...(body.department ? { department: body.department } : {}),
      ...(body.email ? { email: body.email } : {}),
    };

    const response = NextResponse.json({
      success: true,
      message: `Signed in as Demo ${role === 'admin' ? 'Administrator' : 'Student'}`,
      profile,
    });

    response.cookies.set({
      name: DEMO_SESSION_COOKIE,
      value: JSON.stringify(profile),
      httpOnly: false,
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: 'lax',
    });

    return response;
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error).message || 'Failed to authenticate demo user' },
      { status: 500 }
    );
  }
}
