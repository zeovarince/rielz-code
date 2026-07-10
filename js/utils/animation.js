/**
 * animation.js — Animasi utilities
 * Pengganti framer-motion dari template React, menggunakan:
 * - IntersectionObserver untuk fade-in on scroll
 * - RAF (requestAnimationFrame) untuk animasi kontinu
 */

/**
 * Inisialisasi observer untuk elemen .fade-in-hidden.
 * Ketika elemen masuk viewport, class diganti jadi .fade-in-visible.
 * @param {string} selector - CSS selector elemen yang akan di-observe
 */
export function initFadeIn(selector = '.fade-in-hidden') {
  const elements = document.querySelectorAll(selector);
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in-visible');
          observer.unobserve(entry.target); // Hanya sekali
        }
      });
    },
    {
      threshold: 0,
      rootMargin: '0px 0px -60px 0px', // Trigger sebelum element sepenuhnya masuk
    }
  );

  elements.forEach((el) => observer.observe(el));

  return observer;
}

/**
 * Stagger animasi pada daftar elemen (delay bertahap).
 * @param {NodeList|Array} elements
 * @param {number} baseDelay - delay awal dalam ms
 * @param {number} step - step delay antar elemen dalam ms
 */
export function staggerElements(elements, baseDelay = 0, step = 100) {
  elements.forEach((el, i) => {
    el.style.transitionDelay = `${baseDelay + i * step}ms`;
  });
}

/**
 * Scroll Velocity Marquee — Kecepatan marquee mengikuti scroll speed.
 * @param {HTMLElement} track - elemen track marquee
 * @param {Object} options
 */
export function initScrollVelocity(track, options = {}) {
  const {
    baseSpeed = 0.5,       // px per frame, default
    velocityMult = 0.08,   // seberapa cepat scroll mempengaruhi kecepatan
    damping = 0.95,        // seberapa cepat velocity kembali ke base
    direction = 1,         // 1 = kiri, -1 = kanan
  } = options;

  let x = 0;
  let velocity = baseSpeed;
  let lastScrollY = window.scrollY;
  let raf;

  function loop() {
    const currentScroll = window.scrollY;
    const delta = (currentScroll - lastScrollY) * velocityMult;
    lastScrollY = currentScroll;

    velocity += delta;
    velocity = velocity * damping + baseSpeed * (1 - damping);

    x -= velocity * direction;

    // Reset position untuk loop seamless (track harus 2x lebar konten)
    const halfWidth = track.scrollWidth / 2;
    if (Math.abs(x) >= halfWidth) {
      x = direction > 0 ? 0 : -halfWidth;
    }

    track.style.transform = `translateX(${x}px)`;
    raf = requestAnimationFrame(loop);
  }

  raf = requestAnimationFrame(loop);

  return () => cancelAnimationFrame(raf); // Cleanup function
}

/**
 * Magnet effect — elemen mengikuti posisi mouse saat kursor mendekat.
 * @param {HTMLElement} element
 * @param {Object} options
 */
export function initMagnet(element, options = {}) {
  const {
    padding = 120,
    strength = 4,
    activeTransition = 'transform 0.3s ease-out',
    inactiveTransition = 'transform 0.6s ease-in-out',
  } = options;

  function handleMouseMove(e) {
    const rect = element.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;

    const withinX = Math.abs(dx) < rect.width / 2 + padding;
    const withinY = Math.abs(dy) < rect.height / 2 + padding;

    if (withinX && withinY) {
      element.style.transition = activeTransition;
      element.style.transform = `translate3d(${dx / strength}px, ${dy / strength}px, 0)`;
    } else {
      element.style.transition = inactiveTransition;
      element.style.transform = 'translate3d(0, 0, 0)';
    }
  }

  window.addEventListener('mousemove', handleMouseMove);

  return () => window.removeEventListener('mousemove', handleMouseMove);
}

/**
 * Counter animation — angka naik dari 0 ke target.
 * @param {HTMLElement} el
 * @param {number} target
 * @param {number} duration - ms
 */
export function animateCounter(el, target, duration = 1500) {
  const start = performance.now();

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target);

    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = target;
  }

  requestAnimationFrame(update);
}

/**
 * Text shuffle animation — acak karakter lalu reveal karakter asli.
 * @param {HTMLElement} el
 * @param {string} finalText
 * @param {Object} options
 */
export function textShuffle(el, finalText, options = {}) {
  const {
    duration = 1200,
    chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%',
    fps = 30,
  } = options;

  const interval = 1000 / fps;
  const start = performance.now();
  let lastFrame = 0;

  function getRandomChar() {
    return chars[Math.floor(Math.random() * chars.length)];
  }

  function update(now) {
    if (now - lastFrame < interval) {
      requestAnimationFrame(update);
      return;
    }
    lastFrame = now;

    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Berapa karakter yang sudah di-reveal
    const revealCount = Math.floor(progress * finalText.length);

    const result = finalText
      .split('')
      .map((char, i) => {
        if (char === ' ') return ' ';
        if (i < revealCount) return char;
        return getRandomChar();
      })
      .join('');

    el.textContent = result;

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      el.textContent = finalText;
    }
  }

  requestAnimationFrame(update);
}

/**
 * Parallax scroll effect — elemen bergerak lebih lambat/cepat saat scroll.
 * @param {HTMLElement} el
 * @param {number} speed - 0 = tidak bergerak, 0.5 = setengah kecepatan, -0.5 = ke atas
 */
export function initParallax(el, speed = 0.3) {
  function update() {
    const rect = el.parentElement.getBoundingClientRect();
    const scrolled = window.innerHeight - rect.top;
    el.style.transform = `translateY(${scrolled * speed * -1}px)`;
  }

  window.addEventListener('scroll', update, { passive: true });
  update();

  return () => window.removeEventListener('scroll', update);
}
