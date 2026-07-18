/**
 * projects.js — Projects Section
 * Full-screen slider: image left, content right.
 * Navigation via arrows, progress bars, and arrow keys.
 */

import { prefersReducedMotion } from '../utils/helper.js';

/* ── SVG Icons ── */
const ICON_GITHUB = `<svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.268 2.75 1.026A9.578 9.578 0 0 1 12 6.836a9.59 9.59 0 0 1 2.504.337c1.909-1.294 2.747-1.026 2.747-1.026.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg>`;

const ICON_EXTERNAL = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`;

const ICON_PREV = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>`;

const ICON_NEXT = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><polyline points="12 5 19 12 12 19"/></svg>`;

/* ── Helpers ── */
function pad(n) { return String(n).padStart(2, '0'); }

function normalizeUrl(url) {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
}

function buildMoreLink(githubUrl) {
  if (!githubUrl) return '';

  return `
    <div class="proj-slider__more">
      <a href="${githubUrl}" target="_blank" rel="noopener noreferrer" class="proj-slider__more-link">
        <span>See more project</span>
        ${ICON_EXTERNAL}
      </a>
    </div>
  `;
}

/* ════════════════════════════════════════
   BUILD: Left image panel
════════════════════════════════════════ */
function buildLeft(project) {
  const src     = project.images?.[0] || project.thumbnail || null;
  const techs   = (project.tech || []).slice(0, 3)
    .map(t => `<span class="proj-slide__ft">${t}</span>`).join('');
  const demoUrl = normalizeUrl(project.demo_url || project.live_url);

  return `
    <div class="proj-slide__card">
      <div class="proj-slide__img-wrap">
        ${src
          ? `<img src="${src}" alt="${project.title}" class="proj-slide__img" loading="lazy" />`
          : `<div class="proj-slide__placeholder"><span>${project.title.slice(0, 2).toUpperCase()}</span></div>`
        }
      </div>
      <div class="proj-slide__overlay">
        <div class="proj-slide__footer">
          <div class="proj-slide__footer-left">
            <div class="proj-slide__footer-techs">${techs}</div>
            <h3 class="proj-slide__footer-title">${project.title}</h3>
          </div>
          <div class="proj-slide__footer-actions">
            ${project.github_url
              ? `<a href="${project.github_url}" target="_blank" rel="noopener noreferrer"
                   class="proj-slide__github" title="Source Code" aria-label="Source Code">
                   ${ICON_GITHUB}
                 </a>`
              : ''
            }
            ${demoUrl
              ? `<a href="${demoUrl}" target="_blank" rel="noopener noreferrer"
                   class="proj-slide__github proj-slide__github--demo" title="Live Demo" aria-label="Live Demo">
                   ${ICON_EXTERNAL}
                 </a>`
              : ''
            }
          </div>
        </div>
      </div>
    </div>
  `;
}

/* ════════════════════════════════════════
   BUILD: Right content
════════════════════════════════════════ */
function buildContent(project, index, total) {
  const techPills = (project.tech || []).slice(0, 5)
    .map(t => `<span class="proj-slider__tech">${t}</span>`).join('');

  const extraCount = (project.tech || []).length - 5;
  const extraPill  = extraCount > 0
    ? `<span class="proj-slider__tech proj-slider__tech--more">+${extraCount}</span>`
    : '';

  const btnGithub = project.github_url
    ? `<a href="${project.github_url}" target="_blank" rel="noopener noreferrer"
          class="proj-slider__btn">
          ${ICON_GITHUB} Source Code
       </a>`
    : '';

  const demoUrl = normalizeUrl(project.demo_url || project.live_url);

  const btnLive = demoUrl
    ? `<a href="${demoUrl}" target="_blank" rel="noopener noreferrer"
          class="proj-slider__btn proj-slider__btn--live">
          ${ICON_EXTERNAL} Live Demo
       </a>`
    : '';

  return `
    <div class="proj-slider__counter">
      <span class="proj-slider__num">${pad(index + 1)}</span>
      <span class="proj-slider__total">OF ${pad(total)} PROJECTS</span>
    </div>

    <h2 class="proj-slider__title">${project.title}</h2>
    <p  class="proj-slider__desc">${project.description}</p>

    <div class="proj-slider__techs">
      ${techPills}${extraPill}
    </div>

    <div class="proj-slider__actions">
      ${btnGithub}
      ${btnLive}
    </div>
  `;
}

/* ════════════════════════════════════════
   BUILD: Navigation bar (persistent)
════════════════════════════════════════ */
function buildNav(count, activeIndex) {
  const bars = Array.from({ length: count }, (_, i) =>
    `<div class="proj-nav__bar ${i === activeIndex ? 'proj-nav__bar--active' : ''}"
          data-index="${i}" role="button" tabindex="0"
          aria-label="Go to project ${i + 1}"></div>`
  ).join('');

  return `
    <div class="proj-slider__nav">
      <button class="proj-nav__arrow proj-nav__arrow--prev" id="proj-prev" aria-label="Previous project">
        ${ICON_PREV}
      </button>
      <div class="proj-nav__bars" id="proj-bars">${bars}</div>
      <button class="proj-nav__arrow proj-nav__arrow--next" id="proj-next" aria-label="Next project">
        ${ICON_NEXT}
      </button>
    </div>
  `;
}

/* ════════════════════════════════════════
   INIT
════════════════════════════════════════ */
export function initProjects(projects = [], githubUrl = '') {
  const section = document.getElementById('projects');
  if (!section) return;

  const sorted = [...projects].sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
  const total  = sorted.length;
  if (!total) return;

  let current    = 0;
  let isAnimating= false;
  const reduced  = prefersReducedMotion();
  const DURATION = reduced ? 0 : 380; // ms

  /* ── Initial render ── */
  section.innerHTML = `
    <div class="proj-slider">

      <!-- Left: image -->
      <div class="proj-slider__left" id="proj-left">
        <div class="proj-slider__intro">
          <span class="proj-slider__eyebrow">~/projects</span>
          <h2 class="proj-slider__masthead">My Projects</h2>
        </div>
        ${buildLeft(sorted[0])}
      </div>

      <!-- Right: content + nav -->
      <div class="proj-slider__right">

        <div class="proj-slider__right-content" id="proj-content">
          ${buildContent(sorted[0], 0, total)}
        </div>
        ${buildMoreLink(githubUrl)}
        ${buildNav(total, 0)}
      </div>

    </div>
  `;

  const leftEl   = section.querySelector('#proj-left');
  const contentEl= section.querySelector('#proj-content');
  const prevBtn  = section.querySelector('#proj-prev');
  const nextBtn  = section.querySelector('#proj-next');
  const barsEl   = section.querySelector('#proj-bars');

  /* ── Navigate to a slide ── */
  function goTo(index) {
    if (index === current || isAnimating) return;
    isAnimating = true;

    const next = (index + total) % total;

    if (!reduced) {
      /* Fade + slide out */
      leftEl.classList.add('is-leaving');
      contentEl.classList.add('is-leaving');
    }

    setTimeout(() => {
      current = next;

      /* Swap content */
      leftEl.innerHTML    = buildLeft(sorted[current]);
      leftEl.insertAdjacentHTML('afterbegin', `
        <div class="proj-slider__intro">
          <span class="proj-slider__eyebrow">~/projects</span>
          <h2 class="proj-slider__masthead">My Projects</h2>
        </div>
      `);
      contentEl.innerHTML = buildContent(sorted[current], current, total);

      /* Update bars */
      barsEl.querySelectorAll('.proj-nav__bar').forEach((bar, i) => {
        bar.classList.toggle('proj-nav__bar--active', i === current);
      });

      if (!reduced) {
        /* Force reflow, then fade in */
        leftEl.classList.remove('is-leaving');
        contentEl.classList.remove('is-leaving');
      }

      setTimeout(() => { isAnimating = false; }, reduced ? 0 : 80);
    }, DURATION);
  }

  /* ── Button listeners ── */
  prevBtn?.addEventListener('click', () => goTo(current - 1));
  nextBtn?.addEventListener('click', () => goTo(current + 1));

  /* ── Bar clicks ── */
  barsEl?.addEventListener('click', e => {
    const bar = e.target.closest('.proj-nav__bar');
    if (!bar) return;
    goTo(parseInt(bar.dataset.index, 10));
  });

  /* ── Keyboard ── */
  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft')  goTo(current - 1);
    if (e.key === 'ArrowRight') goTo(current + 1);
  });

  /* ── Touch / swipe ── */
  let touchStartX = 0;
  section.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });

  section.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) goTo(dx < 0 ? current + 1 : current - 1);
  }, { passive: true });
}