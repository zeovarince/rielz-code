/**
 * app.js — Entry point utama portfolio
 * 
 * Mengatur inisialisasi semua section dan komponen.
 * Import section secara berurutan sesuai phase pengembangan.
 */

import { fetchAllData } from './utils/fetch.js';
import { initFadeIn } from './utils/animation.js';
import { prefersReducedMotion } from './utils/helper.js';

// Components
import { initNavbar } from './components/navbar.js';
import { initFooter } from './components/footer.js';

// Sections
import { initHero }         from './sections/hero.js';
import { initAbout }        from './sections/about.js';
import { initTechStack }    from './sections/techstack.js';
import { initExperience }   from './sections/experience.js';
import { initProjects }     from './sections/projects.js';
import { initGitHub }       from './sections/github.js';
import { initCertificates } from './sections/certificates.js';
import { initContact }      from './sections/contact.js';

/**
 * State global — data JSON yang di-fetch sekali, dipakai semua section.
 */
let appData = null;

/**
 * Inisialisasi semua modul dengan data yang sudah di-fetch.
 * @param {Object} data
 */
function initModules(data) {
  // Core layout
  initNavbar(data.config);
  initFooter(data.profile);

  // Sections — urutan sesuai tampilan halaman
  initHero(data.profile, data.config);
  initAbout(data.profile);
  initTechStack(data.config.techstack);
  initExperience(data.experience);
  initProjects(data.projects);
  initGitHub(data.config.github, data.profile);
  initCertificates(data.certificates);
  initContact(data.profile, data.config.contact);

  // Global animations (after all HTML di-render)
  if (!prefersReducedMotion()) {
    initFadeIn('.fade-in-hidden');
  }
}

/**
 * Bootstrap aplikasi.
 */
async function bootstrap() {
  try {
    // Fetch semua data JSON paralel
    appData = await fetchAllData();

    // Render semua section
    initModules(appData);

    // Hapus loading state jika ada
    document.body.classList.add('loaded');
    document.body.classList.remove('loading');

  } catch (err) {
    console.error('[App] Bootstrap failed:', err);
    document.body.classList.add('error');
  }
}

// Jalankan saat DOM siap
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
