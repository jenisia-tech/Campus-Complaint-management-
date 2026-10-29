'use client';

import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('campus_theme');
    if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    } else {
      setTheme('light');
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem('campus_theme', next);
    if (next === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-lg bg-notepad-border/30 dark:bg-notepad-darkBorder/40 animate-pulse" />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      type="button"
      title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
      aria-label={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
      className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-notepad-border dark:border-notepad-darkBorder bg-white dark:bg-notepad-darkCard text-navy-900 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-campus-darkSurface focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors shadow-2xs"
    >
      {theme === 'light' ? (
        <Moon className="w-4 h-4 text-navy-900" />
      ) : (
        <Sun className="w-4 h-4 text-teal-400" />
      )}
    </button>
  );
}

