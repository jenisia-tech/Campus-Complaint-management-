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
import type { Complaint, Profile, ComplaintType } from '@/types/database';
import { PlusCircle, FileText, ArrowRight, Home, Building2 } from 'lucide-react';

interface ComplaintsPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    priority?: string;
    status?: string;
    type?: string;
  }>;
}

import { cookies } from 'next/headers';
import { DEMO_SESSION_COOKIE, isSupabaseConfigured } from '@/lib/auth-demo';
import { getStoredComplaints } from '@/lib/local-store';

export default async function ComplaintsPage({ searchParams }: ComplaintsPageProps) {
  const params = await searchParams;
  const q = params.q?.trim().toLowerCase();
  const category = params.category;
  const priority = params.priority;
  const status = params.status;
  const type = params.type as ComplaintType | undefined;

  const cookieStore = await cookies();
  const demoCookie = cookieStore.get(DEMO_SESSION_COOKIE)?.value;

  let complaints: Complaint[] = [];

  if (demoCookie) {
    let profile: Profile | null = null;
    try {
      profile = JSON.parse(demoCookie) as Profile;
    } catch {}

    // Campus-wide complaints ledger: all submitted grievances are visible across student accounts
    let demoList = getStoredComplaints({
      type: type || undefined,
    });

    if (category && category !== 'All') {
      demoList = demoList.filter((c) => c.category === category);
    }
    if (priority && priority !== 'All') {
      demoList = demoList.filter((c) => c.priority === priority);
    }
    if (status && status !== 'All') {
      demoList = demoList.filter((c) => c.status === status);
    }
    complaints = demoList;
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

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching complaints:', error);
    }
    complaints = (data as Complaint[]) || [];
  }

  // In-memory text search across title, description, complaint_id, and location
  if (q) {
    complaints = complaints.filter(
      (c) =>
        c.complaint_id.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q)
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 dark:text-slate-100 tracking-tight">
            Campus Complaints Ledger
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Campus-wide grievance ledger — view, track, and inspect all hostel &amp; college issues submitted across campus
          </p>
        </div>

        <Link href="/complaints/new">
          <Button className="bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-400 text-white dark:text-slate-900 font-semibold shadow-xs">
            <PlusCircle className="w-4 h-4 mr-2" />
            Lodge New Complaint
          </Button>
        </Link>
      </div>

      {/* Filter Toolbar */}
      <ComplaintFilters basePath="/complaints" showDepartmentFilter={false} />

      {/* Results Table */}
      <Card className="border-notepad-border dark:border-notepad-darkBorder bg-white dark:bg-notepad-darkCard shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-notepad-border dark:border-notepad-darkBorder">
          <CardTitle className="text-base font-bold text-navy-900 dark:text-slate-100">
            Records Found ({complaints.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {complaints.length === 0 ? (
            <EmptyState
              title="No matching complaints found"
              description="Try adjusting your search keywords or filter criteria, or submit a new grievance."
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
                    <th className="py-3 px-4 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
                  {complaints.map((c) => {
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
                          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 flex-wrap">
                            <span>{c.category}</span>
                            {c.profiles?.name && (
                              <>
                                <span>&bull;</span>
                                <span className="text-teal-700 dark:text-teal-400 font-medium">By: {c.profiles.name}</span>
                              </>
                            )}
                          </div>
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
                            <Button variant="ghost" size="sm" className="text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300">
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
