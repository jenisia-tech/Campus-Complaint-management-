import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ComplaintFilters } from '@/components/ComplaintFilters';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { getStatusBadge, getPriorityBadge, formatDate } from '@/lib/utils';
import type { Complaint, Profile } from '@/types/database';
import { ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';

interface AdminComplaintsPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    priority?: string;
    status?: string;
    department?: string;
  }>;
}

import { cookies } from 'next/headers';
import { DEMO_SESSION_COOKIE } from '@/lib/auth-demo';
import { getDemoComplaints } from '@/lib/demo-data';

export default async function AdminComplaintsPage({
  searchParams,
}: AdminComplaintsPageProps) {
  const params = await searchParams;
  const q = params.q?.trim().toLowerCase();
  const category = params.category;
  const priority = params.priority;
  const status = params.status;
  const department = params.department;

  const cookieStore = await cookies();
  const demoCookie = cookieStore.get(DEMO_SESSION_COOKIE)?.value;

  let complaints: Complaint[] = [];

  if (demoCookie) {
    const profile = JSON.parse(demoCookie) as Profile;
    if (profile.role !== 'admin') {
      redirect('/dashboard');
    }
    let demoList = getDemoComplaints();
    if (category && category !== 'All') {
      demoList = demoList.filter((c) => c.category === category);
    }
    if (priority && priority !== 'All') {
      demoList = demoList.filter((c) => c.priority === priority);
    }
    if (status && status !== 'All') {
      demoList = demoList.filter((c) => c.status === status);
    }
    if (department && department !== 'All') {
      demoList = demoList.filter((c) => c.department === department);
    }
    complaints = demoList;
  } else {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect('/login');
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      redirect('/dashboard');
    }

    // Base query with profiles join
    let query = supabase
      .from('complaints')
      .select('*, profiles(name, student_id, email, department)')
      .order('created_at', { ascending: false });

    if (category && category !== 'All') {
      query = query.eq('category', category);
    }
    if (priority && priority !== 'All') {
      query = query.eq('priority', priority);
    }
    if (status && status !== 'All') {
      query = query.eq('status', status);
    }
    if (department && department !== 'All') {
      query = query.eq('department', department);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching admin complaints:', error);
    }
    complaints = (data as unknown as Complaint[]) || [];
  }

  // In-memory text search
  if (q) {
    complaints = complaints.filter(
      (c) =>
        c.complaint_id.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q) ||
        (c.profiles?.name && c.profiles.name.toLowerCase().includes(q)) ||
        (c.profiles?.student_id && c.profiles.student_id.toLowerCase().includes(q)) ||
        (c.assigned_to && c.assigned_to.toLowerCase().includes(q))
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/admin"
              className="text-xs font-semibold text-primary-600 hover:text-primary-700 inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Campus Complaints Directory</h1>
          <p className="text-sm text-slate-500">
            Comprehensive registry of all student grievances across academic and facility departments
          </p>
        </div>

        <div className="text-xs font-medium text-slate-600 bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-2xs">
          Showing <span className="font-bold text-slate-900">{complaints.length}</span> complaints
        </div>
      </div>

      {/* Filter Toolbar */}
      <ComplaintFilters basePath="/admin/complaints" showDepartmentFilter={true} />

      {/* Complaints Table */}
      <Card className="border-slate-200 shadow-xs">
        <CardContent className="p-0">
          {complaints.length === 0 ? (
            <div className="p-8">
              <EmptyState
                title="No grievances matched the current filters"
                description="Try clearing the search query or resetting priority, category, or department filters."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Complaint ID</th>
                    <th className="py-3 px-4 font-semibold">Student Details</th>
                    <th className="py-3 px-4 font-semibold">Title & Category</th>
                    <th className="py-3 px-4 font-semibold">Responsible Dept</th>
                    <th className="py-3 px-4 font-semibold">Priority</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold">Assigned Staff</th>
                    <th className="py-3 px-4 font-semibold">Submitted</th>
                    <th className="py-3 px-4 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {complaints.map((c) => {
                    const statusMeta = getStatusBadge(c.status);
                    const prioMeta = getPriorityBadge(c.priority);

                    return (
                      <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-semibold text-xs text-primary-700">
                          {c.complaint_id}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-900 text-xs">
                            {c.profiles?.name || 'Student'}
                          </div>
                          <div className="text-xs text-slate-400">
                            {c.profiles?.student_id || c.profiles?.email || 'N/A'}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-900 line-clamp-1">{c.title}</div>
                          <div className="text-xs text-slate-500">{c.category} &bull; {c.location}</div>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-600">
                          {c.department}
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge className={prioMeta.className}>{prioMeta.label}</Badge>
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge className={statusMeta.className}>{statusMeta.label}</Badge>
                        </td>
                        <td className="py-3.5 px-4 text-xs">
                          {c.assigned_to ? (
                            <span className="font-medium text-slate-800">{c.assigned_to}</span>
                          ) : (
                            <span className="text-slate-400 italic">Unassigned</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-500 whitespace-nowrap">
                          {formatDate(c.created_at)}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Link href={`/admin/complaints/${c.id}`}>
                            <Button size="sm" variant="outline" className="text-xs">
                              Triage <ArrowRight className="w-3.5 h-3.5 ml-1" />
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

