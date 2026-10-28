import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { complaintUpdateSchema } from '@/lib/validations/complaint';

interface RouteContext {
  params: Promise<{ id: string }>;
}

function isUUID(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const { id: rawId } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify complaint ownership & status (support UUID or CMP-YYYY-XXXX)
    let query = supabase.from('complaints').select('*');
    if (isUUID(rawId)) {
      query = query.eq('id', rawId);
    } else {
      query = query.eq('complaint_id', rawId);
    }

    const { data: existing, error: fetchErr } = await query.single();

    if (fetchErr || !existing) {
      return NextResponse.json({ error: 'Complaint not found.' }, { status: 404 });
    }

    if (existing.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden: You can only edit your own complaints.' },
        { status: 403 }
      );
    }

    if (existing.status !== 'Submitted') {
      return NextResponse.json(
        {
          error: `Editing is restricted. Complaint is currently in '${existing.status}' status and can only be modified while 'Submitted'.`,
        },
        { status: 400 }
      );
    }

    const json = await request.json();
    const parseResult = complaintUpdateSchema.safeParse(json);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues.map((e) => e.message).join('. ') },
        { status: 400 }
      );
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', user.id)
      .single();

    const payload = parseResult.data;

    // Update complaint
    const { data: updated, error: updateErr } = await supabase
      .from('complaints')
      .update({
        title: payload.title,
        description: payload.description,
        category: payload.category,
        location: payload.location,
        department: payload.department,
        priority: payload.priority,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
      .select()
      .single();

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    // Record audit entry
    await supabase.from('complaint_history').insert({
      complaint_id: existing.id,
      changed_by_user_id: user.id,
      changed_by_name: profile?.name || 'Student User',
      old_status: 'Submitted',
      new_status: 'Submitted',
      remarks: 'Complaint details updated by student',
    });

    return NextResponse.json({ complaint: updated });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error).message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const { id: rawId } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let query = supabase.from('complaints').select('*');
    if (isUUID(rawId)) {
      query = query.eq('id', rawId);
    } else {
      query = query.eq('complaint_id', rawId);
    }

    const { data: existing, error: fetchErr } = await query.single();

    if (fetchErr || !existing) {
      return NextResponse.json({ error: 'Complaint not found.' }, { status: 404 });
    }

    if (existing.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden: You can only withdraw your own complaints.' },
        { status: 403 }
      );
    }

    if (existing.status !== 'Submitted') {
      return NextResponse.json(
        {
          error: `Cannot withdraw complaint. Current status is '${existing.status}'. Withdrawals are only permitted while 'Submitted'.`,
        },
        { status: 400 }
      );
    }

    let reason = '';
    try {
      const body = await request.json();
      reason = body?.reason || '';
    } catch {
      // optional reason
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', user.id)
      .single();

    // Mark as Closed with withdrawal remark
    const { data: updated, error: updateErr } = await supabase
      .from('complaints')
      .update({
        status: 'Closed',
        admin_remarks: reason ? `Withdrawn by student. Reason: ${reason}` : 'Withdrawn by student.',
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
      .select()
      .single();

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    // Record audit trail
    await supabase.from('complaint_history').insert({
      complaint_id: existing.id,
      changed_by_user_id: user.id,
      changed_by_name: profile?.name || 'Student User',
      old_status: 'Submitted',
      new_status: 'Closed',
      remarks: reason ? `Student withdrew complaint: ${reason}` : 'Complaint withdrawn by student',
    });

    return NextResponse.json({
      message: 'Complaint successfully withdrawn and marked as Closed.',
      complaint: updated,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error).message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
