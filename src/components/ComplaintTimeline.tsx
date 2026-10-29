import React from 'react';
import type { ComplaintHistory } from '@/types/database';
import { formatDate, getStatusBadge } from '@/lib/utils';
import { Clock } from 'lucide-react';

interface ComplaintTimelineProps {
  history: ComplaintHistory[];
}

export function ComplaintTimeline({ history }: ComplaintTimelineProps) {
  if (!history || history.length === 0) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">No status updates recorded yet.</p>;
  }

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {history.map((item, index) => {
          const isLast = index === history.length - 1;
          const badge = getStatusBadge(item.new_status as any);

          return (
            <li key={item.id} className="relative pb-8">
              {!isLast && (
                <span
                  className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-notepad-border dark:bg-notepad-darkBorder"
                  aria-hidden="true"
                />
              )}
              <div className="relative flex space-x-3 items-start">
                <div>
                  <span className="h-8 w-8 rounded-full bg-teal-50 dark:bg-teal-950/70 text-teal-700 dark:text-teal-300 flex items-center justify-center ring-8 ring-white dark:ring-notepad-darkCard shadow-xs">
                    <Clock className="w-4 h-4" />
                  </span>
                </div>
                <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${badge.className}`}>
                        {item.new_status}
                      </span>
                      <span className="text-xs text-slate-400">by</span>
                      <span className="text-xs font-medium text-slate-900 dark:text-slate-100">{item.changed_by_name}</span>
                    </div>
                    {item.remarks && (
                      <p className="mt-1 text-sm text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-campus-darkSurface p-2.5 rounded-lg border border-notepad-border dark:border-notepad-darkBorder">
                        {item.remarks}
                      </p>
                    )}
                  </div>
                  <div className="text-right text-xs whitespace-nowrap text-slate-400 dark:text-slate-500">
                    <time dateTime={item.created_at}>{formatDate(item.created_at)}</time>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

