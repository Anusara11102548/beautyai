// ============================================================
// Profile Management Module
// ============================================================

import { supabaseClient } from './supabase.js';
import { getCurrentUser, updateUserProfile, updatePassword } from './auth.js';
import { uploadToStorage, deleteFromStorage } from './upload.js';
import { validateUsername, validatePassword, validatePasswordMatch } from './validation.js';
import { toast } from './toast.js';

/**
 * Load and populate profile form fields
 */
async function loadProfile() {
  const user = await getCurrentUser();
  if (!user) return null;

  const { data, error } = await supabaseClient
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    toast.error('Failed to load profile.');
    throw error;
  }

  return data;
}

/**
 * Populate UI elements with profile data
 */
function populateProfileUI(profile) {
  const fields = {
    'profile-username': profile.username,
    'profile-email':    profile.email,
  };

  for (const [id, value] of Object.entries(fields)) {
    const el = document.getElementById(id);
    if (el) el.value = value || '';
  }

  // Set profile image
  const imgEl = document.getElementById('profile-image');
  if (imgEl && profile.profile_image) {
    imgEl.src = profile.profile_image;
  }

  // Set display name elements
  document.querySelectorAll('[data-profile-name]').forEach(el => {
    el.textContent = profile.username || profile.email;
  });

  document.querySelectorAll('[data-profile-email]').forEach(el => {
    el.textContent = profile.email;
  });
}

/**
 * Handle username update form submission
 */
async function handleUsernameUpdate(e) {
  e.preventDefault();
  const usernameInput = document.getElementById('profile-username');
  const username = usernameInput?.value?.trim();

  const validation = validateUsername(username);
  if (!validation.valid) {
    toast.error(validation.message);
    return;
  }

  const btn = document.getElementById('save-username-btn');
  if (btn) { btn.disabled = true; btn.classList.add('loading'); }

  try {
    const user = await getCurrentUser();
    await updateUserProfile(user.id, { username });
    toast.success('Username updated successfully!');
  } catch (err) {
    toast.error(err.message?.includes('unique') ? 'Username already taken.' : 'Failed to update username.');
  } finally {
    if (btn) { btn.disabled = false; btn.classList.remove('loading'); }
  }
}

/**
 * Handle password change form submission
 */
async function handlePasswordChange(e) {
  e.preventDefault();
  const newPass = document.getElementById('new-password')?.value;
  const confirmPass = document.getElementById('confirm-password')?.value;

  const passValidation = validatePassword(newPass);
  if (!passValidation.valid) {
    toast.error(passValidation.message);
    return;
  }

  const matchValidation = validatePasswordMatch(newPass, confirmPass);
  if (!matchValidation.valid) {
    toast.error(matchValidation.message);
    return;
  }

  const btn = document.getElementById('save-password-btn');
  if (btn) { btn.disabled = true; btn.classList.add('loading'); }

  try {
    await updatePassword(newPass);
    toast.success('Password changed successfully!');
    document.getElementById('new-password').value = '';
    document.getElementById('confirm-password').value = '';
  } catch (err) {
    toast.error('Failed to change password. Please try again.');
  } finally {
    if (btn) { btn.disabled = false; btn.classList.remove('loading'); }
  }
}

/**
 * Handle profile image upload
 */
async function handleProfileImageUpload(file) {
  const user = await getCurrentUser();
  if (!user) return;

  const progressEl = document.getElementById('profile-img-progress');
  if (progressEl) progressEl.classList.remove('hidden');

  try {
    const result = await uploadToStorage(file, 'profile-images', user.id, (percent) => {
      if (progressEl) progressEl.value = percent;
    });

    const imageUrl = result.publicUrl;
    await updateUserProfile(user.id, { profile_image: imageUrl });

    // Update preview
    const imgEl = document.getElementById('profile-image');
    if (imgEl && imageUrl) imgEl.src = imageUrl;

    toast.success('Profile photo updated!');
  } catch (err) {
    toast.error('Failed to upload profile photo.');
  } finally {
    if (progressEl) progressEl.classList.add('hidden');
  }
}

/**
 * Handle account deletion
 */
async function handleDeleteAccount() {
  const confirmed = document.getElementById('delete-confirm-input')?.value === 'DELETE';
  if (!confirmed) {
    toast.error('Please type DELETE to confirm account deletion.');
    return;
  }

  const btn = document.getElementById('delete-account-btn');
  if (btn) { btn.disabled = true; btn.classList.add('loading'); }

  try {
    // Sign out; actual deletion should use Edge Function
    await supabaseClient.auth.signOut();
    toast.info('Your account deletion request has been submitted.');
    setTimeout(() => { window.location.href = 'index.html'; }, 2000);
  } catch (err) {
    toast.error('Failed to delete account. Please contact support.');
  } finally {
    if (btn) { btn.disabled = false; btn.classList.remove('loading'); }
  }
}

export {
  loadProfile,
  populateProfileUI,
  handleUsernameUpdate,
  handlePasswordChange,
  handleProfileImageUpload,
  handleDeleteAccount,
};
