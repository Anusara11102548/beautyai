// ============================================================
// Toast Notification System — BeautyAI Design System
// Uses SVG icons, no emojis. Soft UI Evolution style.
// ============================================================

const TOAST_CONFIG = {
  success: {
    borderColor: '#22c55e',
    iconColor:   '#16a34a',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
             <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
           </svg>`,
  },
  error: {
    borderColor: '#ef4444',
    iconColor:   '#dc2626',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
             <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
           </svg>`,
  },
  warning: {
    borderColor: '#f59e0b',
    iconColor:   '#d97706',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
             <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
           </svg>`,
  },
  info: {
    borderColor: '#3b82f6',
    iconColor:   '#2563eb',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
             <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z"/>
           </svg>`,
  },
};

let container = null;

function getContainer() {
  if (!container) {
    container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.setAttribute('role', 'region');
      container.setAttribute('aria-label', 'Notifications');
      container.setAttribute('aria-live', 'polite');
      document.body.appendChild(container);
    }
  }
  return container;
}

/**
 * Show a toast notification
 * @param {string} message
 * @param {'success'|'error'|'warning'|'info'} type
 * @param {number} duration ms
 */
function showToast(message, type = 'info', duration = 4000) {
  const c = getContainer();
  const cfg = TOAST_CONFIG[type] || TOAST_CONFIG.info;

  const item = document.createElement('div');
  item.className = `toast-item toast-${type}`;
  item.setAttribute('role', 'alert');
  item.style.cssText = `border-left-color: ${cfg.borderColor};`;

  item.innerHTML = `
    <span style="color:${cfg.iconColor}; flex-shrink:0; margin-top:1px;">${cfg.icon}</span>
    <span style="flex:1; line-height:1.45;">${message}</span>
    <button
      style="flex-shrink:0; background:none; border:none; cursor:pointer; color:#94a3b8; padding:2px; border-radius:4px; display:flex; align-items:center; transition:color 150ms;"
      aria-label="Dismiss notification"
      onmouseover="this.style.color='#475569'"
      onmouseout="this.style.color='#94a3b8'"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
      </svg>
    </button>
  `;

  c.appendChild(item);

  // Animate in
  requestAnimationFrame(() => requestAnimationFrame(() => item.classList.add('show')));

  const closeBtn = item.querySelector('button');
  closeBtn.addEventListener('click', () => dismiss(item));

  const timer = setTimeout(() => dismiss(item), duration);
  item._timer = timer;

  return item;
}

function dismiss(item) {
  if (!item || !item.parentNode) return;
  clearTimeout(item._timer);
  item.classList.remove('show');
  item.classList.add('hide');
  setTimeout(() => item.parentNode?.removeChild(item), 300);
}

const toast = {
  success: (msg, dur) => showToast(msg, 'success', dur),
  error:   (msg, dur) => showToast(msg, 'error',   dur),
  warning: (msg, dur) => showToast(msg, 'warning', dur),
  info:    (msg, dur) => showToast(msg, 'info',    dur),
};

export { showToast, toast };
