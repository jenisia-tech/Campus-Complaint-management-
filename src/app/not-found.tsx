import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="max-w-md mx-auto py-16 text-center space-y-4">
      <div className="w-14 h-14 bg-rose-50 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center mx-auto mb-2 border border-rose-100 dark:border-rose-900/60">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Page Not Found</h2>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        The requested campus resource or complaint reference could not be located.
      </p>
      <div className="pt-2">
        <Link href="/">
          <Button variant="outline" size="sm" className="gap-1.5 border-notepad-border dark:border-notepad-darkBorder text-slate-700 dark:text-slate-200">
            <ArrowLeft className="w-4 h-4" /> Return to Campus Home
          </Button>
        </Link>
      </div>
    </div>
  );
}

