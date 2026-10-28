import React from 'react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ComplaintTimeline } from '@/components/ComplaintTimeline';
import { AdminActionForm } from '@/components/AdminActionForm';
import { getStatusBadge, getPriorityBadge, formatDate } from '@/lib/utils';
import type { Complaint, ComplaintHistory, Profile } from '@/types/database';
import {
  ArrowLeft,
  User,
  GraduationCap,
  Mail,
  MapPin,
  Building2,
  Calendar,
  ShieldCheck,
  Tag
} from 'lucide-react';

interface AdminComplaintDetailPageProps {
  params: Promise<{ id: string }>;
}

import { cookies } from 'next/headers';
import { DEMO_SESSION_COOKIE } from '@/lib/auth-demo';
import { getDemoComplaints, getDemoHistory } from '@/lib/demo-data';

export default async function AdminComplaintDetailPage({
  params,
}: AdminComplaintDetailPageProps) {
  const { id } = await params;
  const cookieStore = await cookies();
  const demoCookie = cookieStore.get(DEMO_SESSION_COOKIE)?.value;

  let complaint: Complaint | null = null;
  let history: ComplaintHistory[] = [];

  if (demoCookie) {
    const profile = JSON.parse(demoCookie) as Profile;
    if (profile.role !== 'admin') {
      redirect('/dashboard');
    }
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

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      redirect('/dashboard');
    }

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
    <div className="max-w-5xl mx-auto py-4 space-y-6">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/complaints"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Complaints Registry
        </Link>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-primary-600" />
          <span>Admin Triage Mode</span>
        </div>
      </div>

      {/* Main Grievance Details & Student Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-primary-800 bg-primary-50 px-2.5 py-1 rounded-md border border-primary-200">
                    {complaint.complaint_id}
                  </span>
                  <Badge className={prioMeta.className}>{prioMeta.label} Priority</Badge>
                  <Badge className={statusMeta.className}>{statusMeta.label}</Badge>
                </div>
                <span className="text-xs text-slate-500">
                  Lodged: {formatDate(complaint.created_at)}
                </span>
              </div>

              <CardTitle className="text-2xl font-bold text-slate-900 leading-snug">
                {complaint.title}
              </CardTitle>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs text-slate-600 border-t border-slate-100">
                <div className="flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-slate-400 shrink-0" />
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
                  <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>
                    <strong className="text-slate-700">Dept:</strong> {complaint.department}
                  </span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div>
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Complaint Description
                </h4>
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {complaint.description}
                </div>
              </div>

              {/* Existing Remarks / Resolution */}
              {(complaint.admin_remarks || complaint.resolution_notes || complaint.assigned_to) && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Current Maintenance Assignment &amp; Notes
                  </h4>
                  {complaint.assigned_to && (
                    <div className="text-xs text-slate-800">
                      <strong>Assigned Lead:</strong> {complaint.assigned_to}
                    </div>
                  )}
                  {complaint.admin_remarks && (
                    <div className="text-xs text-slate-800">
                      <strong>Remarks:</strong> {complaint.admin_remarks}
                    </div>
                  )}
                  {complaint.resolution_notes && (
                    <div className="text-xs text-slate-800">
                      <strong>Resolution Notes:</strong> {complaint.resolution_notes}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Chronological Audit Trail */}
          <ComplaintTimeline history={history} />
        </div>

        {/* Sidebar: Student Profile & Action Form */}
        <div className="space-y-6">
          {/* Complainant Information Card */}
          <Card className="border-slate-200 shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <User className="w-4 h-4 text-primary-600" />
                Complainant Student Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-slate-600">
              <div>
                <div className="text-slate-400">Student Name</div>
                <div className="font-semibold text-slate-900 text-sm">
                  {complaint.profiles?.name || 'N/A'}
                </div>
              </div>

              <div>
                <div className="text-slate-400">Roll / Student ID</div>
                <div className="font-mono font-medium text-slate-800">
                  {complaint.profiles?.student_id || 'N/A'}
                </div>
              </div>

              <div>
                <div className="text-slate-400">Academic Department</div>
                <div className="font-medium text-slate-800">
                  {complaint.profiles?.department || 'N/A'}
                </div>
              </div>

              <div>
                <div className="text-slate-400">Email Address</div>
                <div className="font-medium text-slate-800 break-all">
                  {complaint.profiles?.email || 'N/A'}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Administrative Action & Status Advancement Form */}
          <AdminActionForm complaint={complaint} />
        </div>
      </div>
    </div>
  );
}

