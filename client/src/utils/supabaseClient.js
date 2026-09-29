import { createClient } from '@supabase/supabase-js';

const rawUrl = 
  import.meta.env.VITE_SUPABASE_URL || 
  '';

const rawKey = 
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY || 
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
    'ℹ️ Supabase client is waiting for configuration (VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY).'
  );
} else {
  console.info('⚡ Supabase client initialized successfully with URL:', supabaseUrl);
}

export default supabase;
