/**
 * profilecard.js — Vanilla JS ProfileCard
 * Fix: info bar dipindah ke bawah card, nama pakai display name pendek
 */

/* ── Inject CSS sekali ── */
const STYLE_ID = 'profile-card-styles';
if (!document.getElementById(STYLE_ID)) {
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    @keyframes pc-holo-bg {
      0%   { background-position: 0 var(--background-y, 50%), 0 0, center; }
      100% { background-position: 0 var(--background-y, 50%), 90% 90%, center; }
    }

    .pc-wrap {
      position: relative;
      touch-action: none;
      perspective: 500px;
      transform: translate3d(0,0,0.1px);
      display: flex;
      flex-direction: column;
      width: 100%;
      max-width: 280px;
      gap: 12px;
    }

    .pc-behind-glow {
      position: absolute;
      inset: 0;
      z-index: 0;
      pointer-events: none;
      transition: opacity 0.2s ease;
      filter: blur(50px) saturate(1.1);
      background: radial-gradient(
        circle at var(--pointer-x, 50%) var(--pointer-y, 50%),
        rgba(168, 85, 247, 0.5) 0%,
        transparent 50%
      );
      opacity: 0;
      border-radius: 30px;
    }

    .pc-shell {
      position: relative;
      z-index: 1;
    }

    .pc-card {
      display: grid;
      position: relative;
      overflow: hidden;
      backface-visibility: hidden;
      aspect-ratio: 0.718;
      border-radius: 24px;
      width: 100%;
      box-shadow:
        rgba(0,0,0,0.8)
        calc((var(--pointer-from-left, 0.5) * 10px) - 3px)
        calc((var(--pointer-from-top, 0.5) * 20px) - 6px)
        20px -5px;
      background: rgba(0,0,0,0.9);
      transition: transform 1s ease;
      transform: translateZ(0) rotateX(0deg) rotateY(0deg);
    }

    .pc-card.pc-active {
      transition: none;
      transform: translateZ(0) rotateX(var(--rotate-y, 0deg)) rotateY(var(--rotate-x, 0deg));
    }

    .pc-card.pc-leaving {
      transition: transform 1s ease;
      transform: translateZ(0) rotateX(0deg) rotateY(0deg);
    }

    .pc-inner {
      position: absolute;
      inset: 0;
      border-radius: 24px;
      display: grid;
      grid-area: 1 / -1;
      background-image: linear-gradient(145deg, #60496e8c 0%, #71C4FF44 100%);
      background-color: rgba(0,0,0,0.9);
    }

    .pc-shine {
      grid-area: 1 / -1;
      border-radius: 24px;
      pointer-events: none;
      overflow: hidden;
      z-index: 3;
      transform: translate3d(0,0,1px);
      mix-blend-mode: color-dodge;
      filter: brightness(0.66) contrast(1.33) saturate(0.33) opacity(0.5);
      animation: pc-holo-bg 18s linear infinite;
      background-image:
        repeating-linear-gradient(
          0deg,
          hsl(2,100%,73%)   calc(5% * 1),
          hsl(53,100%,69%)  calc(5% * 2),
          hsl(93,100%,69%)  calc(5% * 3),
          hsl(176,100%,76%) calc(5% * 4),
          hsl(228,100%,74%) calc(5% * 5),
          hsl(283,100%,73%) calc(5% * 6),
          hsl(2,100%,73%)   calc(5% * 7)
        ),
        repeating-linear-gradient(
          -45deg,
          #0e152e 0%,
          hsl(180,10%,60%) 3.8%,
          hsl(180,29%,66%) 4.5%,
          hsl(180,10%,60%) 5.2%,
          #0e152e 10%,
          #0e152e 12%
        ),
        radial-gradient(
          farthest-corner circle at var(--pointer-x, 50%) var(--pointer-y, 50%),
          hsla(0,0%,0%,0.1) 12%,
          hsla(0,0%,0%,0.15) 20%,
          hsla(0,0%,0%,0.25) 120%
        );
    }

    .pc-glare {
      grid-area: 1 / -1;
      border-radius: 24px;
      pointer-events: none;
      z-index: 4;
      transform: translate3d(0,0,1.1px);
      mix-blend-mode: overlay;
      filter: brightness(0.8) contrast(1.2);
      background-image: radial-gradient(
        farthest-corner circle at var(--pointer-x, 50%) var(--pointer-y, 50%),
        hsl(248,25%,80%) 12%,
        hsla(207,40%,30%,0.8) 90%
      );
    }

    .pc-avatar-layer {
      grid-area: 1 / -1;
      border-radius: 24px;
      pointer-events: none;
      overflow: hidden;
      transform: translateZ(2px);
    }

    .pc-avatar-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: top center;
      display: block;
      backface-visibility: hidden;
      will-change: transform;
      transition: transform 120ms ease-out;
      transform:
        translateX(calc((var(--pointer-from-left, 0.5) - 0.5) * 6px))
        translateZ(0)
        scaleY(calc(1 + (var(--pointer-from-top, 0.5) - 0.5) * 0.02))
        scaleX(calc(1 + (var(--pointer-from-left, 0.5) - 0.5) * 0.01));
    }

    /* ── Info bar BAWAH card (di luar .pc-card) ── */
    .pc-user-info {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 16px;
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      position: relative;
      z-index: 2;
    }

    .pc-user-left {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .pc-mini-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      overflow: hidden;
      border: 1px solid rgba(168,85,247,0.3);
      flex-shrink: 0;
    }

    .pc-mini-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: top center;
      border-radius: 50%;
      display: block;
    }

    .pc-user-text {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .pc-handle {
      font-size: 13px;
      font-weight: 600;
      color: rgba(255,255,255,0.9);
      line-height: 1;
      font-family: 'Kanit', sans-serif;
    }

    .pc-status {
      font-size: 11px;
      color: rgba(255,255,255,0.5);
      line-height: 1;
    }

    .pc-contact-btn {
      border: 1px solid rgba(168,85,247,0.4);
      border-radius: 8px;
      padding: 8px 14px;
      font-size: 11px;
      font-weight: 700;
      color: #c084fc;
      cursor: pointer;
      background: rgba(168,85,247,0.1);
      transition: background 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
      pointer-events: auto;
      font-family: 'Kanit', sans-serif;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .pc-contact-btn:hover {
      background: rgba(168,85,247,0.25);
      border-color: rgba(168,85,247,0.7);
      transform: translateY(-1px);
    }

    /* ── Name overlay di dalam card ── */
    .pc-details {
      grid-area: 1 / -1;
      border-radius: 24px;
      pointer-events: none;
      text-align: center;
      position: relative;
      z-index: 5;
      mix-blend-mode: luminosity;
      transform:
        translate3d(
          calc(var(--pointer-from-left, 0.5) * -6px + 3px),
          calc(var(--pointer-from-top, 0.5) * -6px + 3px),
          0.1px
        );
    }

    .pc-details-inner {
      position: absolute;
      top: 2em;
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 0 1rem;
    }

    .pc-name {
      font-size: clamp(1.5rem, 5svh, 2.5rem);
      font-weight: 800;
      margin: 0;
      background-image: linear-gradient(to bottom, #fff, #6f6fbe);
      -webkit-text-fill-color: transparent;
      -webkit-background-clip: text;
      background-clip: text;
      font-family: 'Kanit', sans-serif;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      line-height: 1.1;
    }

    .pc-title {
      margin: 4px auto 0;
      font-size: 12px;
      font-weight: 500;
      white-space: nowrap;
      background-image: linear-gradient(to bottom, #fff, #4a4ac0);
      -webkit-text-fill-color: transparent;
      -webkit-background-clip: text;
      background-clip: text;
      font-family: 'Kanit', sans-serif;
      letter-spacing: 0.05em;
    }

    /* ── HTML Tags floating ── */
    .pc-tag {
      position: absolute;
      font-family: 'Courier New', monospace;
      font-size: 11px;
      font-weight: 700;
      color: #a78bfa;
      background: rgba(139, 92, 246, 0.12);
      border: 1px solid rgba(139, 92, 246, 0.25);
      border-radius: 6px;
      padding: 3px 8px;
      pointer-events: none;
      white-space: nowrap;
      z-index: 10;
      opacity: 0;
      transform: translateY(0px) scale(0.8);
      transition: opacity 0.3s ease, transform 0.3s ease;
      text-shadow: 0 0 8px rgba(167, 139, 250, 0.6);
    }

    .pc-tag.pc-tag--visible {
      opacity: 1;
      transform: translateY(-6px) scale(1);
    }

    .pc-tag.pc-tag--exit {
      opacity: 0;
      transform: translateY(-16px) scale(0.85);
    }
  `;
  document.head.appendChild(style);
}

/* ── Helpers ── */
const clamp  = (v, min = 0, max = 100) => Math.min(Math.max(v, min), max);
const round  = (v, p = 3) => parseFloat(v.toFixed(p));
const adjust = (v, fMin, fMax, tMin, tMax) => round(tMin + ((tMax - tMin) * (v - fMin)) / (fMax - fMin));

/* ── Main factory ── */
export function createProfileCard({
  avatarUrl     = '',
  miniAvatarUrl = '',
  name          = 'Riel',
  title         = 'Frontend Developer',
  handle        = 'riel',
  status        = 'Online',
  contactText   = 'Contact',
  onContactClick = () => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }),
} = {}) {

  const wrap = document.createElement('div');
  wrap.className = 'pc-wrap';

  wrap.innerHTML = `
    <div class="pc-behind-glow"></div>

    <!-- Card utama -->
    <div class="pc-shell">
      <section class="pc-card">
        <div class="pc-inner">
          <div class="pc-shine"></div>
          <div class="pc-glare"></div>

          <!-- Avatar full card -->
          <div class="pc-avatar-layer">
            <img class="pc-avatar-img" src="../../assets/images/profile/profil.png" alt="${name}" loading="lazy" />
          </div>

          <!-- Name + title overlay -->
          <div class="pc-details">
            <div class="pc-details-inner">
              <h3 class="pc-name">${name}</h3>
              <p class="pc-title">${title}</p>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- Info bar DI BAWAH card -->
    <div class="pc-user-info">
      <div class="pc-user-left">
        <div class="pc-mini-avatar">
          <img src="${miniAvatarUrl || avatarUrl}" alt="${name} mini" loading="lazy" />
        </div>
        <div class="pc-user-text">
          <span class="pc-handle">@${handle}</span>
          <span class="pc-status">${status}</span>
        </div>
      </div>
      <button class="pc-contact-btn" type="button">${contactText}</button>
    </div>
  `;

  const glow  = wrap.querySelector('.pc-behind-glow');
  const shell = wrap.querySelector('.pc-shell');
  const card  = wrap.querySelector('.pc-card');
  const btn   = wrap.querySelector('.pc-contact-btn');

  btn.addEventListener('click', onContactClick);

  /* ── CSS vars ── */
  function setVars(x, y) {
    const w = card.clientWidth  || 1;
    const h = card.clientHeight || 1;
    const px = clamp((100 / w) * x);
    const py = clamp((100 / h) * y);
    const cx = px - 50;
    const cy = py - 50;
    const vars = {
      '--pointer-x'          : `${px}%`,
      '--pointer-y'          : `${py}%`,
      '--background-x'       : `${adjust(px, 0, 100, 35, 65)}%`,
      '--background-y'       : `${adjust(py, 0, 100, 35, 65)}%`,
      '--pointer-from-center': `${clamp(Math.hypot(py - 50, px - 50) / 50, 0, 1)}`,
      '--pointer-from-top'   : `${py / 100}`,
      '--pointer-from-left'  : `${px / 100}`,
      '--rotate-x'           : `${round(-(cx / 5))}deg`,
      '--rotate-y'           : `${round(cy / 4)}deg`,
    };
    for (const [k, v] of Object.entries(vars)) wrap.style.setProperty(k, v);
  }

  /* ── Tilt engine ── */
  let curX = 0, curY = 0, tgtX = 0, tgtY = 0;
  let rafId = null, lastTs = 0, running = false;
  let initialUntil = 0;

  function step(ts) {
    if (!running) return;
    if (!lastTs) lastTs = ts;
    const dt  = (ts - lastTs) / 1000;
    lastTs = ts;
    const tau = ts < initialUntil ? 0.6 : 0.14;
    const k   = 1 - Math.exp(-dt / tau);
    curX += (tgtX - curX) * k;
    curY += (tgtY - curY) * k;
    setVars(curX, curY);
    const far = Math.abs(tgtX - curX) > 0.05 || Math.abs(tgtY - curY) > 0.05;
    if (far) { rafId = requestAnimationFrame(step); }
    else { running = false; lastTs = 0; }
  }

  function startRaf() {
    if (running) return;
    running = true; lastTs = 0;
    rafId = requestAnimationFrame(step);
  }

  function setTarget(x, y) { tgtX = x; tgtY = y; startRaf(); }
  function toCenter()       { setTarget(card.clientWidth / 2, card.clientHeight / 2); }

  /* ── HTML Tag floating ── */
  const HTML_TAGS = [
    '<div>', '</div>', '<section>', '</section>',
    '<img/>', '<span>', '</span>', '<header>',
    '<canvas>', '<button>', '</button>', '<nav>',
    '<p>', '</p>', '<main>', '<footer>',
  ];

  let tagInterval = null;
  const activeTags = [];

  function spawnTag() {
    const rect = shell.getBoundingClientRect();
    const tag  = document.createElement('span');
    tag.className = 'pc-tag';
    tag.textContent = HTML_TAGS[Math.floor(Math.random() * HTML_TAGS.length)];

    // posisi acak di sekitar tepi card
    const side = Math.floor(Math.random() * 4); // 0=top 1=right 2=bottom 3=left
    let top, left;
    if (side === 0) { top = -18; left = 10 + Math.random() * 60; }
    else if (side === 1) { top = 10 + Math.random() * 70; left = 88; }
    else if (side === 2) { top = 90; left = 10 + Math.random() * 60; }
    else { top = 10 + Math.random() * 70; left = -10; }

    tag.style.top  = `${top}%`;
    tag.style.left = `${left}%`;

    shell.appendChild(tag);
    activeTags.push(tag);

    // fade in
    requestAnimationFrame(() => {
      requestAnimationFrame(() => tag.classList.add('pc-tag--visible'));
    });

    // fade out setelah 1.8s
    setTimeout(() => {
      tag.classList.remove('pc-tag--visible');
      tag.classList.add('pc-tag--exit');
      setTimeout(() => {
        tag.remove();
        const idx = activeTags.indexOf(tag);
        if (idx > -1) activeTags.splice(idx, 1);
      }, 350);
    }, 1800);
  }

  function startTags() {
    if (tagInterval) return;
    spawnTag();
    tagInterval = setInterval(spawnTag, 500);
  }

  function stopTags() {
    clearInterval(tagInterval);
    tagInterval = null;
    // fade out semua yang masih ada
    activeTags.forEach(tag => {
      tag.classList.remove('pc-tag--visible');
      tag.classList.add('pc-tag--exit');
      setTimeout(() => tag.remove(), 350);
    });
    activeTags.length = 0;
  }

  /* ── Events ── */
  shell.addEventListener('pointerenter', (e) => {
    card.classList.add('pc-active');
    card.classList.remove('pc-leaving');
    glow.style.opacity = '0.8';
    const rect = card.getBoundingClientRect();
    setTarget(e.clientX - rect.left, e.clientY - rect.top);
    startTags();
  });

  shell.addEventListener('pointermove', (e) => {
    const rect = card.getBoundingClientRect();
    setTarget(e.clientX - rect.left, e.clientY - rect.top);
  });

  shell.addEventListener('pointerleave', () => {
    card.classList.add('pc-leaving');
    card.classList.remove('pc-active');
    glow.style.opacity = '0';
    toCenter();
    stopTags();
    function checkSettle() {
      if (Math.hypot(tgtX - curX, tgtY - curY) > 0.6) requestAnimationFrame(checkSettle);
      else card.classList.remove('pc-leaving');
    }
    requestAnimationFrame(checkSettle);
  });

  /* ── Initial tilt animation ── */
  setTimeout(() => {
    curX = (card.clientWidth || 200) - 70;
    curY = 60;
    setVars(curX, curY);
    initialUntil = performance.now() + 1200;
    toCenter();
    startRaf();
  }, 150);

  return wrap;
}