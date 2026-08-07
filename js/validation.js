// ============================================================
// Form Validation Utilities
// ============================================================

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_IMAGE_SIZE_MB = 10;
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

// ── Field validators ─────────────────────────────────────────

/**
 * Validate email address
 */
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || email.trim() === '') return { valid: false, message: 'Email is required.' };
  if (!re.test(email.trim())) return { valid: false, message: 'Please enter a valid email address.' };
  return { valid: true };
}

/**
 * Validate password strength
 * @returns {{ valid: boolean, message?: string, strength: 'weak'|'fair'|'strong'|'very_strong' }}
 */
function validatePassword(password) {
  if (!password) return { valid: false, message: 'Password is required.', strength: 'weak' };
  if (password.length < 8) return { valid: false, message: 'Password must be at least 8 characters.', strength: 'weak' };

  let score = 0;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const strengthMap = { 0: 'weak', 1: 'weak', 2: 'fair', 3: 'fair', 4: 'strong', 5: 'very_strong' };
  const strength = strengthMap[score] || 'weak';

  return { valid: true, strength };
}

/**
 * Validate password confirmation matches
 */
function validatePasswordMatch(password, confirmPassword) {
  if (!confirmPassword) return { valid: false, message: 'Please confirm your password.' };
  if (password !== confirmPassword) return { valid: false, message: 'Passwords do not match.' };
  return { valid: true };
}

/**
 * Validate username
 */
function validateUsername(username) {
  if (!username || username.trim() === '') return { valid: false, message: 'Username is required.' };
  if (username.length < 3) return { valid: false, message: 'Username must be at least 3 characters.' };
  if (username.length > 30) return { valid: false, message: 'Username must be 30 characters or fewer.' };
  if (!/^[a-zA-Z0-9_.-]+$/.test(username)) {
    return { valid: false, message: 'Username can only contain letters, numbers, underscores, dots and hyphens.' };
  }
  return { valid: true };
}

// ── Image validators ─────────────────────────────────────────

/**
 * Validate an image File object
 * @param {File} file
 */
function validateImageFile(file) {
  if (!file) return { valid: false, message: 'Please select an image file.' };
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { valid: false, message: 'Only JPG, PNG and WebP images are supported.' };
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return { valid: false, message: `Image must be smaller than ${MAX_IMAGE_SIZE_MB}MB.` };
  }
  return { valid: true };
}

// ── UI helpers ────────────────────────────────────────────────

/**
 * Show an error message below a form field
 */
function showFieldError(fieldId, message) {
  const field = document.getElementById(fieldId);
  if (!field) return;
  field.classList.add('input-error');
  let errorEl = document.getElementById(`${fieldId}-error`);
  if (!errorEl) {
    errorEl = document.createElement('p');
    errorEl.id = `${fieldId}-error`;
    errorEl.className = 'text-error text-xs mt-1';
    field.parentNode.appendChild(errorEl);
  }
  errorEl.textContent = message;
}

/**
 * Clear error state from a form field
 */
function clearFieldError(fieldId) {
  const field = document.getElementById(fieldId);
  if (!field) return;
  field.classList.remove('input-error');
  const errorEl = document.getElementById(`${fieldId}-error`);
  if (errorEl) errorEl.textContent = '';
}

/**
 * Render a password strength bar
 * @param {string} containerId - ID of the container element
 * @param {'weak'|'fair'|'strong'|'very_strong'} strength
 */
function renderPasswordStrength(containerId, strength) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const levels = { weak: 1, fair: 2, strong: 3, very_strong: 4 };
  const colors = { weak: 'bg-error', fair: 'bg-warning', strong: 'bg-info', very_strong: 'bg-success' };
  const labels = { weak: 'Weak', fair: 'Fair', strong: 'Strong', very_strong: 'Very Strong' };

  const filled = levels[strength] || 0;
  const color = colors[strength] || 'bg-error';
  const label = labels[strength] || '';

  container.innerHTML = `
    <div class="flex gap-1 mt-1">
      ${[1,2,3,4].map(i => `
        <div class="h-1.5 flex-1 rounded-full ${i <= filled ? color : 'bg-base-300'} transition-all duration-300"></div>
      `).join('')}
    </div>
    <p class="text-xs mt-1 ${color.replace('bg-', 'text-')}">${label}</p>
  `;
}

export {
  validateEmail,
  validatePassword,
  validatePasswordMatch,
  validateUsername,
  validateImageFile,
  showFieldError,
  clearFieldError,
  renderPasswordStrength,
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_SIZE_MB,
  MAX_IMAGE_SIZE_BYTES,
};
