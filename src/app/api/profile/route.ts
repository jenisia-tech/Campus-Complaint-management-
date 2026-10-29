import { NextRequest, NextResponse } from 'next/server';
import { DEMO_SESSION_COOKIE } from '@/lib/auth-demo';
import { findUserByEmail, findUserById, saveOrUpdateUser } from '@/lib/local-store';
import type { Profile } from '@/types/database';

export async function GET(request: NextRequest) {
  try {
    const demoCookie = request.cookies.get(DEMO_SESSION_COOKIE)?.value;
    if (!demoCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const current = JSON.parse(demoCookie) as Profile;
    const user = (current.id ? findUserById(current.id) : null) || (current.email ? findUserByEmail(current.email) : null) || current;

    return NextResponse.json({ profile: user });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error).message || 'Failed to retrieve profile' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const demoCookie = request.cookies.get(DEMO_SESSION_COOKIE)?.value;
    if (!demoCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const current = JSON.parse(demoCookie) as Profile;
    const body = await request.json();

    const updated = saveOrUpdateUser({
      id: current.id,
      email: current.email,
      name: body.name || current.name,
      student_id: body.student_id !== undefined ? body.student_id : current.student_id,
      department: body.department || current.department,
      course: body.course !== undefined ? body.course : current.course,
      year_of_study: body.year_of_study !== undefined ? body.year_of_study : current.year_of_study,
      hostel_block: body.hostel_block !== undefined ? body.hostel_block : current.hostel_block,
      floor: body.floor !== undefined ? body.floor : current.floor,
      room_number: body.room_number !== undefined ? body.room_number : current.room_number,
      phone: body.phone !== undefined ? body.phone : current.phone,
      role: current.role,
    });

    const { password_hash, ...safeProfile } = updated;

    const response = NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
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
      { error: (err as Error).message || 'Failed to update profile' },
      { status: 500 }
    );
  }
}

