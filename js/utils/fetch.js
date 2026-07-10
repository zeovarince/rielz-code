/**
 * fetch.js — Data fetching utilities
 * Semua fetch JSON data melewati fungsi-fungsi ini
 */

/** Cache sederhana agar data tidak di-fetch ulang */
const _cache = new Map();

/**
 * Fetch JSON dari path, dengan cache.
 * @param {string} path - URL atau path relatif ke file JSON
 * @returns {Promise<any>}
 */
export async function fetchJSON(path) {
  if (_cache.has(path)) {
    return _cache.get(path);
  }

  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${path}`);
    const data = await res.json();
    _cache.set(path, data);
    return data;
  } catch (err) {
    console.error(`[fetchJSON] Failed to load ${path}:`, err);
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
  const url = `https://api.github.com/users/${username}/repos?sort=updated&per_page=6&type=public`;
  return fetchJSON(url);
}

/**
 * Fetch GitHub events (recent activity) milik user.
 * @param {string} username
 * @returns {Promise<Array>}
 */
export async function fetchGitHubEvents(username) {
  const url = `https://api.github.com/users/${username}/events/public?per_page=10`;
  return fetchJSON(url);
}

/**
 * Fetch GitHub user profile.
 * @param {string} username
 * @returns {Promise<Object>}
 */
export async function fetchGitHubUser(username) {
  const url = `https://api.github.com/users/${username}`;
  return fetchJSON(url);
}
