'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/auth-demo';
import { loginSchema } from '@/lib/validations/complaint';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ShieldCheck, LogIn, AlertCircle, Sparkles } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialError = searchParams.get('error');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(initialError);
  const [showDemoOffer, setShowDemoOffer] = useState(false);

  const loginViaDemoApi = async (roleOverride?: 'student' | 'admin', customEmail?: string) => {
    setLoading(true);
    try {
      const targetEmail = customEmail || email || 'student@campus.edu';
      const isRole = roleOverride || (targetEmail.toLowerCase().includes('admin') ? 'admin' : 'student');
      const res = await fetch('/api/auth/demo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: isRole,
          email: targetEmail,
          password: password,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        window.location.href = data.profile?.role === 'admin' ? '/admin' : '/dashboard';
        return;
      }
      setErrorMessage(data.error || 'Failed to authenticate');
      setLoading(false);
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || 'Failed to initialize session');
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setShowDemoOffer(false);

    // Client-side schema validation
    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      setErrorMessage(validation.error.issues[0]?.message || 'Invalid input credentials');
      return;
    }

    // If Supabase is not configured with real cloud keys, use student demo evaluation mode directly
    if (!isSupabaseConfigured()) {
      await loginViaDemoApi();
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMessage(error.message || 'Authentication failed. Please verify your student credentials.');
        setLoading(false);
        return;
      }

      if (data.user) {
        window.location.href = '/dashboard';
      }
    } catch (err: unknown) {
      const msg = (err as Error).message || '';
      if (msg.toLowerCase().includes('fetch') || msg.toLowerCase().includes('failed to fetch')) {
        setErrorMessage(
          'Supabase Cloud connection failed ("Failed to fetch"). Your NEXT_PUBLIC_SUPABASE_URL in .env.local is unreachable or offline.'
        );
        setShowDemoOffer(true);
      } else {
        setErrorMessage(msg || 'An unexpected error occurred during sign in.');
      }
    } finally {
      setLoading(false);
    }
  };

  const setStudentDemoCredentials = () => {
    setEmail('student@campus.edu');
    setPassword('Student@123456');
    setErrorMessage(null);
  };

  return (
    <div className="max-w-md mx-auto py-8">
      <Card className="shadow-lg border-notepad-border dark:border-notepad-darkBorder bg-white dark:bg-notepad-darkCard">
        <CardHeader className="text-center space-y-2 border-b border-notepad-border dark:border-notepad-darkBorder">
          <div className="w-12 h-12 bg-teal-50 dark:bg-teal-950/70 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 rounded-xl flex items-center justify-center mx-auto mb-1">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <CardTitle className="text-2xl font-bold text-navy-900 dark:text-slate-100">Student Portal Sign In</CardTitle>
          <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
            Enter your campus credentials to file and track grievances
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          {errorMessage && (
            <div className="mb-4 p-3.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-[#FDA4AF] text-sm space-y-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span className="leading-snug">{errorMessage}</span>
              </div>
              {showDemoOffer && (
                <div className="pt-2 border-t border-rose-200/80 dark:border-rose-800/60 flex items-center justify-between">
                  <span className="text-xs text-rose-800 dark:text-rose-300 font-medium">Continue in Student Demo Mode?</span>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => loginViaDemoApi()}
                    className="text-xs bg-white dark:bg-notepad-darkCard text-rose-900 dark:text-rose-200 border-rose-300 hover:bg-rose-100"
                  >
                    Enter Student Demo
                  </Button>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Student Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@campus.edu"
                className="w-full px-3.5 py-2.5 bg-white dark:bg-campus-darkSurface border border-notepad-border dark:border-notepad-darkBorder rounded-lg text-sm text-navy-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-white dark:bg-campus-darkSurface border border-notepad-border dark:border-notepad-darkBorder rounded-lg text-sm text-navy-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-400 text-white dark:text-slate-900 shadow-sm font-semibold">
              {loading ? (
                'Signing in...'
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <LogIn className="w-4 h-4" /> Sign In as Student
                </span>
              )}
            </Button>
          </form>

          {/* Instant 1-Click Evaluation Buttons */}
          <div className="mt-6 pt-5 border-t border-notepad-border dark:border-notepad-darkBorder">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>Instant 1-Click Student Evaluation:</span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => loginViaDemoApi()}
              disabled={loading}
              className="w-full text-xs font-semibold border-teal-300 dark:border-teal-800 text-teal-800 dark:text-teal-300 bg-teal-50/50 dark:bg-teal-950/40 hover:bg-teal-100 py-2.5"
            >
              Sign In with Demo Student Account
            </Button>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center mt-2.5">
              Or <button type="button" onClick={setStudentDemoCredentials} className="underline hover:text-slate-600 dark:hover:text-slate-300 font-medium text-slate-500 dark:text-slate-400">pre-fill credentials</button> (student@campus.edu)
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex justify-center border-t border-notepad-border dark:border-notepad-darkBorder text-xs text-slate-500 dark:text-slate-400">
          <span>Don&apos;t have an account yet?</span>
          <Link href="/register" className="ml-1.5 font-semibold text-teal-600 dark:text-teal-400 hover:underline">
            Register as Student
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="max-w-md mx-auto py-10 text-center text-slate-500">Loading portal...</div>}>
      <LoginForm />
    </Suspense>
  );
}
