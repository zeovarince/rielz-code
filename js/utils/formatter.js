/**
 * formatter.js — Data display formatters
 * Semua transformasi data untuk tampilan UI
 */

/**
 * Format periode experience.
 * @param {string} start - "2025-01"
 * @param {string|null} end - "2026-06" atau null (ongoing)
 * @returns {string}
 */
export function formatExperiencePeriod(start, end = null) {
  const MONTHS = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];

  function parse(str) {
    if (!str) return null;
    const [year, month] = str.split('-');
    return { year, month: month ? MONTHS[parseInt(month, 10) - 1] : null };
  }

  const s = parse(start);
  const e = end ? parse(end) : null;

  if (!s) return '';
  const startStr = s.month ? `${s.month} ${s.year}` : s.year;
  const endStr = e ? (e.month ? `${e.month} ${e.year}` : e.year) : 'Sekarang';

  return `${startStr} – ${endStr}`;
}

/**
 * Format jumlah repo/angka dengan K/M suffix.
 * @param {number} n
 * @returns {string}
 */
export function formatCount(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

/**
 * Format GitHub event type jadi label yang readable.
 * @param {string} type
 * @returns {string}
 */
export function formatGitHubEventType(type) {
  const map = {
    PushEvent:                'Pushed to',
    PullRequestEvent:         'Pull Request on',
    IssuesEvent:              'Issue on',
    CreateEvent:              'Created',
    DeleteEvent:              'Deleted',
    ForkEvent:                'Forked',
    WatchEvent:               'Starred',
    ReleaseEvent:             'Released',
    IssueCommentEvent:        'Commented on',
    PullRequestReviewEvent:   'Reviewed PR on',
  };
  return map[type] || type.replace('Event', '');
}

/**
 * Format tanggal ISO jadi "2 hari lalu", "3 jam lalu", dll.
 * @param {string} isoDate
 * @returns {string}
 */
export function formatRelativeTime(isoDate) {
  const diff = Date.now() - new Date(isoDate).getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 30) return new Date(isoDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  if (days > 0) return `${days} hari lalu`;
  if (hours > 0) return `${hours} jam lalu`;
  if (minutes > 0) return `${minutes} menit lalu`;
  return 'Baru saja';
}

/**
 * Truncate string dengan ellipsis.
 * @param {string} str
 * @param {number} maxLen
 * @returns {string}
 */
export function truncate(str, maxLen = 100) {
  if (!str || str.length <= maxLen) return str;
  return str.slice(0, maxLen).trimEnd() + '…';
}

/**
 * Sanitize HTML string (basic, mencegah XSS sederhana).
 * @param {string} str
 * @returns {string}
 */
export function sanitizeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Slug dari string.
 * @param {string} str
 * @returns {string}
 */
export function toSlug(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

/**
 * Warna badge berdasarkan kategori.
 * @param {string} category
 * @returns {string} Tailwind class atau CSS var
 */
export function getCategoryColor(category) {
  const map = {
    'Full-Stack Web':     'rgba(168,85,247,0.2)',
    'Computer Graphics':  'rgba(59,130,246,0.2)',
    'Web Application':    'rgba(34,197,94,0.2)',
    'Web Development':    'rgba(234,179,8,0.2)',
    'Development':        'rgba(168,85,247,0.2)',
    'Design':             'rgba(236,72,153,0.2)',
    'Organization':       'rgba(249,115,22,0.2)',
  };
  return map[category] || 'rgba(255,255,255,0.1)';
}
