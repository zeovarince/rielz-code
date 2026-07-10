# Choiril — Developer Portfolio

Portfolio modern untuk **A. Choiril Anwar El-Asfihani Risydan**, dibangun dengan HTML5 + Tailwind CSS (CDN) + Vanilla JavaScript ES6+.

---

## 🚀 Cara Menjalankan

### Tanpa instalasi apapun (direkomendasikan)

Cukup buka `index.html` langsung di browser. Tidak perlu server, tidak perlu npm install.

> **Catatan:** Beberapa fitur seperti `fetch()` ke file JSON lokal memerlukan server lokal (karena kebijakan CORS browser). Lihat opsi di bawah.

### Dengan server lokal (untuk fetch JSON)

**Opsi 1 — npx serve (jika Node.js tersedia):**
```bash
npx serve . -p 3000
# Buka: http://localhost:3000
```

**Opsi 2 — Python (jika Python tersedia):**
```bash
python -m http.server 3000
# Buka: http://localhost:3000
```

**Opsi 3 — VS Code Live Server:**
Install extension "Live Server" di VS Code, lalu klik "Go Live".

**Opsi 4 — PHP (jika PHP tersedia):**
```bash
php -S localhost:3000
```

---

## 📦 Tech Stack

| Layer      | Teknologi                          |
|------------|------------------------------------|
| Markup     | HTML5                              |
| Styling    | Tailwind CSS (Play CDN) + CSS Custom |
| Script     | Vanilla JavaScript ES6+ (modules) |
| Icons      | Devicon CDN                        |
| Fonts      | Google Fonts (Kanit + Inter)       |

---

## 🗂 Struktur Folder

```
portfolio/
│
├── index.html                  ← Entry point utama
├── README.md
├── package.json                ← Hanya untuk npx serve (opsional)
├── tailwind.config.js          ← Referensi saja (konfigurasi ada di HTML)
│
├── assets/
│   ├── images/
│   │   ├── profile/            ← Foto profil (avatar.png)
│   │   ├── projects/           ← Screenshot proyek
│   │   ├── certificates/       ← Foto sertifikat
│   │   └── organizations/      ← Logo organisasi
│   ├── icons/                  ← Favicon
│   ├── svg/                    ← SVG assets
│   ├── fonts/                  ← Font lokal (opsional)
│   └── animation/              ← Lottie / animasi assets
│
├── data/
│   ├── profile.json            ← Data profil
│   ├── experience.json         ← Data pengalaman organisasi
│   ├── projects.json           ← Data proyek
│   ├── certificates.json       ← Data sertifikat
│   └── config.json             ← Konfigurasi site, nav, techstack, GitHub
│
├── js/
│   ├── app.js                  ← Entry point JS
│   ├── components/
│   │   ├── navbar.js           ← Floating Dock
│   │   ├── footer.js
│   │   ├── card.js
│   │   ├── modal.js
│   │   └── timeline.js
│   ├── sections/
│   │   ├── hero.js
│   │   ├── about.js
│   │   ├── techstack.js
│   │   ├── experience.js
│   │   ├── projects.js
│   │   ├── github.js
│   │   ├── certificates.js
│   │   └── contact.js
│   └── utils/
│       ├── animation.js        ← FadeIn, Magnet, ScrollVelocity, Shuffle
│       ├── fetch.js            ← Fetch semua JSON data
│       ├── helper.js           ← Utility functions
│       └── formatter.js        ← Format tanggal, teks, dll
│
├── pages/
│   └── project/
│       └── template.html       ← Halaman detail proyek
│
├── styles/
│   ├── main.css                ← Entry CSS (import semua di bawah)
│   ├── globals.css             ← Design tokens, reset, typography
│   ├── components.css          ← Button, card, badge, section
│   ├── animation.css           ← Keyframes, fade-in states, splash cursor
│   └── utilities.css           ← Helper classes (glass, glow, truncate, dll)
│
├── public/
│   ├── cv.pdf
│   └── resume.pdf
│
└── .github/
    └── workflows/
        └── snake.yml           ← GitHub Actions untuk snake animation
```

---

## ⚙️ Tailwind CSS — Setup CDN

Setup ini menggunakan **Tailwind Play CDN** — tidak perlu instalasi atau build step.

```html
<!-- Di index.html -->
<script src="https://cdn.tailwindcss.com"></script>
<script>
  tailwind.config = {
    theme: {
      extend: { /* konfigurasi kustom */ }
    }
  };
</script>
```

Konfigurasi theme (warna, font, animasi, shadow) ada langsung di `index.html` dan `pages/project/template.html`.

> **Catatan untuk production:** Tailwind Play CDN cocok untuk development dan portfolio. Untuk production dengan performa maksimal, pertimbangkan menggunakan Tailwind CLI untuk generate CSS yang sudah di-purge.

---

## 🗄️ Data JSON

Semua data bersifat deklaratif — edit JSON, tampilan otomatis update.

| File                   | Isi                                      |
|------------------------|------------------------------------------|
| `data/profile.json`    | Nama, bio, lokasi, social links, avatar  |
| `data/experience.json` | Pengalaman organisasi (jabatan, periode) |
| `data/projects.json`   | Daftar proyek (nama, desc, link, image)  |
| `data/certificates.json`| Daftar sertifikat                       |
| `data/config.json`     | Nav, techstack, GitHub username, kontak  |

---

## 🔧 GitHub Actions — Snake Animation

File `.github/workflows/snake.yml` otomatis generate GitHub contribution snake animation. Pastikan GitHub username di `data/config.json` sudah benar.

---

## 📋 Development Phases

| Phase | Status | Deskripsi               |
|-------|--------|-------------------------|
| 0     | ✅      | Analisis template React |
| 1     | ✅      | Setup project & migrasi CDN |
| 2     | ⏳      | Hero section            |
| 3     | ⏳      | Floating Dock           |
| 4     | ⏳      | About                   |
| 5     | ⏳      | Tech Stack              |
| 6     | ⏳      | Experience              |
| 7     | ⏳      | Projects                |
| 8     | ⏳      | GitHub                  |
| 9     | ⏳      | Certificates            |
| 10    | ⏳      | Contact                 |
| 11    | ⏳      | Responsive              |
| 12    | ⏳      | Optimization            |

---

*Dibangun dengan ❤️ oleh A. Choiril Anwar El-Asfihani Risydan*
