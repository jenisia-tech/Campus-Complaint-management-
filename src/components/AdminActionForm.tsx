'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Complaint } from '@/types/database';
import { COMPLAINT_PRIORITIES, COMPLAINT_STATUSES, CAMPUS_DEPARTMENTS, isValidTransition } from '@/lib/validations/complaint';
import { Button } from './ui/Button';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface AdminActionFormProps {
  complaint: Complaint;
}

export function AdminActionForm({ complaint }: AdminActionFormProps) {
  const router = useRouter();
  const [status, setStatus] = useState(complaint.status);
  const [priority, setPriority] = useState(complaint.priority);
  const [department, setDepartment] = useState(complaint.department);
  const [assignedTo, setAssignedTo] = useState(complaint.assigned_to || '');
  const [adminRemarks, setAdminRemarks] = useState(complaint.admin_remarks || '');
  const [resolutionNotes, setResolutionNotes] = useState(complaint.resolution_notes || '');

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // Validate transition
    if (status !== complaint.status && !isValidTransition(complaint.status, status)) {
      setMessage({
        type: 'error',
        text: `Invalid status transition from '${complaint.status}' to '${status}'. Please follow the defined workflow.`
      });
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/complaints/${complaint.complaint_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          priority,
          department,
          assigned_to: assignedTo,
          admin_remarks: adminRemarks,
          resolution_notes: resolutionNotes
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update complaint.');
      }

      setMessage({ type: 'success', text: 'Complaint status and assignments updated successfully.' });
      router.refresh();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'An unexpected error occurred.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {message && (
        <div
          className={`p-3.5 rounded-lg text-sm flex items-start gap-2.5 ${
            message.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              : 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 mt-0.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 mt-0.5 text-rose-600 dark:text-rose-400 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Complaint Status *
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="w-full py-2 px-3 text-sm border border-notepad-border dark:border-notepad-darkBorder rounded-lg focus:ring-2 focus:ring-teal-500 bg-white dark:bg-campus-darkSurface text-slate-900 dark:text-slate-100"
            required
          >
            {COMPLAINT_STATUSES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Priority Level *
          </label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as any)}
            className="w-full py-2 px-3 text-sm border border-notepad-border dark:border-notepad-darkBorder rounded-lg focus:ring-2 focus:ring-teal-500 bg-white dark:bg-campus-darkSurface text-slate-900 dark:text-slate-100"
            required
          >
            {COMPLAINT_PRIORITIES.map((prio) => (
              <option key={prio} value={prio}>
                {prio}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Responsible Department *
          </label>
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="w-full py-2 px-3 text-sm border border-notepad-border dark:border-notepad-darkBorder rounded-lg focus:ring-2 focus:ring-teal-500 bg-white dark:bg-campus-darkSurface text-slate-900 dark:text-slate-100"
            required
          >
            {CAMPUS_DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Assigned Technician / Staff
          </label>
          <input
            type="text"
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            placeholder="e.g., HVAC Maintenance Crew A"
            className="w-full py-2 px-3 text-sm border border-notepad-border dark:border-notepad-darkBorder rounded-lg focus:ring-2 focus:ring-teal-500 bg-white dark:bg-campus-darkSurface text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
          Internal Administration Remarks
        </label>
        <textarea
          rows={2}
          value={adminRemarks}
          onChange={(e) => setAdminRemarks(e.target.value)}
          placeholder="Notes on replacement parts, site visits, or follow-up timelines..."
          className="w-full py-2 px-3 text-sm border border-notepad-border dark:border-notepad-darkBorder rounded-lg focus:ring-2 focus:ring-teal-500 bg-white dark:bg-campus-darkSurface text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
          Public Resolution Notes
        </label>
        <textarea
          rows={2}
          value={resolutionNotes}
          onChange={(e) => setResolutionNotes(e.target.value)}
          placeholder="Detailed explanation of work completed (visible to student upon resolution)..."
          className="w-full py-2 px-3 text-sm border border-notepad-border dark:border-notepad-darkBorder rounded-lg focus:ring-2 focus:ring-teal-500 bg-white dark:bg-campus-darkSurface text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
        />
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" isLoading={isLoading} className="w-full sm:w-auto bg-teal-600 hover:bg-teal-500 text-white font-semibold">
          Save Status &amp; Record Audit Entry
        </Button>
      </div>
    </form>
  );
}

