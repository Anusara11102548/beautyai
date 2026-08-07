// ============================================================
// BeautyAI Navbar Component
// Design System: Lora/Raleway, #EC4899 pink, #8B5CF6 purple
// Rules: SVG icons only, cursor-pointer, smooth transitions
// ============================================================

import { supabaseClient } from '../js/supabase.js';
import { logout } from '../js/auth.js';

const NAV_LINKS_PUBLIC = [];

const NAV_LINKS_AUTH = [
  { href: 'dashboard.html',               label: 'Dashboard'      },
  { href: 'face-analysis.html',           label: 'Face Analysis'  },
  { href: 'cosmetic-recommendation.html', label: 'Recommendations'},
  { href: 'history.html',                 label: 'History'        },
];

// SVG icon helpers
const ICONS = {
  logo: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="url(#logo-grad)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <defs><linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#EC4899"/><stop offset="100%" stop-color="#8B5CF6"/></linearGradient></defs>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
    <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
    <line x1="9" y1="9" x2="9.01" y2="9"/>
    <line x1="15" y1="9" x2="15.01" y2="9"/>
  </svg>`,
  menu: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
    <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h8m-8 6h16"/>
  </svg>`,
  close: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
  </svg>`,
  sun: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
    <circle cx="12" cy="12" r="5"/>
    <path stroke-linecap="round" d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
  </svg>`,
  moon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
    <path stroke-linecap="round" stroke-linejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
  </svg>`,
  chevronDown: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
    <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
  </svg>`,
  logout: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
    <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
  </svg>`,
  user: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
    <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
  </svg>`,
  history: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
    <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
  </svg>`,
  dashboard: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
    <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
  </svg>`,
};

