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
import type { Complaint, Profile } from '@/types/database';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  PlusCircle,
  ArrowRight,
  ListFilter,
  User,
  GraduationCap
} from 'lucide-react';

import { cookies } from 'next/headers';
import { DEMO_SESSION_COOKIE } from '@/lib/auth-demo';
import { getDemoComplaints } from '@/lib/demo-data';

export default async function StudentDashboardPage() {
  const cookieStore = await cookies();
  const demoCookie = cookieStore.get(DEMO_SESSION_COOKIE)?.value;

  let profile: Profile | null = null;
  let complaints: Complaint[] = [];

  if (demoCookie) {
    try {
      profile = JSON.parse(demoCookie) as Profile;
      if (profile.role === 'admin') {
        redirect('/admin');
      }
      complaints = getDemoComplaints();
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

    if (profile?.role === 'admin') {
      redirect('/admin');
    }

    const { data: complaintsData } = await supabase
      .from('complaints')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    complaints = (complaintsData as Complaint[]) || [];
  }

  const total = complaints.length;
  const pending = complaints.filter((c) =>
    ['Submitted', 'Under Review', 'Assigned'].includes(c.status)
  ).length;
  const inProgress = complaints.filter((c) => c.status === 'In Progress').length;
  const resolved = complaints.filter((c) => ['Resolved', 'Closed'].includes(c.status)).length;

  const recentComplaints = complaints.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Student Welcome Banner */}
      <div className="bg-gradient-to-r from-primary-900 to-indigo-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-primary-200 text-xs font-medium">
            <GraduationCap className="w-4 h-4" />
            <span>Student Facility Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Welcome back, {profile?.name || profile?.email?.split('@')[0] || 'Student'}
          </h1>
          <p className="text-sm text-primary-200 flex flex-wrap items-center gap-3">
            <span>Roll: <strong className="text-white">{profile?.student_id || 'N/A'}</strong></span>
            <span>&bull;</span>
            <span>Dept: <strong className="text-white">{profile?.department || 'General'}</strong></span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link href="/complaints/new">
            <Button size="lg" className="bg-white text-primary-900 hover:bg-primary-50 font-semibold shadow-sm">
              <PlusCircle className="w-5 h-5 mr-2 text-primary-700" />
              Lodge New Complaint
            </Button>
          </Link>
          <Link href="/complaints">
            <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10">
              <ListFilter className="w-4 h-4 mr-2" />
              My Complaints Directory
            </Button>
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Complaints Lodged"
          value={total}
          description="All time submissions"
          icon={<FileText className="w-5 h-5 text-blue-600" />}
        />
        <StatCard
          title="Pending Review"
          value={pending}
          description="Awaiting assignment"
          icon={<Clock className="w-5 h-5 text-amber-600" />}
        />
        <StatCard
          title="In Progress"
          value={inProgress}
          description="Being resolved by technician"
          icon={<AlertTriangle className="w-5 h-5 text-indigo-600" />}
        />
        <StatCard
          title="Resolved & Closed"
          value={resolved}
          description="Successfully completed"
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
        />
      </div>

      {/* Recent Submissions */}
      <Card className="border-slate-200 shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle>Recent Complaints</CardTitle>
            <p className="text-xs text-slate-500 mt-1">
              Your latest 5 reported issues and their live status
            </p>
          </div>
          {complaints.length > 0 && (
            <Link href="/complaints" className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1">
              View all ({complaints.length}) <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </CardHeader>
        <CardContent>
          {recentComplaints.length === 0 ? (
            <EmptyState
              title="No complaints submitted yet"
              description="Have you noticed any faulty infrastructure, Wi-Fi outages, or facility issues? Report it directly to campus maintenance."
              actionLabel="Lodge Your First Complaint"
              actionHref="/complaints/new"
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-y border-slate-200">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Reference ID</th>
                    <th className="py-3 px-4 font-semibold">Title & Category</th>
                    <th className="py-3 px-4 font-semibold">Location</th>
                    <th className="py-3 px-4 font-semibold">Priority</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold">Submitted</th>
                    <th className="py-3 px-4 text-right font-semibold">Actions</th>
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
                          <div className="font-semibold text-slate-900 line-clamp-1">{c.title}</div>
                          <div className="text-xs text-slate-500">{c.category}</div>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-600">{c.location}</td>
                        <td className="py-3.5 px-4">
                          <Badge className={prioMeta.className}>{prioMeta.label}</Badge>
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge className={statusMeta.className}>{statusMeta.label}</Badge>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-500 whitespace-nowrap">
                          {formatDate(c.created_at)}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Link href={`/complaints/${c.id}`}>
                            <Button variant="ghost" size="sm" className="text-primary-600 hover:text-primary-700">
                              View Details
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

