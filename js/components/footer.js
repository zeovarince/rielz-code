/**
 * footer.js — Footer Component
 */

const ICONS = {
  github: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61
      c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77
      A5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48
      a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1
      A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78
      c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
  </svg>`,
  instagram: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <circle cx="12" cy="12" r="4"/>
    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
  </svg>`,
  linkedin: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
    <rect x="2" y="9" width="4" height="12"/>
    <circle cx="4" cy="4" r="2"/>
  </svg>`,
  arrowup: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <line x1="12" y1="19" x2="12" y2="5"/>
    <polyline points="5 12 12 5 19 12"/>
  </svg>`,
};

function buildFooterHTML(profile) {
  const year     = new Date().getFullYear();
  const name     = profile.name?.short || 'Choiril';
  const fullName = profile.name?.full  || 'A. Choiril Anwar El-Asfihani Risydan';
  const social   = profile.social || {};

  const socialLinks = [
    social.github    && { icon: ICONS.github,    href: social.github,    label: 'GitHub'    },
    social.instagram && { icon: ICONS.instagram, href: social.instagram.startsWith('http') ? social.instagram : `https://instagram.com/${social.instagram}`, label: 'Instagram' },
    social.linkedin  && { icon: ICONS.linkedin,  href: social.linkedin,  label: 'LinkedIn'  },
  ].filter(Boolean);

  const socialHTML = socialLinks.map(s => `
    <a href="${s.href}" target="_blank" rel="noreferrer"
      class="footer-social-link" aria-label="${s.label}">
      ${s.icon}
    </a>
  `).join('');

  return `
    <div class="footer-inner">
      <div class="footer-divider"></div>

      <div class="footer-main">
        <!-- Kiri: nama & copyright -->
        <div class="footer-left">
          <p class="footer-name">${name}</p>
          <p class="footer-copy">
            &copy; ${year} ${fullName}
          </p>
        </div>

        <!-- Tengah: social links -->
        <div class="footer-social">
          ${socialHTML}
        </div>

        <!-- Kanan: back to top -->
        <button class="footer-top-btn" id="footer-top-btn" aria-label="Kembali ke atas">
          ${ICONS.arrowup}
          <span>Top</span>
        </button>
      </div>
    </div>
  `;
}

export function initFooter(profile) {
  const footer = document.getElementById('footer');
  if (!footer || !profile) return;

  footer.innerHTML = buildFooterHTML(profile);

  // Back to top
  document.getElementById('footer-top-btn')?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}