import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://frscimdhiiwonivpgiwt.supabase.co';
const supabaseAnonKey = 'sb_publishable_0SeTcwi3jpuIct3doFOQ9g_AxsgGCO8';

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);