import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { DEMO_SESSION_COOKIE, isSupabaseConfigured } from '@/lib/auth-demo';
import type { Profile } from '@/types/database';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const path = request.nextUrl.pathname;
  const isProtectedRoute =
    path.startsWith('/dashboard') ||
    path.startsWith('/complaints') ||
    path.startsWith('/admin');

  // Check for local demo session cookie first
  const demoCookie = request.cookies.get(DEMO_SESSION_COOKIE)?.value;
  if (demoCookie) {
    try {
      const demoProfile = JSON.parse(demoCookie) as Profile;

      if (path === '/login' || path === '/register') {
        const url = request.nextUrl.clone();
        url.pathname = demoProfile.role === 'admin' ? '/admin' : '/dashboard';
        return NextResponse.redirect(url);
      }

      if (path.startsWith('/admin') && demoProfile.role !== 'admin') {
        const url = request.nextUrl.clone();
        url.pathname = '/dashboard';
        url.searchParams.set('error', 'unauthorized_admin');
        return NextResponse.redirect(url);
      }

      return supabaseResponse;
    } catch {
      // invalid cookie, fall through
    }
  }

  // If Supabase is not configured and no demo cookie, protect routes
  if (!isSupabaseConfigured()) {
    if (isProtectedRoute) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('next', path);
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  // Live Supabase authentication
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // 1. Unauthenticated users trying to access protected routes
    if (!user && isProtectedRoute) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('next', path);
      return NextResponse.redirect(url);
    }

    // 2. Administrator Role Verification for /admin/*
    if (user && path.startsWith('/admin')) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (!profile || profile.role !== 'admin') {
        const url = request.nextUrl.clone();
        url.pathname = '/dashboard';
        url.searchParams.set('error', 'unauthorized_admin');
        return NextResponse.redirect(url);
      }
    }

    // 3. Authenticated users visiting /login or /register
    if (user && (path === '/login' || path === '/register')) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      const url = request.nextUrl.clone();
      url.pathname = profile?.role === 'admin' ? '/admin' : '/dashboard';
      return NextResponse.redirect(url);
    }
  } catch {
    // network or auth error fallback
    if (isProtectedRoute) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
