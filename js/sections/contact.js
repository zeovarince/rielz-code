/**
 * contact.js — Contact Section
 *
 * Layout: heading besar + 3 card kontak (email, instagram, github)
 * Tidak ada form — langsung ke channel komunikasi
 */

const ICONS = {
  mail: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="M2 7l10 7 10-7"/>
  </svg>`,

  instagram: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <circle cx="12" cy="12" r="4"/>
    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
  </svg>`,

  github: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61
      c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77
      A5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48
      a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1
      A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78
      c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
  </svg>`,

  arrowright: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>`,
};

/* ─── Build contact channel card ─── */
function buildChannelCard(icon, label, value, href, delay) {
  return `
    <a class="contact-card fade-in-hidden" data-delay="${delay}"
      style="transition-delay:${delay}ms"
      href="${href}" target="_blank" rel="noreferrer"
      aria-label="${label}: ${value}">

      <div class="contact-card__icon">${icon}</div>

      <div class="contact-card__body">
        <span class="contact-card__label">${label}</span>
        <span class="contact-card__value">${value}</span>
      </div>

      <span class="contact-card__arrow">${ICONS.arrowright}</span>
    </a>
  `;
}

/* ─── Build section HTML ─── */
function buildContactHTML(profile, contact) {
  const email    = profile.email || contact?.email || '';
  const instagram = profile.social?.instagram || '';
  const github   = profile.social?.github || '';
  const igHandle = instagram.replace('https://instagram.com/', '@').replace('https://www.instagram.com/', '@');
  const ghHandle = github.replace('https://github.com/', '@');
  const availText = profile.availability_text || 'Open for collaboration';

  const channels = [
    {
      icon  : ICONS.mail,
      label : 'Email',
      value : email,
      href  : `mailto:${email}`,
      delay : 100,
    },
    {
      icon  : ICONS.instagram,
      label : 'Instagram',
      value : igHandle,
      href  : instagram.startsWith('http') ? instagram : `https://instagram.com/${instagram}`,
      delay : 200,
    },
    {
      icon  : ICONS.github,
      label : 'GitHub',
      value : ghHandle,
      href  : github.startsWith('http') ? github : `https://github.com/${github}`,
      delay : 300,
    },
  ].filter(c => c.value);

  const cardsHTML = channels
    .map(c => buildChannelCard(c.icon, c.label, c.value, c.href, c.delay))
    .join('');

  return `
    <div class="contact-inner">

      <!-- Glow blobs -->
      <div class="contact-blob contact-blob--purple" aria-hidden="true"></div>
      <div class="contact-blob contact-blob--pink"   aria-hidden="true"></div>

      <!-- Heading -->
      <div class="contact-heading-wrap fade-in-hidden">
        <p class="label">Contact</p>
        <h2 class="contact-heading">
          Let's <span class="text-gradient">Work</span><br>Together.
        </h2>
        <p class="contact-sub">${availText}</p>
      </div>

      <!-- Channel cards -->
      <div class="contact-cards">
        ${cardsHTML}
      </div>

    </div>
  `;
}

/* ─── INIT ─── */
export function initContact(profile, contact) {
  const section = document.getElementById('contact');
  if (!section) return;

  section.innerHTML = buildContactHTML(profile, contact);
}