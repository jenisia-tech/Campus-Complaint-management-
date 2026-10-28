import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { createClient } from '@/lib/supabase/server';
import type { Profile } from '@/types/database';

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
  } catch {
    profile = null;
  }

  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased font-sans">
        <Navbar initialProfile={profile} />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
