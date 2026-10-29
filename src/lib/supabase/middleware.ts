import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { DEMO_SESSION_COOKIE, isSupabaseConfigured } from '@/lib/auth-demo';
import type { Profile } from '@/types/database';
import { createFetchWithTimeout } from './timeout';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const path = request.nextUrl.pathname;
  const isProtectedRoute =
    path.startsWith('/dashboard') ||
    path.startsWith('/complaints') ||
    path.startsWith('/admin');

  // 1. Check for local demo session cookie first (0ms latency, no external network)
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
      // invalid cookie, continue
    }
  }

  // 2. If Supabase is not configured and no demo cookie, protect routes without calling network
  if (!isSupabaseConfigured()) {
    if (isProtectedRoute) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('next', path);
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  // 3. Performance check: if public route and no auth cookies present, skip remote auth network request
  const allCookies = request.cookies.getAll();
  const hasAuthCookies = allCookies.some(
    (c) => c.name.startsWith('sb-') || c.name.includes('auth-token')
  );

  if (!isProtectedRoute && !hasAuthCookies && path !== '/login' && path !== '/register') {
    return supabaseResponse;
  }

  // 4. Live Supabase authentication with network timeout protection
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
    global: {
      fetch: createFetchWithTimeout(5000),
    },
  });

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Unauthenticated users trying to access protected routes
    if (!user && isProtectedRoute) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('next', path);
      return NextResponse.redirect(url);
    }

    // Role-dependent routing for authenticated users
    if (user && (path.startsWith('/admin') || path === '/login' || path === '/register')) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (path.startsWith('/admin') && profile?.role !== 'admin') {
        const url = request.nextUrl.clone();
        url.pathname = '/dashboard';
        url.searchParams.set('error', 'unauthorized_admin');
        return NextResponse.redirect(url);
      }

      if (path === '/login' || path === '/register') {
        const url = request.nextUrl.clone();
        url.pathname = profile?.role === 'admin' ? '/admin' : '/dashboard';
        return NextResponse.redirect(url);
      }
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
