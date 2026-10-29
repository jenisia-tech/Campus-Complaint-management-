import { createBrowserClient } from '@supabase/ssr';
import { createFetchWithTimeout } from './timeout';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

  return createBrowserClient(supabaseUrl, supabaseAnonKey, {
    global: {
      fetch: createFetchWithTimeout(6000),
    },
  });
}
