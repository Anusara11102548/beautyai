// ============================================================
// Analysis History Management
// ============================================================

import { supabaseClient } from './supabase.js';
import { getCurrentUser } from './auth.js';
import { deleteAnalysis } from './face-analysis.js';
import { getSignedUrl } from './upload.js';
import { toast } from './toast.js';

const PAGE_SIZE = 8;

let currentPage = 1;
let totalPages = 1;
let pendingDeleteId = null;
let pendingDeletePath = null;

// ── Skin tone color map ───────────────────────────────────────
const SKIN_TONE_COLORS = {
  fair:   '#FDEBD0',
  light:  '#F5CBA7',
  medium: '#E59866',
  tan:    '#CA6F1E',
  deep:   '#784212',
};

/**
 * Load and render history page
 */
async function loadHistory(page = 1) {
  currentPage = page;
  const user = await getCurrentUser();
  if (!user) return;

  const container = document.getElementById('history-container');
  const emptyState = document.getElementById('empty-state');
  const paginationEl = document.getElementById('pagination');
  const loadingEl = document.getElementById('history-loading');

  if (loadingEl) loadingEl.style.display = 'grid';
  if (container) container.innerHTML = '';

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  try {
    const { data, error, count } = await supabaseClient
      .from('face_analysis')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .eq('analysis_status', 'completed')
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    totalPages = Math.ceil((count || 0) / PAGE_SIZE);

    if (loadingEl) loadingEl.style.display = 'none';

    if (!data || data.length === 0) {
      if (emptyState) emptyState.classList.remove('hidden');
      if (paginationEl) paginationEl.classList.add('hidden');
      return;
    }

    if (emptyState) emptyState.classList.add('hidden');

    // Render cards
    for (const item of data) {
      const card = await createHistoryCard(item);
      if (container) container.appendChild(card);
    }

    // Render pagination
    if (paginationEl) renderPagination(paginationEl, page, totalPages);

  } catch (err) {
    if (loadingEl) loadingEl.style.display = 'none';
    toast.error('Failed to load history.');
    console.error(err);
  }
}

/**
 * Create a history card element
 */
