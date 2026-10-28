'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createComplaintSchema } from '@/lib/validations/complaint';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Send, AlertCircle, Sparkles } from 'lucide-react';
import type { ComplaintCategory, ComplaintPriority } from '@/types/database';

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

export default function NewComplaintPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Classroom and infrastructure' as ComplaintCategory,
    location: '',
    department: 'Estate Maintenance & Civil Works',
    priority: 'Medium' as ComplaintPriority,
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

    // Schema validation
    const validation = createComplaintSchema.safeParse(formData);
    if (!validation.success) {
      setErrorMessage(validation.error.issues[0]?.message || 'Please verify form fields');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Failed to submit complaint');
      }

      router.push(`/complaints/${result.complaint.id}`);
      router.refresh();
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || 'An error occurred while submitting.');
      setLoading(false);
    }
  };

  const fillSample = () => {
    setFormData({
      title: 'Projector ceiling bracket loose and Wi-Fi dropping in Lab 302',
      description:
        'The overhead projector in Computer Lab 302 has a loose ceiling mount and vibrates during lectures. Additionally, the campus Wi-Fi access point in the same room drops connection every 15 minutes, interrupting lab practicals.',
      category: 'Laboratory equipment',
      location: 'Science Block B, Room 302',
      department: 'Campus IT & Wi-Fi Network',
      priority: 'High',
    });
    setErrorMessage(null);
  };

  return (
    <div className="max-w-3xl mx-auto py-4 space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/complaints"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Complaints Directory
        </Link>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={fillSample}
          className="text-xs border-dashed text-primary-600 border-primary-300 hover:bg-primary-50"
        >
          <Sparkles className="w-3.5 h-3.5 mr-1" />
          Fill Sample Grievance
        </Button>
      </div>

      <Card className="border-slate-200 shadow-md">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Lodge a New Campus Complaint</CardTitle>
          <CardDescription>
            Provide detailed information to assist the maintenance department in resolving the issue promptly.
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
                placeholder="Brief summary of the issue (e.g. Water dispenser leaking on 2nd floor)"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
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
                  placeholder="e.g. Mechanical Block, Room 104"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
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
                placeholder="Describe the issue in detail: when it started, safety concerns, equipment model numbers, etc."
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
              <p className="text-xs text-slate-400 mt-1">Minimum 10 characters.</p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <Link href="/complaints">
                <Button type="button" variant="ghost">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={loading} className="min-w-[140px]">
                {loading ? (
                  'Lodging Ticket...'
                ) : (
                  <span className="flex items-center gap-1.5">
                    <Send className="w-4 h-4" /> Submit Grievance
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

