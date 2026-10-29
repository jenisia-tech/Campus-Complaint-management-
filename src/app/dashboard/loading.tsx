import React from 'react';

export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Student Welcome Banner Skeleton */}
      <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl w-full" />

      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-white dark:bg-notepad-darkCard border border-notepad-border dark:border-notepad-darkBorder rounded-xl p-5 space-y-2">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
          </div>
        ))}
      </div>

      {/* Recent Complaints Skeleton */}
      <div className="bg-white dark:bg-notepad-darkCard border border-notepad-border dark:border-notepad-darkBorder rounded-xl p-6 space-y-4">
        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-48" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800/80 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
