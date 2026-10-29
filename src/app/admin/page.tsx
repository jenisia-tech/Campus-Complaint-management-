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
import type { Complaint, Profile, ComplaintType } from '@/types/database';
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
  Flame,
  Home,
  Building2,
  LayoutDashboard
} from 'lucide-react';

import { cookies } from 'next/headers';
import { DEMO_SESSION_COOKIE, isSupabaseConfigured } from '@/lib/auth-demo';
import { getStoredComplaints, DEFAULT_ADMIN } from '@/lib/local-store';

interface AdminDashboardProps {
  searchParams?: Promise<{ type?: string }>;
}

export default async function AdminDashboardPage({ searchParams }: AdminDashboardProps) {
  const cookieStore = await cookies();
  const demoCookie = cookieStore.get(DEMO_SESSION_COOKIE)?.value;
  const params = searchParams ? await searchParams : {};
  const activeType = params.type as ComplaintType | undefined;

  let profile: Profile | null = null;
  let allComplaints: Complaint[] = [];

  if (demoCookie) {
    try {
      profile = JSON.parse(demoCookie) as Profile;
      if (profile.role !== 'admin') {
        redirect('/dashboard?error=unauthorized_admin');
      }
      // In local evaluation mode, load the complete persistent ledger for admin review
      allComplaints = getStoredComplaints();
    } catch {
      redirect('/login');
    }
  } else if (!isSupabaseConfigured()) {
    redirect('/login?next=/admin');
  } else {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect('/login');
    }

    const [profileRes, complaintsRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase
        .from('complaints')
        .select('*, profiles(name, student_id, email, department)')
        .order('created_at', { ascending: false }),
    ]);

    profile = (profileRes.data as Profile) || null;

    if (profile?.role !== 'admin') {
      redirect('/dashboard');
    }

    allComplaints = (complaintsRes.data as unknown as Complaint[]) || [];
  }

  // Segment complaints into Hostel vs College
  const hostelComplaints = allComplaints.filter(
    (c) => c.complaint_type === 'Hostel' || c.category === 'Hostel facilities'
  );
  const collegeComplaints = allComplaints.filter(
    (c) => c.complaint_type !== 'Hostel' && c.category !== 'Hostel facilities'
  );

  const displayedComplaints =
    activeType === 'Hostel'
      ? hostelComplaints
      : activeType === 'College'
      ? collegeComplaints
      : allComplaints;

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

  const recentComplaints = displayedComplaints.slice(0, 8);

  return (
    <div className="space-y-8">
      {/* Admin Notepad Header */}
      <div className="bg-white dark:bg-notepad-darkCard border border-notepad-border dark:border-notepad-darkBorder rounded-2xl p-6 sm:p-8 shadow-xs relative overflow-hidden transition-colors">
        {/* Top Header Binder Line */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-navy-900 via-teal-600 to-teal-400" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-1">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 text-xs font-semibold font-mono">
              <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>Admin Triage &amp; Resolution Desk</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Campus Infrastructure Review
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Review, assign, and update status for all student grievances across hostel and college facilities
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link href="/dashboard">
              <Button size="md" variant="outline" className="border-notepad-border dark:border-notepad-darkBorder text-slate-700 dark:text-slate-200">
                <LayoutDashboard className="w-4 h-4 mr-1.5 text-amber-500" />
                Student Desk
              </Button>
            </Link>
            <Link href="/admin/complaints">
              <Button size="md" className="bg-teal-600 hover:bg-teal-500 text-white shadow-xs font-semibold">
                <SlidersHorizontal className="w-4 h-4 mr-1.5" />
                Full Ledger ({total})
              </Button>
            </Link>
            <Link href="/admin/reports">
              <Button variant="outline" size="md" className="border-notepad-border dark:border-notepad-darkBorder text-slate-700 dark:text-slate-200">
                <FileBarChart className="w-4 h-4 mr-1.5" />
                Reports
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Two Complaint Types Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Hostel Complaints Summary */}
        <Link
          href="/admin?type=Hostel"
          className={`p-5 rounded-xl border transition-all flex items-center justify-between ${
            activeType === 'Hostel'
              ? 'bg-amber-100/90 dark:bg-amber-950/70 border-amber-400 ring-2 ring-amber-400/30'
              : 'bg-white dark:bg-notepad-darkCard border-notepad-border dark:border-notepad-darkBorder hover:border-amber-300'
          }`}
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center">
              <Home className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs uppercase font-bold text-amber-800 dark:text-amber-400 font-mono tracking-wider">
                Type 1
              </div>
              <div className="font-bold text-base text-slate-900 dark:text-slate-100">
                Hostel Complaints
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Room maintenance, washrooms, mess, water &amp; electrical
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
              {hostelComplaints.length}
            </span>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Entries</div>
          </div>
        </Link>

        {/* College Complaints Summary */}
        <Link
          href="/admin?type=College"
          className={`p-5 rounded-xl border transition-all flex items-center justify-between ${
            activeType === 'College'
              ? 'bg-blue-100/90 dark:bg-blue-950/70 border-blue-400 ring-2 ring-blue-400/30'
              : 'bg-white dark:bg-notepad-darkCard border-notepad-border dark:border-notepad-darkBorder hover:border-blue-300'
          }`}
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 flex items-center justify-center">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs uppercase font-bold text-blue-800 dark:text-blue-400 font-mono tracking-wider">
                Type 2
              </div>
              <div className="font-bold text-base text-slate-900 dark:text-slate-100">
                College Complaints
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Classrooms, laboratories, campus Wi-Fi &amp; library
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-blue-600 dark:text-blue-400 font-mono">
              {collegeComplaints.length}
            </span>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Entries</div>
          </div>
        </Link>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Grievances"
          value={total}
          description="Across campus facilities"
          icon={<ListTodo className="w-5 h-5 text-teal-600 dark:text-teal-400" />}
        />
        <StatCard
          title="Pending Action"
          value={pending}
          description="Needs assignment/review"
          icon={<Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
        />
        <StatCard
          title="In Progress"
          value={inProgress}
          description="Under active maintenance"
          icon={<TrendingUp className="w-5 h-5 text-teal-600 dark:text-teal-400" />}
        />
        <StatCard
          title="Critical Issues"
          value={critical}
          description="Urgent priority attention"
          icon={<Flame className="w-5 h-5 text-rose-600 dark:text-rose-400" />}
        />
        <StatCard
          title="Avg. Turnaround"
          value={`${avgTurnaround}h`}
          description="Resolution time"
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
        />
      </div>

      {/* Chart Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-notepad-border dark:border-notepad-darkBorder bg-white dark:bg-notepad-darkCard shadow-xs">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Grievances by Category
            </CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <CategoryChart data={categoryStats} />
          </CardContent>
        </Card>

        <Card className="border-notepad-border dark:border-notepad-darkBorder bg-white dark:bg-notepad-darkCard shadow-xs">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Complaints by Status Lifecycle
            </CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <StatusChart data={statusStats} />
          </CardContent>
        </Card>
      </div>

      {/* Active Triage Queue */}
      <Card className="border-notepad-border dark:border-notepad-darkBorder bg-white dark:bg-notepad-darkCard shadow-xs">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-notepad-border dark:border-notepad-darkBorder gap-3">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Grievance Triage Queue
              </CardTitle>
              {activeType && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 font-bold font-mono">
                  {activeType} Only
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Review student issues, assign technicians, and update resolution progress
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <Link href="/admin">
              <Button
                variant={!activeType ? 'primary' : 'outline'}
                size="sm"
                className={`text-xs ${!activeType ? 'bg-teal-600 hover:bg-teal-700 text-white' : ''}`}
              >
                All ({allComplaints.length})
              </Button>
            </Link>
            <Link href="/admin?type=Hostel">
              <Button
                variant={activeType === 'Hostel' ? 'primary' : 'outline'}
                size="sm"
                className={`text-xs ${activeType === 'Hostel' ? 'bg-amber-500 hover:bg-amber-600 text-white' : ''}`}
              >
                Hostel ({hostelComplaints.length})
              </Button>
            </Link>
            <Link href="/admin?type=College">
              <Button
                variant={activeType === 'College' ? 'primary' : 'outline'}
                size="sm"
                className={`text-xs ${activeType === 'College' ? 'bg-teal-700 hover:bg-teal-800 text-white' : ''}`}
              >
                College ({collegeComplaints.length})
              </Button>
            </Link>
          </div>
        </CardHeader>

        <CardContent className="pt-4">
          {recentComplaints.length === 0 ? (
            <EmptyState
              title={activeType ? `No ${activeType} complaints pending` : 'No complaints in triage queue'}
              description="Campus facilities are currently operating normally."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider border-y border-notepad-border dark:border-notepad-darkBorder">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Ref ID</th>
                    <th className="py-3 px-4 font-semibold">Type</th>
                    <th className="py-3 px-4 font-semibold">Student</th>
                    <th className="py-3 px-4 font-semibold">Title &amp; Category</th>
                    <th className="py-3 px-4 font-semibold">Priority</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold">Assigned Lead</th>
                    <th className="py-3 px-4 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
                  {recentComplaints.map((c) => {
                    const statusMeta = getStatusBadge(c.status);
                    const prioMeta = getPriorityBadge(c.priority);
                    const isHostel = c.complaint_type === 'Hostel' || c.category === 'Hostel facilities';

                    return (
                      <tr key={c.id} className="hover:bg-teal-50/40 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-semibold text-xs text-slate-900 dark:text-slate-100">
                          {c.complaint_id}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md font-mono ${
                              isHostel
                                ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                                : 'bg-teal-50 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800'
                            }`}
                          >
                            {isHostel ? <Home className="w-3 h-3" /> : <Building2 className="w-3 h-3" />}
                            {isHostel ? 'Hostel' : 'College'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-900 dark:text-slate-100 text-xs">
                            {c.profiles?.name || 'Student'}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {c.profiles?.student_id || c.profiles?.email || 'N/A'}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">{c.title}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {c.category} &bull; {c.location}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge className={prioMeta.className}>{prioMeta.label}</Badge>
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge className={statusMeta.className}>{statusMeta.label}</Badge>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-300">
                          {c.assigned_to || <span className="text-slate-400 italic">Unassigned</span>}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Link href={`/admin/complaints/${c.id}`}>
                            <Button size="sm" variant="outline" className="text-xs border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950/50">
                              Review &amp; Triage
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
