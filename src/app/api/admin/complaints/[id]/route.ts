import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { adminUpdateSchema, isValidTransition } from '@/lib/validations/complaint';
import { DEMO_SESSION_COOKIE, isSupabaseConfigured } from '@/lib/auth-demo';
import { getStoredComplaintById, updateStoredComplaint, DEFAULT_ADMIN } from '@/lib/local-store';
import type { ComplaintStatus, Profile } from '@/types/database';

interface RouteContext {
  params: Promise<{ id: string }>;
}

function isUUID(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const { id: rawId } = await params;
    const json = await request.json();
    const parseResult = adminUpdateSchema.safeParse(json);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues.map((e) => e.message).join('. ') },
        { status: 400 }
      );
    }

    const payload = parseResult.data;
    const demoCookie = request.cookies.get(DEMO_SESSION_COOKIE)?.value;

    if (demoCookie || !isSupabaseConfigured()) {
      const existing = getStoredComplaintById(rawId);
      if (!existing) {
        return NextResponse.json({ error: 'Complaint not found.' }, { status: 404 });
      }

      if (payload.status && payload.status !== existing.status) {
        const allowed = isValidTransition(existing.status, payload.status as ComplaintStatus);
        if (!allowed) {
          return NextResponse.json(
            {
              error: `Invalid status workflow transition: Cannot move directly from '${existing.status}' to '${payload.status}'.`,
            },
            { status: 400 }
          );
        }
      }

      let adminUser: Profile = DEFAULT_ADMIN;
      if (demoCookie) {
        try {
          adminUser = JSON.parse(demoCookie) as Profile;
        } catch {
          return NextResponse.json({ error: 'Unauthorized: Invalid session.' }, { status: 401 });
        }
      } else {
        return NextResponse.json({ error: 'Unauthorized: Authentication required.' }, { status: 401 });
      }

      if (adminUser.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden: Administrator privileges required.' }, { status: 403 });
      }

      const updated = updateStoredComplaint(
        existing.id,
        {
          ...(payload.status ? { status: payload.status as ComplaintStatus } : {}),
          ...(payload.priority ? { priority: payload.priority } : {}),
          ...(payload.department ? { department: payload.department } : {}),
          ...(payload.assigned_to !== undefined ? { assigned_to: payload.assigned_to } : {}),
          ...(payload.admin_remarks !== undefined ? { admin_remarks: payload.admin_remarks } : {}),
          ...(payload.resolution_notes !== undefined ? { resolution_notes: payload.resolution_notes } : {}),
        },
        { id: adminUser.id, name: adminUser.name || 'Campus Administrator' }
      );

      return NextResponse.json({ complaint: updated });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Role verification
    const { data: profile } = await supabase
      .from('profiles')
      .select('name, role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Administrator privileges required.' },
        { status: 403 }
      );
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

    // Validate status transition if status is being updated
    if (payload.status && payload.status !== existing.status) {
      const allowed = isValidTransition(existing.status as ComplaintStatus, payload.status as ComplaintStatus);
      if (!allowed) {
        return NextResponse.json(
          {
            error: `Invalid status workflow transition: Cannot move directly from '${existing.status}' to '${payload.status}'.`,
          },
          { status: 400 }
        );
      }
    }

    const updateFields: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (payload.priority) updateFields.priority = payload.priority;
    if (payload.department) updateFields.department = payload.department;
    if (payload.assigned_to !== undefined) updateFields.assigned_to = payload.assigned_to;
    if (payload.admin_remarks !== undefined) updateFields.admin_remarks = payload.admin_remarks;
    if (payload.resolution_notes !== undefined) updateFields.resolution_notes = payload.resolution_notes;

    if (payload.status) {
      updateFields.status = payload.status;
      if (payload.status === 'Resolved' && !existing.resolved_at) {
        updateFields.resolved_at = new Date().toISOString();
      }
    }

    const { data: updated, error: updateErr } = await supabase
      .from('complaints')
      .update(updateFields)
      .eq('id', existing.id)
      .select()
      .single();

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    // Insert history record
    const newStatus = (payload.status || existing.status) as ComplaintStatus;
    const historyRemark =
      payload.remarks ||
      (payload.status && payload.status !== existing.status
        ? `Status updated to ${payload.status}`
        : payload.assigned_to
        ? `Assigned to ${payload.assigned_to}`
        : 'Complaint attributes updated by admin');

    await supabase.from('complaint_history').insert({
      complaint_id: existing.id,
      changed_by_user_id: user.id,
      changed_by_name: profile.name || 'Administrator',
      old_status: existing.status,
      new_status: newStatus,
      remarks: historyRemark,
    });

    return NextResponse.json({ complaint: updated });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error).message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
