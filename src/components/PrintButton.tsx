'use client';

import React from 'react';
import { Printer } from 'lucide-react';
import { Button } from './ui/Button';

export function PrintButton() {
  return (
    <Button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 bg-slate-900 text-white hover:bg-slate-800 shadow-xs"
    >
      <Printer className="w-4 h-4" />
      <span>Print / Export PDF</span>
    </Button>
  );
}
