import { createClient } from '@supabase/supabase-js';

const rawUrl = 
  import.meta.env.VITE_SUPABASE_URL || 
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL || 
  import.meta.env.VITE_SUPABASE_PROJECT_URL ||
  '';

const rawKey = 
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY || 
  import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 
  import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  '';

const supabaseUrl = typeof rawUrl === 'string' ? rawUrl.trim().replace(/^["']|["']$/g, '') : '';
const supabasePublishableKey = typeof rawKey === 'string' ? rawKey.trim().replace(/^["']|["']$/g, '') : '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabasePublishableKey && 
  supabasePublishableKey !== 'YOUR_SUPABASE_PUBLISHABLE_ANON_KEY' &&
  supabasePublishableKey !== 'YOUR_SUPABASE_PUBLISHABLE_KEY' &&
  !supabasePublishableKey.includes('YOUR_SUPABASE')
);

// Initialize a single reusable Supabase client instance
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabasePublishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

if (!isSupabaseConfigured) {
  console.info(
    'ℹ️ Supabase credentials are not fully configured yet in client/.env.local.\n' +
    'Please set VITE_SUPABASE_PUBLISHABLE_KEY in client/.env.local to enable live Supabase Auth.\n' +
    'Application is running in local fallback mode with all features preserved.'
  );
} else {
  console.info('⚡ Supabase client initialized successfully with URL:', supabaseUrl);
}

export default supabase;
