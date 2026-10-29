'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { Profile } from '@/types/database';
import {
  User,
  GraduationCap,
  Building2,
  Home,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  Save,
  ArrowLeft,
  FileText,
  Clock,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

const DEPARTMENTS = [
  'Computer Science and Engineering',
  'Information Technology',
  'Electronics and Communication',
  'Electrical and Electronics',
  'Mechanical Engineering',
  'Civil Engineering',
  'Chemical Engineering',
  'Biotechnology',
  'Management Studies',
  'General Administration',
];

const HOSTEL_BLOCKS = [
  'Day Scholar (Non-Hosteller)',
  'Ganga Hostel Block A (Boys)',
  'Ganga Hostel Block B (Boys)',
  'Yamuna Hostel Block C (Girls)',
  'Yamuna Hostel Block D (Girls)',
  'Cauvery PG & Research Block',
  'International Scholar Hostel',
];

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    student_id: '',
    department: 'Computer Science and Engineering',
    course: 'B.Tech Information Technology',
    year_of_study: '3rd Year',
    hostel_block: 'Ganga Hostel Block B (Boys)',
    room_number: '',
    phone: '',
  });

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch('/api/profile');
        if (res.ok) {
          const data = await res.json();
          if (data.profile) {
            setProfile(data.profile);
            setFormData({
              name: data.profile.name || '',
              student_id: data.profile.student_id || '',
              department: data.profile.department || 'Computer Science and Engineering',
              course: data.profile.course || 'B.Tech Information Technology',
              year_of_study: data.profile.year_of_study || '3rd Year',
              hostel_block: data.profile.hostel_block || 'Ganga Hostel Block B (Boys)',
              room_number: data.profile.room_number || '',
              phone: data.profile.phone || '',
            });
          }
        } else {
          router.push('/login');
        }
      } catch (err) {
        setErrorMessage('Failed to load profile details.');
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await res.json();
      if (res.ok && result.profile) {
        setProfile(result.profile);
        setSuccessMessage('Your profile changes have been permanently recorded!');
        setTimeout(() => setSuccessMessage(null), 4000);
      } else {
        throw new Error(result.error || 'Failed to update profile');
      }
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || 'Failed to save profile changes.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-10 space-y-4 animate-pulse">
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-lg w-48" />
        <div className="h-64 bg-white dark:bg-notepad-darkCard rounded-2xl border border-notepad-border dark:border-notepad-darkBorder" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-4 space-y-8">
      {/* Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 dark:text-slate-100 tracking-tight flex items-center gap-2.5">
            <User className="w-7 h-7 text-teal-600 dark:text-teal-400" />
            <span>Campus Member Profile</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage your student credentials, hostel residence details, and contact information
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/complaints/new">
            <Button size="sm" className="bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-400 text-white dark:text-slate-900 text-xs font-semibold shadow-xs">
              + File Complaint
            </Button>
          </Link>
          <Link href="/complaints">
            <Button variant="outline" size="sm" className="text-xs border-notepad-border dark:border-notepad-darkBorder text-slate-700 dark:text-slate-200 hover:bg-teal-50/50 dark:hover:bg-campus-darkSurface">
              <FileText className="w-3.5 h-3.5 mr-1 text-teal-600 dark:text-teal-400" /> Complaints Ledger
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Profile Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Identity Card (Notepad Badge Style) */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-notepad-darkCard border border-notepad-border dark:border-notepad-darkBorder rounded-2xl p-6 shadow-xs relative overflow-hidden">
            {/* Top Notepad Bar */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-navy-900 via-teal-600 to-teal-400" />

            <div className="text-center pt-2 space-y-3">
              <div className="w-20 h-20 rounded-full mx-auto bg-teal-50 dark:bg-teal-950/80 border-2 border-teal-300 dark:border-teal-700/60 text-teal-800 dark:text-teal-300 flex items-center justify-center font-extrabold text-2xl shadow-inner">
                {profile?.name ? profile.name.charAt(0).toUpperCase() : 'S'}
              </div>

              <div>
                <h2 className="text-lg font-bold text-navy-900 dark:text-slate-100">
                  {profile?.name || 'Campus Student'}
                </h2>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 mt-1 rounded-full text-xs font-semibold bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 font-mono">
                  {profile?.role === 'admin' ? 'Campus Administrator' : 'Enrolled Student'}
                </div>
              </div>

              <div className="pt-3 border-t border-notepad-border dark:border-notepad-darkBorder text-left space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="font-mono truncate">{profile?.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{formData.student_id ? `ID: ${formData.student_id}` : 'Roll Not Set'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="truncate">{formData.department}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Home className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="truncate">
                    {formData.hostel_block} {formData.room_number ? `(${formData.room_number})` : ''}
                  </span>
                </div>
                {formData.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{formData.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Notice Card */}
          <div className="p-4 rounded-xl bg-teal-50/80 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/60 text-xs text-teal-900 dark:text-teal-200 space-y-1.5">
            <div className="font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>Hostel &amp; College Routing</span>
            </div>
            <p className="leading-relaxed">
              Keeping your Hostel Block and Room Number updated helps the estate and hostel wardens verify and fix your grievances quickly without back-and-forth delays.
            </p>
          </div>
        </div>

        {/* Right Column: Edit Profile Form */}
        <div className="md:col-span-2 space-y-6">
          <Card className="shadow-xs border-notepad-border dark:border-notepad-darkBorder bg-white dark:bg-notepad-darkCard">
            <CardHeader className="border-b border-notepad-border dark:border-notepad-darkBorder pb-4">
              <CardTitle className="text-lg font-bold flex items-center gap-2 text-navy-900 dark:text-slate-100">
                <FileText className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                <span>Edit Profile Information</span>
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                Changes will be saved persistently to your local campus profile
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-6">
              {successMessage && (
                <div className="mb-5 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {errorMessage && (
                <div className="mb-5 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Alex Johnson"
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-campus-darkSurface border border-notepad-border dark:border-notepad-darkBorder rounded-lg text-sm text-navy-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Student Roll / ID
                    </label>
                    <input
                      type="text"
                      name="student_id"
                      value={formData.student_id}
                      onChange={handleChange}
                      placeholder="e.g. STU-2026-0042"
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-campus-darkSurface border border-notepad-border dark:border-notepad-darkBorder rounded-lg text-sm text-navy-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Campus Email (Primary)
                    </label>
                    <input
                      type="email"
                      disabled
                      value={profile?.email || ''}
                      className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-campus-darkSurface/60 border border-notepad-border dark:border-notepad-darkBorder rounded-lg text-sm text-slate-500 dark:text-slate-400 cursor-not-allowed font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Department *
                    </label>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-campus-darkSurface border border-notepad-border dark:border-notepad-darkBorder rounded-lg text-sm text-navy-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
                    >
                      {DEPARTMENTS.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Course / Degree Programme
                    </label>
                    <input
                      type="text"
                      name="course"
                      value={formData.course}
                      onChange={handleChange}
                      placeholder="e.g. B.Tech Computer Science"
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-campus-darkSurface border border-notepad-border dark:border-notepad-darkBorder rounded-lg text-sm text-navy-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Academic Year of Study
                    </label>
                    <select
                      name="year_of_study"
                      value={formData.year_of_study}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-campus-darkSurface border border-notepad-border dark:border-notepad-darkBorder rounded-lg text-sm text-navy-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
                    >
                      <option value="1st Year">1st Year (Freshman)</option>
                      <option value="2nd Year">2nd Year (Sophomore)</option>
                      <option value="3rd Year">3rd Year (Junior)</option>
                      <option value="4th Year">4th Year (Senior)</option>
                      <option value="Postgraduate">Postgraduate (M.Tech / MBA)</option>
                      <option value="Research Scholar">Research Scholar (Ph.D)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Hostel Block / Residence
                    </label>
                    <select
                      name="hostel_block"
                      value={formData.hostel_block}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-campus-darkSurface border border-notepad-border dark:border-notepad-darkBorder rounded-lg text-sm text-navy-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
                    >
                      {HOSTEL_BLOCKS.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Room Number (if in Hostel)
                    </label>
                    <input
                      type="text"
                      name="room_number"
                      value={formData.room_number}
                      onChange={handleChange}
                      placeholder="e.g. Room 304, 3rd Floor"
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-campus-darkSurface border border-notepad-border dark:border-notepad-darkBorder rounded-lg text-sm text-navy-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Contact Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-campus-darkSurface border border-notepad-border dark:border-notepad-darkBorder rounded-lg text-sm text-navy-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
                  />
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={saving}
                    className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-400 text-white dark:text-slate-900 font-semibold shadow-xs flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{saving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

