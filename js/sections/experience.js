/**
 * experience.js — Experience Section
 *
 * Layout persis seperti referensi video:
 * - Heading "Experience" center atas, ikut naik saat cards scroll
 * - 3 card tampil bersamaan, card tengah active (scale up), kiri-kanan scale down + dim
 * - Pinned horizontal scroll: vertikal → horizontal
 * - Indicator bawah: "01 / 03  Nama Jabatan  ›"
 * - Lightning border neon pada setiap card
 */

import { formatExperiencePeriod } from '../utils/formatter.js';
import { prefersReducedMotion }   from '../utils/helper.js';

/* ─── Icons ─── */
const ICONS = {
  crown: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
    <path d="M2 20h20M5 20 3 8l4.5 4.5L12 4l4.5 8.5L21 8l-2 12"/>
  </svg>`,
  pen: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"/>
  </svg>`,
  users: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>`,
  mappin: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>`,
  chevron: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="m9 18 6-6-6-6"/>
  </svg>`,
};

function getIcon(exp) {
  const p = (exp.position || '').toLowerCase();
  if (p.includes('ketua')) return ICONS.crown;
  if (p.includes('sekretaris')) return ICONS.pen;
  return ICONS.users;
}

/* ─── Lightning Border SVG ─── */
function buildLightning(uid) {
  return `
    <svg class="exp-lightning" viewBox="0 0 100 100" preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <filter id="lg-glow-${uid}" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="1.5" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <linearGradient id="lg-grad-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stop-color="#6366f1"/>
          <stop offset="50%"  stop-color="#a855f7"/>
          <stop offset="100%" stop-color="#ec4899"/>
        </linearGradient>
      </defs>
      <!-- glow layer -->
      <rect class="exp-lightning__glow"
        x="1" y="1" width="98" height="98" rx="12"
        fill="none"
        stroke="url(#lg-grad-${uid})"
        stroke-width="3"
        filter="url(#lg-glow-${uid})"
      />
      <!-- sharp layer -->
      <rect class="exp-lightning__path"
        x="1" y="1" width="98" height="98" rx="12"
        fill="none"
        stroke="url(#lg-grad-${uid})"
        stroke-width="1.2"
      />
    </svg>
  `;
}

/* ─── Build Single Card ─── */
function buildCard(exp, index) {
  const uid      = `exp${index}`;
  const period   = formatExperiencePeriod(exp.period_start, exp.period_end);
  const isActive = !exp.period_end;
  const icon     = getIcon(exp);

  const skills = (exp.skills || [])
    .map(s => `<span class="exp-badge">${s}</span>`).join('');

  return `
    <article class="exp-card" data-index="${index}" tabindex="0"
      aria-label="${exp.position} di ${exp.organization}">
      ${buildLightning(uid)}

      <!-- Top: icon + period -->
      <div class="exp-card__top">
        <div class="exp-card__icon">${icon}</div>
        <div class="exp-card__period-row">
          ${isActive ? `<span class="exp-dot" aria-label="Aktif"></span>` : ''}
          <span class="exp-card__period">${period}</span>
        </div>
      </div>

      <!-- Body -->
      <div class="exp-card__body">
        <h3 class="exp-card__pos">${exp.position}</h3>
        <p class="exp-card__org">${exp.organization_full || exp.organization}</p>
        <span class="exp-card__loc">${ICONS.mappin} ${exp.location}</span>
        <p class="exp-card__desc">${exp.description}</p>
      </div>

      <!-- Skills -->
      <div class="exp-card__skills">${skills}</div>
    </article>
  `;
}

/* ─── Build Section HTML ─── */
function buildHTML(experience) {
  const cards = experience.map((exp, i) => buildCard(exp, i)).join('');
  const total = String(experience.length).padStart(2, '0');

  return `
    <!-- Heading center -->
    <div class="exp-heading-wrap" id="exp-heading">
      <p class="exp-label">~/experience</p>
      <h2 class="exp-title">Experience</h2>
    </div>

    <!-- Cards track (horizontal pinned) -->
    <div class="exp-viewport">
      <div class="exp-track" id="exp-track">
        ${cards}
      </div>
    </div>

    <!-- Bottom indicator -->
    <div class="exp-indicator" id="exp-indicator">
      <span class="exp-ind__num">
        <span id="exp-ind-cur">01</span>
        <span class="exp-ind__sep"> / ${total}</span>
      </span>
      <span class="exp-ind__name" id="exp-ind-name">${experience[0]?.position || ''}</span>
      <span class="exp-ind__chevron">${ICONS.chevron}</span>
    </div>
  `;
}

/* ─── Lightning Animate ─── */
function initLightning() {
  document.querySelectorAll('.exp-card').forEach(card => {
    const els = card.querySelectorAll('.exp-lightning__path, .exp-lightning__glow');
    els.forEach(el => {
      const len = el.getTotalLength ? el.getTotalLength() : 400;
      el.style.strokeDasharray  = len;
      el.style.strokeDashoffset = len;
      el.style.transition = 'stroke-dashoffset 0.65s cubic-bezier(0.4,0,0.2,1)';
    });

    const show = () => els.forEach(el => { el.style.strokeDashoffset = '0'; });
    const hide = () => els.forEach(el => {
      const len = el.getTotalLength ? el.getTotalLength() : 400;
      el.style.strokeDashoffset = len;
    });

    card.addEventListener('mouseenter', show);
    card.addEventListener('mouseleave', hide);
    card.addEventListener('focus',      show);
    card.addEventListener('blur',       hide);
  });
}

/* ─── Carousel Depth Effect ─── */
function applyDepth(cards, activeIndex) {
  cards.forEach((card, i) => {
    const dist = i - activeIndex;
    const absDist = Math.abs(dist);

    if (absDist === 0) {
      // Active card — full scale, full opacity
      card.style.transform = 'scale(1) translateY(0px)';
      card.style.opacity   = '1';
      card.style.filter    = 'brightness(1)';
      card.classList.add('exp-card--active');
    } else if (absDist === 1) {
      // Adjacent — scale down sedikit, sedikit dim
      const dir = dist > 0 ? 1 : -1;
      card.style.transform = `scale(0.88) translateY(24px)`;
      card.style.opacity   = '0.55';
      card.style.filter    = 'brightness(0.7)';
      card.classList.remove('exp-card--active');
    } else {
      // Far — lebih kecil dan transparan
      card.style.transform = `scale(0.76) translateY(40px)`;
      card.style.opacity   = '0.25';
      card.style.filter    = 'brightness(0.5)';
      card.classList.remove('exp-card--active');
    }

    card.style.transition = 'transform 0.5s cubic-bezier(0.4,0,0.2,1), opacity 0.5s ease, filter 0.5s ease';
    card.setAttribute('aria-current', absDist === 0 ? 'true' : 'false');
  });
}

/* ─── Update Indicator ─── */
function updateIndicator(index, experience) {
  const cur  = document.getElementById('exp-ind-cur');
  const name = document.getElementById('exp-ind-name');
  if (cur)  cur.textContent  = String(index + 1).padStart(2, '0');
  if (name) name.textContent = experience[index]?.position || '';
}

/* ─── Pinned Horizontal Scroll ─── */
function initPinnedScroll(experience) {
  const section   = document.getElementById('experience');
  const track     = document.getElementById('exp-track');
  const indicator = document.getElementById('exp-indicator');
  if (!section || !track) return;

  const cards    = Array.from(track.querySelectorAll('.exp-card'));
  const total    = cards.length;
  const CARD_W   = () => cards[0]?.offsetWidth || 380;
  const GAP      = () => parseInt(getComputedStyle(track).gap) || 40;

  // Setiap step = 1 card width + gap
  const stepDist = () => CARD_W() + GAP();
  // Total horizontal travel = (total - 1) langkah
  const totalDist = () => stepDist() * (total - 1);

  // Section height = totalDist + 1 viewport (buffer atas bawah)
  function setHeight() {
    section.style.height = `${totalDist() + window.innerHeight * 1.5}px`;
  }
  setHeight();
  window.addEventListener('resize', setHeight, { passive: true });

  // Awal: card pertama aktif
  applyDepth(cards, 0);
  updateIndicator(0, experience);

  function onScroll() {
    const rect     = section.getBoundingClientRect();
    const scrolled = Math.max(0, -rect.top);
    const dist     = totalDist();

    // Clamp
    const clamped = Math.min(scrolled, dist);

    // Berapa card yang sudah terscroll
    const step = stepDist();
    const rawIndex  = clamped / step;
    const activeIdx = Math.min(Math.round(rawIndex), total - 1);

    // Geser track
    track.style.transform = `translateX(-${clamped}px)`;

    // Depth effect
    applyDepth(cards, activeIdx);
    updateIndicator(activeIdx, experience);

    // Tampilkan indicator saat dalam section
    if (indicator) {
      indicator.style.opacity = scrolled > 10 && clamped < dist + 50 ? '1' : '0';
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ─── INIT ─── */
export function initExperience(experience) {
  const section = document.getElementById('experience');
  if (!section || !experience?.length) return;

  // Override section style untuk pinned
  section.style.position = 'relative';
  section.classList.add('exp-section');
  section.innerHTML = buildHTML(experience);

  if (prefersReducedMotion()) {
    // Fallback: tampilkan semua card vertikal tanpa scroll effect
    const track = document.getElementById('exp-track');
    if (track) {
      track.style.flexDirection = 'column';
      track.style.transform     = 'none';
      section.style.height      = 'auto';
    }
    return;
  }

  requestAnimationFrame(() => {
    initLightning();
    initPinnedScroll(experience);
  });
}