async function initNavbar() {
  const container = document.getElementById('navbar-container');
  if (!container) return;

  const { data: { session } } = await supabaseClient.auth.getSession();
  const isAuth = !!session;

  let profile = null;
  if (isAuth) {
    const { data } = await supabaseClient
      .from('users')
      .select('username, profile_image')
      .eq('id', session.user.id)
      .single();
    profile = data;
  }

  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = isAuth ? NAV_LINKS_AUTH : NAV_LINKS_PUBLIC;
  const avatarSrc = profile?.profile_image ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.username || 'U')}&background=EC4899&color=fff&size=80&bold=true`;

  container.innerHTML = `
    <nav class="navbar-beautyai" role="navigation" aria-label="Main navigation">
      <div style="max-width:1280px; margin:0 auto; padding:0 1.5rem; display:flex; align-items:center; height:64px; gap:1rem;">

        <!-- Logo -->
        <a href="index.html" class="flex items-center gap-2 flex-shrink-0" style="text-decoration:none; cursor:pointer;"
           aria-label="BeautyAI home">
          ${ICONS.logo}
          <span style="font-family:'Lora',serif; font-weight:700; font-size:1.25rem; background:linear-gradient(135deg,#EC4899,#8B5CF6); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;">
            BeautyAI
          </span>
        </a>

        <!-- Desktop nav links -->
        <ul style="display:flex; gap:0.25rem; list-style:none; margin:0; padding:0; margin-left:2rem;" class="hidden lg:flex">
          ${navLinks.map(l => `
            <li>
              <a href="${l.href}"
                 style="padding:0.5rem 0.875rem; border-radius:0.5rem; font-family:'Raleway',sans-serif; font-size:0.875rem; font-weight:${currentPage === l.href ? '600' : '500'}; color:${currentPage === l.href ? '#EC4899' : '#475569'}; background:${currentPage === l.href ? 'rgba(236,72,153,0.08)' : 'transparent'}; text-decoration:none; cursor:pointer; transition:all 200ms ease; display:block;"
                 onmouseover="if('${currentPage}' !== '${l.href}'){this.style.background='rgba(236,72,153,0.06)';this.style.color='#EC4899';}"
                 onmouseout="if('${currentPage}' !== '${l.href}'){this.style.background='transparent';this.style.color='#475569';}"
              >${l.label}</a>
            </li>
          `).join('')}
        </ul>

        <!-- Spacer -->
        <div style="flex:1;"></div>

        <!-- Theme toggle (light mode only per design system — toggle removed, kept for accssibility) -->

        <!-- Auth actions -->
        ${!isAuth ? `
          <div style="display:flex; gap:0.5rem; align-items:center;">
            <a href="login.html"
               class="hidden sm:block"
               style="padding:0.5rem 1rem; border-radius:0.5rem; font-family:'Raleway',sans-serif; font-size:0.875rem; font-weight:600; color:#475569; text-decoration:none; cursor:pointer; transition:all 200ms ease;"
               onmouseover="this.style.color='#EC4899'; this.style.background='rgba(236,72,153,0.06)';"
               onmouseout="this.style.color='#475569'; this.style.background='transparent';"
            >Sign In</a>
            <a href="register.html"
               style="padding:0.5rem 1.25rem; border-radius:0.5rem; font-family:'Raleway',sans-serif; font-size:0.875rem; font-weight:600; background:linear-gradient(135deg,#EC4899,#c026d3); color:white; text-decoration:none; cursor:pointer; transition:all 200ms ease; box-shadow:0 4px 12px rgba(236,72,153,0.3);"
               onmouseover="this.style.opacity='0.92'; this.style.transform='translateY(-1px)';"
               onmouseout="this.style.opacity='1'; this.style.transform='translateY(0)';"
            >Get Started</a>
          </div>
        ` : `
          <!-- User dropdown -->
          <div class="relative" id="user-dropdown-wrapper">
            <button
              id="user-menu-btn"
              aria-haspopup="true"
              aria-expanded="false"
              style="display:flex; align-items:center; gap:0.5rem; padding:0.375rem 0.75rem 0.375rem 0.375rem; border-radius:9999px; border:1px solid rgba(236,72,153,0.2); background:white; cursor:pointer; transition:all 200ms ease; box-shadow:0 1px 3px rgba(0,0,0,0.06);"
              onmouseover="this.style.boxShadow='0 4px 12px rgba(236,72,153,0.15)';"
              onmouseout="this.style.boxShadow='0 1px 3px rgba(0,0,0,0.06)';"
            >
              <img
                src="${avatarSrc}"
                alt="${profile?.username || 'User'} profile photo"
                style="width:32px; height:32px; border-radius:50%; object-fit:cover; border:2px solid rgba(236,72,153,0.3);"
                onerror="this.src='https://ui-avatars.com/api/?name=U&background=EC4899&color=fff&size=80'"
              />
              <span style="font-family:'Raleway',sans-serif; font-size:0.8125rem; font-weight:600; color:#1e293b; max-width:100px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" class="hidden sm:block">${profile?.username || 'Account'}</span>
              <span style="color:#94a3b8;">${ICONS.chevronDown}</span>
            </button>

            <!-- Dropdown menu -->
            <div
              id="user-menu-dropdown"
              role="menu"
              aria-label="User account menu"
              style="position:absolute; right:0; top:calc(100% + 8px); width:200px; background:white; border-radius:0.75rem; box-shadow:0 10px 30px rgba(0,0,0,0.12); border:1px solid rgba(236,72,153,0.1); padding:0.5rem; display:none; z-index:100;"
            >
              <div style="padding:0.5rem 0.75rem 0.625rem; border-bottom:1px solid #f1f5f9; margin-bottom:0.25rem;">
                <p style="font-family:'Raleway',sans-serif; font-size:0.875rem; font-weight:700; color:#1e293b; margin:0;">${profile?.username || 'User'}</p>
              </div>
              <a href="dashboard.html" role="menuitem" style="display:flex;align-items:center;gap:0.625rem;padding:0.5rem 0.75rem;border-radius:0.5rem;font-family:'Raleway',sans-serif;font-size:0.8125rem;font-weight:500;color:#475569;text-decoration:none;cursor:pointer;transition:all 150ms;" onmouseover="this.style.background='rgba(236,72,153,0.07)';this.style.color='#EC4899';" onmouseout="this.style.background='transparent';this.style.color='#475569';">
                ${ICONS.dashboard} Dashboard
              </a>
              <a href="profile.html" role="menuitem" style="display:flex;align-items:center;gap:0.625rem;padding:0.5rem 0.75rem;border-radius:0.5rem;font-family:'Raleway',sans-serif;font-size:0.8125rem;font-weight:500;color:#475569;text-decoration:none;cursor:pointer;transition:all 150ms;" onmouseover="this.style.background='rgba(236,72,153,0.07)';this.style.color='#EC4899';" onmouseout="this.style.background='transparent';this.style.color='#475569';">
                ${ICONS.user} Profile
              </a>
              <a href="history.html" role="menuitem" style="display:flex;align-items:center;gap:0.625rem;padding:0.5rem 0.75rem;border-radius:0.5rem;font-family:'Raleway',sans-serif;font-size:0.8125rem;font-weight:500;color:#475569;text-decoration:none;cursor:pointer;transition:all 150ms;" onmouseover="this.style.background='rgba(236,72,153,0.07)';this.style.color='#EC4899';" onmouseout="this.style.background='transparent';this.style.color='#475569';">
                ${ICONS.history} History
              </a>
              <div style="border-top:1px solid #f1f5f9; margin:0.25rem 0;"></div>
              <button role="menuitem" onclick="window.__navbarLogout()" style="display:flex;align-items:center;gap:0.625rem;width:100%;padding:0.5rem 0.75rem;border-radius:0.5rem;font-family:'Raleway',sans-serif;font-size:0.8125rem;font-weight:500;color:#ef4444;background:none;border:none;cursor:pointer;transition:all 150ms;text-align:left;" onmouseover="this.style.background='rgba(239,68,68,0.07)';" onmouseout="this.style.background='transparent';">
                ${ICONS.logout} Sign Out
              </button>
            </div>
          </div>
        `}

        <!-- Mobile menu button -->
        <button
          id="mobile-menu-btn"
          class="lg:hidden"
          aria-label="Open navigation menu"
          aria-expanded="false"
          style="padding:0.5rem; border-radius:0.5rem; background:transparent; border:none; cursor:pointer; color:#475569; transition:all 200ms ease;"
          onmouseover="this.style.background='rgba(236,72,153,0.08)'; this.style.color='#EC4899';"
          onmouseout="this.style.background='transparent'; this.style.color='#475569';"
        >
          ${ICONS.menu}
        </button>
      </div>

      <!-- Mobile menu drawer -->
      <div
        id="mobile-menu"
        style="display:none; border-top:1px solid rgba(236,72,153,0.1);"
        role="navigation"
        aria-label="Mobile navigation"
      >
        <div style="max-width:1280px; margin:0 auto; padding:1rem 1.5rem; display:flex; flex-direction:column; gap:0.25rem;">
          ${navLinks.map(l => `
            <a href="${l.href}"
               style="display:block; padding:0.625rem 0.875rem; border-radius:0.5rem; font-family:'Raleway',sans-serif; font-size:0.9375rem; font-weight:${currentPage === l.href ? '600' : '500'}; color:${currentPage === l.href ? '#EC4899' : '#475569'}; background:${currentPage === l.href ? 'rgba(236,72,153,0.08)' : 'transparent'}; text-decoration:none; cursor:pointer; transition:all 200ms ease;"
            >${l.label}</a>
          `).join('')}
          ${!isAuth ? `
            <div style="display:flex; gap:0.5rem; margin-top:0.5rem;">
              <a href="login.html" style="flex:1; padding:0.625rem; border-radius:0.5rem; text-align:center; font-family:'Raleway',sans-serif; font-weight:600; font-size:0.875rem; color:#EC4899; border:1.5px solid #EC4899; text-decoration:none; cursor:pointer;">Sign In</a>
              <a href="register.html" style="flex:1; padding:0.625rem; border-radius:0.5rem; text-align:center; font-family:'Raleway',sans-serif; font-weight:600; font-size:0.875rem; color:white; background:linear-gradient(135deg,#EC4899,#c026d3); text-decoration:none; cursor:pointer;">Get Started</a>
            </div>
          ` : `
            <button onclick="window.__navbarLogout()" style="display:flex;align-items:center;gap:0.5rem;padding:0.625rem 0.875rem;border-radius:0.5rem;font-family:'Raleway',sans-serif;font-size:0.9375rem;font-weight:500;color:#ef4444;background:none;border:none;cursor:pointer;margin-top:0.25rem;transition:all 200ms;" onmouseover="this.style.background='rgba(239,68,68,0.07)';" onmouseout="this.style.background='transparent';">
              ${ICONS.logout} Sign Out
            </button>
          `}
        </div>
      </div>
    </nav>
  `;

  // Mobile menu toggle
  const mobileBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  let mobileOpen = false;

  mobileBtn?.addEventListener('click', () => {
    mobileOpen = !mobileOpen;
    mobileMenu.style.display = mobileOpen ? 'block' : 'none';
    mobileBtn.setAttribute('aria-expanded', mobileOpen);
  });

  // User dropdown toggle
  const userBtn = document.getElementById('user-menu-btn');
  const userDropdown = document.getElementById('user-menu-dropdown');
  let dropdownOpen = false;

  userBtn?.addEventListener('click', () => {
    dropdownOpen = !dropdownOpen;
    userDropdown.style.display = dropdownOpen ? 'block' : 'none';
    userBtn.setAttribute('aria-expanded', dropdownOpen);
  });

  // Close dropdown on outside click
  document.addEventListener('click', (e) => {
    const wrapper = document.getElementById('user-dropdown-wrapper');
    if (wrapper && !wrapper.contains(e.target)) {
      if (userDropdown) userDropdown.style.display = 'none';
      dropdownOpen = false;
      userBtn?.setAttribute('aria-expanded', 'false');
    }
  });

  // Keyboard nav for dropdown
  userDropdown?.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      userDropdown.style.display = 'none';
      dropdownOpen = false;
      userBtn?.focus();
    }
  });

  // Logout handler
  window.__navbarLogout = async () => {
    try { await logout(); }
    catch (_) { window.location.href = 'index.html'; }
  };
}

export { initNavbar };
