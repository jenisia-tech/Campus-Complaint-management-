import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { getStatusBadge, getPriorityBadge, formatDate } from '@/lib/utils';
import type { Complaint, Profile, ComplaintType } from '@/types/database';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  PlusCircle,
  ArrowRight,
  ListFilter,
  User,
  GraduationCap,
  Building2,
  Home,
  ShieldCheck,
  Layers
} from 'lucide-react';

import { cookies } from 'next/headers';
import { DEMO_SESSION_COOKIE, isSupabaseConfigured } from '@/lib/auth-demo';
import { getStoredComplaints } from '@/lib/local-store';

interface StudentDashboardProps {
  searchParams?: Promise<{ type?: string; error?: string }>;
}

export default async function StudentDashboardPage({ searchParams }: StudentDashboardProps) {
  const cookieStore = await cookies();
  const demoCookie = cookieStore.get(DEMO_SESSION_COOKIE)?.value;
  const params = searchParams ? await searchParams : {};
  const activeType = params.type as ComplaintType | undefined;
  const dashboardError = params.error;

  let profile: Profile | null = null;
  let allUserComplaints: Complaint[] = [];

  if (demoCookie) {
    try {
      profile = JSON.parse(demoCookie) as Profile;
      if (profile.role === 'admin') {
        redirect('/admin');
      }
      // Strictly load ONLY complaints filed by this specific student (NO JUNK VALUES)
      allUserComplaints = getStoredComplaints({ userId: profile.id });
    } catch {
      redirect('/login');
    }
  } else if (!isSupabaseConfigured()) {
    redirect('/login');
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
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
    ]);

    profile = (profileRes.data as Profile) || null;

    if (profile?.role === 'admin') {
      redirect('/admin');
    }

    allUserComplaints = (complaintsRes.data as Complaint[]) || [];
  }

  // Segment complaints into Hostel vs. College
  const hostelComplaints = allUserComplaints.filter(
    (c) => c.complaint_type === 'Hostel' || c.category === 'Hostel facilities'
  );
  const collegeComplaints = allUserComplaints.filter(
    (c) => c.complaint_type !== 'Hostel' && c.category !== 'Hostel facilities'
  );

  const displayedComplaints =
    activeType === 'Hostel'
      ? hostelComplaints
      : activeType === 'College'
      ? collegeComplaints
      : allUserComplaints;

  const total = allUserComplaints.length;
  const pending = allUserComplaints.filter((c) =>
    ['Submitted', 'Under Review', 'Assigned'].includes(c.status)
  ).length;
  const inProgress = allUserComplaints.filter((c) => c.status === 'In Progress').length;
  const resolved = allUserComplaints.filter((c) => ['Resolved', 'Closed'].includes(c.status)).length;

  const recentComplaints = displayedComplaints.slice(0, 6);

  return (
    <div className="space-y-8">
      {dashboardError && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-sm flex items-center gap-3 shadow-xs">
          <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
          <span className="font-medium">
            {dashboardError === 'unauthorized_admin'
              ? 'Server Authorization Denied: Access to Administrator Desk requires verified admin role privileges.'
              : dashboardError === 'unauthorized_complaint'
              ? 'Access Denied: You are restricted from viewing or modifying grievances filed by another student.'
              : dashboardError}
          </span>
        </div>
      )}

      {/* Student Welcome Notepad Header */}
      <div className="bg-white dark:bg-notepad-darkCard border border-notepad-border dark:border-notepad-darkBorder rounded-2xl p-6 sm:p-8 shadow-xs relative overflow-hidden transition-colors">
        {/* Top Binder Accent */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-navy-900 via-teal-600 to-teal-400" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-1">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 text-xs font-semibold font-mono">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Student Grievance Notepad</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 dark:text-slate-100 tracking-tight">
              Welcome back, {profile?.name || 'Student'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 flex flex-wrap items-center gap-3">
              <span>Roll: <strong className="text-navy-900 dark:text-white font-mono">{profile?.student_id || 'Not Set'}</strong></span>
              <span>&bull;</span>
              <span>Dept: <strong className="text-navy-900 dark:text-white">{profile?.department || 'General'}</strong></span>
              {profile?.hostel_block && (
                <>
                  <span>&bull;</span>
                  <span>Hostel: <strong className="text-navy-900 dark:text-white">{profile.hostel_block}</strong></span>
                </>
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link href="/complaints/new">
              <Button size="md" className="bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-400 text-white dark:text-slate-900 font-semibold shadow-xs">
                <PlusCircle className="w-4 h-4 mr-2" />
                Lodge Grievance
              </Button>
            </Link>
            <Link href="/profile">
              <Button variant="outline" size="md" className="border-notepad-border dark:border-notepad-darkBorder text-slate-700 dark:text-slate-200 hover:bg-teal-50/50 dark:hover:bg-campus-darkSurface">
                <User className="w-4 h-4 mr-1.5" />
                Edit Profile
              </Button>
            </Link>
            <Link href="/complaints">
              <Button variant="outline" size="md" className="border-notepad-border dark:border-notepad-darkBorder text-slate-700 dark:text-slate-200 hover:bg-teal-50/50 dark:hover:bg-campus-darkSurface">
                <ListFilter className="w-4 h-4 mr-1.5" />
                Complaints Ledger &rarr;
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Two Types of Grievance Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Hostel Complaints Card */}
        <Link
          href="/dashboard?type=Hostel"
          className={`p-5 rounded-xl border transition-all flex items-center justify-between ${
            activeType === 'Hostel'
              ? 'bg-teal-50 dark:bg-teal-950/70 border-teal-500 dark:border-teal-600 ring-2 ring-teal-400/30'
              : 'bg-white dark:bg-notepad-darkCard border-notepad-border dark:border-notepad-darkBorder hover:border-teal-400'
          }`}
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-teal-50 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 flex items-center justify-center">
              <Home className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs uppercase font-bold text-teal-800 dark:text-teal-400 font-mono tracking-wider">
                Type 1
              </div>
              <div className="font-bold text-base text-navy-900 dark:text-slate-100">
                Hostel Grievances
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Rooms, mess, water, geysers, Wi-Fi &amp; cleanliness
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-teal-700 dark:text-teal-400 font-mono">
              {hostelComplaints.length}
            </span>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Entries</div>
          </div>
        </Link>

        {/* College Complaints Card */}
        <Link
          href="/dashboard?type=College"
          className={`p-5 rounded-xl border transition-all flex items-center justify-between ${
            activeType === 'College'
              ? 'bg-teal-50 dark:bg-teal-950/70 border-teal-500 dark:border-teal-600 ring-2 ring-teal-400/30'
              : 'bg-white dark:bg-notepad-darkCard border-notepad-border dark:border-notepad-darkBorder hover:border-teal-400'
          }`}
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-navy-50 dark:bg-navy-900/60 text-navy-900 dark:text-teal-300 border border-navy-200 dark:border-navy-700 flex items-center justify-center">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs uppercase font-bold text-navy-800 dark:text-teal-400 font-mono tracking-wider">
                Type 2
              </div>
              <div className="font-bold text-base text-navy-900 dark:text-slate-100">
                College Grievances
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Classrooms, labs, library, transport &amp; departments
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-navy-900 dark:text-teal-400 font-mono">
              {collegeComplaints.length}
            </span>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Entries</div>
          </div>
        </Link>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Submissions"
          value={total}
          description="Your personal entries"
          icon={<FileText className="w-5 h-5 text-amber-600" />}
        />
        <StatCard
          title="Under Review"
          value={pending}
          description="Awaiting assignment"
          icon={<Clock className="w-5 h-5 text-amber-500" />}
        />
        <StatCard
          title="In Progress"
          value={inProgress}
          description="Assigned to technician"
          icon={<AlertTriangle className="w-5 h-5 text-indigo-500" />}
        />
        <StatCard
          title="Resolved & Closed"
          value={resolved}
          description="Completed by department"
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
        />
      </div>

      {/* Complaints Ledger Card */}
      <Card className="border-notepad-border dark:border-notepad-darkBorder bg-white dark:bg-notepad-darkCard shadow-xs">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-notepad-border dark:border-notepad-darkBorder gap-3">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg font-bold text-navy-900 dark:text-slate-100">
                Complaints Ledger
              </CardTitle>
              {activeType && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 font-bold font-mono">
                  {activeType} Only
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Strictly displays your personal complaints (saved persistently)
            </p>
          </div>

          {/* Type Filter Buttons */}
          <div className="flex items-center gap-1.5">
            <Link href="/dashboard">
              <Button
                variant={!activeType ? 'primary' : 'outline'}
                size="sm"
                className={`text-xs ${!activeType ? 'bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-400 text-white dark:text-slate-900 font-semibold' : ''}`}
              >
                All ({allUserComplaints.length})
              </Button>
            </Link>
            <Link href="/dashboard?type=Hostel">
              <Button
                variant={activeType === 'Hostel' ? 'primary' : 'outline'}
                size="sm"
                className={`text-xs ${activeType === 'Hostel' ? 'bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-400 text-white dark:text-slate-900 font-semibold' : ''}`}
              >
                Hostel ({hostelComplaints.length})
              </Button>
            </Link>
            <Link href="/dashboard?type=College">
              <Button
                variant={activeType === 'College' ? 'primary' : 'outline'}
                size="sm"
                className={`text-xs ${activeType === 'College' ? 'bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-400 text-white dark:text-slate-900 font-semibold' : ''}`}
              >
                College ({collegeComplaints.length})
              </Button>
            </Link>
          </div>
        </CardHeader>

        <CardContent className="pt-4">
          {recentComplaints.length === 0 ? (
            <EmptyState
              title={
                activeType
                  ? `No ${activeType} complaints filed yet`
                  : 'Your complaint ledger is clean'
              }
              description={
                activeType
                  ? `You haven't reported any ${activeType.toLowerCase()} grievances yet. Notice a problem in your ${activeType === 'Hostel' ? 'hostel room or bathroom' : 'classroom or campus'}? File an entry now.`
                  : 'No complaints have been submitted under your account. When you submit any issue, it is saved persistently here.'
              }
              actionLabel="Lodge New Complaint"
              actionHref="/complaints/new"
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider border-y border-notepad-border dark:border-notepad-darkBorder">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Ref ID</th>
                    <th className="py-3 px-4 font-semibold">Type</th>
                    <th className="py-3 px-4 font-semibold">Title &amp; Category</th>
                    <th className="py-3 px-4 font-semibold">Location</th>
                    <th className="py-3 px-4 font-semibold">Priority</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold">Submitted</th>
                    <th className="py-3 px-4 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
                  {recentComplaints.map((c) => {
                    const statusMeta = getStatusBadge(c.status);
                    const prioMeta = getPriorityBadge(c.priority);
                    const isHostel = c.complaint_type === 'Hostel' || c.category === 'Hostel facilities';

                    return (
                      <tr key={c.id} className="hover:bg-teal-50/40 dark:hover:bg-campus-darkSurface/50 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-semibold text-xs text-navy-900 dark:text-teal-300">
                          {c.complaint_id}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md font-mono ${
                              isHostel
                                ? 'bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800'
                                : 'bg-navy-50 dark:bg-navy-950 text-navy-900 dark:text-slate-200 border border-navy-200 dark:border-navy-700'
                            }`}
                          >
                            {isHostel ? <Home className="w-3 h-3" /> : <Building2 className="w-3 h-3" />}
                            {isHostel ? 'Hostel' : 'College'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-navy-900 dark:text-slate-100 line-clamp-1">{c.title}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">{c.category}</div>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-300">{c.location}</td>
                        <td className="py-3.5 px-4">
                          <Badge className={prioMeta.className}>{prioMeta.label}</Badge>
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge className={statusMeta.className}>{statusMeta.label}</Badge>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {formatDate(c.created_at)}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Link href={`/complaints/${c.id}`}>
                            <Button variant="ghost" size="sm" className="text-amber-600 dark:text-amber-400 hover:text-amber-700">
                              View Entry
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
