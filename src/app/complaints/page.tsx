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
import type { Complaint } from '@/types/database';
import { PlusCircle, FileText, ArrowRight } from 'lucide-react';

interface ComplaintsPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    priority?: string;
    status?: string;
  }>;
}

export default async function ComplaintsPage({ searchParams }: ComplaintsPageProps) {
  const params = await searchParams;
  const q = params.q?.trim().toLowerCase();
  const category = params.category;
  const priority = params.priority;
  const status = params.status;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Base query (RLS restricts to user's complaints)
  let query = supabase
    .from('complaints')
    .select('*')
    .eq('user_id', user.id)
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

  let complaints: Complaint[] = (data as Complaint[]) || [];

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
          <h1 className="text-2xl font-bold text-slate-900">My Lodged Complaints</h1>
          <p className="text-sm text-slate-500">
            Track, filter, and inspect the real-time resolution status of your submissions
          </p>
        </div>

        <Link href="/complaints/new">
          <Button className="shadow-xs">
            <PlusCircle className="w-4 h-4 mr-2" />
            Lodge New Complaint
          </Button>
        </Link>
      </div>

      {/* Filter Toolbar */}
      <ComplaintFilters basePath="/complaints" showDepartmentFilter={false} />

      {/* Results Table */}
      <Card className="border-slate-200 shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base font-semibold">
            Records Found ({complaints.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
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
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-y border-slate-200">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Complaint ID</th>
                    <th className="py-3 px-4 font-semibold">Title & Category</th>
                    <th className="py-3 px-4 font-semibold">Campus Location</th>
                    <th className="py-3 px-4 font-semibold">Priority</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold">Last Updated</th>
                    <th className="py-3 px-4 text-right font-semibold">Action</th>
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
                          {formatDate(c.updated_at || c.created_at)}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Link href={`/complaints/${c.id}`}>
                            <Button variant="outline" size="sm" className="text-xs">
                              Inspect <ArrowRight className="w-3.5 h-3.5 ml-1" />
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
