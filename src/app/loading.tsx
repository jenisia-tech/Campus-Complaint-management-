import React from 'react';

export default function RootLoading() {
  return (
    <div className="w-full max-w-7xl mx-auto py-8 space-y-6 animate-pulse">
      {/* Top Banner Skeleton */}
      <div className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl w-full" />

      {/* Grid of Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        ))}
      </div>

      {/* Main Content Area */}
      <div className="h-72 bg-slate-200 dark:bg-slate-800 rounded-xl" />
    </div>
  );
}
