import React from 'react';

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
        <div>
          <span className="font-semibold text-gray-700">Campus Complaint Management System</span> &bull; Academic Software Engineering Project (IA3 Evaluation)
        </div>
        <div className="flex items-center gap-3">
          <span>React 19 &bull; Next.js 15 (App Router) &bull; Supabase PostgreSQL &bull; Tailwind CSS &bull; Vercel</span>
        </div>
      </div>
    </footer>
  );
}
