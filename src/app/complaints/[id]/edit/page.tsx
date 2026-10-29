'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { complaintUpdateSchema } from '@/lib/validations/complaint';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import type { ComplaintCategory, ComplaintPriority, Complaint } from '@/types/database';

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
        const res = await fetch(`/api/complaints/${complaintId}`);
        if (!res.ok) {
          setErrorMessage('Could not load complaint details.');
          setLoading(false);
          return;
        }

        const complaint = (await res.json()) as Complaint;

        const profileRes = await fetch('/api/profile');
        if (profileRes.ok) {
          const profile = await profileRes.json();
          if (profile.id && complaint.user_id && profile.id !== complaint.user_id && profile.role !== 'admin') {
            router.replace(`/complaints/${complaint.id || complaintId}`);
            return;
          }
        }

        if (complaint.status !== 'Submitted') {
          router.replace(`/complaints/${complaint.id || complaintId}`);
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
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-navy-900 dark:hover:text-slate-100 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Cancel and return to Complaint
      </Link>

      <Card className="border-notepad-border dark:border-notepad-darkBorder bg-white dark:bg-notepad-darkCard shadow-md">
        <CardHeader className="border-b border-notepad-border dark:border-notepad-darkBorder">
          <CardTitle className="text-xl font-bold text-navy-900 dark:text-slate-100">Edit Submitted Complaint</CardTitle>
          <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
            You may update details while this complaint remains in <strong className="text-teal-700 dark:text-teal-300">Submitted</strong> status.
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-[#FDA4AF] text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Complaint Title *
              </label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-campus-darkSurface border border-notepad-border dark:border-notepad-darkBorder rounded-lg text-sm text-navy-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-campus-darkSurface border border-notepad-border dark:border-notepad-darkBorder rounded-lg text-sm text-navy-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Severity / Priority *
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-campus-darkSurface border border-notepad-border dark:border-notepad-darkBorder rounded-lg text-sm text-navy-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
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
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Campus Location / Room *
                </label>
                <input
                  type="text"
                  name="location"
                  required
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-campus-darkSurface border border-notepad-border dark:border-notepad-darkBorder rounded-lg text-sm text-navy-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Assigned Department *
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-campus-darkSurface border border-notepad-border dark:border-notepad-darkBorder rounded-lg text-sm text-navy-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
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
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Detailed Description *
              </label>
              <textarea
                name="description"
                required
                rows={5}
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-campus-darkSurface border border-notepad-border dark:border-notepad-darkBorder rounded-lg text-sm text-navy-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <Link href={`/complaints/${complaintId}`}>
                <Button type="button" variant="ghost">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={submitting} className="min-w-[140px] bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-400 text-white dark:text-slate-900 font-semibold shadow-xs">
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

