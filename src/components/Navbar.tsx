'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/types/database';
import {
  FileEdit,
  PlusCircle,
  LayoutDashboard,
  ListTodo,
  LogOut,
  Menu,
  X,
  User,
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

interface NavbarProps {
  initialProfile?: Profile | null;
}

export function Navbar({ initialProfile }: NavbarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(initialProfile || null);

  useEffect(() => {
    setProfile(initialProfile || null);
  }, [initialProfile]);

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/demo-logout', { method: 'POST' });
    } catch {
      // ignore
    }

    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      // ignore
    }

    document.cookie = 'campus_demo_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; Max-Age=0;';
    setProfile(null);
    window.location.href = '/login';
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-notepad-darkCard/95 border-b border-notepad-border dark:border-notepad-darkBorder shadow-xs backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Brand & Left Navigation */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 group shrink-0">
              <div className="p-2 bg-teal-600 dark:bg-teal-500 rounded-lg text-white dark:text-slate-900 shadow-xs group-hover:bg-teal-700 dark:group-hover:bg-teal-400 transition-colors">
                <FileEdit className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg text-navy-900 dark:text-slate-100 tracking-tight leading-none">
                  CampusCare
                </span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-teal-700 dark:text-teal-400 font-semibold mt-0.5">
                  Grievance Notepad
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links - Centered & Vertically Aligned */}
            <nav className="hidden md:flex items-center gap-2">
              {profile ? (
                <>
                  <Link
                    href="/dashboard"
                    className={`h-9 inline-flex items-center gap-1.5 px-3 rounded-lg text-sm font-medium transition-colors ${
                      pathname === '/dashboard'
                        ? 'bg-teal-50 dark:bg-teal-950/70 text-teal-900 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60 font-semibold'
                        : 'text-slate-600 dark:text-slate-300 hover:text-navy-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-campus-darkSurface/70'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    <span>Student Desk</span>
                  </Link>

                  <Link
                    href="/complaints"
                    className={`h-9 inline-flex items-center gap-1.5 px-3 rounded-lg text-sm font-medium transition-colors ${
                      pathname === '/complaints'
                        ? 'bg-teal-50 dark:bg-teal-950/70 text-teal-900 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60 font-semibold'
                        : 'text-slate-600 dark:text-slate-300 hover:text-navy-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-campus-darkSurface/70'
                    }`}
                  >
                    <ListTodo className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    <span>Complaints Ledger</span>
                  </Link>

                  <Link
                    href="/complaints/new"
                    className="h-9 inline-flex items-center gap-1.5 px-3.5 bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-400 text-white dark:text-slate-900 rounded-lg text-sm font-semibold shadow-2xs transition-colors"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>New Entry</span>
                  </Link>
                </>
              ) : (
                <Link
                  href="/login"
                  className="h-9 inline-flex items-center px-3 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-navy-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-campus-darkSurface"
                >
                  Sign In
                </Link>
              )}
            </nav>
          </div>

          {/* Right Action Area - Cleanly Aligned with ThemeToggle and Profile */}
          <div className="hidden md:flex items-center gap-3">
            {/* Theme Toggle Button */}
            <ThemeToggle />

            {profile ? (
              <div className="flex items-center gap-2.5 pl-3 border-l border-notepad-border dark:border-notepad-darkBorder">
                {/* Profile Link */}
                <Link
                  href="/profile"
                  className="h-9 inline-flex items-center gap-2 px-2.5 rounded-lg border border-notepad-border dark:border-notepad-darkBorder bg-slate-50/70 dark:bg-campus-darkSurface/60 hover:bg-teal-50/50 dark:hover:bg-campus-darkSurface transition-colors"
                  title="View and edit your student profile"
                >
                  <div className="w-6 h-6 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-300 dark:border-teal-700/60 text-teal-800 dark:text-teal-300 flex items-center justify-center font-bold text-xs shrink-0">
                    {profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="text-left flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">{profile.name}</span>
                    <span className="text-[9px] uppercase px-1 py-0.5 rounded bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 font-mono font-semibold">
                      {profile.student_id ? profile.student_id : 'Student'}
                    </span>
                  </div>
                </Link>

                {/* Log Out Button */}
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="h-9 inline-flex items-center gap-1.5 px-3 text-xs font-semibold rounded-lg border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors shadow-2xs"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <button className="h-9 px-3 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-campus-darkSurface transition-colors">
                    Sign In
                  </button>
                </Link>
                <Link href="/register">
                  <button className="h-9 px-3.5 rounded-lg text-xs font-semibold bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-400 text-white dark:text-slate-900 shadow-xs transition-colors">
                    Register
                  </button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger & theme toggle */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Toggle Navigation Menu"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden border-t border-notepad-border dark:border-notepad-darkBorder bg-white dark:bg-notepad-darkCard px-4 pt-3 pb-5 space-y-2">
          {profile && (
            <>
              <Link
                href="/dashboard"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-md text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-teal-50 dark:hover:bg-campus-darkSurface"
              >
                Student Desk
              </Link>
              <Link
                href="/complaints"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-md text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-teal-50 dark:hover:bg-campus-darkSurface"
              >
                Complaints Ledger
              </Link>
              <Link
                href="/complaints/new"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-md text-sm font-semibold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/40"
              >
                + New Complaint Entry
              </Link>
              <Link
                href="/profile"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-md text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-teal-50/50 dark:hover:bg-campus-darkSurface"
              >
                My Profile
              </Link>
            </>
          )}

          {profile ? (
            <div className="pt-3 border-t border-notepad-border dark:border-notepad-darkBorder flex items-center justify-between">
              <div className="text-xs">
                <div className="font-semibold text-slate-900 dark:text-slate-100">{profile.name}</div>
                <div className="text-slate-500 dark:text-slate-400 font-mono text-[10px]">{profile.email}</div>
              </div>
              <button
                onClick={handleSignOut}
                className="px-2.5 py-1 text-xs text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 rounded font-semibold"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-2 flex flex-col gap-2">
              <Link href="/login" onClick={() => setIsOpen(false)}>
                <button className="w-full py-2 text-center text-xs font-semibold border border-notepad-border dark:border-notepad-darkBorder rounded-lg">
                  Sign In
                </button>
              </Link>
              <Link href="/register" onClick={() => setIsOpen(false)}>
                <button className="w-full py-2 text-center text-xs font-semibold bg-teal-600 dark:bg-teal-500 text-white dark:text-slate-900 rounded-lg">
                  Register
                </button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
