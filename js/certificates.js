/**
 * certificates.js — Controller untuk certificates.html
 *
 * Halaman standalone, tidak ada hubungan dengan app.js / index.html.
 * Flow:
 *   1. Fetch /data/certificates.json
 *   2. Build filter pills di sidebar
 *   3. Render list sertifikat di kolom tengah
 *   4. Klik item → load & render PDF di viewer kanan
 *   5. Zoom (Ctrl+Scroll), page nav (arrow key), buka tab baru
 */

/* ══ PDF.js worker ══ */
pdfjsLib.GlobalWorkerOptions.workerSrc =
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

/* ══ Helpers ══ */
const MONTHS = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];

function formatDate(str) {
  if (!str) return '';
  const [y, m] = str.split('-');
  return m ? `${MONTHS[parseInt(m, 10) - 1]} ${y}` : y;
}

function resolvePath(p) {
  if (!p) return '';
  if (p.startsWith('http')) return p;
  if (window.location.protocol === 'file:') {
    const base = window.location.href.replace(/\/[^/]*$/, '/');
    return new URL(p.replace(/^\//, ''), base).href;
  }
  return p;
}

const SVG = {
  award: `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="9" r="7"/><polyline points="9 14.2 12 22 15 14.2"/></svg>`,
  cal:   `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
};

const $ = id => document.getElementById(id);

/* ══ DOM refs ══ */
const sbCount     = $('sb-count');
const filterPills = $('filter-pills');
const listLabel   = $('list-label');
const listCount   = $('list-count');
const certList    = $('cert-list');
const vtTitle     = $('vt-title');
const vtIssuer    = $('vt-issuer');
const btnOpen     = $('btn-open');
const viewerEmpty = $('viewer-empty');
const canvasWrap  = $('canvas-wrap');
const canvasSkel  = $('canvas-skel');
const pdfCanvas   = $('pdf-canvas');
const viewerBody  = $('viewer-body');
const pageInfo    = $('page-info');
const pagePrev    = $('page-prev');
const pageNext    = $('page-next');
const zoomInBtn   = $('zoom-in');
const zoomOutBtn  = $('zoom-out');
const zoomVal     = $('zoom-val');
const statusLeft  = $('status-left');
const statusRight = $('status-right');

/* ══ State ══ */
let allCerts  = [];
let filtered  = [];
let activeIdx = -1;
let activeCat = 'all';

let pdfDoc     = null;
let pdfPage    = 1;
let pdfTotal   = 0;
let pdfZoom    = 1.0;
let renderTask = null;

/* ══ Load data ══ */
async function loadData() {
  try {
    const res = await fetch(resolvePath('/data/certificates.json'));
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    allCerts = await res.json();
  } catch (e) {
    console.error('[certificates.js] Gagal load data:', e);
    allCerts = [];
  }
}

/* ══ Filter pills ══ */
function buildFilters() {
  const counts = { all: allCerts.length };
  allCerts.forEach(c => {
    const cat = c.category || 'General';
    counts[cat] = (counts[cat] || 0) + 1;
  });
  const cats = ['all', ...new Set(allCerts.map(c => c.category || 'General'))];

  filterPills.innerHTML = cats.map(cat => `
    <button class="cp-pill ${cat === activeCat ? 'cp-pill--active' : ''}" data-cat="${cat}">
      ${cat === 'all' ? 'Semua' : cat}
      <span class="cp-pill__badge">${counts[cat] || 0}</span>
    </button>
  `).join('');

  filterPills.querySelectorAll('.cp-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      activeCat = btn.dataset.cat;
      filterPills.querySelectorAll('.cp-pill')
        .forEach(b => b.classList.remove('cp-pill--active'));
      btn.classList.add('cp-pill--active');
      applyFilter();
    });
  });
}

/* ══ Filter & render list ══ */
function applyFilter() {
  filtered = activeCat === 'all'
    ? [...allCerts]
    : allCerts.filter(c => (c.category || 'General') === activeCat);
  listLabel.textContent = activeCat === 'all' ? 'Semua' : activeCat;
  listCount.textContent = filtered.length;
  renderList();
}

function renderList() {
  if (!filtered.length) {
    certList.innerHTML = `
      <div style="padding:2rem 1rem;text-align:center;color:var(--text-dim);font-size:.72rem;">
        Tidak ada sertifikat di kategori ini
      </div>`;
    return;
  }

  certList.innerHTML = filtered.map((cert, i) => {
    const realIdx  = allCerts.indexOf(cert);
    const isActive = realIdx === activeIdx;
    return `
      <div class="cp-item ${isActive ? 'cp-item--active' : ''}"
        data-real="${realIdx}" role="option" aria-selected="${isActive}" tabindex="0">
        <span class="cp-item__num">${String(i + 1).padStart(2, '0')}</span>
        <div class="cp-item__body">
          <p class="cp-item__title">${cert.title}</p>
          <div class="cp-item__meta">
            <span class="cp-item__issuer">${SVG.award} ${cert.issuer}</span>
            ${cert.date ? `<span class="cp-item__date">${SVG.cal} ${formatDate(cert.date)}</span>` : ''}
            <span class="cp-item__cat">${cert.category || 'General'}</span>
          </div>
        </div>
      </div>`;
  }).join('');

  certList.querySelectorAll('.cp-item').forEach(el => {
    const pick = () => selectCert(parseInt(el.dataset.real, 10));
    el.addEventListener('click', pick);
    el.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); }
    });
  });
}

/* ══ Select sertifikat ══ */
function selectCert(realIdx) {
  activeIdx = realIdx;
  renderList();

  const cert = allCerts[realIdx];
  vtTitle.textContent  = cert.title;
  vtIssuer.textContent = cert.issuer || '';
  statusLeft.textContent = cert.title;

  if (cert.image) {
    const url = resolvePath(cert.image);
    btnOpen.style.display = 'inline-flex';
    btnOpen.onclick = () => window.open(url, '_blank', 'noopener,noreferrer');
    loadPdf(url);
  } else {
    btnOpen.style.display = 'none';
    clearViewer();
    statusLeft.textContent = 'Tidak ada dokumen';
  }
}

/* ══ Clear viewer ══ */
function clearViewer() {
  viewerEmpty.style.display = 'flex';
  canvasWrap.style.display  = 'none';
  pageInfo.textContent      = '—';
  pagePrev.disabled         = true;
  pageNext.disabled         = true;
  zoomInBtn.disabled        = true;
  zoomOutBtn.disabled       = true;
  statusRight.textContent   = '';
  pdfDoc = null; pdfPage = 1; pdfTotal = 0;
}

/* ══ Load PDF ══ */
async function loadPdf(url) {
  viewerEmpty.style.display = 'none';
  canvasWrap.style.display  = 'block';
  canvasWrap.classList.add('cp-loading');
  canvasWrap.classList.remove('cp-ready');
  canvasSkel.classList.remove('hidden');
  statusLeft.textContent  = 'Memuat PDF…';
  statusRight.textContent = '';

  if (renderTask) { try { renderTask.cancel(); } catch (_) {} renderTask = null; }

  pdfDoc = null; pdfPage = 1; pdfTotal = 0; pdfZoom = 1.0;
  updateZoomLabel();

  try {
    pdfDoc   = await pdfjsLib.getDocument(url).promise;
    pdfTotal = pdfDoc.numPages;
    pdfPage  = 1;
    zoomInBtn.disabled  = false;
    zoomOutBtn.disabled = false;
    updatePageNav();
    await renderPage();
    statusLeft.textContent  = allCerts[activeIdx]?.title || '';
    statusRight.textContent = `${pdfTotal} halaman`;
  } catch (e) {
    console.error('[certificates.js PDF] Load error:', e);
    statusLeft.textContent = 'Gagal memuat PDF';
    canvasSkel.classList.add('hidden');
  }
}

/* ══ Render halaman PDF ══ */
async function renderPage() {
  if (!pdfDoc) return;

  const bodyW = viewerBody.clientWidth  - 64;
  const bodyH = viewerBody.clientHeight - 64;
  const dpr   = window.devicePixelRatio || 1;

  const page   = await pdfDoc.getPage(pdfPage);
  const baseVp = page.getViewport({ scale: 1 });
  const fit    = Math.min(bodyW / baseVp.width, bodyH / baseVp.height);
  const scale  = fit * pdfZoom;
  const vp     = page.getViewport({ scale });

  pdfCanvas.width        = Math.round(vp.width  * dpr);
  pdfCanvas.height       = Math.round(vp.height * dpr);
  pdfCanvas.style.width  = `${vp.width}px`;
  pdfCanvas.style.height = `${vp.height}px`;

  canvasSkel.style.width  = `${vp.width}px`;
  canvasSkel.style.height = `${vp.height}px`;
  canvasSkel.classList.remove('hidden');

  const ctx = pdfCanvas.getContext('2d');
  ctx.clearRect(0, 0, pdfCanvas.width, pdfCanvas.height);

  renderTask = page.render({
    canvasContext: ctx,
    viewport: page.getViewport({ scale: scale * dpr }),
  });

  try {
    await renderTask.promise;
    canvasSkel.classList.add('hidden');
    canvasWrap.classList.remove('cp-loading');
    canvasWrap.classList.add('cp-ready');
  } catch (e) {
    if (e?.name !== 'RenderingCancelledException') {
      console.error('[certificates.js PDF] Render error:', e);
    }
  }
}

/* ══ Page nav ══ */
function updatePageNav() {
  pageInfo.textContent = pdfTotal ? `${pdfPage} / ${pdfTotal}` : '—';
  pagePrev.disabled    = pdfPage <= 1;
  pageNext.disabled    = pdfPage >= pdfTotal;
}

pagePrev.addEventListener('click', () => {
  if (pdfPage > 1) { pdfPage--; updatePageNav(); renderPage(); }
});
pageNext.addEventListener('click', () => {
  if (pdfPage < pdfTotal) { pdfPage++; updatePageNav(); renderPage(); }
});

document.addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT' || !pdfDoc) return;
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
    e.preventDefault();
    if (pdfPage < pdfTotal) { pdfPage++; updatePageNav(); renderPage(); }
  }
  if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
    e.preventDefault();
    if (pdfPage > 1) { pdfPage--; updatePageNav(); renderPage(); }
  }
});

/* ══ Zoom ══ */
function updateZoomLabel() { zoomVal.textContent = `${Math.round(pdfZoom * 100)}%`; }

function doZoom(delta) {
  const next = Math.round((pdfZoom + delta) * 100) / 100;
  if (next < 0.5 || next > 3) return;
  pdfZoom = next;
  updateZoomLabel();
  renderPage();
}

zoomInBtn.addEventListener('click',  () => doZoom(+0.25));
zoomOutBtn.addEventListener('click', () => doZoom(-0.25));

viewerBody.addEventListener('wheel', e => {
  if (!pdfDoc || !e.ctrlKey) return;
  e.preventDefault();
  doZoom(e.deltaY < 0 ? +0.1 : -0.1);
}, { passive: false });

/* ══ Resize → re-render ══ */
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => { if (pdfDoc) renderPage(); }, 180);
});

/* ══ Boot ══ */
(async function boot() {
  await loadData();

  if (!allCerts.length) {
    certList.innerHTML = `
      <div style="padding:2rem;text-align:center;color:var(--text-dim);font-size:.72rem;">
        Belum ada data sertifikat
      </div>`;
    sbCount.textContent = '0 sertifikat';
    return;
  }

  sbCount.textContent = `${allCerts.length} sertifikat`;
  buildFilters();
  applyFilter();
  selectCert(0); // auto-select pertama
})();