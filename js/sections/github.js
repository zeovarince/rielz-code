/**
 * github.js — GitHub Section
 *
 * Menampilkan:
 * 1. GitHub Stats card  (github-readme-stats)
 * 2. Most Used Language (github-readme-stats)
 * 3. Contribution Graph (ghchart.rshah.org)
 * 4. Snake animation    (SVG dari GitHub Actions output)
 * 5. Pinned / Recent repos (GitHub API)
 */

import { fetchGitHubRepos } from '../utils/fetch.js';

/* ─── Icons ─── */
const ICONS = {
  star: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>`,

  fork: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><circle cx="18" cy="6" r="3"/>
    <path d="M6 9v2a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V9"/>
    <line x1="12" y1="15" x2="12" y2="21"/>
  </svg>`,

  externallink: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
    <polyline points="15 3 21 3 21 9"/>
    <line x1="10" y1="14" x2="21" y2="3"/>
  </svg>`,

  github: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61
      c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77
      A5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48
      a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1
      A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78
      c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
  </svg>`,
};

/* ─── Warna bahasa pemrograman ─── */
const LANG_COLORS = {
  JavaScript : '#F7DF1E',
  TypeScript : '#3178C6',
  Python     : '#3776AB',
  PHP        : '#777BB4',
  HTML       : '#E34F26',
  CSS        : '#1572B6',
  'C++'      : '#00599C',
  Java       : '#ED8B00',
  Vue        : '#4FC08D',
  Go         : '#00ADD8',
  Rust       : '#CE422B',
  Shell      : '#89E051',
};

function getLangColor(lang) {
  return LANG_COLORS[lang] || '#a855f7';
}

/* ─── Build repo card ─── */
function buildRepoCard(repo) {
  const lang      = repo.language || 'Code';
  const langColor = getLangColor(lang);
  const desc      = repo.description
    ? (repo.description.length > 80 ? repo.description.slice(0, 80) + '…' : repo.description)
    : 'No description provided.';

  return `
    <a class="gh-repo-card fade-in-hidden"
      href="${repo.html_url}" target="_blank" rel="noreferrer"
      aria-label="${repo.name}">

      <div class="gh-repo-card__header">
        <span class="gh-repo-card__name">${repo.name}</span>
        <span class="gh-repo-card__ext">${ICONS.externallink}</span>
      </div>

      <p class="gh-repo-card__desc">${desc}</p>

      <div class="gh-repo-card__footer">
        <span class="gh-repo-card__lang">
          <span class="gh-repo-card__lang-dot" style="background:${langColor}"></span>
          ${lang}
        </span>
        <span class="gh-repo-card__stat">${ICONS.star} ${repo.stargazers_count}</span>
        <span class="gh-repo-card__stat">${ICONS.fork} ${repo.forks_count}</span>
      </div>
    </a>
  `;
}

/* ─── Build skeleton repo card ─── */
function buildRepoSkeleton() {
  return `
    <div class="gh-repo-card gh-skeleton">
      <div class="skeleton" style="height:1rem;width:60%;margin-bottom:0.75rem;"></div>
      <div class="skeleton" style="height:0.75rem;width:90%;margin-bottom:0.5rem;"></div>
      <div class="skeleton" style="height:0.75rem;width:70%;margin-bottom:1.5rem;"></div>
      <div class="skeleton" style="height:0.75rem;width:40%;"></div>
    </div>
  `;
}

/* ─── Build section HTML ─── */
function buildGitHubHTML(githubConfig) {
  const { username, stats_card, lang_card, snake_dark, contribution_graph } = githubConfig;
  const profileUrl = `https://github.com/${username}`;

  return `
    <!-- Header -->
    <div class="gh-header fade-in-hidden">
      <p class="label">GitHub</p>
      <h2 class="section-heading">
        Open <span class="text-gradient">Source</span>
      </h2>
      <a href="${profileUrl}" target="_blank" rel="noreferrer" class="gh-profile-link">
        ${ICONS.github} @${username}
      </a>
    </div>

    <!-- Row 1: Stats + Language -->
    <div class="gh-stats-row fade-in-hidden" data-delay="100">
      <div class="gh-stat-card">
        <img
          src="${stats_card}"
          alt="GitHub Stats ${username}"
          class="gh-stat-img"
          loading="lazy"
          onerror="this.parentElement.classList.add('gh-img-error')"
        />
      </div>
      <div class="gh-stat-card">
        <img
          src="${lang_card}"
          alt="Most Used Languages ${username}"
          class="gh-stat-img"
          loading="lazy"
          onerror="this.parentElement.classList.add('gh-img-error')"
        />
      </div>
    </div>

    <!-- Row 2: Contribution graph -->
    <div class="gh-contrib-wrap fade-in-hidden" data-delay="200">
      <p class="gh-section-label">Contribution Graph</p>
      <div class="gh-contrib-card">
        <img
          src="${contribution_graph}"
          alt="GitHub Contribution Graph ${username}"
          class="gh-contrib-img"
          loading="lazy"
          onerror="this.parentElement.innerHTML='<p class=gh-img-fallback>Contribution graph tidak tersedia.</p>'"
        />
      </div>
    </div>

    <!-- Row 3: Snake animation -->
    <div class="gh-snake-wrap fade-in-hidden" data-delay="300">
      <p class="gh-section-label">Contribution Snake</p>
      <div class="gh-snake-card">
        <img
          src="${snake_dark}"
          alt="GitHub Snake Animation ${username}"
          class="gh-snake-img"
          loading="lazy"
          onerror="this.parentElement.innerHTML='<p class=gh-img-fallback>Snake animation belum tersedia. Pastikan GitHub Actions snake.yml sudah dijalankan.</p>'"
        />
      </div>
    </div>

    <!-- Row 4: Repos -->
    <div class="gh-repos-wrap fade-in-hidden" data-delay="400">
      <p class="gh-section-label">Recent Repositories</p>
      <div class="gh-repos-grid" id="gh-repos-grid">
        ${[1,2,3,4,5,6].map(() => buildRepoSkeleton()).join('')}
      </div>
    </div>
  `;
}

/* ─── Fetch dan render repos ─── */
async function loadRepos(username) {
  const grid = document.getElementById('gh-repos-grid');
  if (!grid) return;

  try {
    const repos = await fetchGitHubRepos(username);
    if (!repos?.length) {
      grid.innerHTML = `<p class="gh-img-fallback">Tidak ada repository publik.</p>`;
      return;
    }

    // Ambil maks 6, sort by updated
    const sorted = repos
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
      .slice(0, 6);

    grid.innerHTML = sorted.map(buildRepoCard).join('');

    // Trigger fade-in pada repo cards
    requestAnimationFrame(() => {
      grid.querySelectorAll('.fade-in-hidden').forEach((el, i) => {
        setTimeout(() => el.classList.add('fade-in-visible'), i * 80);
      });
    });

  } catch (err) {
    console.warn('[GitHub] Failed to fetch repos:', err);
    grid.innerHTML = `<p class="gh-img-fallback">Gagal memuat repository. Cek koneksi internet.</p>`;
  }
}

/* ─── INIT ─── */
export function initGitHub(githubConfig) {
  const section = document.getElementById('github');
  if (!section || !githubConfig?.username) return;

  const inner = section.querySelector('.section-inner') || section;
  inner.innerHTML = buildGitHubHTML(githubConfig);

  // Fetch repos async
  loadRepos(githubConfig.username);
}