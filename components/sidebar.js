// ============================================================
// BeautyAI Sidebar Component — SVG Icons, Design System
// ============================================================

import { supabaseClient } from '../js/supabase.js';
import { logout } from '../js/auth.js';

const SIDEBAR_LINKS = [
  {
    href: 'dashboard.html',
    label: 'Dashboard',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>`,
  },
  {
    href: 'face-analysis.html',
    label: 'Face Analysis',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M4 5a1 1 0 011-1h4a1 1 0 010 2H5a1 1 0 01-1-1zm0 8a1 1 0 011-1h4a1 1 0 010 2H5a1 1 0 01-1-1zm10-8a1 1 0 011-1h4a1 1 0 010 2h-4a1 1 0 01-1-1zm0 8a1 1 0 011-1h4a1 1 0 010 2h-4a1 1 0 01-1-1z"/><circle cx="12" cy="12" r="3" stroke-linecap="round"/></svg>`,
  },
  {
    href: 'cosmetic-recommendation.html',
    label: 'Recommendations',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>`,
  },
  {
    href: 'history.html',
    label: 'History',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
  },
  {
    href: 'profile.html',
    label: 'Profile',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>`,
  },
];

async function initSidebar() {
  const container = document.getElementById('sidebar-container');
  if (!container) return;

  const { data: { session } } = await supabaseClient.auth.getSession();
  let profile = null;
  if (session) {
    const { data } = await supabaseClient
      .from('users')
      .select('username, profile_image, email')
      .eq('id', session.user.id)
      .single();
    profile = data;
  }

  const currentPage = window.location.pathname.split('/').pop() || 'dashboard.html';
  const avatarSrc = profile?.profile_image ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.username || 'U')}&background=EC4899&color=fff&size=80&bold=true`;

  container.innerHTML = `
    <aside
      style="display:flex; flex-direction:column; height:100%; background:#ffffff; border-right:1px solid rgba(236,72,153,0.12); width:240px; min-height:100vh; flex-shrink:0;"
      role="navigation"
      aria-label="Sidebar navigation"
    >
      <!-- User card -->
      ${profile ? `
        <div style="padding:1rem 1.25rem; border-bottom:1px solid rgba(236,72,153,0.08);">
          <div style="display:flex; align-items:center; gap:0.75rem;">
            <img
              src="${avatarSrc}"
              alt="${profile.username || 'User'} profile"
              style="width:40px; height:40px; border-radius:50%; object-fit:cover; border:2px solid rgba(236,72,153,0.25); flex-shrink:0;"
              onerror="this.src='https://ui-avatars.com/api/?name=U&background=EC4899&color=fff&size=80'"
            />
            <div style="min-width:0;">
              <p style="font-family:'Raleway',sans-serif; font-weight:700; font-size:0.875rem; color:#1e293b; margin:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${profile.username || 'User'}</p>
              <p style="font-family:'Raleway',sans-serif; font-size:0.75rem; color:#94a3b8; margin:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${profile.email || ''}</p>
            </div>
          </div>
        </div>
      ` : ''}

      <!-- Navigation links -->
      <nav style="flex:1; padding:0.75rem; overflow-y:auto;">
        <ul style="list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:0.125rem;" role="list">
          ${SIDEBAR_LINKS.map(link => {
            const isActive = currentPage === link.href;
            return `
              <li role="listitem">
                <a
                  href="${link.href}"
                  class="sidebar-link ${isActive ? 'active' : ''}"
                  aria-current="${isActive ? 'page' : 'false'}"
                  style="${isActive ? 'background:rgba(236,72,153,0.09); color:#EC4899; font-weight:600; border-left:3px solid #EC4899;' : ''}"
                >
                  ${link.icon}
                  ${link.label}
                </a>
              </li>
            `;
          }).join('')}
        </ul>
      </nav>

      <!-- Sign out -->
      <div style="padding:0.75rem; border-top:1px solid rgba(236,72,153,0.1);">
        <button
          onclick="window.__sidebarLogout()"
          style="display:flex; align-items:center; gap:0.625rem; width:100%; padding:0.625rem 0.875rem; border-radius:0.5rem; font-family:'Raleway',sans-serif; font-size:0.875rem; font-weight:500; color:#ef4444; background:none; border:none; cursor:pointer; transition:all 200ms ease; text-align:left;"
          onmouseover="this.style.background='rgba(239,68,68,0.07)';"
          onmouseout="this.style.background='transparent';"
          aria-label="Sign out of your account"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
          </svg>
          Sign Out
        </button>
      </div>
    </aside>
  `;

  window.__sidebarLogout = async () => {
    try { await logout(); }
    catch (_) { window.location.href = 'index.html'; }
  };
}

export { initSidebar };
