/**
 * fetch.js — Data fetching utilities
 * Semua fetch JSON data melewati fungsi-fungsi ini
 */

/** Cache sederhana agar data tidak di-fetch ulang */
const _cache = new Map();

/**
 * Resolve path JSON relatif terhadap lokasi index.html.
 * Mendukung baik server (http://) maupun file:// protocol.
 */
function resolvePath(path) {
  // Jika sudah absolute URL, gunakan langsung
  if (path.startsWith('http')) return path;
  // Relatif terhadap root dokumen
  const base = window.location.href.replace(/\/[^/]*$/, '/');
  // Normalkan path: hilangkan leading slash jika pakai file://
  if (window.location.protocol === 'file:') {
    return new URL(path.replace(/^\//, ''), base).href;
  }
  return path;
}

/**
 * Fetch JSON dari path, dengan cache.
 * @param {string} path
 * @returns {Promise<any>}
 */
export async function fetchJSON(path) {
  const resolved = resolvePath(path);
  if (_cache.has(resolved)) return _cache.get(resolved);

  try {
    const res = await fetch(resolved);
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${resolved}`);
    const data = await res.json();
    _cache.set(resolved, data);
    return data;
  } catch (err) {
    console.error(`[fetchJSON] Failed to load ${resolved}:`, err);
    throw err;
  }
}

/**
 * Fetch semua data sekaligus (paralel).
 * @returns {Promise<{profile, experience, projects, certificates, config}>}
 */
export async function fetchAllData() {
  const [profile, experience, projects, certificates, config] = await Promise.all([
    fetchJSON('/data/profile.json'),
    fetchJSON('/data/experience.json'),
    fetchJSON('/data/projects.json'),
    fetchJSON('/data/certificates.json'),
    fetchJSON('/data/config.json'),
  ]);
  return { profile, experience, projects, certificates, config };
}

/**
 * Fetch GitHub repos milik user.
 * @param {string} username
 * @returns {Promise<Array>}
 */
export async function fetchGitHubRepos(username) {
  return fetchJSON(`https://api.github.com/users/${username}/repos?sort=updated&per_page=6&type=public`);
}

/**
 * Fetch GitHub events (recent activity) milik user.
 * @param {string} username
 * @returns {Promise<Array>}
 */
export async function fetchGitHubEvents(username) {
  return fetchJSON(`https://api.github.com/users/${username}/events/public?per_page=10`);
}

/**
 * Fetch GitHub user profile.
 * @param {string} username
 * @returns {Promise<Object>}
 */
export async function fetchGitHubUser(username) {
  return fetchJSON(`https://api.github.com/users/${username}`);
}