import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { createClient } from '@/lib/supabase/server';
import type { Profile } from '@/types/database';
import { cookies } from 'next/headers';
import { DEMO_SESSION_COOKIE, isSupabaseConfigured } from '@/lib/auth-demo';
import { findUserByEmail, findUserById } from '@/lib/local-store';

export const metadata: Metadata = {
  title: 'Campus Complaint Management System | Academic SE Project',
  description:
    'Full-stack Campus Complaint Management System built with React, Next.js App Router, Supabase PostgreSQL & Auth, Tailwind CSS, and Vercel.',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let profile: Profile | null = null;

  try {
    const cookieStore = await cookies();
    const demoCookie = cookieStore.get(DEMO_SESSION_COOKIE)?.value;

    if (demoCookie) {
      const parsed = JSON.parse(demoCookie) as Profile;
      // Get the freshest profile from persistent local store if available
      const stored = (parsed.id ? findUserById(parsed.id) : null) || (parsed.email ? findUserByEmail(parsed.email) : null);
      profile = stored ? {
        id: stored.id,
        name: stored.name,
        student_id: stored.student_id,
        email: stored.email,
        role: stored.role,
        department: stored.department,
        hostel_block: stored.hostel_block,
        room_number: stored.room_number,
        phone: stored.phone,
        created_at: stored.created_at,
        updated_at: stored.updated_at,
      } : parsed;
    } else if (isSupabaseConfigured()) {
      const allCookies = cookieStore.getAll();
      const hasAuthCookies = allCookies.some(
        (c) => c.name.startsWith('sb-') || c.name.includes('auth-token')
      );

      if (hasAuthCookies) {
        const supabase = await createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          if (data) {
            profile = data as Profile;
          }
        }
      }
    }
  } catch {
    profile = null;
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var theme = localStorage.getItem('campus_theme');
                if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-notepad-paper dark:bg-notepad-darkBg text-campus-text antialiased font-sans transition-colors">
        <Navbar initialProfile={profile} />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
