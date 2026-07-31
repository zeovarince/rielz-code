/**
 * certificates.js
 *
 * File ini punya DUA peran:
 *
 * 1. export initCertificates() → dipanggil app.js saat load index.html
 *    Section #certificates sudah dihapus dari index, jadi ini hanya stub kosong
 *    supaya app.js tidak crash dan semua section lain tetap jalan.
 *
 * 2. Logic standalone → dijalankan otomatis jika halaman ini adalah certificates.html
 *    Grid card + lightbox modal + PDF render via PDF.js
 */

/* ══════════════════════════════════════════════════
   BAGIAN 1 — Export untuk app.js (index.html)
══════════════════════════════════════════════════ */
export function initCertificates() {
  // Section #certificates sudah tidak ada di index.html
  // Fungsi ini sengaja kosong agar app.js tidak error
}

/* ══════════════════════════════════════════════════
   BAGIAN 2 — Standalone: hanya jalan di certificates.html
══════════════════════════════════════════════════ */
import { initNavbar } from './components/navbar.js';
import { fetchJSON } from './utils/fetch.js';
import { initSplashCursor } from './utils/splashcursor.js';

if (document.getElementById('cert-grid')) {
  document.addEventListener('DOMContentLoaded', function () {
    bootstrapCertPage();
  });
}

async function bootstrapCertPage() {
  try {
    const [config] = await Promise.all([
      fetchJSON('/data/config.json'),
    ]);

    initNavbar(config);

    initSplashCursor({
      canvas: '#splash-canvas',
      rainbow: false,
      transparent: true,
      color: '#c084fc',
    });

    initCertPage();
  } catch (err) {
    console.error('[cert] Bootstrap gagal:', err);
    initCertPage();
  }
}

