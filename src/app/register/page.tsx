'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/auth-demo';
import { registerSchema } from '@/lib/validations/complaint';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';

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

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    student_id: '',
    email: '',
    department: 'Computer Science and Engineering',
    password: '',
    confirm_password: '',
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Schema validation
    const validation = registerSchema.safeParse(formData);
    if (!validation.success) {
      setErrorMessage(validation.error.issues[0]?.message || 'Please fix errors in the form');
      return;
    }

    setLoading(true);

    // If Supabase is unconfigured, complete registration in local demo evaluation mode
    if (!isSupabaseConfigured()) {
      try {
        const res = await fetch('/api/auth/demo-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            isRegistration: true,
            role: 'student',
            name: formData.name,
            student_id: formData.student_id,
            department: formData.department,
            email: formData.email,
            password: formData.password,
          }),
        });
        const data = await res.json();
        if (res.ok) {
          window.location.href = '/dashboard';
          return;
        } else {
          setErrorMessage(data.error || 'Registration failed');
          setLoading(false);
          return;
        }
      } catch (err: unknown) {
        setErrorMessage((err as Error).message || 'Registration failed');
        setLoading(false);
        return;
      }
    }

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            student_id: formData.student_id,
            department: formData.department,
          },
        },
      });

      if (error) {
        setErrorMessage(error.message || 'Registration failed.');
        setLoading(false);
        return;
      }

      if (data.session) {
        // Direct session created (email confirmation disabled in Supabase)
        router.push('/dashboard');
        router.refresh();
      } else {
        setSuccessMessage(
          'Registration successful! Please check your email inbox to confirm your account, or sign in now.'
        );
      }
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-8">
      <Card className="shadow-lg border-notepad-border dark:border-notepad-darkBorder bg-white dark:bg-notepad-darkCard">
        <CardHeader className="text-center space-y-2 border-b border-notepad-border dark:border-notepad-darkBorder">
          <div className="w-12 h-12 bg-teal-50 dark:bg-teal-950/70 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 rounded-xl flex items-center justify-center mx-auto mb-1">
            <UserPlus className="w-6 h-6" />
          </div>
          <CardTitle className="text-2xl font-bold text-navy-900 dark:text-slate-100">Student Registration</CardTitle>
          <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
            Create an official student account to report and track campus complaints
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          {errorMessage && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-[#FDA4AF] text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-[#86EFAC] text-sm flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">{successMessage}</p>
                <div className="mt-2">
                  <Link href="/login">
                    <Button size="sm" variant="outline" className="bg-white dark:bg-notepad-darkCard">
                      Proceed to Sign In
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {!successMessage && (
            <form onSubmit={handleRegister} className="space-y-4">
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
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-campus-darkSurface border border-notepad-border dark:border-notepad-darkBorder rounded-lg text-sm text-navy-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Student Roll / ID *
                  </label>
                  <input
                    type="text"
                    name="student_id"
                    required
                    value={formData.student_id}
                    onChange={handleChange}
                    placeholder="e.g. STU-2026-0042"
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-campus-darkSurface border border-notepad-border dark:border-notepad-darkBorder rounded-lg text-sm text-navy-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Campus Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="alex@campus.edu"
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-campus-darkSurface border border-notepad-border dark:border-notepad-darkBorder rounded-lg text-sm text-navy-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Academic Department *
                  </label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-campus-darkSurface border border-notepad-border dark:border-notepad-darkBorder rounded-lg text-sm text-navy-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
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
                    Password *
                  </label>
                  <input
                    type="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Min 6 characters"
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-campus-darkSurface border border-notepad-border dark:border-notepad-darkBorder rounded-lg text-sm text-navy-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    name="confirm_password"
                    required
                    value={formData.confirm_password}
                    onChange={handleChange}
                    placeholder="Re-enter password"
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-campus-darkSurface border border-notepad-border dark:border-notepad-darkBorder rounded-lg text-sm text-navy-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button type="submit" disabled={loading} className="w-full bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-400 text-white dark:text-slate-900 font-semibold shadow-xs">
                  {loading ? 'Creating Student Account...' : 'Complete Registration'}
                </Button>
              </div>
            </form>
          )}
        </CardContent>

        <CardFooter className="flex justify-center border-t border-notepad-border dark:border-notepad-darkBorder text-xs text-slate-500 dark:text-slate-400">
          <span>Already registered?</span>
          <Link href="/login" className="ml-1.5 font-semibold text-primary-600 hover:underline">
            Sign In to Portal
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

