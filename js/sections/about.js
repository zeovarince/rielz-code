/**
 * about.js — About Section (Revised)
 *
 * Layout:
 * - Kiri  : Tilt Card 3D (CSS perspective + mousemove + holographic shimmer)
 * - Kanan : heading + bio + title tags
 * - Bawah : meta info (lokasi, univ, jurusan) + social links
 * - Hapus : availability badge
 */

/* ─── Icons ─── */
const ICONS = {
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
  graduation: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
    <path d="M6 12v5c0 2 6 3 6 3s6-1 6-3v-5"/>
  </svg>`,
};

/* ─── Build HTML ─── */
function buildAboutHTML(profile) {
  const social    = profile.social || {};
  const bio       = profile.bio || '';
  const location  = profile.location || '';
  const university= profile.university || '';
  const major     = profile.major || '';
  const avatarUrl = profile.profil || '/assets/images/profile/profil.png';
  const titles    = profile.title || [];
  const igHandle  = (social.instagram || '')
    .replace('https://instagram.com/', '')
    .replace('https://www.instagram.com/', '')
    .replace('@', '') || 'riel';

  /* Social links */
  const socialHTML = [
    social.github    && { href: social.github,    icon: 'github',    label: 'GitHub' },
    social.instagram && { href: social.instagram.startsWith('http') ? social.instagram : `https://instagram.com/${social.instagram}`, icon: 'instagram', label: 'Instagram' },
    social.linkedin  && { href: social.linkedin,  icon: 'linkedin',  label: 'LinkedIn' },
    profile.email    && { href: `mailto:${profile.email}`, icon: 'mail', label: 'Email' },
  ].filter(Boolean).map(({ href, icon, label }) => `
    <a href="${href}" target="_blank" rel="noreferrer"
      class="about-social-link" aria-label="${label}" title="${label}">
      ${ICONS[icon]}
    </a>
  `).join('');

  /* Meta info */
  const metaHTML = [
    location   && `<div class="about-meta__row">${ICONS.mappin}<span>${location}</span></div>`,
    university && `<div class="about-meta__row">${ICONS.graduation}<span>${university}</span></div>`,
    major      && `<div class="about-meta__row">${ICONS.graduation}<span>${major}</span></div>`,
  ].filter(Boolean).join('');

  /* Title tags */
  const tagsHTML = titles.map(t =>
    `<span class="about-title-tag">${t}</span>`
  ).join('');

  return `
    <p class="label fade-in-hidden">About</p>

    <!-- Grid atas: tilt card kiri + teks kanan -->
    <div class="about-grid">

      <!-- KIRI: Tilt Card 3D -->
      <div class="about-left fade-in-hidden from-left">
        <div class="about-tilt-wrap" id="about-tilt-wrap">
          <div class="about-tilt-card" id="about-tilt-card">
            <!-- Foto -->
            <div class="about-tilt-img-wrap">
              <img
                src="${avatarUrl}"
                alt="Foto profil"
                class="about-tilt-img"
                loading="lazy"
                onerror="this.style.opacity='0'"
              />
            </div>
            <!-- Holographic shimmer overlay -->
            <div class="about-tilt-shimmer" id="about-tilt-shimmer"></div>
            <!-- Shine spot -->
            <div class="about-tilt-shine" id="about-tilt-shine"></div>
          </div>
        </div>

        <!-- Nama + username IG di bawah card -->
        <div class="about-card-info">
          <div class="about-card-info__inner">
            <div class="about-card-info__avatar">
              <img src="../../assets/images/profile/profil2.jpeg" alt="avatar mini"
                onerror="this.style.display='none'" />
            </div>
            <div class="about-card-info__text">
              <span class="about-card-info__handle">@${igHandle}</span>
              <span class="about-card-info__name">${profile.name?.full || ''}</span>
            </div>
            <a href="#contact" class="about-card-info__btn"
              onclick="event.preventDefault();document.getElementById('contact')?.scrollIntoView({behavior:'smooth'})">
              Contact
            </a>
          </div>
        </div>
      </div>

      <!-- KANAN: Teks -->
      <div class="about-right">
        <h2 class="about-heading fade-in-hidden" data-delay="100">
          Crafting digital<br>
          <span class="text-gradient">experiences.</span>
        </h2>

        <p class="about-bio fade-in-hidden" data-delay="200">
          ${bio}
        </p>

        <div class="about-titles fade-in-hidden" data-delay="300">
          ${tagsHTML}
        </div>
      </div>

    </div>

    <!-- Bawah: meta + social -->
    <div class="about-footer fade-in-hidden" data-delay="400">
      <div class="about-meta">${metaHTML}</div>
      <div class="about-social">${socialHTML}</div>
    </div>
  `;
}

