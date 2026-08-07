// ============================================================
// Authentication Module
// ============================================================

import { supabaseClient } from './supabase.js';
import { toast } from './toast.js';

// ── Session helpers ───────────────────────────────────────────

/**
 * Get the current authenticated session
 */
async function getSession() {
  const { data: { session }, error } = await supabaseClient.auth.getSession();
  if (error) console.error('getSession error:', error);
  return session;
}

/**
 * Get the current authenticated user
 */
async function getCurrentUser() {
  const { data: { user }, error } = await supabaseClient.auth.getUser();
  if (error) console.error('getUser error:', error);
  return user;
}

/**
 * Get the current user's profile from public.users
 */
async function getUserProfile(userId) {
  const { data, error } = await supabaseClient
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data;
}

// ── Auth guards ───────────────────────────────────────────────

/**
 * Redirect to login if not authenticated (use on protected pages)
 */
async function requireAuth(redirectUrl = 'login.html') {
  const session = await getSession();
  if (!session) {
    window.location.href = redirectUrl;
    return null;
  }
  return session;
}

/**
 * Redirect to dashboard if already authenticated (use on auth pages)
 */
async function redirectIfAuthenticated(redirectUrl = 'dashboard.html') {
  const session = await getSession();
  if (session) {
    window.location.href = redirectUrl;
  }
}

// ── Registration ──────────────────────────────────────────────

/**
 * Register a new user and auto-login (no email confirmation required)
 * @param {string} email
 * @param {string} password
 * @param {string} username
 */
async function register(email, password, username) {
  // signUp with emailRedirectTo: undefined disables the confirmation email flow
  // when Supabase project has "Confirm email" turned OFF
  const { data, error } = await supabaseClient.auth.signUp({
    email,
    password,
    options: {
      data: { username },
      emailRedirectTo: undefined,
    }
  });

  if (error) throw error;

  // If session is available immediately, the user is auto-logged in
  // (happens when email confirmation is disabled in Supabase project settings)
  if (data.session) {
    return data;
  }

  // Fallback: if Supabase still requires confirmation, try signing in directly
  // This covers cases where the project still has confirmation enabled
  if (data.user && !data.session) {
    const { data: loginData, error: loginError } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });
    if (!loginError && loginData.session) {
      return loginData;
    }
  }

  return data;
}

// ── Login ─────────────────────────────────────────────────────

/**
 * Login with email and password
 */
async function login(email, password) {
  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

// ── Logout ────────────────────────────────────────────────────

/**
 * Sign out the current user
 */
async function logout() {
  const { error } = await supabaseClient.auth.signOut();
  if (error) throw error;
  window.location.href = 'index.html';
}

// ── Password reset ────────────────────────────────────────────

/**
 * Send a password reset email
 */
async function sendPasswordResetEmail(email) {
  const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/profile.html#reset-password`,
  });
  if (error) throw error;
}

/**
 * Update password (after reset or from profile page)
 */
async function updatePassword(newPassword) {
  const { error } = await supabaseClient.auth.updateUser({ password: newPassword });
  if (error) throw error;
}

// ── Auth state listener ───────────────────────────────────────

/**
 * Subscribe to auth state changes
 * @param {function} callback
 */
function onAuthStateChange(callback) {
  return supabaseClient.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
}

// ── Profile update ────────────────────────────────────────────

/**
 * Update the user's profile in public.users
 */
async function updateUserProfile(userId, updates) {
  const { data, error } = await supabaseClient
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Delete account: removes auth user (cascades to public.users via trigger)
 */
async function deleteAccount() {
  // Sign out first, then delete user record (Supabase doesn't expose deleteUser in client SDK for security)
  // The actual deletion should be done via a Supabase Edge Function or RPC
  const { error } = await supabaseClient.rpc('delete_user');
  if (error) throw error;
  await supabaseClient.auth.signOut();
  window.location.href = 'index.html';
}

export {
  getSession,
  getCurrentUser,
  getUserProfile,
  requireAuth,
  redirectIfAuthenticated,
  register,
  login,
  logout,
  sendPasswordResetEmail,
  updatePassword,
  onAuthStateChange,
  updateUserProfile,
  deleteAccount,
};
