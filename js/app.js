/**
 * app.js — Entry point utama portfolio
 */

import { fetchAllData } from './utils/fetch.js';
import { initFadeIn }   from './utils/animation.js';
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

let appData = null;

function initModules(data) {
  // Core layout
  initNavbar(data.config);
  initFooter(data.profile);

  // Sections
  initHero(data.profile, data.config);
  initAbout(data.profile);
  initTechStack(data.config.techstack);
  initExperience(data.experience);
  initProjects(data.projects, data.profile?.social?.github || data.config.contact?.github);
  initGitHub(data.config.github, data.profile);
  initCertificates(data.certificates);
  initContact(data.profile, data.config.contact);

  // Global fade-in observer (untuk section selanjutnya)
  if (!prefersReducedMotion()) {
    setTimeout(() => initFadeIn('.fade-in-hidden'), 100);
  }
}

async function bootstrap() {
  try {
    appData = await fetchAllData();
    initModules(appData);
    document.body.classList.add('loaded');
    document.body.classList.remove('loading');
  } catch (err) {
    console.error('[App] Bootstrap failed:', err);
    // Tetap hapus loading agar halaman tidak blank total
    document.body.classList.remove('loading');
    document.body.classList.add('error');
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}

/* ── Experience in-view observer (progress bar & counter visibility) ── */
(function initExpInView() {
  const section = document.getElementById('experience');
  if (!section) return;
  const obs = new IntersectionObserver(
    ([entry]) => {
      section.classList.toggle('in-view', entry.isIntersecting);
    },
    { threshold: 0.05 }
  );
  obs.observe(section);
})();