function initCertPage() {

  /* ── PDF.js setup ── */
  if (window.pdfjsLib) {
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  }

  /* ── Helpers ── */
  function formatYear(str) { return str ? str.split('-')[0] : ''; }

  function isPdf(p) { return typeof p === 'string' && p.toLowerCase().endsWith('.pdf'); }

  /* ── DOM refs ── */
  const filterBar     = document.getElementById('cert-filter-bar');
  const certGrid      = document.getElementById('cert-grid');
  const modal         = document.getElementById('cert-modal');
  const modalBackdrop = document.getElementById('modal-backdrop');
  const modalCounter  = document.getElementById('modal-counter');
  const modalPreview  = document.getElementById('modal-preview');
  const modalClose    = document.getElementById('modal-close');
  const modalPrev     = document.getElementById('modal-prev');
  const modalNext     = document.getElementById('modal-next');
  const modalTitle    = document.getElementById('modal-title');
  const modalSub      = document.getElementById('modal-sub');
  const modalDocLink  = document.getElementById('modal-doc-link');

  /* ── State ── */
  let allCerts        = [];
  let filtered        = [];
  let activeCat       = 'all';
  let modalIdx        = -1;
  let modalRenderTask = null;

  /* ── Load data (coba beberapa path) ── */
  async function loadData() {
    try {
      allCerts = await fetchJSON('/data/certificates.json');
    } catch (_) {
      console.error('[cert] Gagal load certificates.json');
      allCerts = [];
    }
  }

  /* ── Filter pills ── */
  function buildFilters() {
    const cats   = ['all', ...new Set(allCerts.map(c => c.category || 'General'))];
    const counts = { all: allCerts.length };
    allCerts.forEach(c => { const cat = c.category || 'General'; counts[cat] = (counts[cat]||0)+1; });

    filterBar.innerHTML = cats.map(cat => `
      <button class="cert-filter-pill ${cat === activeCat ? 'cert-filter-pill--active' : ''}" data-cat="${cat}">
        ${cat === 'all' ? 'Semua' : cat} (${counts[cat]||0})
      </button>
    `).join('');

    filterBar.querySelectorAll('.cert-filter-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        activeCat = btn.dataset.cat;
        filterBar.querySelectorAll('.cert-filter-pill').forEach(b => b.classList.remove('cert-filter-pill--active'));
        btn.classList.add('cert-filter-pill--active');
        applyFilter();
      });
    });
  }

  function applyFilter() {
    filtered = activeCat === 'all'
      ? [...allCerts]
      : allCerts.filter(c => (c.category || 'General') === activeCat);
    renderGrid();
  }

  /* ── Grid ── */
  function renderGrid() {
    if (!filtered.length) {
      certGrid.innerHTML = `<div class="cert-empty">Tidak ada sertifikat di kategori ini</div>`;
      return;
    }

    certGrid.innerHTML = filtered.map((cert, i) => `
      <div class="cert-card" data-idx="${i}" style="animation-delay:${i*60}ms"
        role="button" tabindex="0" aria-label="Lihat: ${cert.title}">
        <div class="cert-card__thumb">
          <canvas class="cert-thumb-canvas" data-path="${cert.image||''}" data-skel-id="skel-${i}"></canvas>
          <div class="cert-card__thumb-skel" id="skel-${i}"></div>
          <div class="cert-card__overlay">
            <div class="cert-card__overlay-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
              </svg>
            </div>
          </div>
        </div>
        <div class="cert-card__info">
          <p class="cert-card__title">${cert.title}</p>
          <div class="cert-card__meta">
            <span class="cert-card__issuer">${cert.issuer}</span>
            <span class="cert-card__year">${formatYear(cert.date)}</span>
          </div>
            <div class="cert-card__doc">
              ${cert.credential_url ? 'Dokumen tersedia' : 'PDF preview'}
            </div>
        </div>
      </div>
    `).join('');

    certGrid.querySelectorAll('.cert-thumb-canvas').forEach(canvas => renderThumbnail(canvas));

    certGrid.querySelectorAll('.cert-card').forEach(card => {
      const open = () => openModal(parseInt(card.dataset.idx, 10));
      card.addEventListener('click', open);
      card.addEventListener('keydown', e => { if (e.key==='Enter'||e.key===' '){ e.preventDefault(); open(); } });
    });
  }

  /* ── Thumbnail PDF ── */
  async function renderThumbnail(canvas) {
    const path  = canvas.dataset.path;
    const skel  = document.getElementById(canvas.dataset.skelId);
    if (!path) { if(skel) skel.classList.add('hidden'); return; }

    if (!isPdf(path)) {
      const img = document.createElement('img');
      img.src = path;
      img.alt = '';
      img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;position:absolute;inset:0';
      img.onload  = () => { if(skel) skel.classList.add('hidden'); };
      img.onerror = () => { if(skel) skel.classList.add('hidden'); };
      canvas.parentElement.appendChild(img);
      canvas.remove();
      return;
    }

    if (!window.pdfjsLib) { if(skel) skel.classList.add('hidden'); return; }

    try {
      const pdf   = await pdfjsLib.getDocument(path).promise;
      const page  = await pdf.getPage(1);
      const dpr   = window.devicePixelRatio || 1;
      const wrap  = canvas.parentElement;
      const cardW = wrap.clientWidth  || 320;
      const cardH = wrap.clientHeight || 240;
      const vp0   = page.getViewport({ scale: 1 });
      const scale = Math.max(cardW / vp0.width, cardH / vp0.height);
      const vp    = page.getViewport({ scale });

      canvas.width  = Math.round(vp.width  * dpr);
      canvas.height = Math.round(vp.height * dpr);
      canvas.style.cssText = 'width:100%;height:100%;position:absolute;inset:0;object-fit:cover';

      await page.render({
        canvasContext: canvas.getContext('2d'),
        viewport: page.getViewport({ scale: scale * dpr }),
      }).promise;

      if(skel) skel.classList.add('hidden');
    } catch(e) {
      console.warn('[thumb]', e);
      if(skel) skel.classList.add('hidden');
    }
  }

  /* ── Modal open/close ── */
  function openModal(idx) {
    modalIdx = idx;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    updateModal();
  }

  function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = '';
    if (modalRenderTask) { try { modalRenderTask.cancel(); } catch(_){} modalRenderTask = null; }
    modalIdx = -1;
  }

  function updateModal() {
    const cert = filtered[modalIdx];
    if (!cert) return;
    modalCounter.textContent = `${String(modalIdx+1).padStart(2,'0')} / ${String(filtered.length).padStart(2,'0')}`;
    modalTitle.textContent   = cert.title;
    modalSub.textContent     = `${cert.issuer}${cert.date ? ' · ' + formatYear(cert.date) : ''}`;
    if (modalDocLink) {
      const docUrl = cert.credential_url || cert.image || '';
      modalDocLink.hidden = !docUrl;
      modalDocLink.href = docUrl;
    }
    modalPrev.disabled       = modalIdx <= 0;
    modalNext.disabled       = modalIdx >= filtered.length - 1;
    renderModalPreview(cert);
  }

  async function renderModalPreview(cert) {
    if (modalRenderTask) { try { modalRenderTask.cancel(); } catch(_){} modalRenderTask = null; }
    modalPreview.innerHTML = `<div class="cert-modal__preview-skel"></div>`;

    if (!cert.image) {
      modalPreview.innerHTML = `<div style="padding:3rem;text-align:center;color:rgba(255,255,255,0.3);font-family:'Kanit',sans-serif">Tidak ada dokumen</div>`;
      return;
    }

    if (!isPdf(cert.image)) {
      const img = new Image();
      img.alt     = cert.title;
      img.onload  = () => { modalPreview.innerHTML = ''; modalPreview.appendChild(img); };
      img.onerror = () => { modalPreview.innerHTML = `<div style="padding:3rem;color:rgba(255,255,255,0.3)">Gagal memuat gambar</div>`; };
      img.src = cert.image;
      return;
    }

    if (!window.pdfjsLib) {
      modalPreview.innerHTML = `<div style="padding:3rem;color:rgba(255,255,255,0.3)">PDF.js tidak tersedia</div>`;
      return;
    }

    try {
      const pdf   = await pdfjsLib.getDocument(cert.image).promise;
      const page  = await pdf.getPage(1);
      const dpr   = window.devicePixelRatio || 1;
      const maxW  = Math.min(window.innerWidth * 0.8, 860);
      const maxH  = window.innerHeight * 0.65;
      const vp0   = page.getViewport({ scale: 1 });
      const scale = Math.min(maxW / vp0.width, maxH / vp0.height);
      const vp    = page.getViewport({ scale });

      const canvas           = document.createElement('canvas');
      canvas.width           = Math.round(vp.width  * dpr);
      canvas.height          = Math.round(vp.height * dpr);
      canvas.style.width     = `${vp.width}px`;
      canvas.style.height    = `${vp.height}px`;
      canvas.style.borderRadius = '0.75rem';
      canvas.style.maxWidth  = '100%';

      modalPreview.innerHTML = '';
      modalPreview.appendChild(canvas);

      modalRenderTask = page.render({
        canvasContext: canvas.getContext('2d'),
        viewport: page.getViewport({ scale: scale * dpr }),
      });
      await modalRenderTask.promise;
    } catch(e) {
      if (e?.name !== 'RenderingCancelledException') {
        console.error('[modal PDF]', e);
        modalPreview.innerHTML = `<div style="padding:3rem;color:rgba(255,255,255,0.3)">Gagal memuat PDF</div>`;
      }
    }
  }

  /* ── Event listeners ── */
  modalClose.addEventListener('click', closeModal);
  modalBackdrop.addEventListener('click', closeModal);
  modalPrev.addEventListener('click', () => { if(modalIdx>0){ modalIdx--; updateModal(); } });
  modalNext.addEventListener('click', () => { if(modalIdx<filtered.length-1){ modalIdx++; updateModal(); } });
  document.addEventListener('keydown', e => {
    if (modal.hidden) return;
    if (e.key==='Escape') { closeModal(); return; }
    if (e.key==='ArrowRight'||e.key==='ArrowDown') { e.preventDefault(); if(modalIdx<filtered.length-1){ modalIdx++; updateModal(); } }
    if (e.key==='ArrowLeft' ||e.key==='ArrowUp')   { e.preventDefault(); if(modalIdx>0){ modalIdx--; updateModal(); } }
  });

  /* ── Boot ── */
  loadData().then(() => {
    if (!allCerts.length) {
      certGrid.innerHTML = `<div class="cert-empty">Belum ada data sertifikat</div>`;
      return;
    }
    buildFilters();
    applyFilter();
  });

} // end initCertPage