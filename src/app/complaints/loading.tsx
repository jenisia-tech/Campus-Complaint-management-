import React from 'react';

export default function ComplaintsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-notepad-border dark:border-notepad-darkBorder">
        <div className="space-y-2">
          <div className="h-7 bg-slate-200 dark:bg-slate-800 rounded w-48" />
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-72" />
        </div>
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-lg w-36" />
      </div>

      {/* Filter Bar Skeleton */}
      <div className="h-20 bg-white dark:bg-notepad-darkCard border border-notepad-border dark:border-notepad-darkBorder rounded-xl" />

      {/* Complaints Table Skeleton */}
      <div className="bg-white dark:bg-notepad-darkCard border border-notepad-border dark:border-notepad-darkBorder rounded-xl p-6 space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-14 bg-slate-100 dark:bg-slate-800/80 rounded-lg" />
        ))}
      </div>
    </div>
  );
}
