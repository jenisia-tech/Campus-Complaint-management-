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
import { DEMO_SESSION_COOKIE } from '@/lib/auth-demo';
import { getDemoComplaints, getDemoHistory } from '@/lib/demo-data';

export default async function ComplaintDetailPage({ params }: ComplaintDetailPageProps) {
  const { id } = await params;
  const cookieStore = await cookies();
  const demoCookie = cookieStore.get(DEMO_SESSION_COOKIE)?.value;

  let complaint: Complaint | null = null;
  let history: ComplaintHistory[] = [];
  let isAdmin = false;

  if (demoCookie) {
    const profile = JSON.parse(demoCookie) as Profile;
    isAdmin = profile.role === 'admin';
    const allDemo = getDemoComplaints();
    const found = allDemo.find((c) => c.id === id || c.complaint_id === id);
    if (!found) notFound();
    complaint = found;
    const historyMap = getDemoHistory();
    history = historyMap[complaint.complaint_id] || [];
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

    const profile = profileData as Profile | null;
    isAdmin = profile?.role === 'admin';

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    let query = supabase
      .from('complaints')
      .select('*, profiles(name, student_id, email, department)');

    if (isUUID) {
      query = query.eq('id', id);
    } else {
      query = query.eq('complaint_id', id);
    }

    const { data: complaintData, error: complaintError } = await query.single();
    if (complaintError || !complaintData) {
      notFound();
    }
    complaint = complaintData as unknown as Complaint;

    if (!isAdmin && complaint.user_id !== user.id) {
      notFound();
    }

    const { data: historyData } = await supabase
      .from('complaint_history')
      .select('*')
      .eq('complaint_id', complaint.id)
      .order('created_at', { ascending: true });

    history = (historyData as ComplaintHistory[]) || [];
  }

  const statusMeta = getStatusBadge(complaint.status);
  const prioMeta = getPriorityBadge(complaint.priority);

  return (
    <div className="max-w-4xl mx-auto py-4 space-y-6">
      {/* Navigation header */}
      <div className="flex items-center justify-between">
        <Link
          href={isAdmin ? '/admin/complaints' : '/complaints'}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {isAdmin ? 'Back to All Complaints' : 'Back to My Complaints'}
        </Link>

        {isAdmin && (
          <Link href={`/admin/complaints/${complaint.id}`}>
            <Button size="sm" variant="secondary" className="gap-1.5">
              <ShieldCheck className="w-4 h-4 text-primary-700" />
              Open in Admin Triage
            </Button>
          </Link>
        )}
      </div>

      {/* Main Complaint Header Card */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-primary-800 bg-primary-50 px-2.5 py-1 rounded-md border border-primary-200">
                {complaint.complaint_id}
              </span>
              <Badge className={prioMeta.className}>{prioMeta.label} Priority</Badge>
              <Badge className={statusMeta.className}>{statusMeta.label}</Badge>
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Lodged: {formatDate(complaint.created_at)}</span>
            </div>
          </div>

          <CardTitle className="text-2xl font-bold text-slate-900 leading-snug">
            {complaint.title}
          </CardTitle>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs text-slate-600 border-t border-slate-100">
            <div className="flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
              <span>
                <strong className="text-slate-700">Category:</strong> {complaint.category}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <span>
                <strong className="text-slate-700">Location:</strong> {complaint.location}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-slate-400 shrink-0" />
              <span>
                <strong className="text-slate-700">Dept:</strong> {complaint.department}
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div>
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Detailed Description
            </h4>
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
              {complaint.description}
            </div>
          </div>

          {/* Admin remarks & resolution box if available */}
          {(complaint.admin_remarks || complaint.resolution_notes || complaint.assigned_to) && (
            <div className="bg-primary-50/60 border border-primary-200/80 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-primary-900 uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-primary-700" />
                <span>Administrative Triage &amp; Resolution Details</span>
              </div>

              {complaint.assigned_to && (
                <div className="text-xs text-primary-900">
                  <strong>Assigned Technician / Lead:</strong>{' '}
                  <span className="font-medium">{complaint.assigned_to}</span>
                </div>
              )}

              {complaint.admin_remarks && (
                <div className="text-xs text-primary-900">
                  <strong>Administrator Remarks:</strong>{' '}
                  <p className="mt-0.5 text-slate-700 bg-white p-2.5 rounded-lg border border-primary-100">
                    {complaint.admin_remarks}
                  </p>
                </div>
              )}

              {complaint.resolution_notes && (
                <div className="text-xs text-primary-900">
                  <strong>Official Resolution Notes:</strong>{' '}
                  <p className="mt-0.5 text-slate-700 bg-white p-2.5 rounded-lg border border-primary-100 font-mono text-xs">
                    {complaint.resolution_notes}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Student Actions: Edit / Withdraw only if status === 'Submitted' */}
          {!isAdmin && (
            <div className="pt-2 border-t border-slate-100">
              {complaint.status === 'Submitted' ? (
                <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="text-xs text-slate-600">
                    <p className="font-semibold text-slate-800">Need to modify or cancel?</p>
                    <p>
                      Because this ticket is in <code className="text-primary-700 font-bold">Submitted</code> state,
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
                <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
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
