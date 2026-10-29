
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { complaintSchema } from '@/lib/validations/complaint';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
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

    if (status) query = query.eq('status', status);
    if (category) query = query.eq('category', category);
    if (priority) query = query.eq('priority', priority);

    if (search) {
      const safeSearch = search.replace(/[,%()]/g, ' ').trim();

      if (safeSearch) {
        query = query.or(
          `complaint_id.ilike.%${safeSearch}%,title.ilike.%${safeSearch}%,description.ilike.%${safeSearch}%,location.ilike.%${safeSearch}%`
        );
      }
    }

    // Database RLS controls which complaints this user can access.
    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ complaints: data });
  } catch {
    return NextResponse.json(
      { error: 'Unable to load complaints.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const result = complaintSchema.safeParse(json);

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error.issues
            .map((issue) => issue.message)
            .join('. '),
        },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

    const payload = result.data;

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Your user profile was not found. Please contact the administrator.' },
        { status: 403 }
      );
    }

    // The user ID comes from the verified session, not the request body.
    // The database trigger generates the complaint reference number.
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
      })
      .select()
      .single();

    if (insertError || !complaint) {
      return NextResponse.json(
        { error: insertError?.message || 'Unable to save complaint.' },
        { status: 500 }
      );
    }

    // complaint_history references the text complaint_id,
    // not the complaint row's UUID.
    const { error: historyError } = await supabase
      .from('complaint_history')
      .insert({
        complaint_id: complaint.complaint_id,
        changed_by_user_id: user.id,
        changed_by_name: profile.name,
        old_status: null,
        new_status: 'Submitted',
        remarks: 'Initial complaint submission',
      });

    if (historyError) {
      return NextResponse.json(
        {
          error: 'The complaint was saved, but its history entry failed. Please contact the administrator.',
          complaint,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Complaint submitted successfully.',
        complaint,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: 'An unexpected error occurred while processing the complaint.' },
      { status: 500 }
    );
  }
}
