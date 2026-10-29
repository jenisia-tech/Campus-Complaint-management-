import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { ComplaintPriority, ComplaintStatus } from '@/types/database';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getStatusBadge(status: ComplaintStatus): {
  label: string;
  className: string;
} {
  switch (status) {
    case 'Submitted':
      return {
        label: 'Submitted',
        className: 'bg-teal-50 text-blue-800 border-teal-200 dark:bg-campus-darkSurface dark:text-campus-accent dark:border-campus-border'
      };
    case 'Under Review':
      return {
        label: 'Under Review',
        className: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-[#FCD58A] dark:border-amber-800/60'
      };
    case 'Assigned':
      return {
        label: 'Assigned',
        className: 'bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800/60'
      };
    case 'In Progress':
      return {
        label: 'In Progress',
        className: 'bg-indigo-50 text-indigo-800 border-indigo-200 dark:bg-indigo-950/60 dark:text-[#FCD58A] dark:border-indigo-800/60'
      };
    case 'Resolved':
      return {
        label: 'Resolved',
        className: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-[#86EFAC] dark:border-emerald-800/60'
      };
    case 'Closed':
      return {
        label: 'Closed',
        className: 'bg-slate-100 text-gray-800 border-slate-200 dark:bg-campus-darkSurface dark:text-slate-300 dark:border-campus-border'
      };
    case 'Reopened':
      return {
        label: 'Reopened',
        className: 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-[#FDA4AF] dark:border-rose-800/60'
      };
    default:
      return {
        label: status,
        className: 'bg-slate-100 text-gray-800 border-slate-200 dark:bg-campus-darkSurface dark:text-slate-300 dark:border-campus-border'
      };
  }
}

export function getPriorityBadge(priority: ComplaintPriority): {
  label: string;
  className: string;
} {
  switch (priority) {
    case 'Low':
      return {
        label: 'Low',
        className: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-campus-darkSurface dark:text-slate-300 dark:border-campus-border'
      };
    case 'Medium':
      return {
        label: 'Medium',
        className: 'bg-sky-50 text-sky-800 border-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800/60'
      };
    case 'High':
      return {
        label: 'High',
        className: 'bg-amber-50 text-orange-800 border-amber-200 dark:bg-amber-950/60 dark:text-[#FCD58A] dark:border-amber-800/60'
      };
    case 'Critical':
      return {
        label: 'Critical',
        className: 'bg-rose-50 text-red-800 border-rose-300 dark:bg-rose-950/60 dark:text-[#FDA4AF] dark:border-rose-800/60 font-bold animate-pulse'
      };
    default:
      return {
        label: priority,
        className: 'bg-slate-100 text-slate-700 dark:bg-campus-darkSurface dark:text-slate-300'
      };
  }
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return String(dateString).slice(0, 16);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(d);
  } catch {
    return String(dateString);
  }
}

export function calculateAverageTurnaround(
  complaints: { created_at: string; resolved_at: string | null }[]
): number {
  const eligible = complaints.filter(
    (c) => c.resolved_at && new Date(c.resolved_at).getTime() > new Date(c.created_at).getTime()
  );
  if (eligible.length === 0) return 0;

  const totalMilliseconds = eligible.reduce((acc, c) => {
    return acc + (new Date(c.resolved_at!).getTime() - new Date(c.created_at).getTime());
  }, 0);

  const avgHours = totalMilliseconds / (eligible.length * 1000 * 60 * 60);
  return Math.round(avgHours * 10) / 10;
}

