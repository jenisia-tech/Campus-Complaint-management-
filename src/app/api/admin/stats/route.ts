import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { calculateAverageTurnaround } from '@/lib/utils';
import { DEMO_SESSION_COOKIE, isSupabaseConfigured } from '@/lib/auth-demo';
import { getDemoComplaints } from '@/lib/demo-data';
import type { Complaint, DashboardStats, Profile } from '@/types/database';

export async function GET(request: NextRequest) {
  try {
    const demoCookie = request.cookies.get(DEMO_SESSION_COOKIE)?.value;

    if (demoCookie || !isSupabaseConfigured()) {
      if (!demoCookie) {
        return NextResponse.json({ error: 'Unauthorized: Authentication required.' }, { status: 401 });
      }
      try {
        const profile = JSON.parse(demoCookie) as Profile;
        if (profile.role !== 'admin') {
          return NextResponse.json({ error: 'Forbidden: Administrator privileges required.' }, { status: 403 });
        }
      } catch {
        return NextResponse.json({ error: 'Unauthorized: Invalid session.' }, { status: 401 });
      }
      const allComplaints = getDemoComplaints();
      const total = allComplaints.length;
      const pending = allComplaints.filter((c) =>
        ['Submitted', 'Under Review', 'Assigned'].includes(c.status)
      ).length;
      const in_progress = allComplaints.filter((c) => c.status === 'In Progress').length;
      const resolved = allComplaints.filter((c) => c.status === 'Resolved').length;
      const closed = allComplaints.filter((c) => c.status === 'Closed').length;
      const critical = allComplaints.filter((c) => c.priority === 'Critical').length;

      const catMap: Record<string, number> = {};
      const statusMap: Record<string, number> = {};
      const prioMap: Record<string, number> = {};
      const deptMap: Record<string, number> = {};

      allComplaints.forEach((c) => {
        catMap[c.category] = (catMap[c.category] || 0) + 1;
        statusMap[c.status] = (statusMap[c.status] || 0) + 1;
        prioMap[c.priority] = (prioMap[c.priority] || 0) + 1;
        if (c.department) {
          deptMap[c.department] = (deptMap[c.department] || 0) + 1;
        }
      });

      const categories = Object.entries(catMap).map(([category, count]) => ({ category, count }));
      const statuses = Object.entries(statusMap).map(([status, count]) => ({ status, count }));
      const priorities = Object.entries(prioMap).map(([priority, count]) => ({ priority, count }));
      const departments = Object.entries(deptMap).map(([department, count]) => ({ department, count }));
      const avg_resolution_hours = calculateAverageTurnaround(allComplaints);
      const recent = allComplaints.slice(0, 5);

      const stats: DashboardStats = {
        total,
        pending,
        in_progress,
        resolved,
        closed,
        critical,
        avg_resolution_hours,
        categories,
        statuses,
        priorities,
        departments,
        recent,
      };

      return NextResponse.json({ stats });
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parallelize role verification and complaints retrieval
    const [profileRes, complaintsRes] = await Promise.all([
      supabase.from('profiles').select('role').eq('id', user.id).single(),
      supabase
        .from('complaints')
        .select('*, profiles(name, student_id, email)')
        .order('created_at', { ascending: false }),
    ]);

    const profile = profileRes.data;
    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const complaints = complaintsRes.data;
    const fetchError = complaintsRes.error;

    if (fetchError) {
      console.error('Admin stats fetch error:', fetchError);
      return NextResponse.json(
        { error: 'Failed to compute dashboard statistics' },
        { status: 500 }
      );
    }

    const allComplaints: Complaint[] = (complaints as unknown as Complaint[]) || [];

    const total = allComplaints.length;
    const pending = allComplaints.filter((c) =>
      ['Submitted', 'Under Review', 'Assigned'].includes(c.status)
    ).length;
    const in_progress = allComplaints.filter((c) => c.status === 'In Progress').length;
    const resolved = allComplaints.filter((c) => c.status === 'Resolved').length;
    const closed = allComplaints.filter((c) => c.status === 'Closed').length;
    const critical = allComplaints.filter((c) => c.priority === 'Critical').length;

    const catMap: Record<string, number> = {};
    const statusMap: Record<string, number> = {};
    const prioMap: Record<string, number> = {};
    const deptMap: Record<string, number> = {};

    allComplaints.forEach((c) => {
      catMap[c.category] = (catMap[c.category] || 0) + 1;
      statusMap[c.status] = (statusMap[c.status] || 0) + 1;
      prioMap[c.priority] = (prioMap[c.priority] || 0) + 1;
      if (c.department) {
        deptMap[c.department] = (deptMap[c.department] || 0) + 1;
      }
    });

    const categories = Object.entries(catMap).map(([category, count]) => ({
      category,
      count,
    }));
    const statuses = Object.entries(statusMap).map(([status, count]) => ({
      status,
      count,
    }));
    const priorities = Object.entries(prioMap).map(([priority, count]) => ({
      priority,
      count,
    }));
    const departments = Object.entries(deptMap).map(([department, count]) => ({
      department,
      count,
    }));

    const avg_resolution_hours = calculateAverageTurnaround(allComplaints);
    const recent = allComplaints.slice(0, 5);

    const stats: DashboardStats = {
      total,
      pending,
      in_progress,
      resolved,
      closed,
      critical,
      avg_resolution_hours,
      categories,
      statuses,
      priorities,
      departments,
      recent,
    };

    return NextResponse.json({ stats });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error).message || 'Internal server error' },
      { status: 500 }
    );
  }
}
