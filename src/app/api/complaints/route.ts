import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { complaintSchema } from '@/lib/validations/complaint';

export async function GET(request: NextRequest) {
  try {
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

    // Enforce student ownership (RLS also reinforces this at DB level)
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
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
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

    const json = await request.json();
    const parseResult = complaintSchema.safeParse(json);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.errors.map((e) => e.message).join('. ') },
        { status: 400 }
      );
    }

    const payload = parseResult.data;

    // 1. Insert complaint (trigger sets unique CMP-YYYY-XXXX automatically)
    const { data: complaint, error: insertError } = await supabase
      .from('complaints')
      .insert({
        user_id: user.id,
        title: payload.title,
        description: payload.description,
        category: payload.category,
        location: payload.location,
        department: payload.department,
        priority: payload.priority,
        status: 'Submitted',
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // 2. Record initial history entry
    await supabase.from('complaint_history').insert({
      complaint_id: complaint.complaint_id,
      changed_by_user_id: user.id,
      changed_by_name: profile?.name || 'Student User',
      old_status: null,
      new_status: 'Submitted',
      remarks: 'Complaint submitted by student',
    });

    return NextResponse.json({ complaint }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
