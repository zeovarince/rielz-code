/**
 * certificates.js — Certificates Section
 *
 * Layout: kiri list, kanan CardSwap
 * PDF ditampilkan via PDF.js (canvas render)
 * Klik list → swap card + aktif
 * Tombol "Lihat" → buka PDF full di tab baru
 */

/* ─── Format date ─── */
function formatDate(dateStr) {
  if (!dateStr) return '';
  const [year, month] = dateStr.split('-');
  const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
  return month ? `${months[parseInt(month,10)-1]} ${year}` : year;
}

/* ─── Icons ─── */
const ICONS = {
  award:    `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="9" r="7"/><polyline points="9 14.2 12 22 15 14.2"/></svg>`,
  calendar: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  eye:      `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
  chevron:  `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`,
  ext:      `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`,
};

const FOOTER_H = 72; // tinggi panel footer (harus sama dengan CSS)

/* ─── Load PDF.js jika belum ada ─── */
function loadPdfJs() {
  return new Promise(resolve => {
    if (window.pdfjsLib) { resolve(window.pdfjsLib); return; }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      resolve(window.pdfjsLib);
    };
    document.head.appendChild(script);
  });
}

/* ─── Render PDF page ke canvas ─── */
async function renderPdfToCanvas(pdfUrl, canvas, targetW, targetH) {
  try {
    const pdfjsLib = await loadPdfJs();
    const pdf  = await pdfjsLib.getDocument(pdfUrl).promise;
    const page = await pdf.getPage(1);

    const dpr      = window.devicePixelRatio || 1;
    const viewport = page.getViewport({ scale: 1 });

    // Math.min = contain (full sertif terlihat, tidak terpotong)
    // * 0.92 → sedikit padding di pinggir supaya napas
    const scale = Math.min(
      (targetW * dpr) / viewport.width,
      (targetH * dpr) / viewport.height
    ) * 0.92;
    const vp = page.getViewport({ scale });

    // Canvas = ukuran area konten persis (physical px)
    canvas.width  = Math.round(targetW * dpr);
    canvas.height = Math.round(targetH * dpr);
    canvas.style.width  = `${targetW}px`;
    canvas.style.height = `${targetH}px`;

    // Center-crop: geser PDF ke tengah kalau lebih besar dari canvas
    const offsetX = (canvas.width  - vp.width)  / 2;
    const offsetY = (canvas.height - vp.height) / 2;

    await page.render({
      canvasContext: canvas.getContext('2d'),
      viewport: vp,
      transform: [1, 0, 0, 1, offsetX, offsetY],
    }).promise;
  } catch (e) {
    console.warn('[PDF.js] Render failed:', e);
    canvas.parentElement?.classList.add('cert-card--fallback');
  }
}

/* ─── Build HTML ─── */
function buildHTML(certs) {
  const listHTML = certs.map((cert, i) => `
    <div class="cert-list-item ${i === 0 ? 'cert-list-item--active' : ''}"
      data-index="${i}" role="button" tabindex="0">
      <div class="cert-list-item__left">
        <span class="cert-list-item__num">${String(i+1).padStart(2,'0')}</span>
        <div class="cert-list-item__info">
          <h4 class="cert-list-item__title">${cert.title}</h4>
          <div class="cert-list-item__meta">
            <span>${ICONS.award} ${cert.issuer}</span>
            ${cert.date ? `<span>${ICONS.calendar} ${formatDate(cert.date)}</span>` : ''}
          </div>
        </div>
      </div>
      <div class="cert-list-item__right">
        <span class="cert-list-item__cat">${cert.category || 'General'}</span>
        <span class="cert-list-item__chevron">${ICONS.chevron}</span>
      </div>
    </div>`).join('');

  return `
    <div class="cert-header fade-in-hidden">
      <p class="cert-label">~/certificates</p>
      <h2 class="cert-heading">Credentials</h2>
    </div>

    <div class="cert-content fade-in-hidden" data-delay="150">

      <!-- KIRI: List -->
      <div class="cert-list" id="cert-list">${listHTML}</div>

      <!-- KANAN: CardSwap -->
      <div class="cert-swap-wrap">
        <div class="cert-swap-scene" id="cert-swap-scene"></div>
      </div>

    </div>`;
}

/* ════════════════════════════════
   CARD SWAP — Vanilla JS + GSAP
════════════════════════════════ */
class CardSwap {
  constructor(container, certs, opts = {}) {
    this.container = container;
    this.certs     = certs;
    this.cardW     = opts.width            ?? 400;
    this.cardH     = opts.height           ?? 280;
    this.distX     = opts.cardDistance     ?? 40;
    this.distY     = opts.verticalDistance ?? 44;
    this.delay     = opts.delay            ?? 4000;
    this.skew      = opts.skewAmount       ?? 4;
    this.onSwap    = opts.onSwap           || null;

    this.els   = [];
    this.order = [];
    this.tl    = null;
    this.timer = null;
    this.busy  = false;

    this.cfg = {
      ease: 'elastic.out(0.6,0.9)',
      dur: 1.8, overlapFac: 0.9, returnDelay: 0.05,
    };

    this._build();
    this._placeAll();
    this._startAuto();
  }

  _slot(i) {
    return {
      x: i * this.distX,
      y: -i * this.distY,
      z: -i * this.distX * 1.5,
      zIndex: this.certs.length - i,
    };
  }

  _build() {
    const gsap = window.gsap;
    this.container.style.cssText = `
      position:relative;
      width:${this.cardW}px;
      height:${this.cardH}px;
      perspective:900px;
    `;

    this.certs.forEach((cert, i) => {
      const el = document.createElement('div');
      el.className = 'cert-swap-card';
      el.setAttribute('data-cert-index', i);
      el.style.cssText = `
        position:absolute; top:50%; left:50%;
        width:${this.cardW}px; height:${this.cardH}px;
        border-radius:1rem;
        transform-style:preserve-3d;
        will-change:transform;
        backface-visibility:hidden;
        overflow:hidden;
        cursor:pointer;
      `;

      const isPdf     = cert.image?.toLowerCase().endsWith('.pdf');
      const initials  = cert.title.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
      const viewBtn   = cert.image
        ? `<button class="cert-view-btn" data-pdf="${cert.image}" data-title="${cert.title}">${ICONS.eye} Lihat</button>`
        : '';

      if (isPdf) {
        el.innerHTML = `
          <div class="cert-card-canvas-wrap">
            <canvas class="cert-card-canvas" data-pdf="${cert.image}"></canvas>
            <div class="cert-card-canvas-loading">
              <div class="skeleton" style="width:100%;height:100%"></div>
            </div>
          </div>
          <div class="cert-swap-card__overlay">
            <div class="cert-swap-card__footer">
              <div>
                <p class="cert-swap-card__title">${cert.title}</p>
                <p class="cert-swap-card__issuer">${cert.issuer}</p>
              </div>
              ${viewBtn}
            </div>
          </div>`;

      } else if (cert.image) {
        el.innerHTML = `
          <div style="position:absolute;top:0;left:0;right:0;bottom:${FOOTER_H}px;overflow:hidden;">
            <img src="${cert.image}" alt="${cert.title}"
              style="width:100%;height:100%;object-fit:cover;display:block"
              onerror="this.style.display='none'"/>
          </div>
          <div class="cert-swap-card__overlay">
            <div class="cert-swap-card__footer">
              <div>
                <p class="cert-swap-card__title">${cert.title}</p>
                <p class="cert-swap-card__issuer">${cert.issuer}</p>
              </div>
              ${viewBtn}
            </div>
          </div>`;

      } else {
        el.innerHTML = `
          <div class="cert-card-fallback">
            <span class="cert-swap-card__initials">${initials}</span>
          </div>
          <div class="cert-swap-card__overlay">
            <div class="cert-swap-card__footer">
              <div>
                <p class="cert-swap-card__title">${cert.title}</p>
                <p class="cert-swap-card__issuer">${cert.issuer}</p>
              </div>
            </div>
          </div>`;
      }

      // Klik card → bawa ke depan
      el.addEventListener('click', (e) => {
        if (e.target.closest('.cert-view-btn')) return;
        this._bringToFront(i);
      });

      this.container.appendChild(el);
      this.els.push(el);
      this.order.push(i);
    });

    // Tombol "Lihat" → buka PDF di tab baru
    this.container.addEventListener('click', (e) => {
      const btn = e.target.closest('.cert-view-btn');
      if (!btn) return;
      e.stopPropagation();
      openPdfModal(btn.dataset.pdf, btn.dataset.title);
    });
  }

  _placeAll() {
    const gsap = window.gsap;
    if (!gsap) return;
    this.order.forEach((certIdx, queuePos) => {
      const slot = this._slot(queuePos);
      gsap.set(this.els[certIdx], {
        x: slot.x, y: slot.y, z: slot.z,
        xPercent: -50, yPercent: -50,
        skewY: this.skew,
        transformOrigin: 'center center',
        zIndex: slot.zIndex,
        force3D: true,
      });
    });

    this._renderVisiblePdfs();
  }

  _renderVisiblePdfs() {
    // Tinggi area konten = kartu dikurangi footer
    const contentH = this.cardH - FOOTER_H;

    this.order.slice(0, 2).forEach(certIdx => {
      const el     = this.els[certIdx];
      const canvas = el.querySelector('.cert-card-canvas');
      if (!canvas || canvas.dataset.rendered) return;
      canvas.dataset.rendered = 'true';

      const loading = el.querySelector('.cert-card-canvas-loading');
      renderPdfToCanvas(canvas.dataset.pdf, canvas, this.cardW, contentH).then(() => {
        if (loading) loading.style.display = 'none';
      });
    });
  }

  _doSwap() {
    const gsap = window.gsap;
    if (!gsap || this.order.length < 2 || this.busy) return;
    this.busy = true;

    const cfg = this.cfg;
    const [frontIdx, ...restIdxs] = this.order;
    const elFront = this.els[frontIdx];

    const tl = gsap.timeline({
      onComplete: () => {
        this.order = [...restIdxs, frontIdx];
        if (this.onSwap) this.onSwap(this.order[0]);
        this._renderVisiblePdfs();
        this.busy = false;
      }
    });
    this.tl = tl;

    tl.to(elFront, { y: '+=600', duration: cfg.dur, ease: cfg.ease });
    tl.addLabel('promote', `-=${cfg.dur * cfg.overlapFac}`);
    restIdxs.forEach((certIdx, i) => {
      const slot = this._slot(i);
      tl.set(this.els[certIdx], { zIndex: slot.zIndex }, 'promote');
      tl.to(this.els[certIdx], {
        x: slot.x, y: slot.y, z: slot.z,
        duration: cfg.dur, ease: cfg.ease,
      }, `promote+=${i * 0.15}`);
    });

    const backSlot = this._slot(this.order.length - 1);
    tl.addLabel('return', `promote+=${cfg.dur * cfg.returnDelay}`);
    tl.call(() => { gsap.set(elFront, { zIndex: backSlot.zIndex }); }, undefined, 'return');
    tl.to(elFront, {
      x: backSlot.x, y: backSlot.y, z: backSlot.z,
      duration: cfg.dur, ease: cfg.ease,
    }, 'return');
  }

  _startAuto() {
    this._doSwap();
    this.timer = setInterval(() => this._doSwap(), this.delay);
  }

  _bringToFront(certIdx) {
    const pos = this.order.indexOf(certIdx);
    if (pos === 0) return;

    clearInterval(this.timer);
    if (this.tl) { this.tl.kill(); this.tl = null; }
    this.busy = false;

    this.order = [...this.order.slice(pos), ...this.order.slice(0, pos)];

    const gsap = window.gsap;
    this.order.forEach((cIdx, queuePos) => {
      const slot = this._slot(queuePos);
      gsap.to(this.els[cIdx], {
        x: slot.x, y: slot.y, z: slot.z,
        zIndex: slot.zIndex,
        duration: 0.65, ease: 'power2.out',
      });
    });

    if (this.onSwap) this.onSwap(this.order[0]);
    this._renderVisiblePdfs();

    setTimeout(() => this._startAuto(), 750);
  }

  showCert(certIdx) { this._bringToFront(certIdx); }
  destroy() { clearInterval(this.timer); if (this.tl) this.tl.kill(); }
}

/* ────────────────────────────
   PDF MODAL — buka full screen
──────────────────────────── */
function openPdfModal(pdfUrl, title) {
  window.open(pdfUrl, '_blank', 'noopener,noreferrer');
}

/* ─── Sync active list ─── */
function syncList(certIdx) {
  document.querySelectorAll('.cert-list-item').forEach(el => {
    el.classList.toggle('cert-list-item--active',
      parseInt(el.dataset.index, 10) === certIdx);
  });
}

/* ─── FadeIn ─── */
function initFadeIn() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const delay = parseInt(e.target.dataset.delay || '0', 10);
      setTimeout(() => e.target.classList.add('fade-in-visible'), delay);
      obs.unobserve(e.target);
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('#certificates .fade-in-hidden').forEach(el => obs.observe(el));
}

/* ─── INIT ─── */
export function initCertificates(certificates) {
  const section = document.getElementById('certificates');
  if (!section || !certificates?.length) return;

  const inner = section.querySelector('.section-inner') || section;
  inner.innerHTML = buildHTML(certificates);
  initFadeIn();

  function tryInit() {
    if (!window.gsap) { setTimeout(tryInit, 100); return; }

    const scene = document.getElementById('cert-swap-scene');
    if (!scene) return;

    const wrapW = scene.parentElement.offsetWidth || 420;
    const cardW = Math.min(wrapW - 40, 460);
    const cardH = Math.round(cardW * 0.68);

    const swap = new CardSwap(scene, certificates, {
      width           : cardW,
      height          : cardH,
      cardDistance    : Math.round(cardW * 0.1),
      verticalDistance: Math.round(cardH * 0.18),
      delay           : 4000,
      skewAmount      : 4,
      onSwap          : (certIdx) => syncList(certIdx),
    });

    // List click
    document.getElementById('cert-list')?.addEventListener('click', e => {
      const item = e.target.closest('.cert-list-item');
      if (!item) return;
      swap.showCert(parseInt(item.dataset.index, 10));
    });

    // Keyboard
    document.getElementById('cert-list')?.addEventListener('keydown', e => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const item = e.target.closest('.cert-list-item');
      if (!item) return;
      e.preventDefault();
      swap.showCert(parseInt(item.dataset.index, 10));
    });
  }

  requestAnimationFrame(tryInit);
}