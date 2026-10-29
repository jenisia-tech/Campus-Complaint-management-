import { NextRequest, NextResponse } from 'next/server';
import { DEMO_SESSION_COOKIE } from '@/lib/auth-demo';
import { findUserByEmail, saveOrUpdateUser, verifyPassword, hashPassword, DEFAULT_ADMIN } from '@/lib/local-store';
import type { UserRole } from '@/types/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const requestedEmail = body.email ? String(body.email).trim().toLowerCase() : '';
    const isRegistration = Boolean(body.isRegistration);

    if (!requestedEmail) {
      return NextResponse.json({ error: 'Email address is required.' }, { status: 400 });
    }

    const existing = findUserByEmail(requestedEmail);

    if (isRegistration) {
      if (existing) {
        return NextResponse.json(
          { error: 'An account with this college email address already exists. Please sign in instead.' },
          { status: 400 }
        );
      }

      // New student registration
      const newProfile = saveOrUpdateUser({
        name: body.name || requestedEmail.split('@')[0],
        student_id: body.student_id || null,
        email: requestedEmail,
        password: body.password || 'Student@123456',
        role: 'student', // Never allow public registration as admin
        department: body.department || 'Computer Science and Engineering',
        course: body.course || 'B.Tech Computer Science',
        year_of_study: body.year_of_study || '1st Year',
        hostel_block: body.hostel_block || null,
        floor: body.floor || null,
        room_number: body.room_number || null,
        phone: body.phone || null,
      });

      const { password_hash, ...safeProfile } = newProfile;
      const response = NextResponse.json({
        success: true,
        message: 'Student account registered successfully',
        profile: safeProfile,
      });

      response.cookies.set({
        name: DEMO_SESSION_COOKIE,
        value: JSON.stringify(safeProfile),
        httpOnly: false,
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        sameSite: 'lax',
      });

      return response;
    }

    // Sign in flow
    if (!existing) {
      // If someone logs in with standard demo admin
      if (requestedEmail === 'admin@campus.edu') {
        const adminProfile = DEFAULT_ADMIN;
        if (body.password && !verifyPassword(body.password, adminProfile.password_hash || hashPassword('Admin@123456'))) {
          return NextResponse.json({ error: 'Invalid administrator password.' }, { status: 401 });
        }
        const { password_hash, ...safeProfile } = adminProfile;
        const response = NextResponse.json({
          success: true,
          message: 'Signed in as Administrator',
          profile: safeProfile,
        });
        response.cookies.set({
          name: DEMO_SESSION_COOKIE,
          value: JSON.stringify(safeProfile),
          httpOnly: false,
          path: '/',
          maxAge: 60 * 60 * 24 * 30,
          sameSite: 'lax',
        });
        return response;
      }

      return NextResponse.json(
        { error: 'No account registered with this email address. Please register first.' },
        { status: 404 }
      );
    }

    // Verify password if provided
    if (body.password && existing.password_hash) {
      if (!verifyPassword(body.password, existing.password_hash)) {
        return NextResponse.json(
          { error: 'Invalid password. Please check your credentials.' },
          { status: 401 }
        );
      }
    }

    // Check role elevation attempt
    if (body.role === 'admin' && existing.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized: Student account cannot access administrator privileges.' },
        { status: 403 }
      );
    }

    const { password_hash, ...safeProfile } = existing;
    const response = NextResponse.json({
      success: true,
      message: `Signed in as ${existing.role === 'admin' ? 'Administrator' : 'Student'}`,
      profile: safeProfile,
    });

    response.cookies.set({
      name: DEMO_SESSION_COOKIE,
      value: JSON.stringify(safeProfile),
      httpOnly: false,
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
      sameSite: 'lax',
    });

    return response;
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error).message || 'Failed to authenticate user' },
      { status: 500 }
    );
  }
}
