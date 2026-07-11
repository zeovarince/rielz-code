/**
 * experience.js — Experience Section (Fix: heading offset + travel benar)
 *
 * Logika scroll yang benar:
 * - Viewport duduk TEPAT di bawah heading (top = headingHeight)
 * - Travel = (total - 1) * step
 *   → geser sampai hanya card TERAKHIR yang tersisa
 * - Section height = headingH + viewportH + travel + buffer
 */

import { ElectricBorder }         from '../utils/electric-border.js';
import { formatExperiencePeriod } from '../utils/formatter.js';
import { prefersReducedMotion }   from '../utils/helper.js';

/* ─── Config ─── */
const EB_CONFIG = {
  color        : '#a855f7',
  speed        : 0.8,
  chaos        : 0.10,
  borderRadius : 16,
};

/* ─── Icons ─── */
const ICONS = {
  crown: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
    <path d="M2 20h20M5 20 3 8l4.5 4.5L12 4l4.5 8.5L21 8l-2 12"/>
  </svg>`,
  pen: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 20h9"/>
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"/>
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
  if (p.includes('ketua'))      return ICONS.crown;
  if (p.includes('sekretaris')) return ICONS.pen;
  return ICONS.users;
}

/* ─── Build Card ─── */
function buildCard(exp, index) {
  const period   = formatExperiencePeriod(exp.period_start, exp.period_end);
  const isActive = !exp.period_end;
  const icon     = getIcon(exp);
  const skills   = (exp.skills || [])
    .map(s => `<span class="exp-badge">${s}</span>`).join('');

  return `
    <article class="exp-card" data-index="${index}" tabindex="0"
      aria-label="${exp.position} di ${exp.organization}">
      <div class="exp-card__top">
        <div class="exp-card__icon">${icon}</div>
        <div class="exp-card__period-row">
          ${isActive ? `<span class="exp-dot" aria-label="Aktif"></span>` : ''}
          <span class="exp-card__period">${period}</span>
        </div>
      </div>
      <div class="exp-card__body">
        <h3 class="exp-card__pos">${exp.position}</h3>
        <p class="exp-card__org">${exp.organization_full || exp.organization}</p>
        <span class="exp-card__loc">${ICONS.mappin} ${exp.location}</span>
        <p class="exp-card__desc">${exp.description}</p>
      </div>
      <div class="exp-card__skills">${skills}</div>
    </article>
  `;
}

/* ─── Build HTML ─── */
function buildHTML(experience) {
  const cards = experience.map((exp, i) => buildCard(exp, i)).join('');
  const total = String(experience.length).padStart(2, '0');

  return `
    <div class="exp-heading-wrap" id="exp-heading">
      <p class="exp-label">~/experience</p>
      <h2 class="exp-title">Experience</h2>
    </div>

    <div class="exp-viewport" id="exp-viewport">
      <div class="exp-track" id="exp-track">
        ${cards}
      </div>
    </div>

    <div class="exp-indicator" id="exp-indicator">
      <span class="exp-ind__num">
        <span id="exp-ind-cur">01</span>
        <span class="exp-ind__sep"> / ${total}</span>
      </span>
      <span class="exp-ind__sep">—</span>
      <span class="exp-ind__name" id="exp-ind-name">
        ${experience[0]?.position || ''}
      </span>
      <span class="exp-ind__chevron">${ICONS.chevron}</span>
    </div>
  `;
}

/* ─── Electric Border ─── */
function initElectricBorders() {
  const instances = [];
  document.querySelectorAll('.exp-card').forEach(card => {
    const eb = new ElectricBorder(card, EB_CONFIG);
    eb.start();
    instances.push(eb);
  });
  return instances;
}

/* ─── Active card ─── */
function updateActiveCard(cards, activeIndex) {
  cards.forEach((card, i) => {
    card.classList.toggle('exp-card--active', i === activeIndex);
    card.setAttribute('aria-current', i === activeIndex ? 'true' : 'false');
  });
}

/* ─── Indicator ─── */
function updateIndicator(index, experience) {
  const cur  = document.getElementById('exp-ind-cur');
  const name = document.getElementById('exp-ind-name');
  if (cur)  cur.textContent  = String(index + 1).padStart(2, '0');
  if (name) name.textContent = experience[index]?.position || '';
}

/* ─────────────────────────────────────────────
   PINNED HORIZONTAL SCROLL

   Diagram layout saat scroll aktif:
   ┌─────────────────────────────────┐ ← top section
   │  HEADING  (sticky top:0)        │ ← tinggi = headingH
   ├─────────────────────────────────┤
   │  VIEWPORT (sticky top:headingH) │ ← tinggi = 100vh - headingH
   │  [card1][card2][card3]          │
   └─────────────────────────────────┘ ← bottom section

   Section height:
   = headingH          (ruang untuk heading)
   + (100vh - headingH) (ruang untuk viewport, 1x diam)
   + travel             (jarak geser horizontal)
   + buffer             (sedikit napas di akhir)

   = 100vh + travel + buffer

   Travel:
   Geser sampai card ke-(total-1) hampir keluar kiri,
   hanya card TERAKHIR yang tersisa sendirian.
   travel = (total - 1) * (cardW + gap)
───────────────────────────────────────────── */
function initPinnedScroll(experience) {
  const section   = document.getElementById('experience');
  const heading   = document.getElementById('exp-heading');
  const viewport  = document.getElementById('exp-viewport');
  const track     = document.getElementById('exp-track');
  const indicator = document.getElementById('exp-indicator');

  if (!section || !heading || !viewport || !track) return;

  const cards = Array.from(track.querySelectorAll('.exp-card'));
  const total = cards.length;
  if (total === 0) return;

  /* ── Getter — dihitung ulang saat resize ── */
  const headingH  = () => heading.offsetHeight;
  const viewportH = () => window.innerHeight - headingH();
  const cardW     = () => cards[0]?.offsetWidth || 480;
  const gap       = () => {
    return parseFloat(getComputedStyle(track).gap)
        || parseFloat(getComputedStyle(track).columnGap)
        || 32;
  };
  const step      = () => cardW() + gap();

  /*
   * Travel = geser semua card kecuali yang terakhir keluar ke kiri
   * Contoh 3 card: travel = 2 * step
   * → card 1 hilang, card 2 hilang, card 3 sendirian
   */
  const travel    = () => step() * (total - 1);

  /* ── Set viewport position tepat di bawah heading ── */
  function positionViewport() {
    const hH = headingH();
    const vH = viewportH();
    viewport.style.top    = `${hH}px`;
    viewport.style.height = `${vH}px`;
  }

  /* ── Set section height ── */
  function setHeight() {
    /*
     * 100vh       : heading + viewport pertama kali tampil (diam)
     * travel()    : ruang vertikal yang dikonversi ke horizontal
     */
    section.style.height = `${window.innerHeight + travel()}px`;
  }

  positionViewport();
  setHeight();

  /* Resize handler */
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      positionViewport();
      setHeight();
      onScroll();
    }, 100);
  }, { passive: true });

  /* Init state */
  updateActiveCard(cards, 0);
  updateIndicator(0, experience);

  /* ── Scroll handler ── */
  function onScroll() {
    const t          = travel();
    const sectionTop = section.getBoundingClientRect().top + window.scrollY;

    /*
     * Scroll horizontal mulai aktif setelah user scroll melewati:
     * sectionTop → masuk section
     * + headingH() → heading sudah tampil penuh (tidak terpotong)
     *
     * Sebelum triggerAt: track diam di posisi 0
     * Setelah triggerAt: track geser ke kiri seiring scroll
     */
    const triggerAt = sectionTop + headingH();
    const rawScrolled = window.scrollY - triggerAt;
    const scrolled    = Math.max(0, rawScrolled);
    const clamped     = Math.min(scrolled, t);

    /* Geser track */
    track.style.transform = `translateX(-${clamped}px)`;

    /* Active card */
    const s         = step();
    const rawIndex  = s > 0 ? clamped / s : 0;
    const activeIdx = Math.min(Math.round(rawIndex), total - 1);
    updateActiveCard(cards, activeIdx);
    updateIndicator(activeIdx, experience);

    /* Indicator: tampil selama scroll horizontal berlangsung */
    if (indicator) {
      const isScrolling = scrolled > 20 && clamped < t + 60;
      indicator.style.opacity = isScrolling ? '1' : '0';
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ─── INIT ─── */
export function initExperience(experience) {
  const section = document.getElementById('experience');
  if (!section || !experience?.length) return;

  section.style.position = 'relative';
  section.classList.add('exp-section');
  section.innerHTML = buildHTML(experience);

  if (prefersReducedMotion()) {
    const track = document.getElementById('exp-track');
    if (track) {
      track.style.flexDirection = 'column';
      track.style.transform     = 'none';
      section.style.height      = 'auto';
    }
    requestAnimationFrame(() => initElectricBorders());
    return;
  }

  requestAnimationFrame(() => {
    initElectricBorders();
    initPinnedScroll(experience);
  });
}