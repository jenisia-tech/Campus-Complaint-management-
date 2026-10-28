import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { CategoryChart } from '@/components/CategoryChart';
import { StatusChart } from '@/components/StatusChart';
import { EmptyState } from '@/components/ui/EmptyState';
import { getStatusBadge, getPriorityBadge, formatDate, calculateAverageTurnaround } from '@/lib/utils';
import type { Complaint, Profile, DashboardStats } from '@/types/database';
import {
  ShieldCheck,
  ListTodo,
  Clock,
  CheckCircle2,
  AlertOctagon,
  FileBarChart,
  ArrowRight,
  TrendingUp,
  SlidersHorizontal,
  Flame
} from 'lucide-react';

import { cookies } from 'next/headers';
import { DEMO_SESSION_COOKIE } from '@/lib/auth-demo';
import { getDemoComplaints } from '@/lib/demo-data';

export default async function AdminDashboardPage() {
  const cookieStore = await cookies();
  const demoCookie = cookieStore.get(DEMO_SESSION_COOKIE)?.value;

  let profile: Profile | null = null;
  let allComplaints: Complaint[] = [];

  if (demoCookie) {
    try {
      profile = JSON.parse(demoCookie) as Profile;
      if (profile.role !== 'admin') {
        redirect('/dashboard');
      }
      allComplaints = getDemoComplaints();
    } catch {
      redirect('/login');
    }
  } else {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect('/login');
    }

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    profile = profileData as Profile | null;

    if (profile?.role !== 'admin') {
      redirect('/dashboard');
    }

    // Fetch complaints with student profile
    const { data: complaintsData, error } = await supabase
      .from('complaints')
      .select('*, profiles(name, student_id, email, department)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Admin dashboard error:', error);
    }

    allComplaints = (complaintsData as unknown as Complaint[]) || [];
  }

  // Compute live statistics
  const total = allComplaints.length;
  const pending = allComplaints.filter((c) =>
    ['Submitted', 'Under Review', 'Assigned'].includes(c.status)
  ).length;
  const inProgress = allComplaints.filter((c) => c.status === 'In Progress').length;
  const resolved = allComplaints.filter((c) => ['Resolved', 'Closed'].includes(c.status)).length;
  const critical = allComplaints.filter((c) => c.priority === 'Critical').length;
  const avgTurnaround = calculateAverageTurnaround(allComplaints);

  // Groupings for charts
  const catMap: Record<string, number> = {};
  const statusMap: Record<string, number> = {};

  allComplaints.forEach((c) => {
    catMap[c.category] = (catMap[c.category] || 0) + 1;
    statusMap[c.status] = (statusMap[c.status] || 0) + 1;
  });

  const categoryStats = Object.entries(catMap).map(([category, count]) => ({
    category,
    count,
  }));

  const statusStats = Object.entries(statusMap).map(([status, count]) => ({
    status,
    count,
  }));

  const recentComplaints = allComplaints.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-slate-900 via-primary-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/20 text-primary-300 border border-primary-500/30 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Administrator Control Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Campus Infrastructure Triage
          </h1>
          <p className="text-sm text-slate-300">
            Signed in as <strong className="text-white">{profile?.name}</strong> &bull; System Role: <strong className="text-emerald-400">Campus Administrator</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link href="/admin/complaints">
            <Button size="lg" className="bg-primary-600 hover:bg-primary-500 text-white shadow-sm font-semibold">
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Manage All Complaints
            </Button>
          </Link>
          <Link href="/admin/reports">
            <Button variant="outline" size="lg" className="border-slate-600 text-slate-200 hover:bg-slate-800">
              <FileBarChart className="w-4 h-4 mr-2" />
              Analytics &amp; Reports
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Grievances"
          value={total}
          description="Campus-wide submissions"
          icon={<ListTodo className="w-5 h-5 text-blue-600" />}
        />
        <StatCard
          title="Pending Action"
          value={pending}
          description="Needs assignment/review"
          icon={<Clock className="w-5 h-5 text-amber-600" />}
        />
        <StatCard
          title="In Progress"
          value={inProgress}
          description="Under active maintenance"
          icon={<TrendingUp className="w-5 h-5 text-indigo-600" />}
        />
        <StatCard
          title="Critical Issues"
          value={critical}
          description="Immediate attention required"
          icon={<Flame className="w-5 h-5 text-rose-600" />}
        />
        <StatCard
          title="Avg. Resolution"
          value={`${avgTurnaround}h`}
          description="Average turnaround time"
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
        />
      </div>

      {/* Chart Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-slate-200 shadow-xs">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Grievances by Category</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <CategoryChart data={categoryStats} />
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-xs">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Complaints by Status Lifecycle</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <StatusChart data={statusStats} />
          </CardContent>
        </Card>
      </div>

      {/* Recent Triage Queue */}
      <Card className="border-slate-200 shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle>Recent Grievance Queue</CardTitle>
            <p className="text-xs text-slate-500 mt-1">
              Latest incoming student complaints requiring administrative evaluation
            </p>
          </div>
          <Link href="/admin/complaints" className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1">
            Open Directory ({total}) <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </CardHeader>
        <CardContent>
          {recentComplaints.length === 0 ? (
            <EmptyState
              title="No complaints in queue"
              description="The campus maintenance ticket queue is currently empty."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-y border-slate-200">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Complaint ID</th>
                    <th className="py-3 px-4 font-semibold">Student</th>
                    <th className="py-3 px-4 font-semibold">Title & Category</th>
                    <th className="py-3 px-4 font-semibold">Priority</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold">Assigned Lead</th>
                    <th className="py-3 px-4 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {recentComplaints.map((c) => {
                    const statusMeta = getStatusBadge(c.status);
                    const prioMeta = getPriorityBadge(c.priority);

                    return (
                      <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-semibold text-xs text-slate-900">
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
                        <td className="py-3.5 px-4">
                          <Badge className={prioMeta.className}>{prioMeta.label}</Badge>
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge className={statusMeta.className}>{statusMeta.label}</Badge>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-600">
                          {c.assigned_to || <span className="text-slate-400 italic">Unassigned</span>}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Link href={`/admin/complaints/${c.id}`}>
                            <Button size="sm" variant="outline" className="text-xs">
                              Triage Ticket
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

