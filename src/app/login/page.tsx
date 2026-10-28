'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Client-side schema validation
    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      setErrorMessage(validation.error.issues[0]?.message || 'Invalid input credentials');
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
        // Fetch profile to determine role
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
      setErrorMessage((err as Error).message || 'An unexpected error occurred during sign in.');
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
    <div className="max-w-md mx-auto py-10">
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
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{errorMessage}</span>
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

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                'Signing in...'
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <LogIn className="w-4 h-4" /> Sign In
                </span>
              )}
            </Button>
          </form>

          {/* Quick Demo Fill Buttons for Examiner */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-primary-600" />
              <span>Quick Demo Fill for Evaluation:</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDemoCredentials('student')}
                className="text-xs border-slate-200 hover:bg-slate-50"
              >
                Student Demo
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDemoCredentials('admin')}
                className="text-xs border-slate-200 hover:bg-slate-50"
              >
                Admin Demo
              </Button>
            </div>
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
