/**
 * github.js — GitHub Section
 */

import { fetchGitHubRepos } from '../utils/fetch.js';
import { prefersReducedMotion } from '../utils/helper.js';

/* ─── Icons ─── */
const ICONS = {
  star: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  fork: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><circle cx="18" cy="6" r="3"/><path d="M6 9v2a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V9"/><line x1="12" y1="15" x2="12" y2="21"/></svg>`,
  ext:  `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`,
  gh:   `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.268 2.75 1.026A9.578 9.578 0 0 1 12 6.836a9.59 9.59 0 0 1 2.504.337c1.909-1.294 2.747-1.026 2.747-1.026.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg>`,
};

const LANG_COLORS = {
  JavaScript:'#F7DF1E', TypeScript:'#3178C6', Python:'#3776AB',
  PHP:'#777BB4', HTML:'#E34F26', CSS:'#1572B6', 'C++':'#00599C',
  Java:'#ED8B00', Vue:'#4FC08D', Go:'#00ADD8', Rust:'#CE422B', Shell:'#89E051',
};
const getLangColor = l => LANG_COLORS[l] || '#a855f7';

/* ─── Stats via GitHub API langsung (tidak butuh readme-stats) ─── */
async function fetchGitHubUserStats(username) {
  try {
    const [userRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${username}`),
      fetch(`https://api.github.com/users/${username}/repos?per_page=100&type=public`),
    ]);
    const user  = await userRes.json();
    const repos = await reposRes.json();

    const totalStars  = repos.reduce((s, r) => s + r.stargazers_count, 0);
    const totalForks  = repos.reduce((s, r) => s + r.forks_count, 0);
    const languages   = {};
    repos.forEach(r => { if (r.language) languages[r.language] = (languages[r.language] || 0) + 1; });

    return { user, repos, totalStars, totalForks, languages };
  } catch (e) {
    return null;
  }
}

/* ─── Build stats card dari API data ─── */
function buildStatsCard(data) {
  if (!data) return `<p class="gh-img-fallback">Stats tidak tersedia.</p>`;
  const { user, totalStars, totalForks, repos } = data;

  return `
    <div class="gh-api-stats">
      <div class="gh-api-stat">
        <span class="gh-api-stat__val">${user.public_repos ?? 0}</span>
        <span class="gh-api-stat__label">Repos</span>
      </div>
      <div class="gh-api-stat">
        <span class="gh-api-stat__val">${totalStars}</span>
        <span class="gh-api-stat__label">Stars</span>
      </div>
      <div class="gh-api-stat">
        <span class="gh-api-stat__val">${totalForks}</span>
        <span class="gh-api-stat__label">Forks</span>
      </div>
      <div class="gh-api-stat">
        <span class="gh-api-stat__val">${user.followers ?? 0}</span>
        <span class="gh-api-stat__label">Followers</span>
      </div>
    </div>`;
}

/* ─── Build language chart dari API data ─── */
function buildLangCard(data) {
  if (!data) return `<p class="gh-img-fallback">Language data tidak tersedia.</p>`;
  const { languages } = data;
  const total = Object.values(languages).reduce((s, v) => s + v, 0);
  if (!total) return `<p class="gh-img-fallback">Belum ada data bahasa.</p>`;

  const sorted = Object.entries(languages)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const bars = sorted.map(([lang, count]) => {
    const pct = ((count / total) * 100).toFixed(1);
    return `
      <div class="gh-lang-row">
        <div class="gh-lang-info">
          <span class="gh-lang-dot" style="background:${getLangColor(lang)}"></span>
          <span class="gh-lang-name">${lang}</span>
          <span class="gh-lang-pct">${pct}%</span>
        </div>
        <div class="gh-lang-bar-wrap">
          <div class="gh-lang-bar" style="width:${pct}%;background:${getLangColor(lang)}"></div>
        </div>
      </div>`;
  }).join('');

  return `
    <div class="gh-lang-chart">
      <p class="gh-lang-title">Most Used Languages</p>
      ${bars}
    </div>`;
}

/* ─── Repo card ─── */
function buildRepoCard(repo) {
  const lang = repo.language || 'Code';
  const desc = (repo.description || 'No description.')
    .slice(0, 85) + (repo.description?.length > 85 ? '…' : '');
  return `
    <a class="gh-repo-card fade-in-hidden"
      href="${repo.html_url}" target="_blank" rel="noopener noreferrer">
      <div class="gh-repo-card__header">
        <span class="gh-repo-card__name">${repo.name}</span>
        <span class="gh-repo-card__ext">${ICONS.ext}</span>
      </div>
      <p class="gh-repo-card__desc">${desc}</p>
      <div class="gh-repo-card__footer">
        <span class="gh-repo-card__lang">
          <span class="gh-repo-card__lang-dot" style="background:${getLangColor(lang)}"></span>
          ${lang}
        </span>
        <span class="gh-repo-card__stat">${ICONS.star} ${repo.stargazers_count}</span>
        <span class="gh-repo-card__stat">${ICONS.fork} ${repo.forks_count}</span>
      </div>
    </a>`;
}

