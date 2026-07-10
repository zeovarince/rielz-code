/**
 * helper.js — General purpose helper functions
 */

/**
 * Buat elemen HTML dari string template.
 * @param {string} html
 * @returns {HTMLElement}
 */
export function createElement(html) {
  const div = document.createElement('div');
  div.innerHTML = html.trim();
  return div.firstElementChild;
}

/**
 * Query selector shorthand.
 * @param {string} selector
 * @param {Document|HTMLElement} context
 * @returns {HTMLElement|null}
 */
export function qs(selector, context = document) {
  return context.querySelector(selector);
}

/**
 * Query selector all shorthand.
 * @param {string} selector
 * @param {Document|HTMLElement} context
 * @returns {NodeList}
 */
export function qsa(selector, context = document) {
  return context.querySelectorAll(selector);
}

/**
 * Clamp nilai antara min dan max.
 * @param {number} val
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

/**
 * Linear interpolation.
 * @param {number} a - start
 * @param {number} b - end
 * @param {number} t - progress 0–1
 * @returns {number}
 */
export function lerp(a, b, t) {
  return a + (b - a) * t;
}

/**
 * Debounce — tunda eksekusi fungsi.
 * @param {Function} fn
 * @param {number} ms
 * @returns {Function}
 */
export function debounce(fn, ms = 200) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

/**
 * Throttle — batasi eksekusi fungsi per interval.
 * @param {Function} fn
 * @param {number} ms
 * @returns {Function}
 */
export function throttle(fn, ms = 100) {
  let last = 0;
  return (...args) => {
    const now = Date.now();
    if (now - last >= ms) {
      last = now;
      fn(...args);
    }
  };
}

/**
 * Check apakah device adalah mobile/touch.
 * @returns {boolean}
 */
export function isMobile() {
  return window.innerWidth < 768 || 'ontouchstart' in window;
}

/**
 * Check apakah user prefer reduced motion.
 * @returns {boolean}
 */
export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Scroll smooth ke elemen dengan ID.
 * @param {string} id - tanpa tanda #
 * @param {number} offset - offset dari atas dalam px
 */
export function scrollToSection(id, offset = 0) {
  const el = document.getElementById(id);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top, behavior: 'smooth' });
}

/**
 * Format tanggal "2025-01" jadi "Jan 2025".
 * @param {string} dateStr - format YYYY-MM
 * @returns {string}
 */
export function formatPeriod(dateStr) {
  if (!dateStr) return 'Sekarang';
  const [year, month] = dateStr.split('-');
  const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
  return month ? `${months[parseInt(month, 10) - 1]} ${year}` : year;
}

/**
 * Ambil inisial dari nama.
 * @param {string} name
 * @returns {string}
 */
export function getInitials(name) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

/**
 * Copy teks ke clipboard.
 * @param {string} text
 * @returns {Promise<boolean>}
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