/* ─────────────────────────────────────────────
   TILT CARD 3D
   CSS perspective + mousemove tracking
   Holographic shimmer: radial gradient yang
   bergerak mengikuti posisi mouse
───────────────────────────────────────────── */
function initTiltCard() {
  const wrap   = document.getElementById('about-tilt-wrap');
  const card   = document.getElementById('about-tilt-card');
  const shine  = document.getElementById('about-tilt-shine');
  const shimmer= document.getElementById('about-tilt-shimmer');
  if (!wrap || !card) return;

  const MAX_TILT  = 18;   // derajat tilt maksimal
  const SHINE_AMT = 0.3;  // intensitas shine spot

  let rafId = null;
  let targetRx = 0, targetRy = 0;
  let currentRx = 0, currentRy = 0;

  function lerp(a, b, t) { return a + (b - a) * t; }

  function onMouseMove(e) {
    const rect = wrap.getBoundingClientRect();
    const cx   = rect.left + rect.width  / 2;
    const cy   = rect.top  + rect.height / 2;
    const dx   = (e.clientX - cx) / (rect.width  / 2);
    const dy   = (e.clientY - cy) / (rect.height / 2);

    targetRy =  dx * MAX_TILT;
    targetRx = -dy * MAX_TILT;

    /* Shine spot position */
    const px = ((e.clientX - rect.left) / rect.width)  * 100;
    const py = ((e.clientY - rect.top)  / rect.height) * 100;

    if (shine) {
      shine.style.background = `radial-gradient(circle at ${px}% ${py}%,
        rgba(255,255,255,${SHINE_AMT}) 0%,
        transparent 60%)`;
    }

    /* Holographic shimmer — hue rotate berdasarkan posisi */
    if (shimmer) {
      const hue = Math.round(dx * 60 + 200); // 140–260 range
      shimmer.style.background = `
        linear-gradient(
          ${105 + dy * 20}deg,
          transparent 0%,
          rgba(${hue > 200 ? '100,80,255' : '80,200,255'}, 0.08) 30%,
          rgba(168,85,247,0.12) 50%,
          rgba(236,72,153,0.08) 70%,
          transparent 100%
        )
      `;
      shimmer.style.opacity = '1';
    }
  }

  function onMouseLeave() {
    targetRx = 0;
    targetRy = 0;
    if (shine)   shine.style.background = 'none';
    if (shimmer) shimmer.style.opacity  = '0';
  }

  function animate() {
    currentRx = lerp(currentRx, targetRx, 0.1);
    currentRy = lerp(currentRy, targetRy, 0.1);

    card.style.transform = `
      perspective(800px)
      rotateX(${currentRx}deg)
      rotateY(${currentRy}deg)
      scale3d(1.02, 1.02, 1.02)
    `;

    rafId = requestAnimationFrame(animate);
  }

  wrap.addEventListener('mousemove', onMouseMove);
  wrap.addEventListener('mouseleave', onMouseLeave);
  rafId = requestAnimationFrame(animate);
}

/* ─── INIT ─── */
export function initAbout(profile) {
  const section = document.getElementById('about');
  if (!section) return;

  const inner = section.querySelector('.section-inner') || section;
  inner.innerHTML = buildAboutHTML(profile);

  requestAnimationFrame(initTiltCard);
}