'use client';

import React from 'react';
import { Printer } from 'lucide-react';
import { Button } from './ui/Button';

export function PrintButton() {
  return (
    <Button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 bg-navy-900 hover:bg-navy-800 text-white dark:bg-teal-600 dark:hover:bg-teal-500 shadow-xs font-semibold"
    >
      <Printer className="w-4 h-4" />
      <span>Print / Export PDF</span>
    </Button>
  );
}

