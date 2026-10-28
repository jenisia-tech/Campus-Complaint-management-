'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { complaintUpdateSchema } from '@/lib/validations/complaint';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import type { ComplaintCategory, ComplaintPriority, Complaint } from '@/types/database';
import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/auth-demo';
import { getDemoComplaints } from '@/lib/demo-data';

const CATEGORIES: ComplaintCategory[] = [
  'Classroom and infrastructure',
  'Laboratory equipment',
  'Hostel facilities',
  'Electricity and lighting',
  'Wi-Fi and internet',
  'Water and sanitation',
  'Library facilities',
  'Transportation',
  'Food and canteen',
  'Other',
];

const DEPARTMENTS = [
  'Estate Maintenance & Civil Works',
  'Electrical & Power Systems',
  'Campus IT & Wi-Fi Network',
  'Laboratory & Workshop Management',
  'Hostel Administration & Housing',
  'Water Supply & Sanitation Facility',
  'Central Library Services',
  'Campus Transport & Logistics',
  'Canteen & Food Quality Control',
  'General Administration',
];

const PRIORITIES: ComplaintPriority[] = ['Low', 'Medium', 'High', 'Critical'];

export default function EditComplaintPage() {
  const router = useRouter();
  const params = useParams();
  const complaintId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Classroom and infrastructure' as ComplaintCategory,
    location: '',
    department: 'Estate Maintenance & Civil Works',
    priority: 'Medium' as ComplaintPriority,
  });

  useEffect(() => {
    async function loadComplaint() {
      if (!complaintId) return;
      try {
        if (!isSupabaseConfigured()) {
          const allDemo = getDemoComplaints();
          const complaint = allDemo.find((c) => c.id === complaintId || c.complaint_id === complaintId);
          if (!complaint) {
            setErrorMessage('Complaint not found.');
            setLoading(false);
            return;
          }
          if (complaint.status !== 'Submitted') {
            router.replace(`/complaints/${complaint.id}`);
            return;
          }
          setFormData({
            title: complaint.title,
            description: complaint.description,
            category: complaint.category,
            location: complaint.location,
            department: complaint.department,
            priority: complaint.priority,
          });
          setLoading(false);
          return;
        }

        const supabase = createClient();
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(complaintId);

        let query = supabase.from('complaints').select('*');
        if (isUUID) {
          query = query.eq('id', complaintId);
        } else {
          query = query.eq('complaint_id', complaintId);
        }

        const { data, error } = await query.single();

        if (error || !data) {
          setErrorMessage('Could not load complaint details.');
          setLoading(false);
          return;
        }

        const complaint = data as Complaint;

        if (complaint.status !== 'Submitted') {
          router.replace(`/complaints/${complaint.id}`);
          return;
        }

        setFormData({
          title: complaint.title,
          description: complaint.description,
          category: complaint.category,
          location: complaint.location,
          department: complaint.department,
          priority: complaint.priority,
        });
      } catch (err: unknown) {
        setErrorMessage((err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    loadComplaint();
  }, [complaintId, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const validation = complaintUpdateSchema.safeParse(formData);
    if (!validation.success) {
      setErrorMessage(validation.error.issues[0]?.message || 'Please fix invalid fields');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/complaints/${complaintId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'Failed to update complaint.');
      }

      router.push(`/complaints/${complaintId}`);
      router.refresh();
    } catch (err: unknown) {
      setErrorMessage((err as Error).message);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center text-slate-500">
        Loading complaint for editing...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-4 space-y-6">
      <Link
        href={`/complaints/${complaintId}`}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Cancel and return to Complaint
      </Link>

      <Card className="border-slate-200 shadow-md">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Edit Submitted Complaint</CardTitle>
          <CardDescription>
            You may update details while this complaint remains in <strong className="text-primary-700">Submitted</strong> status.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Complaint Title *
              </label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Severity / Priority *
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                >
                  {PRIORITIES.map((prio) => (
                    <option key={prio} value={prio}>
                      {prio} Priority
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Campus Location / Room *
                </label>
                <input
                  type="text"
                  name="location"
                  required
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Assigned Department *
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Detailed Description *
              </label>
              <textarea
                name="description"
                required
                rows={5}
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <Link href={`/complaints/${complaintId}`}>
                <Button type="button" variant="ghost">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={submitting} className="min-w-[140px]">
                {submitting ? (
                  'Saving Changes...'
                ) : (
                  <span className="flex items-center gap-1.5">
                    <Save className="w-4 h-4" /> Save Changes
                  </span>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

