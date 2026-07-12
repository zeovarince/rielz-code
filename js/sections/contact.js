/**
 * contact.js — Contact Section
 *
 * Layout: kiri = heading + 3 card kontak, kanan = form (EmailJS)
 */

const ICONS = {
  mail: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="M2 7l10 7 10-7"/>
  </svg>`,

  instagram: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <circle cx="12" cy="12" r="4"/>
    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
  </svg>`,

  github: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61
      c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77
      A5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48
      a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1
      A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78
      c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
  </svg>`,

  arrowright: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>`,

  send: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/>
    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>`,

  check: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>`,
};

/* ─── Build contact channel card ─── */
function buildChannelCard(icon, label, value, href, delay) {
  return `
    <a class="contact-card fade-in-hidden" data-delay="${delay}"
      style="transition-delay:${delay}ms"
      href="${href}" target="_blank" rel="noreferrer"
      aria-label="${label}: ${value}">
      <div class="contact-card__icon">${icon}</div>
      <div class="contact-card__body">
        <span class="contact-card__label">${label}</span>
        <span class="contact-card__value">${value}</span>
      </div>
      <span class="contact-card__arrow">${ICONS.arrowright}</span>
    </a>
  `;
}

/* ─── Build section HTML ─── */
function buildContactHTML(profile, contact) {
  const email     = profile.email || contact?.email || '';
  const instagram = profile.social?.instagram || '';
  const github    = profile.social?.github || '';
  const igHandle  = instagram.replace('https://instagram.com/', '@').replace('https://www.instagram.com/', '@');
  const ghHandle  = github.replace('https://github.com/', '@');
  const availText = profile.availability_text || 'Open for collaboration';

  const channels = [
    {
      icon  : ICONS.mail,
      label : 'Email',
      value : email,
      href  : `mailto:${email}`,
      delay : 100,
    },
    {
      icon  : ICONS.instagram,
      label : 'Instagram',
      value : igHandle,
      href  : instagram.startsWith('http') ? instagram : `https://instagram.com/${instagram}`,
      delay : 200,
    },
    {
      icon  : ICONS.github,
      label : 'GitHub',
      value : ghHandle,
      href  : github.startsWith('http') ? github : `https://github.com/${github}`,
      delay : 300,
    },
  ].filter(c => c.value);

  const cardsHTML = channels
    .map(c => buildChannelCard(c.icon, c.label, c.value, c.href, c.delay))
    .join('');

  return `
    <div class="contact-inner">

      <!-- Glow blobs -->
      <div class="contact-blob contact-blob--purple" aria-hidden="true"></div>
      <div class="contact-blob contact-blob--pink"   aria-hidden="true"></div>

      <div class="contact-layout">

        <!-- ── KIRI: Heading + Cards ── -->
        <div class="contact-left">
          <div class="contact-heading-wrap fade-in-hidden">
            <p class="label">Contact</p>
            <h2 class="contact-heading">
              Let's <span class="text-gradient">Work</span><br>Together.
            </h2>
            <p class="contact-sub">${availText}</p>
          </div>

          <div class="contact-cards">
            ${cardsHTML}
          </div>
        </div>

        <!-- ── KANAN: Form ── -->
        <div class="contact-right fade-in-hidden" data-delay="200">
          <form id="contact-form" class="contact-form" novalidate>

            <div class="cf-group">
              <label class="cf-label" for="cf-name">Nama</label>
              <input
                id="cf-name"
                name="from_name"
                type="text"
                class="cf-input"
                placeholder="Nama kamu"
                required
              />
            </div>

            <div class="cf-group">
              <label class="cf-label" for="cf-email">Email</label>
              <input
                id="cf-email"
                name="from_email"
                type="email"
                class="cf-input"
                placeholder="email@kamu.com"
                required
              />
            </div>

            <div class="cf-group">
              <label class="cf-label" for="cf-message">Pesan</label>
              <textarea
                id="cf-message"
                name="message"
                class="cf-input cf-textarea"
                placeholder="Hei, aku mau ngobrol soal..."
                rows="5"
                required
              ></textarea>
            </div>

            <!-- Status message -->
            <div id="cf-status" class="cf-status" aria-live="polite"></div>

            <button type="submit" class="cf-submit" id="cf-btn">
              <span class="cf-btn-text">Kirim Pesan</span>
              <span class="cf-btn-icon">${ICONS.send}</span>
            </button>

          </form>
        </div>

      </div>
    </div>
  `;
}

/* ─── EmailJS handler ─── */
function initContactForm() {
  const form   = document.getElementById('contact-form');
  const btn    = document.getElementById('cf-btn');
  const status = document.getElementById('cf-status');

  if (!form) return;

  // ── Ganti 3 nilai ini dengan milik kamu dari emailjs.com ──
  const EMAILJS_PUBLIC_KEY  = 'R-QMAjmFaYrKMCKPZ';
  const EMAILJS_SERVICE_ID  = 'service_u8fcxwb';
  const EMAILJS_TEMPLATE_ID = 'template_u67ie7f';

  // Load EmailJS SDK
  if (!window.emailjs) {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
    script.onload = () => {
      window.emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
    };
    document.head.appendChild(script);
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Validasi sederhana
    const name    = form.from_name.value.trim();
    const email   = form.from_email.value.trim();
    const message = form.message.value.trim();

    if (!name || !email || !message) {
      showStatus('error', 'Semua field wajib diisi.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showStatus('error', 'Format email tidak valid.');
      return;
    }

    // Loading state
    setLoading(true);
    showStatus('', '');

    try {
      await window.emailjs.sendForm(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        form
      );

      showStatus('success', 'Pesan terkirim ke email! Akan segera aku balas');
      form.reset();
    } catch (err) {
      console.error('[EmailJS]', err);
      showStatus('error', 'Gagal mengirim pesan. Coba lagi atau hubungi via email langsung.');
    } finally {
      setLoading(false);
    }
  });

  function setLoading(loading) {
    btn.disabled = loading;
    btn.classList.toggle('cf-submit--loading', loading);
    btn.querySelector('.cf-btn-text').textContent = loading ? 'Mengirim...' : 'Kirim Pesan';
  }

  function showStatus(type, message) {
    status.className = 'cf-status';
    status.textContent = message;
    if (type) {
      status.classList.add(`cf-status--${type}`);
    }
  }
}

/* ─── INIT ─── */
export function initContact(profile, contact) {
  const section = document.getElementById('contact');
  if (!section) return;

  section.innerHTML = buildContactHTML(profile, contact);
  initContactForm();
}