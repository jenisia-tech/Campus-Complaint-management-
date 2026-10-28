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
        className: 'bg-blue-100 text-blue-800 border-blue-200'
      };
    case 'Under Review':
      return {
        label: 'Under Review',
        className: 'bg-amber-100 text-amber-800 border-amber-200'
      };
    case 'Assigned':
      return {
        label: 'Assigned',
        className: 'bg-purple-100 text-purple-800 border-purple-200'
      };
    case 'In Progress':
      return {
        label: 'In Progress',
        className: 'bg-indigo-100 text-indigo-800 border-indigo-200'
      };
    case 'Resolved':
      return {
        label: 'Resolved',
        className: 'bg-emerald-100 text-emerald-800 border-emerald-200'
      };
    case 'Closed':
      return {
        label: 'Closed',
        className: 'bg-gray-100 text-gray-800 border-gray-200'
      };
    case 'Reopened':
      return {
        label: 'Reopened',
        className: 'bg-rose-100 text-rose-800 border-rose-200'
      };
    default:
      return {
        label: status,
        className: 'bg-gray-100 text-gray-800 border-gray-200'
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
        className: 'bg-slate-100 text-slate-700 border-slate-200'
      };
    case 'Medium':
      return {
        label: 'Medium',
        className: 'bg-sky-100 text-sky-800 border-sky-200'
      };
    case 'High':
      return {
        label: 'High',
        className: 'bg-orange-100 text-orange-800 border-orange-200'
      };
    case 'Critical':
      return {
        label: 'Critical',
        className: 'bg-red-100 text-red-800 border-red-300 font-bold animate-pulse'
      };
    default:
      return {
        label: priority,
        className: 'bg-slate-100 text-slate-700'
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
