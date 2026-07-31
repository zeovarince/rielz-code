/**
 * navbar.js — Floating Dock Navigation
 *
 * Desktop : fixed kanan tengah, vertikal
 * Mobile  : fixed bawah tengah, horizontal
 * Icon    : Lucide SVG inline
 * Active  : IntersectionObserver — highlight section yang sedang dilihat
 * Click   : smooth scroll ke section
 *
 */

import { scrollToSection } from '../utils/helper.js';

/* ─────────────────────────────────────────────
   ICONS
───────────────────────────────────────────── */
const ICONS = {
  home: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/>
    <polyline points="9 21 9 12 15 12 15 21"/>
  </svg>`,

  user: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="8" r="4"/>
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
  </svg>`,

  code: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="16 18 22 12 16 6"/>
    <polyline points="8 6 2 12 8 18"/>
  </svg>`,

  briefcase: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2"/>
    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
    <line x1="12" y1="12" x2="12" y2="12"/>
  </svg>`,

  layers: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2"/>
    <polyline points="2 17 12 22 22 17"/>
    <polyline points="2 12 12 17 22 12"/>
  </svg>`,

  github: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61
      c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77
      A5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48
      a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1
      A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78
      c0 5.42 3.3 6.61 6.44 7
      A3.37 3.37 0 0 0 9 18.13V22"/>
  </svg>`,

  mail: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="M2 7l10 7 10-7"/>
  </svg>`,

  award: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="9" r="7"/>
    <polyline points="9 14.2 12 22 15 14.2"/>
    <polyline points="9.6 14.6 12 17 14.4 14.6"/>
  </svg>`,
};

/* ─────────────────────────────────────────────
   BUILD HTML — Dock utama (scroll nav)
───────────────────────────────────────────── */
function buildDockHTML(navItems, isCertificatesPage) {
  const items = navItems.map((item) => {
    const icon = ICONS[item.icon] || ICONS.home;
    const href = isCertificatesPage ? `./index.html#${item.id}` : null;
    if (isCertificatesPage) {
      return `
        <li>
          <a
            class="dock-item"
            href="${href}"
            aria-label="${item.label}"
            title="${item.label}"
          >
            <span class="dock-icon">${icon}</span>
            <span class="dock-tooltip">${item.label}</span>
          </a>
        </li>
      `;
    }

    return `
      <li>
        <button
          class="dock-item"
          data-target="${item.id}"
          aria-label="${item.label}"
          title="${item.label}"
        >
          <span class="dock-icon">${icon}</span>
          <span class="dock-tooltip">${item.label}</span>
        </button>
      </li>
    `;
  }).join('');

  return `<ul class="dock-list">${items}</ul>`;
}

/* ─────────────────────────────────────────────
   BUILD HTML — Dock Certificates (terpisah)
   Panel sendiri di bawah dock utama,
   hanya satu tombol → navigasi ke certificates.html
───────────────────────────────────────────── */
function buildCertDockHTML(isActive) {
  return `
    <nav id="cert-dock-widget" aria-label="Halaman Sertifikat">
      <ul class="cert-dock-widget-list">
        <li>
          <a
            href="./certificates.html"
            class="cert-dock-widget-btn ${isActive ? 'cert-dock-widget-btn--active' : ''}"
            aria-label="Certificates"
            title="Certificates"
            ${isActive ? 'aria-current="page"' : ''}
          >
            <span class="dock-icon">${ICONS.award}</span>
            <span class="dock-tooltip">Certificates</span>
          </a>
        </li>
      </ul>
    </nav>
  `;
}

/* ─────────────────────────────────────────────
   ACTIVE STATE via IntersectionObserver
───────────────────────────────────────────── */
function initActiveObserver(navItems) {
  const sectionIds = navItems.map((n) => n.id);
  const activeMap  = new Map();

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        activeMap.set(entry.target.id, entry.isIntersecting);
      });

      let currentId = null;
      for (const id of sectionIds) {
        if (activeMap.get(id)) { currentId = id; break; }
      }

      document.querySelectorAll('.dock-item').forEach((btn) => {
        btn.classList.toggle('dock-item--active', btn.dataset.target === currentId);
      });
    },
    { threshold: 0.25, rootMargin: '0px 0px -20% 0px' }
  );

  sectionIds.forEach((id) => {
    const el = document.getElementById(id);
    if (el) observer.observe(el);
  });
}

/* ─────────────────────────────────────────────
   CLICK → SMOOTH SCROLL
───────────────────────────────────────────── */
function initClickHandlers(isCertificatesPage) {
  document.querySelectorAll('.dock-item').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (isCertificatesPage) {
        window.location.href = `./index.html#${btn.dataset.target}`;
        return;
      }

      scrollToSection(btn.dataset.target, 0);
    });
  });

  document.querySelectorAll('.cert-dock-widget-btn').forEach((btn) => {
    btn.addEventListener('click', (event) => {
      event.preventDefault();
      window.location.href = btn.getAttribute('href') || './certificates.html';
    });
  });
}

/* ─────────────────────────────────────────────
   INIT
───────────────────────────────────────────── */
export function initNavbar(config) {
  const dock = document.getElementById('floating-dock');
  if (!dock) return;

  const navItems = config?.nav || [];
  if (!navItems.length) return;

  const isCertificatesPage = /(^|\/)certificates\.html$/i.test(window.location.pathname);

  // Dock utama
  dock.innerHTML = buildDockHTML(navItems, isCertificatesPage);

  // Dock Certificates — sisipkan setelah #floating-dock di DOM
  const certWidget = document.createElement('div');
  certWidget.innerHTML = buildCertDockHTML(isCertificatesPage);
  dock.parentNode.insertBefore(certWidget.firstElementChild, dock.nextSibling);

  initActiveObserver(navItems);
  initClickHandlers(isCertificatesPage);
}