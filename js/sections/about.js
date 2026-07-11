/**
 * about.js — About Section
 *
 * Layout:
 * - Kiri : foto avatar + availability badge + social links
 * - Kanan: label, heading besar, bio, stats row, title tags
 *
 * Data dari profile.json
 * Animasi: fade-in-hidden via IntersectionObserver (sudah di app.js)
 */

/* ─────────────────────────────────────────────
   ICON SVG — Lucide inline
───────────────────────────────────────────── */
const SOCIAL_ICONS = {
  github: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61
      c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77
      A5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48
      a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1
      A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78
      c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
  </svg>`,

  instagram: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <circle cx="12" cy="12" r="4"/>
    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
  </svg>`,

  linkedin: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
    <rect x="2" y="9" width="4" height="12"/>
    <circle cx="4" cy="4" r="2"/>
  </svg>`,

  mail: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="M2 7l10 7 10-7"/>
  </svg>`,

  mappin: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>`,

  graduationcap: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
    <path d="M6 12v5c0 2 6 3 6 3s6-1 6-3v-5"/>
  </svg>`,

  arrowupright: `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <line x1="7" y1="17" x2="17" y2="7"/>
    <polyline points="7 7 17 7 17 17"/>
  </svg>`,
};

/* ─────────────────────────────────────────────
   STATS — angka yang ditampilkan
───────────────────────────────────────────── */
function buildStats(profile) {
  const year = parseInt(profile.year || '2024', 10);
  const yearsActive = new Date().getFullYear() - year + 1;

  return [
    { value: yearsActive + '+', label: 'Years\nLearning' },
    { value: profile.title.length + '+', label: 'Tech\nRoles' },
    { value: '10+', label: 'Projects\nBuilt' },
  ];
}

/* ─────────────────────────────────────────────
   BUILD SOCIAL LINKS
───────────────────────────────────────────── */
function buildSocialLinks(social, email) {
  const links = [];

  if (social?.github)
    links.push({ href: social.github, icon: 'github', label: 'GitHub' });
  if (social?.instagram)
    links.push({ href: social.instagram.startsWith('http') ? social.instagram : `https://instagram.com/${social.instagram}`, icon: 'instagram', label: 'Instagram' });
  if (social?.linkedin)
    links.push({ href: social.linkedin, icon: 'linkedin', label: 'LinkedIn' });
  if (email)
    links.push({ href: `mailto:${email}`, icon: 'mail', label: 'Email' });

  return links.map(({ href, icon, label }) => `
    <a
      href="${href}"
      target="_blank"
      rel="noreferrer noopener"
      class="about-social-link"
      aria-label="${label}"
      title="${label}"
    >
      ${SOCIAL_ICONS[icon]}
    </a>
  `).join('');
}

/* ─────────────────────────────────────────────
   BUILD TITLE TAGS
───────────────────────────────────────────── */
function buildTitleTags(titles = []) {
  return titles.map((t) => `
    <span class="about-title-tag">${t}</span>
  `).join('');
}

/* ─────────────────────────────────────────────
   BUILD STATS ROW
───────────────────────────────────────────── */
function buildStatsRow(stats) {
  return stats.map(({ value, label }) => `
    <div class="about-stat">
      <span class="about-stat__value">${value}</span>
      <span class="about-stat__label">${label.replace('\n', '<br>')}</span>
    </div>
  `).join('');
}

/* ─────────────────────────────────────────────
   HTML BUILDER
───────────────────────────────────────────── */
function buildAboutHTML(profile) {
  const stats       = buildStats(profile);
  const socialLinks = buildSocialLinks(profile.social, profile.email);
  const titleTags   = buildTitleTags(profile.title);
  const statsRow    = buildStatsRow(stats);

  const avatarPath  = profile.avatar || '/assets/images/profile/avatar.png';
  const fullName    = profile.name?.full || '';
  const bio         = profile.bio || '';
  const location    = profile.location || '';
  const university  = profile.university || '';
  const major       = profile.major || '';
  const available   = profile.availability ?? true;
  const availText   = profile.availability_text || 'Open for collaboration';

  return `
    <!-- Section label -->
    <p class="label fade-in-hidden">About</p>

    <!-- Grid: kiri + kanan -->
    <div class="about-grid">

      <!-- ══ KIRI: Avatar + info ══ -->
      <div class="about-left fade-in-hidden from-left">

        <!-- Avatar frame -->
        <div class="about-avatar-frame">
          <img
            src="../../assets/images/profile/profil.png"
            alt="Foto ${fullName}"
            class="about-avatar"
            loading="lazy"
            onerror="this.style.display='none'"
          />
          <!-- Glow ring -->
          <div class="about-avatar-glow" aria-hidden="true"></div>
        </div>

        <!-- Availability badge -->
        ${available ? `
          <div class="about-availability">
            <span class="about-availability__dot"></span>
            <span>${availText}</span>
          </div>
        ` : ''}

        <!-- Info singkat -->
        <div class="about-meta">
          ${location ? `
            <div class="about-meta__row">
              ${SOCIAL_ICONS.mappin}
              <span>${location}</span>
            </div>
          ` : ''}
          ${university ? `
            <div class="about-meta__row">
              ${SOCIAL_ICONS.graduationcap}
              <span>${university}</span>
            </div>
          ` : ''}
          ${major ? `
            <div class="about-meta__row">
              ${SOCIAL_ICONS.graduationcap}
              <span>${major}</span>
            </div>
          ` : ''}
        </div>

        <!-- Social links -->
        <div class="about-social">
          ${socialLinks}
        </div>

      </div><!-- /.about-left -->

      <!-- ══ KANAN: Teks ══ -->
      <div class="about-right">

        <!-- Heading -->
        <h2 class="about-heading fade-in-hidden" data-delay="100">
          Crafting digital<br>
          <span class="text-gradient">experiences.</span>
        </h2>

        <!-- Bio -->
        <p class="about-bio fade-in-hidden" data-delay="200">
          ${bio}
        </p>

        <!-- Stats row -->
        <div class="about-stats fade-in-hidden" data-delay="300">
          ${statsRow}
        </div>

        <!-- Divider -->
        <div class="divider fade-in-hidden" data-delay="350"></div>

        <!-- Title tags -->
        <div class="about-titles fade-in-hidden" data-delay="400">
          ${titleTags}
        </div>

      </div><!-- /.about-right -->

    </div><!-- /.about-grid -->
  `;
}

/* ─────────────────────────────────────────────
   INIT
───────────────────────────────────────────── */
export function initAbout(profile) {
  const section = document.getElementById('about');
  if (!section) return;

  const inner = section.querySelector('.section-inner') || section;
  inner.innerHTML = buildAboutHTML(profile);
}