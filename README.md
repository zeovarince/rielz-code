# Riel — Developer Portfolio

Portfolio personal modern milik **A. Choiril Anwar El-Asfihani Risydan**, dibangun dengan HTML5 + Tailwind CSS CDN + Vanilla JavaScript ES6 Modules. Tidak ada bundler, tidak ada framework.

Live: [riel-dev.netlify.app](https://riel-dev.netlify.app)

---

## Cara Menjalankan

File JSON di-fetch via `fetch()`, membutuhkan server lokal agar tidak kena CORS error.

```bash
# Node.js
npx serve . -p 3000

# Python
python -m http.server 3000

```

Atau pakai extension **Live Server** di VS Code.

---

## Tech Stack

| Layer      | Teknologi                                           |
|------------|-----------------------------------------------------|
| Markup     | HTML5 Semantik                                      |
| Styling    | Tailwind CSS Play CDN + Custom CSS per section      |
| Script     | Vanilla JavaScript ES6+ (ES Modules, tanpa bundler) |
| Animasi    | GSAP 3 CDN, RAF, IntersectionObserver, WebGL        |
| Icons      | Lucide SVG inline + Devicon CDN                     |
| Fonts      | Google Fonts — Kanit + Inter                        |
| Deployment | Netlify                                             |

---

## Fitur

### Hero
- Text shuffle animasi nama saat halaman load
- Avatar center dengan efek **Magnet** (mengikuti kursor)
- **Dual Scroll Velocity marquee** — 2 baris teks berlawanan arah, kecepatan mengikuti scroll
- **Splash Cursor** — fluid WebGL simulation berbasis canvas
- CTA: Explore Projects + Download CV

### About
- **Tilt Card 3D** — foto profil dengan efek perspektif CSS + holographic shimmer overlay
- Info bar bawah card: avatar mini, username Instagram, nama lengkap, tombol Contact
- Bio, title tags, meta info (lokasi, universitas, jurusan), social links

### Tech Stack
- **Dual marquee** — 2 baris logo tech bergerak berlawanan arah
- Kecepatan responsif terhadap scroll

### Experience
- **Pinned horizontal scroll** — section ter-pin, cards bergerak ke kiri satu per satu
- **Electric Border** — animated canvas noise border pada setiap card
- Indicator bawah: nomor card aktif + nama jabatan
- Layout vertikal di mobile

### Projects
- Card featured besar (horizontal) + grid card sisanya
- Link GitHub repo + live demo per proyek
- Klik card → halaman detail proyek

### GitHub
- Stats card dan language chart dari GitHub API
- Contribution Graph dari ghchart.rshah.org
- **Snake Animation** — SVG contribution snake dark theme
- **Pac-Man Game** — SVG contribution pac-man
- 6 repo terbaru dari GitHub API

### Certificates
- Halaman tersendiri `certificates.html` di root project
- List sertifikat di kiri + **PDF Viewer** di kanan (via PDF.js)
- Filter berdasarkan kategori
- Navigasi halaman PDF + tombol buka PDF baru

### Contact
- 3 channel card: Email, Instagram, GitHub

---

## Struktur Folder

```
rielz-code/
│
├── index.html                  ← Main portfolio
├── certificates.html           ← Halaman sertifikat + PDF viewer
├── README.md
│
├── assets/
│   ├── images/
│   │   ├── profile/            ← avatar.png, profil.png, profil2.jpeg
│   │   ├── projects/           ← thumbnail proyek
│   │   └── certificates/       ← file PDF sertifikat
│   └── icons/                  
│
├── data/
│   ├── profile.json
│   ├── experience.json
│   ├── projects.json
│   ├── certificates.json
│   └── config.json
│
├── js/
│   ├── app.js
│   ├── components/
│   │   ├── navbar.js           ← Floating Dock
│   │   └── footer.js
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
│       ├── animation.js
│       ├── splashcursor.js
│       ├── electric-border.js
│       ├── fetch.js
│       ├── helper.js
│       └── formatter.js
│
├── styles/
│   ├── main.css
│   ├── globals.css
│   ├── components.css
│   ├── animation.css
│   ├── utilities.css
│   ├── dock.css
│   ├── about.css
│   ├── techstack.css
│   ├── experience.css
│   ├── project.css
│   ├── github.css
│   ├── certificates.css
│   └── contact.css
│
├── public/
│   └── CV_ATS_A.CHOIRIL ANWAR EL-A.R.pdf
│
└── .github/
    └── workflows/
        └── generate.yml        ← Snake + Pac-Man → branch output
```

---

## Data JSON

| File                     | Isi                                          |
|--------------------------|----------------------------------------------|
| `data/profile.json`      | Nama, bio, lokasi, social links, avatar path |
| `data/experience.json`   | Jabatan, organisasi, periode, deskripsi      |
| `data/projects.json`     | Judul, deskripsi, tech stack, link, gambar   |
| `data/certificates.json` | Judul, issuer, tanggal, path PDF             |
| `data/config.json`       | Nav items, techstack icons, GitHub URLs      |

---

## GitHub Actions

Workflow `generate.yml` generate dua animasi sekaligus ke branch `output`:

- **Snake** — `Platane/snk/svg-only@v3`
- **Pac-Man** — `abozanona/pacman-contribution-graph@main`

```json
"snake_dark": "https://raw.githubusercontent.com/zeovarince/rielz-code/output/github-contribution-grid-snake-dark.svg",
"pacman": "https://raw.githubusercontent.com/zeovarince/rielz-code/output/pacman-contribution-graph.svg"
```

---

## Floating Dock

- **Desktop** — fixed kanan tengah, vertikal
- **Mobile** — fixed bawah tengah, horizontal
- Active state via IntersectionObserver
- Klik Certificates → buka `certificates.html`

---

*A. Choiril Anwar El-Asfihani Risydan — Teknik Informatika, Universitas Trunojoyo Madura*
