// ============================================================
// Supabase Client Configuration
// Replace with your actual Supabase project credentials
// ============================================================

const SUPABASE_URL = 'https://bkrfvmbboxuciihzuqmr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrcmZ2bWJib3h1Y2lpaHp1cW1yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQzNzYxNTEsImV4cCI6MjA5OTk1MjE1MX0.9DaXZ0RgVM9p-d4KuZQFAAr0jQ9ATwQbVS6NBeQxXcY';

// Initialize Supabase client
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

export { supabaseClient };
