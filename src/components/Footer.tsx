import React from 'react';

export function Footer() {
  return (
    <footer className="bg-white/80 dark:bg-notepad-darkCard/80 border-t border-notepad-border dark:border-notepad-darkBorder mt-auto py-6 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
        <div>
          &copy; {new Date().getFullYear()} CampusCare &bull; Grievance Notepad
        </div>
        <div className="text-slate-400 dark:text-slate-500 text-[11px]">
          Hostel &amp; College Infrastructure Management
        </div>
      </div>
    </footer>
  );
}
