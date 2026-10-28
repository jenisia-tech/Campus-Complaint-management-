'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/auth-demo';
import { loginSchema } from '@/lib/validations/complaint';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ShieldCheck, LogIn, AlertCircle, Sparkles, Database, CheckCircle2, Info } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialError = searchParams.get('error');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(initialError);
  const [showDemoOffer, setShowDemoOffer] = useState(false);

  const loginViaDemoApi = async (role: 'student' | 'admin') => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/demo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      if (res.ok) {
        router.push(role === 'admin' ? '/admin' : '/dashboard');
        router.refresh();
        return;
      }
      throw new Error('Failed to set demo session');
    } catch (err: unknown) {
      setErrorMessage((err as Error).message);
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

    const isDemoRole: 'student' | 'admin' = email.toLowerCase().includes('admin') ? 'admin' : 'student';

    // If Supabase is not configured with real cloud keys, use local evaluation demo mode directly
    if (!isSupabaseConfigured()) {
      await loginViaDemoApi(isDemoRole);
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
        setErrorMessage(error.message || 'Authentication failed. Please verify your credentials.');
        setLoading(false);
        return;
      }

      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        if (profile?.role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
        router.refresh();
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

  const setDemoCredentials = (role: 'student' | 'admin') => {
    if (role === 'student') {
      setEmail('student@campus.edu');
      setPassword('Student@123456');
    } else {
      setEmail('admin@campus.edu');
      setPassword('Admin@123456');
    }
    setErrorMessage(null);
  };

  return (
    <div className="max-w-md mx-auto py-8">
      {/* Informational Banner */}
      {!isSupabaseConfigured() && (
        <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1.5 shadow-xs">
          <div className="flex items-center gap-1.5 font-bold text-amber-800">
            <Info className="w-4 h-4 shrink-0 text-amber-700" />
            <span>Academic IA3 Evaluation Mode Active</span>
          </div>
          <p className="text-amber-800 leading-relaxed">
            Supabase cloud credentials are not yet configured in <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-semibold">.env.local</code>.
            You can sign in immediately using the <strong>Quick Demo Buttons</strong> below with pre-seeded data, or connect your Supabase database when ready.
          </p>
        </div>
      )}

      <Card className="shadow-lg border-slate-200">
        <CardHeader className="text-center space-y-2">
          <div className="w-12 h-12 bg-primary-100 text-primary-700 rounded-xl flex items-center justify-center mx-auto mb-1">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <CardDescription>
            Sign in to your campus complaint management account
          </CardDescription>
        </CardHeader>

        <CardContent>
          {errorMessage && (
            <div className="mb-4 p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm space-y-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span className="leading-snug">{errorMessage}</span>
              </div>
              {showDemoOffer && (
                <div className="pt-2 border-t border-rose-200/80 flex items-center justify-between">
                  <span className="text-xs text-rose-800 font-medium">Use local demo instead?</span>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => loginViaDemoApi('student')}
                    className="text-xs bg-white text-rose-900 border-rose-300 hover:bg-rose-100"
                  >
                    Enter Demo Mode
                  </Button>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Campus Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g., student@campus.edu"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full shadow-sm">
              {loading ? (
                'Signing in...'
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <LogIn className="w-4 h-4" /> Sign In
                </span>
              )}
            </Button>
          </form>

          {/* Instant 1-Click Evaluation Buttons */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-primary-600" />
              <span>Instant 1-Click Demo Evaluation:</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => loginViaDemoApi('student')}
                disabled={loading}
                className="text-xs border-primary-200 text-primary-700 hover:bg-primary-50"
              >
                Sign in as Student
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => loginViaDemoApi('admin')}
                disabled={loading}
                className="text-xs border-indigo-200 text-indigo-700 hover:bg-indigo-50"
              >
                Sign in as Admin
              </Button>
            </div>
            <p className="text-[11px] text-slate-400 text-center mt-2">
              Or click to pre-fill: <button type="button" onClick={() => setDemoCredentials('student')} className="underline hover:text-slate-600">Student</button> &bull; <button type="button" onClick={() => setDemoCredentials('admin')} className="underline hover:text-slate-600">Admin</button>
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex justify-center border-t border-slate-100 text-xs text-slate-500">
          <span>Don&apos;t have an account yet?</span>
          <Link href="/register" className="ml-1.5 font-semibold text-primary-600 hover:underline">
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
