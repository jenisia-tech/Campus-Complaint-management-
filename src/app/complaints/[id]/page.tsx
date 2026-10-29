import React from 'react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ComplaintTimeline } from '@/components/ComplaintTimeline';
import { StudentActionForm } from '@/components/StudentActionForm';
import { getStatusBadge, getPriorityBadge, formatDate } from '@/lib/utils';
import type { Complaint, ComplaintHistory, Profile } from '@/types/database';
import {
  ArrowLeft,
  MapPin,
  Building2,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Edit3,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

interface ComplaintDetailPageProps {
  params: Promise<{ id: string }>;
}

import { cookies } from 'next/headers';
import { DEMO_SESSION_COOKIE, isSupabaseConfigured } from '@/lib/auth-demo';
import { getDemoComplaints, getDemoHistory } from '@/lib/demo-data';

export default async function ComplaintDetailPage({ params }: ComplaintDetailPageProps) {
  const { id } = await params;
  const cookieStore = await cookies();
  const demoCookie = cookieStore.get(DEMO_SESSION_COOKIE)?.value;

  let complaint: Complaint | null = null;
  let history: ComplaintHistory[] = [];
  let isAdmin = false;
  let currentUserId: string | null = null;

  if (demoCookie) {
    const profile = JSON.parse(demoCookie) as Profile;
    isAdmin = profile.role === 'admin';
    currentUserId = profile.id;
    const allDemo = getDemoComplaints();
    const found = allDemo.find((c) => c.id === id || c.complaint_id === id);
    if (!found) notFound();
    complaint = found;
    const historyMap = getDemoHistory();
    history = historyMap[complaint.complaint_id] || [];
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
    currentUserId = user.id;

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    let complaintQuery = supabase
      .from('complaints')
      .select('*, profiles(name, student_id, email, department)');

    if (isUUID) {
      complaintQuery = complaintQuery.eq('id', id);
    } else {
      complaintQuery = complaintQuery.eq('complaint_id', id);
    }

    // Parallel fetch profile & complaint
    const [profileRes, complaintRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      complaintQuery.single(),
    ]);

    const profile = (profileRes.data as Profile) || null;
    isAdmin = profile?.role === 'admin';

    if (complaintRes.error || !complaintRes.data) {
      notFound();
    }
    complaint = complaintRes.data as unknown as Complaint;

    const { data: historyData } = await supabase
      .from('complaint_history')
      .select('*')
      .eq('complaint_id', complaint.id)
      .order('created_at', { ascending: true });

    history = (historyData as ComplaintHistory[]) || [];
  }

  const isOwner = Boolean(currentUserId && complaint.user_id === currentUserId);
  const statusMeta = getStatusBadge(complaint.status);
  const prioMeta = getPriorityBadge(complaint.priority);

  return (
    <div className="max-w-4xl mx-auto py-4 space-y-6">
      {/* Navigation header */}
      <div className="flex items-center justify-between">
        <Link
          href="/complaints"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Complaints Ledger
        </Link>
      </div>

      {/* Main Complaint Header Card */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-sm font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/80 px-2.5 py-1 rounded-md border border-amber-200 dark:border-amber-800">
                {complaint.complaint_id}
              </span>
              <span
                className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-md font-mono ${
                  complaint.complaint_type === 'Hostel' || complaint.category === 'Hostel facilities'
                    ? 'bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800'
                    : 'bg-navy-50 dark:bg-navy-950 text-navy-900 dark:text-slate-200 border border-navy-200 dark:border-navy-700'
                }`}
              >
                {complaint.complaint_type === 'Hostel' || complaint.category === 'Hostel facilities'
                  ? 'Hostel Grievance'
                  : 'College Grievance'}
              </span>
              <Badge className={prioMeta.className}>{prioMeta.label} Priority</Badge>
              <Badge className={statusMeta.className}>{statusMeta.label}</Badge>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Lodged: {formatDate(complaint.created_at)}</span>
            </div>
          </div>

          <CardTitle className="text-2xl font-bold text-navy-900 dark:text-slate-100 leading-snug">
            {complaint.title}
          </CardTitle>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 text-xs text-slate-600 dark:text-slate-300 border-t border-notepad-border dark:border-notepad-darkBorder">
            <div className="flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
              <span>
                <strong className="text-slate-700 dark:text-slate-200">Category:</strong> {complaint.category}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <span>
                <strong className="text-slate-700 dark:text-slate-200">Location:</strong> {complaint.location}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-slate-400 shrink-0" />
              <span>
                <strong className="text-slate-700 dark:text-slate-200">Dept:</strong> {complaint.department}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-slate-400 shrink-0" />
              <span>
                <strong className="text-slate-700 dark:text-slate-200">Author:</strong> {complaint.profiles?.name || 'Student'} {isOwner ? '(You)' : ''}
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div>
            <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Detailed Description
            </h4>
            <div className="bg-slate-50 dark:bg-campus-darkSurface border border-notepad-border dark:border-notepad-darkBorder rounded-xl p-4 text-sm text-navy-900 dark:text-slate-100 whitespace-pre-wrap leading-relaxed">
              {complaint.description}
            </div>
          </div>

          {/* Admin remarks & resolution box if available */}
          {(complaint.admin_remarks || complaint.resolution_notes || complaint.assigned_to) && (
            <div className="bg-teal-50/60 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-800/60 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-teal-900 dark:text-teal-300 uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>Administrative Triage &amp; Resolution Details</span>
              </div>

              {complaint.assigned_to && (
                <div className="text-xs text-navy-900 dark:text-slate-200">
                  <strong>Assigned Technician / Lead:</strong>{' '}
                  <span className="font-medium">{complaint.assigned_to}</span>
                </div>
              )}

              {complaint.admin_remarks && (
                <div className="text-xs text-navy-900 dark:text-slate-200">
                  <strong>Administrator Remarks:</strong>{' '}
                  <p className="mt-0.5 text-slate-700 dark:text-slate-200 bg-white dark:bg-campus-darkCard p-2.5 rounded-lg border border-teal-100 dark:border-teal-900/60">
                    {complaint.admin_remarks}
                  </p>
                </div>
              )}

              {complaint.resolution_notes && (
                <div className="text-xs text-navy-900 dark:text-slate-200">
                  <strong>Official Resolution Notes:</strong>{' '}
                  <p className="mt-0.5 text-slate-700 dark:text-slate-200 bg-white dark:bg-campus-darkCard p-2.5 rounded-lg border border-teal-100 dark:border-teal-900/60 font-mono text-xs">
                    {complaint.resolution_notes}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Student Actions: Edit / Withdraw only if logged-in student is author */}
          {isOwner && (
            <div className="pt-2 border-t border-notepad-border dark:border-notepad-darkBorder">
              {complaint.status === 'Submitted' ? (
                <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-campus-darkSurface p-4 rounded-xl border border-notepad-border dark:border-notepad-darkBorder">
                  <div className="text-xs text-slate-600 dark:text-slate-300">
                    <p className="font-semibold text-navy-900 dark:text-slate-100">Need to modify or cancel?</p>
                    <p>
                      Because this ticket is in <code className="text-teal-700 dark:text-teal-300 font-bold">Submitted</code> state,
                      you may update details or withdraw it.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/complaints/${complaint.id}/edit`}>
                      <Button size="sm" variant="outline" className="gap-1.5">
                        <Edit3 className="w-3.5 h-3.5" /> Edit Details
                      </Button>
                    </Link>
                    <StudentActionForm complaint={complaint} />
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-campus-darkSurface p-3.5 rounded-xl border border-notepad-border dark:border-notepad-darkBorder">
                  <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>
                    This complaint has advanced to <strong className="text-slate-700">{complaint.status}</strong>.
                    Per college policy, tickets under review or in progress cannot be directly edited by students.
                  </span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Audit History Timeline */}
      <ComplaintTimeline history={history} />
    </div>
  );
}
