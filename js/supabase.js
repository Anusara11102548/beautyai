// ============================================================
// Supabase Client Configuration
// Replace with your actual Supabase project credentials
// ============================================================

const SUPABASE_URL = 'https://kpkuvbktmmshcbpuzzmq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_mBf44fcOeoWq5SiraIpDxw_44GO5IrO';

// Initialize Supabase client
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

export { supabaseClient };