function buildSkeleton() {
  return `
    <div class="gh-repo-card gh-skeleton">
      <div class="skeleton" style="height:.9rem;width:60%;margin-bottom:.75rem"></div>
      <div class="skeleton" style="height:.75rem;width:90%;margin-bottom:.4rem"></div>
      <div class="skeleton" style="height:.75rem;width:70%;margin-bottom:1.25rem"></div>
      <div class="skeleton" style="height:.75rem;width:40%"></div>
    </div>`;
}

/* ─── Build HTML ─── */
function buildHTML(cfg) {
  const { username, snake_dark, contribution_graph } = cfg;
  const profileUrl = `https://github.com/${username}`;

  return `
    <div class="gh-header fade-in-hidden">
      <p class="gh-label">~/github</p>
      <h2 class="gh-heading">Open Source</h2>
      <a href="${profileUrl}" target="_blank" rel="noopener noreferrer" class="gh-profile-link">
        ${ICONS.gh} @${username}
      </a>
    </div>

    <!-- Stats row: diisi JS dari GitHub API -->
    <div class="gh-stats-row fade-in-hidden" data-delay="100">
      <div class="gh-stat-card" id="gh-stats-card">
        ${Array(4).fill(`<div class="skeleton" style="height:2rem;width:80%;margin:.5rem auto"></div>`).join('')}
      </div>
      <div class="gh-stat-card" id="gh-lang-card">
        ${Array(5).fill(`<div class="skeleton" style="height:1rem;width:90%;margin:.4rem auto"></div>`).join('')}
      </div>
    </div>

    <!-- Contribution graph -->
    <div class="gh-contrib-wrap fade-in-hidden" data-delay="200">
      <p class="gh-section-label">Contribution Graph</p>
      <div class="gh-contrib-card">
        <img src="${contribution_graph}"
          alt="Contribution Graph ${username}" class="gh-contrib-img" loading="lazy"
          onerror="this.parentElement.innerHTML='<p class=gh-img-fallback>Contribution graph tidak tersedia.</p>'"/>
      </div>
    </div>

    <!-- Snake animation -->
    <div class="gh-snake-wrap fade-in-hidden" data-delay="300">
      <p class="gh-section-label">Contribution Snake</p>
      <div class="gh-snake-card" id="gh-snake-card">
        <img src="${snake_dark}"
          alt="GitHub Snake ${username}" class="gh-snake-img" loading="lazy"
          onerror="this.closest('#gh-snake-card').innerHTML='<p class=gh-img-fallback>Snake belum tersedia — jalankan snake.yml di GitHub Actions repo <strong>${username}/${username}</strong>.</p>'"/>
      </div>
    </div>

    <!-- Recent repos -->
    <div class="gh-repos-wrap fade-in-hidden" data-delay="400">
      <p class="gh-section-label">Recent Repositories</p>
      <div class="gh-repos-grid" id="gh-repos-grid">
        ${Array(6).fill(0).map(buildSkeleton).join('')}
      </div>
    </div>`;
}

/* ─── Load semua data ─── */
async function loadGitHubData(username) {
  // Stats & language dari GitHub API langsung — tidak butuh readme-stats
  const statsData = await fetchGitHubUserStats(username);

  const statsCard = document.getElementById('gh-stats-card');
  const langCard  = document.getElementById('gh-lang-card');
  if (statsCard) statsCard.innerHTML = buildStatsCard(statsData);
  if (langCard)  langCard.innerHTML  = buildLangCard(statsData);

  // Repos
  const grid = document.getElementById('gh-repos-grid');
  if (!grid) return;

  try {
    const repos = statsData?.repos
      ? [...statsData.repos].sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)).slice(0, 6)
      : await fetchGitHubRepos(username);

    if (!repos?.length) {
      grid.innerHTML = `<p class="gh-img-fallback">Tidak ada repository publik.</p>`;
      return;
    }

    grid.innerHTML = repos.slice(0, 6).map(buildRepoCard).join('');

    if (!prefersReducedMotion()) {
      grid.querySelectorAll('.fade-in-hidden').forEach((el, i) => {
        setTimeout(() => el.classList.add('fade-in-visible'), i * 80);
      });
    } else {
      grid.querySelectorAll('.fade-in-hidden').forEach(el => el.classList.add('fade-in-visible'));
    }
  } catch (err) {
    grid.innerHTML = `<p class="gh-img-fallback">Gagal memuat repository.</p>`;
  }
}

function initSectionFadeIn() {
  const targets = document.querySelectorAll('#github .fade-in-hidden');
  if (!targets.length) return;
  if (prefersReducedMotion()) {
    targets.forEach(el => el.classList.add('fade-in-visible'));
    return;
  }
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const delay = parseInt(entry.target.dataset.delay || '0', 10);
      setTimeout(() => entry.target.classList.add('fade-in-visible'), delay);
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.1 });
  targets.forEach(el => obs.observe(el));
}

export function initGitHub(githubConfig) {
  const section = document.getElementById('github');
  if (!section || !githubConfig?.username) return;

  const inner = section.querySelector('.section-inner') || section;
  inner.innerHTML = buildHTML(githubConfig);

  requestAnimationFrame(() => {
    initSectionFadeIn();
    loadGitHubData(githubConfig.username);
  });
}