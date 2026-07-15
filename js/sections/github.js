/**
 * github.js — GitHub Section
 *
 * Stats & Language: fetch langsung dari GitHub API (tidak pakai readme-stats)
 * Contribution Graph: ghchart.rshah.org
 * Snake: raw.githubusercontent.com
 * Repos: GitHub API
 */

import { prefersReducedMotion } from '../utils/helper.js';

/* ─── Icons ─── */
const ICONS = {
  star: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  fork: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><circle cx="18" cy="6" r="3"/><path d="M6 9v2a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V9"/><line x1="12" y1="15" x2="12" y2="21"/></svg>`,
  ext:  `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`,
  gh:   `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.268 2.75 1.026A9.578 9.578 0 0 1 12 6.836a9.59 9.59 0 0 1 2.504.337c1.909-1.294 2.747-1.026 2.747-1.026.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg>`,
  repo: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3h18v18H3z" opacity="0"/><path d="M9 19H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v5"/><path d="M13 15l3 3 5-5"/></svg>`,
};

const LANG_COLORS = {
  JavaScript:'#F7DF1E', TypeScript:'#3178C6', Python:'#3776AB',
  PHP:'#777BB4', HTML:'#E34F26', CSS:'#1572B6', 'C++':'#00599C',
  Java:'#ED8B00', Vue:'#4FC08D', Go:'#00ADD8', Rust:'#CE422B', Shell:'#89E051',
  Blade:'#f05340', Svelte:'#ff3e00', Kotlin:'#7F52FF', Swift:'#F05138',
};
const getLangColor = l => LANG_COLORS[l] || '#a855f7';

/* ─── Fetch GitHub user + repos sekaligus ─── */
async function fetchGitHubData(username) {
  try {
    const [userRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${username}`),
      fetch(`https://api.github.com/users/${username}/repos?per_page=100&type=public`),
    ]);

    if (!userRes.ok) throw new Error(`User fetch failed: ${userRes.status}`);

    const user  = await userRes.json();
    const repos = reposRes.ok ? await reposRes.json() : [];

    // Hitung stats
    const totalStars = repos.reduce((s, r) => s + (r.stargazers_count || 0), 0);
    const totalForks = repos.reduce((s, r) => s + (r.forks_count || 0), 0);

    // Hitung language usage (jumlah repo per bahasa)
    const langCount = {};
    repos.forEach(r => {
      if (r.language) langCount[r.language] = (langCount[r.language] || 0) + 1;
    });

    return { user, repos, totalStars, totalForks, langCount };
  } catch (err) {
    console.warn('[GitHub] Data fetch failed:', err);
    return null;
  }
}

/* ─── Render stats card ─── */
function renderStatsCard(data) {
  const el = document.getElementById('gh-stats-card');
  if (!el) return;

  if (!data) {
    el.innerHTML = `<p class="gh-img-fallback">Stats tidak tersedia.</p>`;
    return;
  }

  const { user, totalStars, totalForks } = data;
  el.innerHTML = `
    <div class="gh-api-stats">
      <div class="gh-api-stat">
        <span class="gh-api-stat__val">${user.public_repos ?? 0}</span>
        <span class="gh-api-stat__label">Repositories</span>
      </div>
      <div class="gh-api-stat">
        <span class="gh-api-stat__val">${totalStars}</span>
        <span class="gh-api-stat__label">Total Stars</span>
      </div>
      <div class="gh-api-stat">
        <span class="gh-api-stat__val">${totalForks}</span>
        <span class="gh-api-stat__label">Total Forks</span>
      </div>
      <div class="gh-api-stat">
        <span class="gh-api-stat__val">${user.followers ?? 0}</span>
        <span class="gh-api-stat__label">Followers</span>
      </div>
    </div>`;
}

