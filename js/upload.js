// ============================================================
// Image Upload Handler
// Drag & Drop + File Picker + Preview + Supabase Storage
// ============================================================

import { supabaseClient } from './supabase.js';
import { validateImageFile } from './validation.js';
import { toast } from './toast.js';

/**
 * Initialize a drag-and-drop upload zone
 * @param {object} options
 * @param {string} options.dropZoneId - ID of the drop zone element
 * @param {string} options.inputId - ID of the file input element
 * @param {string} options.previewId - ID of the image preview element
 * @param {string} options.previewContainerId - ID of the preview container
 * @param {string} options.progressBarId - ID of the progress bar element
 * @param {function} options.onFileSelected - Callback when file is selected/dropped (file) => void
 */
function initUploadZone({
  dropZoneId,
  inputId,
  previewId,
  previewContainerId,
  progressBarId,
  onFileSelected,
}) {
  const dropZone = document.getElementById(dropZoneId);
  const fileInput = document.getElementById(inputId);
  const preview = document.getElementById(previewId);
  const previewContainer = document.getElementById(previewContainerId);

  if (!dropZone || !fileInput) return;

  // Click to open picker
  dropZone.addEventListener('click', () => fileInput.click());

  // Keyboard accessibility
  dropZone.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') fileInput.click();
  });

  // File input change
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelected(file);
  });

  // Drag events
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over', 'border-primary', 'bg-primary/5');
  });

  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('drag-over', 'border-primary', 'bg-primary/5');
  });

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over', 'border-primary', 'bg-primary/5');
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelected(file);
  });

  function handleFileSelected(file) {
    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast.error(validation.message);
      return;
    }
    showPreview(file);
    if (onFileSelected) onFileSelected(file);
  }

  function showPreview(file) {
    if (!preview || !previewContainer) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      preview.src = e.target.result;
      previewContainer.classList.remove('hidden');
      dropZone.classList.add('hidden');
    };
    reader.readAsDataURL(file);
  }
}

/**
 * Upload a file to Supabase Storage
 * @param {File} file - The file to upload
 * @param {string} bucket - Storage bucket name
 * @param {string} userId - Current user's ID (used as folder)
 * @param {function} [onProgress] - Progress callback (0–100)
 * @returns {Promise<{path: string, publicUrl: string|null, signedUrl: string|null}>}
 */
async function uploadToStorage(file, bucket, userId, onProgress) {
  const ext = file.name.split('.').pop().toLowerCase();
  const timestamp = Date.now();
  const path = `${userId}/${timestamp}.${ext}`;

  // Supabase JS client doesn't support upload progress natively —
  // simulate progress with XHR for UX
  const base64Promise = new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const base64 = await base64Promise;

  if (onProgress) onProgress(20);

  const { data, error } = await supabaseClient.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    });

  if (error) throw error;

  if (onProgress) onProgress(80);

  let publicUrl = null;
  let signedUrl = null;

  if (bucket === 'profile-images') {
    const { data: urlData } = supabaseClient.storage
      .from(bucket)
      .getPublicUrl(path);
    publicUrl = urlData?.publicUrl || null;
  } else {
    const { data: signedData, error: signedError } = await supabaseClient.storage
      .from(bucket)
      .createSignedUrl(path, 60 * 60 * 24 * 7); // 7 days
    if (!signedError) signedUrl = signedData?.signedUrl || null;
  }

  if (onProgress) onProgress(100);

  return { path, publicUrl, signedUrl, base64 };
}

/**
 * Delete a file from Supabase Storage
 * @param {string} bucket
 * @param {string} path
 */
async function deleteFromStorage(bucket, path) {
  const { error } = await supabaseClient.storage.from(bucket).remove([path]);
  if (error) throw error;
}

/**
 * Get a signed URL for a private file
 * @param {string} bucket
 * @param {string} path
 * @param {number} expiresIn - seconds until expiry (default 3600)
 */
async function getSignedUrl(bucket, path, expiresIn = 3600) {
  const { data, error } = await supabaseClient.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);
  if (error) throw error;
  return data.signedUrl;
}

/**
 * Set progress bar value
 */
function setProgressBar(progressBarId, percent) {
  const bar = document.getElementById(progressBarId);
  if (!bar) return;
  bar.style.width = `${percent}%`;
  bar.setAttribute('aria-valuenow', percent);
}

export {
  initUploadZone,
  uploadToStorage,
  deleteFromStorage,
  getSignedUrl,
  setProgressBar,
};
