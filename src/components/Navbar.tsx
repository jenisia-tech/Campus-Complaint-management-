'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/types/database';
import { ShieldCheck, PlusCircle, LayoutDashboard, ListTodo, FileBarChart, LogOut, Menu, X, User } from 'lucide-react';
import { Button } from './ui/Button';

interface NavbarProps {
  initialProfile?: Profile | null;
}

export function Navbar({ initialProfile }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [profile] = useState<Profile | null>(initialProfile || null);

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/demo-logout', { method: 'POST' });
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    router.push('/login');
    router.refresh();
  };

  const isStudent = profile?.role === 'student';
  const isAdmin = profile?.role === 'admin';

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200/80 shadow-xs backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="p-2 bg-primary-600 rounded-lg text-white shadow-sm group-hover:bg-primary-700 transition-colors">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-gray-900 tracking-tight">CampusCare</span>
                <span className="text-xs font-semibold px-2 py-0.5 bg-primary-50 text-primary-700 rounded-full border border-primary-200">
                  Next.js + Supabase
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1 ml-8">
              {isStudent && (
                <>
                  <Link
                    href="/dashboard"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      pathname === '/dashboard' ? 'bg-gray-100 text-primary-700 font-semibold' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <LayoutDashboard className="w-4 h-4" /> Dashboard
                    </span>
                  </Link>
                  <Link
                    href="/complaints"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      pathname === '/complaints' ? 'bg-gray-100 text-primary-700 font-semibold' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <ListTodo className="w-4 h-4" /> My Complaints
                    </span>
                  </Link>
                  <Link
                    href="/complaints/new"
                    className="ml-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold shadow-xs transition-colors"
                  >
                    <PlusCircle className="w-4 h-4" /> File Complaint
                  </Link>
                </>
              )}

              {isAdmin && (
                <>
                  <Link
                    href="/admin"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      pathname === '/admin' ? 'bg-gray-100 text-primary-700 font-semibold' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <LayoutDashboard className="w-4 h-4" /> Admin Console
                    </span>
                  </Link>
                  <Link
                    href="/admin/complaints"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      pathname === '/admin/complaints' ? 'bg-gray-100 text-primary-700 font-semibold' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <ListTodo className="w-4 h-4" /> All Grievances
                    </span>
                  </Link>
                  <Link
                    href="/admin/reports"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      pathname === '/admin/reports' ? 'bg-gray-100 text-primary-700 font-semibold' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <FileBarChart className="w-4 h-4" /> Reports
                    </span>
                  </Link>
                </>
              )}
            </nav>
          </div>

          {/* User Profile / Auth Actions */}
          <div className="hidden md:flex items-center gap-3">
            {profile ? (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900 flex items-center justify-end gap-1.5">
                    <span>{profile.name}</span>
                    <span
                      className={`text-2xs uppercase tracking-wider font-bold px-1.5 py-0.5 rounded ${
                        profile.role === 'admin'
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : 'bg-blue-100 text-blue-800 border border-blue-200'
                      }`}
                    >
                      {profile.role}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {profile.student_id ? `ID: ${profile.student_id}` : profile.department}
                  </div>
                </div>

                <Button variant="ghost" size="sm" onClick={handleSignOut} title="Sign Out">
                  <LogOut className="w-4 h-4 text-gray-500 hover:text-rose-600" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">
                    Student Register
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 pt-3 pb-5 space-y-2">
          {isStudent && (
            <>
              <Link
                href="/dashboard"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
              >
                Dashboard
              </Link>
              <Link
                href="/complaints"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
              >
                My Complaints
              </Link>
              <Link
                href="/complaints/new"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-semibold text-emerald-700 bg-emerald-50"
              >
                + File Complaint
              </Link>
            </>
          )}

          {isAdmin && (
            <>
              <Link
                href="/admin"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
              >
                Admin Dashboard
              </Link>
              <Link
                href="/admin/complaints"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
              >
                All Grievances
              </Link>
              <Link
                href="/admin/reports"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
              >
                Resolution Reports
              </Link>
            </>
          )}

          {profile ? (
            <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
              <div className="text-sm">
                <div className="font-semibold text-gray-900">{profile.name}</div>
                <div className="text-xs text-gray-500">{profile.email}</div>
              </div>
              <Button variant="danger" size="sm" onClick={handleSignOut}>
                Log Out
              </Button>
            </div>
          ) : (
            <div className="pt-3 border-t border-gray-100 flex gap-2">
              <Link href="/login" className="flex-1" onClick={() => setIsOpen(false)}>
                <Button variant="outline" className="w-full">
                  Sign In
                </Button>
              </Link>
              <Link href="/register" className="flex-1" onClick={() => setIsOpen(false)}>
                <Button className="w-full">Register</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

