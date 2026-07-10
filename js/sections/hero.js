/**
 * hero.js — Hero Section
 *
 * Fitur:
 * 1. Text shuffle pada nama (sekali saat load)
 * 2. Avatar/character di tengah dengan Magnet effect
 * 3. Dual Scroll Velocity marquee: atas RTL + bawah LTR, membelakangi avatar
 * 4. Splash Cursor (canvas fluid simulation)
 * 5. CTA: Explore Projects + Download CV
 * 6. FadeIn orchestrated pada semua elemen
 */

import { textShuffle, initScrollVelocity, initMagnet } from '../utils/animation.js';
import { prefersReducedMotion, isMobile } from '../utils/helper.js';
import { initSplashCursor } from '../utils/splashcursor.js';

export function initHero(profile, config) {
    const section = document.getElementById('home');
    if (!section) return;

    const displayName  = profile.name.display || 'RIEL';
    const bioShort     = profile.bio_short || '';
    const cvPath       = profile.cv || '/public/cv.pdf';
    const avatarPath   = profile.avatar || '/assets/images/profile/avatar.png';
    const velocityText =
        config.scroll_velocity_text ||
        'FRONTEND • WEB DEVELOPMENT • UI/UX DESIGNER •';

    section.innerHTML = buildHeroHTML(
        displayName,
        bioShort,
        cvPath,
        avatarPath,
        velocityText
    );

    initSplashCursor({
        canvas: '#splash-canvas',
        color: '#8B5CF6',
        rainbow: false,
        transparent: true,
    });

    initHeroAnimations(displayName);
    initScrollVelocitySection();

    if (!isMobile()) {
        initMagnetEffect();
    }
}

/* ─────────────────────────────────────────────
   HTML BUILDER
───────────────────────────────────────────── */

function buildHeroHTML(name, bio, cvPath, avatarPath, velocityText) {
    // Duplikat text lebih banyak untuk seamless loop
    const repeated = `${velocityText} &nbsp; ${velocityText} &nbsp; ${velocityText} &nbsp; ${velocityText} &nbsp; ${velocityText} &nbsp;`;

    return `
        <canvas
            id="splash-canvas"
            class="hero-splash"
            aria-hidden="true">
        </canvas>

        <!-- ═══ HERO MAIN ═══ -->
        <div class="hero-wrapper">

            <!-- Glow blobs -->
            <div class="hero-blob hero-blob--purple" aria-hidden="true"></div>
            <div class="hero-blob hero-blob--pink" aria-hidden="true"></div>

            <!-- ── Heading ── -->
            <div class="hero-heading-wrap fade-in-hidden" data-delay="150">
                <h1 id="hero-name" class="hero-name hero-heading" aria-label="${name}">
                    ${name}
                </h1>
            </div>

            <!-- ═══ SCROLL VELOCITY — dua strip, membelakangi avatar ═══ -->
            <div class="hero-marquee-stack fade-in-hidden" data-delay="300" aria-hidden="true">

                <!-- Strip atas: dari kanan ke kiri (RTL) -->
                <div class="hero-marquee-row">
                    <div id="scroll-vel-track-1" class="hero-marquee-track hero-marquee-track--rtl">
                        <span class="hero-marquee-item">${repeated}</span>
                        <span class="hero-marquee-item" aria-hidden="true">${repeated}</span>
                    </div>
                </div>

                <!-- Strip bawah: dari kiri ke kanan (LTR) -->
                <div class="hero-marquee-row">
                    <div id="scroll-vel-track-2" class="hero-marquee-track hero-marquee-track--ltr">
                        <span class="hero-marquee-item">${repeated}</span>
                        <span class="hero-marquee-item" aria-hidden="true">${repeated}</span>
                    </div>
                </div>

            </div>

            <!-- ── Avatar center ── -->
            <div id="hero-avatar-wrap" class="hero-avatar-wrap fade-in-hidden" data-delay="600">
                <div id="hero-magnet" class="hero-magnet">
                    <img
                        src="${avatarPath}"
                        alt="Avatar Choiril"
                        class="hero-avatar"
                        draggable="false"
                        onerror="this.style.display='none'"
                    />
                </div>
            </div>

            <!-- ── Bottom bar: bio kiri + CTA kanan ── -->
            <div class="hero-bottom">
                <p class="hero-bio fade-in-hidden" data-delay="350">
                    ${bio}
                </p>

                <div class="hero-cta fade-in-hidden" data-delay="500">
                    <a href="#projects" class="btn btn-glass hero-cta__explore">
                        Explore Projects
                    </a>
                    <a href="${cvPath}" download class="btn btn-outline hero-cta__cv">
                        Download CV
                    </a>
                </div>
            </div>

        </div><!-- /.hero-wrapper -->
    `;
}

/* ─────────────────────────────────────────────
   ORCHESTRATED FADE-IN
───────────────────────────────────────────── */

function initHeroAnimations(name) {
    if (prefersReducedMotion()) {
        // Langsung tampilkan semua tanpa animasi
        document.querySelectorAll('#home .fade-in-hidden').forEach(el => {
            el.classList.add('fade-in-visible');
        });
        return;
    }

    // Stagger berdasarkan data-delay
    document.querySelectorAll('#home .fade-in-hidden').forEach(el => {
        const delay = parseInt(el.dataset.delay || '0', 10);
        setTimeout(() => {
            el.classList.add('fade-in-visible');

            // Shuffle pada nama saat elemen heading muncul
            if (el.classList.contains('hero-heading-wrap')) {
                const nameEl = document.getElementById('hero-name');
                if (nameEl) {
                    setTimeout(() => textShuffle(nameEl, name, { duration: 1000, fps: 30 }), 100);
                }
            }
        }, delay);
    });
}

/* ─────────────────────────────────────────────
   SCROLL VELOCITY — Dua track, arah berlawanan
───────────────────────────────────────────── */

function initScrollVelocitySection() {
    if (prefersReducedMotion()) return;

    const track1 = document.getElementById('scroll-vel-track-1');
    const track2 = document.getElementById('scroll-vel-track-2');

    if (track1) {
        initScrollVelocity(track1, {
            baseSpeed: 0.55,
            velocityMult: 0.07,
            damping: 0.94,
            direction: -1,  // RTL → dari kanan ke kiri
        });
    }

    if (track2) {
        initScrollVelocity(track2, {
            baseSpeed: 0.55,
            velocityMult: 0.07,
            damping: 0.94,
            direction: 1,   // LTR → dari kiri ke kanan
        });
    }
}

/* ─────────────────────────────────────────────
   MAGNET EFFECT
───────────────────────────────────────────── */

function initMagnetEffect() {
    const magnet = document.getElementById('hero-magnet');
    if (!magnet) return;
    initMagnet(magnet, { padding: 100, strength: 5 });
}