import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CategoryChart } from '@/components/CategoryChart';
import { StatusChart } from '@/components/StatusChart';
import { calculateAverageTurnaround } from '@/lib/utils';
import type { Complaint, Profile } from '@/types/database';
import { PrintButton } from '@/components/PrintButton';
import { ArrowLeft, Layers, Building2 } from 'lucide-react';

import { cookies } from 'next/headers';
import { DEMO_SESSION_COOKIE } from '@/lib/auth-demo';
import { getDemoComplaints } from '@/lib/demo-data';

export default async function AdminReportsPage() {
  const cookieStore = await cookies();
  const demoCookie = cookieStore.get(DEMO_SESSION_COOKIE)?.value;

  let complaints: Complaint[] = [];

  if (demoCookie) {
    const profile = JSON.parse(demoCookie) as Profile;
    if (profile.role !== 'admin') {
      redirect('/dashboard');
    }
    complaints = getDemoComplaints();
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

    const { data: complaintsData, error } = await supabase
      .from('complaints')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Reports fetch error:', error);
    }
    complaints = (complaintsData as Complaint[]) || [];
  }
  const total = complaints.length;

  const catMap: Record<string, number> = {};
  const statusMap: Record<string, number> = {};
  const deptMap: Record<string, number> = {};
  const prioMap: Record<string, number> = {};

  complaints.forEach((c) => {
    catMap[c.category] = (catMap[c.category] || 0) + 1;
    statusMap[c.status] = (statusMap[c.status] || 0) + 1;
    deptMap[c.department] = (deptMap[c.department] || 0) + 1;
    prioMap[c.priority] = (prioMap[c.priority] || 0) + 1;
  });

  const categoryStats = Object.entries(catMap)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);

  const statusStats = Object.entries(statusMap)
    .map(([status, count]) => ({ status, count }))
    .sort((a, b) => b.count - a.count);

  const deptStats = Object.entries(deptMap)
    .map(([department, count]) => ({ department, count }))
    .sort((a, b) => b.count - a.count);

  const avgTurnaround = calculateAverageTurnaround(complaints);
  const resolvedCount = (statusMap['Resolved'] || 0) + (statusMap['Closed'] || 0);
  const resolutionRate = total > 0 ? Math.round((resolvedCount / total) * 100) : 0;

  return (
    <div className="space-y-8 py-4">
      {/* Header and Print Control */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <Link
            href="/admin"
            className="text-xs font-semibold text-primary-600 hover:text-primary-700 inline-flex items-center gap-1 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">
            Campus Grievance &amp; Resolution Analytics
          </h1>
          <p className="text-sm text-slate-500">
            Official Software Engineering IA3 evaluation report generated from live Supabase records
          </p>
        </div>

        <PrintButton />
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Complaints
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-2">{total}</div>
          <div className="text-xs text-slate-500 mt-1">Grievances filed to date</div>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Resolution Rate
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 mt-2">{resolutionRate}%</div>
          <div className="text-xs text-slate-500 mt-1">{resolvedCount} of {total} closed or resolved</div>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Avg Turnaround Time
          </div>
          <div className="text-3xl font-extrabold text-indigo-600 mt-2">{avgTurnaround}h</div>
          <div className="text-xs text-slate-500 mt-1">From submission to resolved</div>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Active Workload
          </div>
          <div className="text-3xl font-extrabold text-amber-600 mt-2">
            {total - resolvedCount}
          </div>
          <div className="text-xs text-slate-500 mt-1">Pending review or maintenance</div>
        </div>
      </div>

      {/* Visual Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 no-print">
        <Card className="border-slate-200 shadow-xs">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Distribution by Category</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <CategoryChart data={categoryStats} />
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-xs">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Distribution by Workflow Status</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <StatusChart data={statusStats} />
          </CardContent>
        </Card>
      </div>

      {/* Breakdown Tables for Academic Record */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Breakdown Table */}
        <Card className="border-slate-200 shadow-xs">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary-600" />
              Category Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-y border-slate-200">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Category</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Count</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Share (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {categoryStats.map((item) => {
                  const pct = total > 0 ? ((item.count / total) * 100).toFixed(1) : '0';
                  return (
                    <tr key={item.category} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-4 font-medium text-slate-900">{item.category}</td>
                      <td className="py-2.5 px-4 text-right font-semibold">{item.count}</td>
                      <td className="py-2.5 px-4 text-right text-slate-500">{pct}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Department Breakdown Table */}
        <Card className="border-slate-200 shadow-xs">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-600" />
              Responsible Department Load
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-y border-slate-200">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Department</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Assigned</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Share (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {deptStats.map((item) => {
                  const pct = total > 0 ? ((item.count / total) * 100).toFixed(1) : '0';
                  return (
                    <tr key={item.department} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-4 font-medium text-slate-900">{item.department}</td>
                      <td className="py-2.5 px-4 text-right font-semibold">{item.count}</td>
                      <td className="py-2.5 px-4 text-right text-slate-500">{pct}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
