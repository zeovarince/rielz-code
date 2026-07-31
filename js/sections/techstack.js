/**
 * techstack.js — Tech Stack Section
 *
 * Fix:
 * 1. Loop dimulai LANGSUNG saat render (shell masih off-screen) — tidak ada gap/putus
 * 2. Entrance: kedua shell ditrigger di JS tick yang sama — masuk barengan
 * 3. Scroll velocity: kecepatan naik proporsional saat scroll
 */

const NUM_COPIES = 6;

/* ── Split items into two rows ── */
function splitItems(items) {
  const mid = Math.ceil(items.length / 2);
  return { top: items.slice(0, mid), bot: items.slice(mid) };
}

/* ── Build single tech item ── */
function buildItem(tech) {
  return `
    <div class="ts-item">
      <span class="ts-item__icon">
        <i class="${tech.icon} colored" style="color:${tech.color}" aria-hidden="true"></i>
      </span>
      <span class="ts-item__name">${tech.name}</span>
    </div>`;
}

/* ── Build one marquee row ── */
function buildRow(id, items, dir) {
  const single  = items.map(buildItem).join('');
  const content = Array(NUM_COPIES).fill(single).join('');
  const shell   = dir === 'rtl'
    ? 'ts-row-shell ts-row-shell--rtl'
    : 'ts-row-shell ts-row-shell--ltr';

  return `
    <div class="${shell}">
      <div class="ts-marquee-row">
        <div class="ts-marquee-track" id="${id}">${content}</div>
      </div>
    </div>`;
}

/* ── Build full section HTML ── */
function buildTechStackHTML(techstack) {
  const { top, bot } = splitItems(techstack);
  return `
    <div class="ts-inner">
      <div class="ts-header section-inner fade-in-hidden">
        <p class="label">Technologies</p>
        <h2 class="ts-heading">Tech <span class="text-gradient">Stack</span></h2>
        <p class="ts-subheading">Tools & technologies I work with day to day</p>
      </div>
      <div class="ts-rows">
        ${buildRow('ts-track-1', top, 'ltr')}
        ${buildRow('ts-track-2', bot, 'rtl')}
      </div>
    </div>`;
}

/* ════════════════════════════════════════
   MARQUEE ENGINE

   dir  1 = LTR: track bergerak ke KIRI
                 x: 0 → -loopW → (lompat ke) 0 → -loopW → ...
   dir -1 = RTL: track bergerak ke KANAN
                 x: -loopW → 0 → (lompat ke) -loopW → ...

   Wrap terjadi di satu titik saja → tidak ada gap.
════════════════════════════════════════ */
function startMarquee(track, dir, baseSpeed) {
  baseSpeed = baseSpeed || 0.9;

  /* Gunakan double-rAF agar browser sudah menghitung layout
     (scrollWidth valid setelah paint pertama)              */
  requestAnimationFrame(function() {
    requestAnimationFrame(function() {
      var loopW = track.scrollWidth / NUM_COPIES;
      if (loopW === 0) return;

      /* RTL mulai di -loopW agar wrap dan posisi awal konsisten */
      var x           = dir === -1 ? -loopW : 0;
      var velSmooth   = 0;
      var lastScrollY = window.scrollY;

      /* Set posisi awal sebelum animasi mulai — tidak ada jump visible
         karena shell masih off-screen saat ini                         */
      track.style.transform = 'translate3d(' + x + 'px, 0, 0)';

      function tick() {
        var scrollY = window.scrollY;
        var delta   = scrollY - lastScrollY;
        lastScrollY = scrollY;

        /* Smooth scroll velocity */
        velSmooth     = velSmooth * 0.88 + delta * 0.12;
        var extra     = Math.min(Math.abs(velSmooth) * 0.2, 4.5);
        var speed     = baseSpeed + extra;

        if (dir === 1) {
          x -= speed;
          if (x <= -loopW) x += loopW;
        } else {
          x += speed;
          if (x >= 0) x -= loopW;
        }

        track.style.transform = 'translate3d(' + x + 'px, 0, 0)';
        requestAnimationFrame(tick);
      }

      requestAnimationFrame(tick);
    });
  });
}

/* ════════════════════════════════════════
   INIT
════════════════════════════════════════ */
export function initTechStack(techstack) {
  var section = document.getElementById('techstack');
  if (!section || !techstack || !techstack.length) return;

  section.innerHTML = buildTechStackHTML(techstack);

  var shells  = Array.from(section.querySelectorAll('.ts-row-shell'));
  var entered = false;

  /* ── Langkah 1: Mulai loop sekarang ──────────────────────────────
     Shell masih off-screen (translateX ±110%) jadi tidak ada yg kelihatan.
     Loop sudah stabil → saat entrance terjadi langsung full-width.
  ─────────────────────────────────────────────────────────────────── */
  shells.forEach(function(shell) {
    var track = shell.querySelector('.ts-marquee-track');
    if (!track) return;
    var dir = shell.classList.contains('ts-row-shell--rtl') ? -1 : 1;
    startMarquee(track, dir);
  });

  /* ── Langkah 2: Observer — slide BARENGAN ────────────────────────
     Kedua classList.add() dalam satu JS tick
     → browser jadwalkan kedua CSS transition di frame yang sama
     → animasi masuk atas & bawah mulai bersamaan
  ─────────────────────────────────────────────────────────────────── */
  var obs = new IntersectionObserver(function(entries) {
    if (!entries[0].isIntersecting || entered) return;
    entered = true;
    obs.disconnect();

    shells.forEach(function(shell) {
      shell.classList.add('is-visible');
    });
  }, { threshold: 0.08 });

  obs.observe(section);
}