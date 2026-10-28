import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { complaintSchema } from '@/lib/validations/complaint';
import { DEMO_SESSION_COOKIE, isSupabaseConfigured } from '@/lib/auth-demo';
import { getDemoComplaints, addDemoComplaint, DEMO_STUDENT } from '@/lib/demo-data';
import type { Profile } from '@/types/database';

export async function GET(request: NextRequest) {
  try {
    const demoCookie = request.cookies.get(DEMO_SESSION_COOKIE)?.value;
    if (demoCookie || !isSupabaseConfigured()) {
      return NextResponse.json({ complaints: getDemoComplaints() });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const priority = searchParams.get('priority');

    let query = supabase
      .from('complaints')
      .select('*, profiles(name, student_id, email, department)')
      .order('created_at', { ascending: false });

    // Enforce student ownership
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      query = query.eq('user_id', user.id);
    }

    if (status) query = query.eq('status', status);
    if (category) query = query.eq('category', category);
    if (priority) query = query.eq('priority', priority);
    if (search) {
      query = query.or(
        `complaint_id.ilike.%${search}%,title.ilike.%${search}%,description.ilike.%${search}%,location.ilike.%${search}%`
      );
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ complaints: data });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error).message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const parseResult = complaintSchema.safeParse(json);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues.map((e) => e.message).join('. ') },
        { status: 400 }
      );
    }

    const payload = parseResult.data;

    // Check demo mode
    const demoCookie = request.cookies.get(DEMO_SESSION_COOKIE)?.value;
    if (demoCookie || !isSupabaseConfigured()) {
      let studentId: string | undefined;
      if (demoCookie) {
        try {
          const profile = JSON.parse(demoCookie) as Profile;
          studentId = profile.id;
        } catch {
          // ignore
        }
      }
      const newComplaint = addDemoComplaint({
        ...payload,
        user_id: studentId || DEMO_STUDENT.id,
      });
      return NextResponse.json({ complaint: newComplaint }, { status: 201 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile name
    const { data: profile } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', user.id)
      .single();

    // Insert complaint
    const { data: complaint, error: insertErr } = await supabase
      .from('complaints')
      .insert({
        user_id: user.id,
        title: payload.title,
        description: payload.description,
        category: payload.category,
        location: payload.location,
        department: payload.department,
        priority: payload.priority,
      })
      .select()
      .single();

    if (insertErr) {
      return NextResponse.json({ error: insertErr.message }, { status: 500 });
    }

    // Insert initial status history
    await supabase.from('complaint_history').insert({
      complaint_id: complaint.id,
      changed_by_user_id: user.id,
      changed_by_name: profile?.name || 'Student User',
      old_status: null,
      new_status: 'Submitted',
      remarks: 'Initial complaint submission',
    });

    return NextResponse.json({ complaint }, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error).message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
