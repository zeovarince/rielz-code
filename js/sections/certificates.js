/**
 * certificates.js — Certificates Section
 *
 * Layout: grid masonry-style
 * Fitur : hover flip/overlay, filter kategori, lightbox
 */

const ICONS = {
  award: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="9" r="7"/>
    <polyline points="9 14.2 12 22 15 14.2"/>
    <polyline points="9.6 14.6 12 17 14.4 14.6"/>
  </svg>`,

  externallink: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
    <polyline points="15 3 21 3 21 9"/>
    <line x1="10" y1="14" x2="21" y2="3"/>
  </svg>`,

  calendar: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>`,

  x: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>`,
};

/* ─── Format date ─── */
function formatDate(dateStr) {
  if (!dateStr) return '';
  const [year, month] = dateStr.split('-');
  const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
  return month ? `${months[parseInt(month,10)-1]} ${year}` : year;
}

/* ─── Get unique categories ─── */
function getCategories(certs) {
  const cats = [...new Set(certs.map(c => c.category).filter(Boolean))];
  return ['All', ...cats];
}

/* ─── Build single certificate card ─── */
function buildCertCard(cert, index) {
  const date       = formatDate(cert.date);
  const delay      = index * 80;
  const hasImage   = !!cert.image;
  const initials   = cert.title.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();

  return `
    <div class="cert-card fade-in-hidden" data-delay="${delay}"
      style="transition-delay:${delay}ms"
      data-category="${cert.category || 'Other'}"
      data-id="${cert.id}">

      <!-- Thumbnail -->
      <div class="cert-thumb">
        ${hasImage
          ? `<img src="${cert.image}" alt="${cert.title}" loading="lazy"
               onerror="this.parentElement.classList.add('cert-thumb--fallback');this.remove()" />`
          : `<div class="cert-thumb--fallback"></div>`
        }
        <div class="cert-thumb__initials">${initials}</div>
        <div class="cert-thumb__overlay">
          <button class="cert-view-btn" data-id="${cert.id}" aria-label="Lihat sertifikat">
            Lihat
          </button>
        </div>
      </div>

      <!-- Info -->
      <div class="cert-info">
        <div class="cert-info__top">
          <span class="cert-category">${cert.category || 'General'}</span>
          ${cert.credential_url
            ? `<a href="${cert.credential_url}" target="_blank" rel="noreferrer"
                class="cert-link" onclick="event.stopPropagation()" aria-label="Verifikasi">
                ${ICONS.externallink}
               </a>`
            : ''
          }
        </div>
        <h3 class="cert-title">${cert.title}</h3>
        <div class="cert-meta">
          <span class="cert-issuer">${ICONS.award} ${cert.issuer}</span>
          ${date ? `<span class="cert-date">${ICONS.calendar} ${date}</span>` : ''}
        </div>
      </div>
    </div>
  `;
}

/* ─── Build filter tabs ─── */
function buildFilters(categories) {
  return categories.map(cat => `
    <button class="cert-filter-btn ${cat === 'All' ? 'cert-filter-btn--active' : ''}"
      data-filter="${cat}">
      ${cat}
    </button>
  `).join('');
}

/* ─── Build lightbox ─── */
function buildLightbox() {
  return `
    <div class="cert-lightbox" id="cert-lightbox" role="dialog" aria-modal="true" aria-label="Certificate viewer">
      <div class="cert-lightbox__backdrop" id="cert-lb-backdrop"></div>
      <div class="cert-lightbox__content">
        <button class="cert-lightbox__close" id="cert-lb-close" aria-label="Tutup">
          ${ICONS.x}
        </button>
        <img id="cert-lb-img" src="" alt="" class="cert-lightbox__img" />
        <div class="cert-lightbox__info">
          <h3 id="cert-lb-title" class="cert-lightbox__title"></h3>
          <p id="cert-lb-issuer" class="cert-lightbox__issuer"></p>
        </div>
      </div>
    </div>
  `;
}

/* ─── Build section HTML ─── */
function buildCertHTML(certificates) {
  const categories = getCategories(certificates);
  const cards      = certificates.map((c, i) => buildCertCard(c, i)).join('');

  return `
    <div class="cert-header fade-in-hidden">
      <p class="label">Certificates</p>
      <h2 class="section-heading">
        My <span class="text-gradient">Credentials</span>
      </h2>
    </div>

    <!-- Filter tabs -->
    <div class="cert-filters fade-in-hidden" data-delay="100" id="cert-filters">
      ${buildFilters(categories)}
    </div>

    <!-- Grid -->
    <div class="cert-grid" id="cert-grid">
      ${cards}
    </div>

    <!-- Lightbox -->
    ${buildLightbox()}
  `;
}

/* ─── Filter logic ─── */
function initFilters(certificates) {
  const filterWrap = document.getElementById('cert-filters');
  const grid       = document.getElementById('cert-grid');
  if (!filterWrap || !grid) return;

  filterWrap.addEventListener('click', (e) => {
    const btn = e.target.closest('.cert-filter-btn');
    if (!btn) return;

    const filter = btn.dataset.filter;

    // Update active button
    filterWrap.querySelectorAll('.cert-filter-btn').forEach(b => {
      b.classList.toggle('cert-filter-btn--active', b === btn);
    });

    // Show/hide cards
    grid.querySelectorAll('.cert-card').forEach((card, i) => {
      const match = filter === 'All' || card.dataset.category === filter;
      card.style.display = match ? '' : 'none';

      if (match) {
        // Re-trigger fade-in
        card.classList.remove('fade-in-visible');
        setTimeout(() => card.classList.add('fade-in-visible'), i * 60);
      }
    });
  });
}

/* ─── Lightbox logic ─── */
function initLightbox(certificates) {
  const lb       = document.getElementById('cert-lightbox');
  const lbImg    = document.getElementById('cert-lb-img');
  const lbTitle  = document.getElementById('cert-lb-title');
  const lbIssuer = document.getElementById('cert-lb-issuer');
  const lbClose  = document.getElementById('cert-lb-close');
  const lbBack   = document.getElementById('cert-lb-backdrop');
  if (!lb) return;

  function open(id) {
    const cert = certificates.find(c => c.id === parseInt(id, 10));
    if (!cert) return;
    lbImg.src       = cert.image || '';
    lbImg.alt       = cert.title;
    lbTitle.textContent  = cert.title;
    lbIssuer.textContent = cert.issuer;
    lb.classList.add('cert-lightbox--open');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    lb.classList.remove('cert-lightbox--open');
    document.body.style.overflow = '';
    lbImg.src = '';
  }

  document.getElementById('cert-grid')?.addEventListener('click', (e) => {
    const btn = e.target.closest('.cert-view-btn');
    if (btn) open(btn.dataset.id);
  });

  lbClose?.addEventListener('click', close);
  lbBack?.addEventListener('click', close);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });
}

/* ─── INIT ─── */
export function initCertificates(certificates) {
  const section = document.getElementById('certificates');
  if (!section || !certificates?.length) return;

  const inner = section.querySelector('.section-inner') || section;
  inner.innerHTML = buildCertHTML(certificates);

  // Trigger fade-in cards setelah render
  requestAnimationFrame(() => {
    inner.querySelectorAll('.cert-card.fade-in-hidden').forEach((el, i) => {
      setTimeout(() => el.classList.add('fade-in-visible'), i * 80);
    });
  });

  initFilters(certificates);
  initLightbox(certificates);
}