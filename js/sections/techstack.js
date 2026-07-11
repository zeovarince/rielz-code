/**
 * techstack.js — Tech Stack Section
 *
 * Layout:
 * - Heading section + label
 * - Row 1 : marquee kiri ke kanan (LTR)
 * - Row 2 : marquee kanan ke kiri (RTL)
 *
 * Data dari config.techstack (devicon class + warna)
 * Kecepatan marquee dipengaruhi scroll velocity (sama seperti hero)
 */

import { initScrollVelocity } from '../utils/animation.js';
import { prefersReducedMotion } from '../utils/helper.js';

/* ─────────────────────────────────────────────
   SPLIT ITEMS — baris atas dan bawah
───────────────────────────────────────────── */
function splitItems(items) {
  const mid  = Math.ceil(items.length / 2);
  const top  = items.slice(0, mid);
  const bot  = items.slice(mid);
  return { top, bot };
}

/* ─────────────────────────────────────────────
   BUILD SINGLE TECH ITEM
───────────────────────────────────────────── */
function buildItem(tech) {
  return `
    <div class="ts-item">
      <span class="ts-item__icon">
        <i class="${tech.icon} colored" style="color:${tech.color}" aria-hidden="true"></i>
      </span>
      <span class="ts-item__name">${tech.name}</span>
    </div>
  `;
}

/* ─────────────────────────────────────────────
   BUILD MARQUEE TRACK
   Duplikat 4x agar loop seamless di semua layar
───────────────────────────────────────────── */
function buildTrack(id, items) {
  const html = items.map(buildItem).join('');
  // 4 salinan untuk seamless infinite loop
  const repeated = html + html + html + html;
  return `
    <div class="ts-marquee-wrapper">
      <div id="${id}" class="ts-marquee-track">
        ${repeated}
      </div>
    </div>
  `;
}

/* ─────────────────────────────────────────────
   HTML BUILDER
───────────────────────────────────────────── */
function buildTechStackHTML(techstack) {
  const { top, bot } = splitItems(techstack);

  return `
    <div class="ts-inner">

      <!-- Label + Heading -->
      <div class="ts-header section-inner fade-in-hidden">
        <p class="label">Technologies</p>
        <h2 class="ts-heading">
          Tech <span class="text-gradient">Stack</span>
        </h2>
        <p class="ts-subheading">
          Tools & technologies I work with day to day
        </p>
      </div>

      <!-- Marquee rows -->
      <div class="ts-rows fade-in-hidden" data-delay="150">

        <!-- Row 1: LTR (kiri ke kanan) -->
        ${buildTrack('ts-track-1', top)}

        <!-- Row 2: RTL (kanan ke kiri) -->
        ${buildTrack('ts-track-2', bot)}

      </div>

    </div>
  `;
}

/* ─────────────────────────────────────────────
   INIT MARQUEE — scroll velocity pada dua track
───────────────────────────────────────────── */
function initMarquees() {
  if (prefersReducedMotion()) return;

  const track1 = document.getElementById('ts-track-1');
  const track2 = document.getElementById('ts-track-2');

  if (track1) {
    initScrollVelocity(track1, {
      baseSpeed   : 0.6,
      velocityMult: 0.06,
      damping     : 0.93,
      direction   : 1,    // LTR
    });
  }

  if (track2) {
    initScrollVelocity(track2, {
      baseSpeed   : 0.6,
      velocityMult: 0.06,
      damping     : 0.93,
      direction   : -1,   // RTL
    });
  }
}

/* ─────────────────────────────────────────────
   INIT
───────────────────────────────────────────── */
export function initTechStack(techstack) {
  const section = document.getElementById('techstack');
  if (!section || !techstack?.length) return;

  section.innerHTML = buildTechStackHTML(techstack);
  initMarquees();
}