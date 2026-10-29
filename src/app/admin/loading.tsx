import React from 'react';

export default function AdminLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Admin Header Skeleton */}
      <div className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl w-full" />

      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-white dark:bg-notepad-darkCard border border-notepad-border dark:border-notepad-darkBorder rounded-xl" />
        ))}
      </div>

      {/* Analytical Visuals Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-64 bg-white dark:bg-notepad-darkCard border border-notepad-border dark:border-notepad-darkBorder rounded-xl" />
        <div className="h-64 bg-white dark:bg-notepad-darkCard border border-notepad-border dark:border-notepad-darkBorder rounded-xl" />
      </div>

      {/* Table Skeleton */}
      <div className="h-80 bg-white dark:bg-notepad-darkCard border border-notepad-border dark:border-notepad-darkBorder rounded-xl" />
    </div>
  );
}