/* ─── Render language chart ─── */
function renderLangCard(data) {
  const el = document.getElementById('gh-lang-card');
  if (!el) return;

  if (!data?.langCount || !Object.keys(data.langCount).length) {
    el.innerHTML = `<p class="gh-img-fallback">Data bahasa belum tersedia.</p>`;
    return;
  }

  const total  = Object.values(data.langCount).reduce((s, v) => s + v, 0);
  const sorted = Object.entries(data.langCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7);

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
          <div class="gh-lang-bar" style="width:0%;background:${getLangColor(lang)}"
            data-width="${pct}"></div>
        </div>
      </div>`;
  }).join('');

  el.innerHTML = `
    <div class="gh-lang-chart">
      <p class="gh-lang-title">Most Used Languages</p>
      ${bars}
    </div>`;

  // Animasi bar setelah render
  requestAnimationFrame(() => {
    el.querySelectorAll('.gh-lang-bar').forEach(bar => {
      setTimeout(() => {
        bar.style.transition = 'width 0.9s cubic-bezier(0.4,0,0.2,1)';
        bar.style.width = bar.dataset.width + '%';
      }, 200);
    });
  });
}

/* ─── Render repo cards ─── */
function buildRepoCard(repo) {
  const lang = repo.language || 'Code';
  const desc = (repo.description || 'No description.')
    .slice(0, 85) + ((repo.description?.length ?? 0) > 85 ? '…' : '');

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

function buildStatSkeleton() {
  return `
    <div style="display:flex;flex-direction:column;gap:.75rem;padding:.5rem;width:100%">
      ${Array(4).fill(`<div class="skeleton" style="height:2.5rem;border-radius:.5rem"></div>`).join('')}
    </div>`;
}

function buildLangSkeleton() {
  return `
    <div style="display:flex;flex-direction:column;gap:.6rem;padding:.5rem;width:100%">
      ${Array(5).fill(`<div class="skeleton" style="height:1.5rem;border-radius:.25rem"></div>`).join('')}
    </div>`;
}

/* ─── Build section HTML ─── */
function buildHTML(cfg) {
  const { username, snake_dark, contribution_graph, pacman } = cfg;
  const profileUrl = `https://github.com/${username}`;

  return `
    <!-- Header -->
    <div class="gh-header fade-in-hidden">
      <p class="gh-label">~/github</p>
      <h2 class="gh-heading">Open Source</h2>
      <a href="${profileUrl}" target="_blank" rel="noopener noreferrer" class="gh-profile-link">
        ${ICONS.gh} @${username}
      </a>
    </div>

    <!-- Stats + Language (dari GitHub API) -->
    <div class="gh-stats-row fade-in-hidden" data-delay="100">
      <div class="gh-stat-card" id="gh-stats-card">
        ${buildStatSkeleton()}
      </div>
      <div class="gh-stat-card" id="gh-lang-card">
        ${buildLangSkeleton()}
      </div>
    </div>

    <!-- Contribution Graph -->
    <div class="gh-contrib-wrap fade-in-hidden" data-delay="200">
      <p class="gh-section-label">Contribution Graph</p>
      <div class="gh-contrib-card">
        <img src="${contribution_graph}"
          alt="Contribution Graph" class="gh-contrib-img" loading="lazy"
          onerror="this.parentElement.innerHTML='<p class=gh-img-fallback>Contribution graph tidak tersedia.</p>'"/>
      </div>
    </div>

    <!-- Snake -->
    <div class="gh-snake-wrap fade-in-hidden" data-delay="300">
      <p class="gh-section-label">Contribution Snake</p>
      <div class="gh-snake-card">
        <img src="${snake_dark}"
          alt="GitHub Snake" class="gh-snake-img" loading="lazy"
          onerror="this.closest('.gh-snake-card').innerHTML='<p class=gh-img-fallback>Snake belum tersedia — jalankan snake.yml di GitHub Actions repo <strong>${username}/${username}</strong>.</p>'"/>
      </div>
    </div>

    ${pacman ? `
    <!-- Pac-Man -->
    <div class="gh-snake-wrap fade-in-hidden" data-delay="350">
      <p class="gh-section-label">Pac-Man</p>
      <div class="gh-snake-card">
        <img src="${pacman}"
          alt="Pac-Man" class="gh-snake-img" loading="lazy"
          onerror="this.closest('.gh-snake-card').innerHTML='<p class=gh-img-fallback>Pac-Man belum tersedia.</p>'"/>
      </div>
    </div>` : ''}

    <!-- Recent Repos -->
    <div class="gh-repos-wrap fade-in-hidden" data-delay="400">
      <p class="gh-section-label">Recent Repositories</p>
      <div class="gh-repos-grid" id="gh-repos-grid">
        ${Array(6).fill(0).map(buildSkeleton).join('')}
      </div>
    </div>`;
}

/* ─── FadeIn observer ─── */
function initFadeIn() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const delay = parseInt(e.target.dataset.delay || '0', 10);
      setTimeout(() => e.target.classList.add('fade-in-visible'), delay);
      obs.unobserve(e.target);
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('#github .fade-in-hidden').forEach(el => obs.observe(el));
}

/* ─── Render repos ke grid ─── */
function renderRepos(repos) {
  const grid = document.getElementById('gh-repos-grid');
  if (!grid) return;

  const sorted = [...repos]
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
    .slice(0, 6);

  grid.innerHTML = sorted.map(buildRepoCard).join('');

  if (!prefersReducedMotion()) {
    grid.querySelectorAll('.fade-in-hidden').forEach((el, i) => {
      setTimeout(() => el.classList.add('fade-in-visible'), i * 80);
    });
  } else {
    grid.querySelectorAll('.fade-in-hidden').forEach(el => el.classList.add('fade-in-visible'));
  }
}

/* ─── INIT ─── */
export function initGitHub(githubConfig) {
  const section = document.getElementById('github');
  if (!section || !githubConfig?.username) return;

  const inner = section.querySelector('.section-inner') || section;
  inner.innerHTML = buildHTML(githubConfig);

  initFadeIn();

  // Fetch semua data dari GitHub API
  fetchGitHubData(githubConfig.username).then(data => {
    renderStatsCard(data);
    renderLangCard(data);
    if (data?.repos?.length) {
      renderRepos(data.repos);
    } else {
      const grid = document.getElementById('gh-repos-grid');
      if (grid) grid.innerHTML = `<p class="gh-img-fallback">Tidak ada repository publik.</p>`;
    }
  });
}