async function createHistoryCard(item) {
  const card = document.createElement('div');
  card.id = `history-card-${item.id}`;
  card.style.cssText = 'background:#fff;border-radius:1rem;border:1px solid #fce7f3;box-shadow:0 2px 8px rgba(0,0,0,0.05);overflow:hidden;transition:box-shadow 200ms,transform 200ms;';
  card.addEventListener('mouseenter', () => { card.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'; card.style.transform = 'translateY(-2px)'; });
  card.addEventListener('mouseleave', () => { card.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'; card.style.transform = 'translateY(0)'; });

  const date = new Date(item.created_at).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });

  const skinToneColor = SKIN_TONE_COLORS[item.skin_tone] || '#E59866';

  let imgSrc = 'https://placehold.co/100x120/fce7f3/EC4899?text=?';
  if (item.uploaded_image) {
    try {
      imgSrc = await getSignedUrl('face-analysis-images', item.uploaded_image, 3600);
    } catch (_) {}
  }

  const badge = (bg, color, border, text) =>
    `<span style="background:${bg};color:${color};border:1px solid ${border};font-family:'Raleway',sans-serif;font-size:0.6875rem;font-weight:700;padding:0.15rem 0.5rem;border-radius:9999px;">${text}</span>`;

  card.innerHTML = `
    <div style="display:flex;height:100%;">
      <div style="flex-shrink:0;width:96px;">
        <img src="${imgSrc}" alt="Analysis photo"
          style="width:96px;height:100%;min-height:120px;object-fit:cover;display:block;"
          loading="lazy"
          onerror="this.src='https://placehold.co/96x120/fce7f3/EC4899?text=?'" />
      </div>
      <div style="flex:1;padding:0.875rem;display:flex;flex-direction:column;justify-content:space-between;min-width:0;">
        <div>
          <p style="font-family:'Raleway',sans-serif;font-size:0.75rem;color:#94a3b8;margin:0 0 0.5rem;">${date}</p>
          <div style="display:flex;flex-wrap:wrap;gap:0.3rem;margin-bottom:0.375rem;">
            ${item.skin_tone ? badge(`${skinToneColor}20`, skinToneColor, `${skinToneColor}40`, `<span style="width:6px;height:6px;border-radius:50%;background:${skinToneColor};display:inline-block;margin-right:3px;vertical-align:middle;"></span>${capitalize(item.skin_tone)}`) : ''}
            ${item.face_shape ? badge('rgba(139,92,246,0.08)', '#7c3aed', 'rgba(139,92,246,0.20)', capitalize(item.face_shape)) : ''}
            ${item.undertone  ? badge('rgba(100,116,139,0.08)', '#475569', 'rgba(100,116,139,0.20)', capitalize(item.undertone)) : ''}
            ${item.skin_type  ? badge('rgba(34,197,94,0.08)', '#16a34a', 'rgba(34,197,94,0.20)', capitalize(item.skin_type)) : ''}
          </div>
          ${item.beauty_style ? `<p style="font-family:'Raleway',sans-serif;font-size:0.75rem;color:#8B5CF6;font-weight:600;margin:0;">${item.beauty_style}</p>` : ''}
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-top:0.625rem;padding-top:0.5rem;border-top:1px solid #f1f5f9;">
          <button onclick="viewDetails('${item.id}')"
            style="padding:0.375rem 0.875rem;border-radius:0.5rem;background:linear-gradient(135deg,#EC4899,#c026d3);color:#fff;border:none;font-family:'Raleway',sans-serif;font-size:0.8125rem;font-weight:600;cursor:pointer;transition:opacity 200ms;"
            onmouseenter="this.style.opacity='0.85'" onmouseleave="this.style.opacity='1'">View</button>
          <button onclick="confirmDelete('${item.id}','${item.uploaded_image || ''}')"
            style="padding:0.375rem 0.5rem;border-radius:0.5rem;background:transparent;color:#94a3b8;border:none;cursor:pointer;transition:color 200ms;display:flex;align-items:center;gap:0.25rem;font-family:'Raleway',sans-serif;font-size:0.8125rem;"
            onmouseenter="this.style.color='#ef4444'" onmouseleave="this.style.color='#94a3b8'">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
            Delete
          </button>
        </div>
      </div>
    </div>`;

  return card;
}

/**
 * Render pagination controls
 */
function renderPagination(container, current, total) {
  if (total <= 1) {
    container.classList.add('hidden');
    return;
  }
  container.classList.remove('hidden');

  const btnBase = 'font-family:\'Raleway\',sans-serif;font-size:0.875rem;font-weight:600;border-radius:0.5rem;padding:0.5rem 0.875rem;border:1.5px solid;cursor:pointer;transition:all 200ms;min-width:2.5rem;text-align:center;';
  const btnActive = `${btnBase}background:linear-gradient(135deg,#EC4899,#c026d3);color:#fff;border-color:transparent;`;
  const btnNormal = `${btnBase}background:#fff;color:#475569;border-color:#e2e8f0;`;
  const btnDisabled = `${btnBase}background:#f8fafc;color:#cbd5e1;border-color:#f1f5f9;cursor:not-allowed;`;

  const pages = Array.from({ length: total }, (_, i) => i + 1);
  container.innerHTML = `
    <div style="display:flex;gap:0.375rem;align-items:center;">
      <button style="${current === 1 ? btnDisabled : btnNormal}"
        ${current === 1 ? 'disabled' : `onclick="loadHistory(${current - 1})"`}
        aria-label="Previous page">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 19l-7-7 7-7"/></svg>
      </button>
      ${pages.map(p => `
        <button style="${p === current ? btnActive : btnNormal}"
          onclick="loadHistory(${p})" aria-label="Page ${p}" ${p === current ? 'aria-current="page"' : ''}>${p}</button>
      `).join('')}
      <button style="${current === total ? btnDisabled : btnNormal}"
        ${current === total ? 'disabled' : `onclick="loadHistory(${current + 1})"`}
        aria-label="Next page">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>
      </button>
    </div>`;
}

/**
 * Navigate to detail view
 */
function viewDetails(analysisId) {
  window.location.href = `cosmetic-recommendation.html?id=${analysisId}`;
}

/**
 * Open delete confirmation modal
 */
function confirmDelete(analysisId, storagePath) {
  pendingDeleteId = analysisId;
  pendingDeletePath = storagePath;
  const modal = document.getElementById('delete-modal');
  if (modal) modal.showModal();
}

/**
 * Execute confirmed deletion
 */
async function executeDelete() {
  if (!pendingDeleteId) return;

  const btn = document.getElementById('confirm-delete-btn');
  if (btn) { btn.disabled = true; btn.classList.add('loading'); }

  try {
    await deleteAnalysis(pendingDeleteId, pendingDeletePath || null);
    toast.success('Analysis deleted.');

    const modal = document.getElementById('delete-modal');
    if (modal) modal.close();

    // Remove card from DOM
    const card = document.getElementById(`history-card-${pendingDeleteId}`);
    if (card) {
      card.classList.add('opacity-0', 'scale-95');
      setTimeout(() => card.remove(), 300);
    }

    pendingDeleteId = null;
    pendingDeletePath = null;

    // Reload if page is now empty
    setTimeout(() => loadHistory(currentPage), 500);

  } catch (err) {
    toast.error('Failed to delete analysis.');
  } finally {
    if (btn) { btn.disabled = false; btn.classList.remove('loading'); }
  }
}

/**
 * Download analysis as JSON
 */
async function downloadAsJSON(analysisId) {
  try {
    const { data, error } = await supabaseClient
      .from('face_analysis')
      .select(`*, cosmetic_recommendations(*)`)
      .eq('id', analysisId)
      .single();

    if (error) throw error;

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `beauty-analysis-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    toast.error('Failed to download analysis.');
  }
}

function capitalize(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
}

// Expose to global scope for inline onclick handlers
window.loadHistory = loadHistory;
window.viewDetails = viewDetails;
window.confirmDelete = confirmDelete;
window.executeDelete = executeDelete;
window.downloadAsJSON = downloadAsJSON;

export { loadHistory, viewDetails, confirmDelete, executeDelete, downloadAsJSON };
