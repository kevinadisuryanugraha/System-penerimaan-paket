# 📦 Sistem Penerimaan Paket Satpam

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?logo=pwa&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Cloudflare](https://img.shields.io/badge/Deployed-Cloudflare%20Pages-F38020?logo=cloudflare&logoColor=white)

**Aplikasi PWA modern untuk pencatatan dan pemindaian barcode paket masuk oleh petugas keamanan (satpam).**

[Demo Live](https://sistem-penerimaan-paket-satpam.pages.dev) · [GitHub](https://github.com/kevinadisuryanugraha/System-penerimaan-paket)

</div>

---

## 📋 Daftar Isi

- [Fitur](#-fitur)
- [Tech Stack](#-tech-stack)
- [Screenshots](#-screenshots)
- [Instalasi Lokal](#-instalasi-lokal)
- [Konfigurasi](#-konfigurasi)
- [Deployment](#-deployment)
- [Struktur Proyek](#-struktur-proyek)
- [Alur Kerja Aplikasi](#-alur-kerja-aplikasi)
- [Data Model](#-data-model)
- [Keamanan](#-keamanan)
- [Lisensi](#-lisensi)

---

## ✨ Fitur

### 🔐 Autentikasi
- Login petugas satpam dengan kredensial yang dapat dikonfigurasi
- **Ubah username & password** langsung dari UI tanpa perlu edit kode
- Kredensial disimpan aman di **IndexedDB**

### 📸 Scan Barcode / QR Code
- **Pemindai kamera real-time** menggunakan `html5-qrcode`
- Mendukung berbagai format: **QR Code, Code 128, Code 39, EAN-13, EAN-8, UPC-A, UPC-E**
- **Auto-detect ekspedisi** dari prefix nomor resi (SPX, JNT, JNE, TKP, SCP)
- **Simulasi scan cepat** untuk testing tanpa paket fisik
- Toggle senter/flashlight & ganti kamera (depan/belakang)
- **Input manual** sebagai fallback

### 📋 Manajemen Paket
- **CRUD lengkap** — Tambah, lihat, update, hapus data paket
- **Deteksi duplikat otomatis** saat scan/input nomor resi
- **Tandai sudah diambil** dengan timestamp otomatis
- **Foto kondisi fisik paket** — ambil dari kamera, kompresi otomatis (JPEG, max 800px)
- **Catatan tambahan** per paket (kondisi fragile, basah, dll)
- Semua data disimpan di **IndexedDB** (kapasitas ~250MB, offline-ready)

### 📊 Dashboard
- **4 kartu statistik**: Total Paket, Belum Diambil, Sudah Diambil, Masuk Hari Ini
- **Tabel paket terbaru** dengan quick search
- **Panduan cepat** 4 langkah untuk petugas baru
- Status **online/offline** real-time

### 📑 Daftar & Riwayat
- **Filter multi-kriteria**: pencarian teks, status, tanggal
- **Export CSV** — rekap paket & laporan riwayat
- Tampilan **responsive**: tabel di desktop, kartu di mobile

### 📱 PWA & Mobile
- **Installable** — bisa dipasang di home screen HP (Android & iOS)
- **Service Worker** — network-first strategy dengan cache fallback
- **Offline-ready** — tetap bisa lihat data tersimpan tanpa internet
- **Panduan install iOS** — step-by-step untuk iPhone/iPad

### 🎯 Detail Paket
- **Modal detail lengkap** dengan status banner, foto, dan info petugas
- **Share via WhatsApp** — template notifikasi otomatis ke penerima
- **Cetak slip** — bukti penerimaan paket siap print
- **Tandai diambil / Hapus** langsung dari modal detail

### 🎨 UX/UI
- **Confetti celebration** saat paket berhasil dicatat
- **Audio feedback** — beep sukses & peringatan via Web Audio API
- **Toast notifications** — success, error, warning, info
- **Skeleton loading** — animasi placeholder saat data dimuat
- **Responsive design** — sidebar di desktop, bottom nav di mobile
- **Animasi halus** — fade-in, slide, pulse, scale transitions

---

## 🛠 Tech Stack

| Layer | Teknologi |
|-------|-----------|
| **Framework** | React 19 + TypeScript 5.8 |
| **Build Tool** | Vite 6 |
| **Styling** | Tailwind CSS 4 |
| **Routing** | React Router DOM 7 (HashRouter) |
| **Database** | IndexedDB via `idb` |
| **Scanner** | `html5-qrcode` |
| **Icons** | Lucide React |
| **Animations** | Motion (Framer Motion) |
| **Confetti** | `canvas-confetti` |
| **PWA** | Service Worker + Web Manifest |
| **Deployment** | Cloudflare Pages |
| **Package Manager** | npm / Bun |

---

## 📸 Screenshots

### Login Screen
> Halaman login dengan opsi ubah kredensial. Kredensial default ditampilkan untuk demo.

### Dashboard
> 4 kartu statistik + tabel paket terbaru dengan quick search + panduan cepat di sidebar.

### Scan Barcode
> Pemindai kamera real-time dengan simulasi scan cepat. Mode input manual sebagai alternatif.

### Daftar Paket
> Tabel dengan filter status, pencarian, dan date picker. Export CSV satu klik.

### Detail Paket
> Modal dengan foto fisik, info lengkap, tombol WhatsApp share & cetak slip.

---

## 🚀 Instalasi Lokal

### Prasyarat
- **Node.js** ≥ 18.x
- **npm** ≥ 9.x (atau Bun)

### Langkah-langkah

```bash
# 1. Clone repository
git clone https://github.com/kevinadisuryanugraha/System-penerimaan-paket.git
cd System-penerimaan-paket

# 2. Install dependencies
npm install

# 3. Jalankan development server
npm run dev
```

Akses di browser: **http://localhost:3000**

### Login
| Field | Default |
|-------|---------|
| Username | `satpam` |
| Password | `123456` |

> 💡 Klik tombol **"Ubah Username & Password"** di halaman login untuk mengganti kredensial.

---

## ⚙️ Konfigurasi

### Environment Variables

Buat file `.env` (copy dari `.env.example`):

```env
# Kredensial default untuk login satpam
VITE_DEFAULT_USERNAME="satpam"
VITE_DEFAULT_PASSWORD="123456"
```

| Variable | Required | Default | Deskripsi |
|----------|----------|---------|-----------|
| `VITE_DEFAULT_USERNAME` | Tidak | `satpam` | Default username saat pertama kali |
| `VITE_DEFAULT_PASSWORD` | Tidak | `123456` | Default password saat pertama kali |

> ⚠️ Variabel environment hanya digunakan sebagai default awal. User dapat mengubah kredensial kapan saja melalui UI, dan perubahan disimpan di IndexedDB.

### Build

```bash
# Production build
npm run build

# Preview production build
npm run preview

# Type checking
npm run lint
```

Output build ada di folder `dist/`.

---

## ☁️ Deployment

### Cloudflare Pages (Direkomendasikan)

**Deploy via Wrangler CLI:**

```bash
# Set token
export CLOUDFLARE_API_TOKEN="your-api-token"

# Deploy
npx wrangler pages deploy dist --project-name=sistem-penerimaan-paket-satpam
```

**Deploy via Git (Auto-deploy):**

1. Hubungkan repository GitHub di Cloudflare Pages Dashboard
2. Konfigurasi build:

| Field | Value |
|-------|-------|
| Framework preset | `None` |
| Build command | `npm run build` |
| Build output directory | `dist` |

3. (Opsional) Tambahkan Environment Variables:
   - `VITE_DEFAULT_USERNAME`
   - `VITE_DEFAULT_PASSWORD`

4. Klik **Save and Deploy**

### Deploy ke Platform Lain

Aplikasi ini adalah **Static SPA** dengan **Hash-based routing**. Bisa dideploy ke platform static hosting manapun:

- **Vercel**: Framework preset `Vite`, output `dist`
- **Netlify**: Build `npm run build`, publish `dist`
- **GitHub Pages**: Build `npm run build`, deploy folder `dist`
- **Static Server**: Copy isi folder `dist/` ke web server

---

## 📁 Struktur Proyek

```
├── .env.example                 # Template environment variables
├── .gitignore
├── index.html                   # Entry HTML + PWA meta tags
├── metadata.json                # AI Studio metadata
├── package.json                 # Dependencies & scripts
├── tsconfig.json                # TypeScript strict config
├── vite.config.ts               # Vite + Tailwind + path aliases
├── wrangler.toml                # Cloudflare Pages config
├── public/
│   ├── _headers                 # Cloudflare cache headers
│   ├── manifest.json            # PWA manifest (shield icon)
│   └── sw.js                    # Service Worker (network-first)
└── src/
    ├── main.tsx                 # Entry point + PWA SW registration
    ├── App.tsx                  # Root: auth gate, routing, modals
    ├── types.ts                 # TypeScript interfaces & types
    ├── index.css                # Tailwind import
    ├── vite-env.d.ts            # Vite type declarations
    ├── components/
    │   ├── Navigation.tsx       # Sidebar (desktop) + Bottom bar (mobile)
    │   ├── Toast.tsx            # Toast notification system
    │   ├── ConfirmModal.tsx     # Generic confirmation dialog
    │   ├── PackageDetailModal.tsx # Full detail + WA share + Print
    │   ├── DuplicatePackageModal.tsx # Duplicate warning
    │   ├── ScannerCamera.tsx    # Barcode/QR scanner wrapper
    │   ├── MobilePwaWidget.tsx  # Offline status + PWA install
    │   └── LoadingSkeleton.tsx  # Skeleton loading components
    ├── services/
    │   ├── authService.ts       # Auth logic + credential management
    │   ├── indexedDB.ts         # IndexedDB core (CRUD, photos, settings)
    │   └── packageStorage.ts    # Business logic layer for packages
    ├── utils/
    │   └── audio.ts            # Web Audio API beep sounds
    └── views/
        ├── LoginView.tsx        # Login + change password
        ├── DashboardView.tsx    # Dashboard stats + recent packages
        ├── ScanView.tsx         # Scan camera + manual input form
        ├── PackageListView.tsx  # Full package list + filters + CSV
        └── HistoryView.tsx      # Archive of completed packages
```

---

## 🔄 Alur Kerja Aplikasi

```
┌─────────────────────────────────────────────────────────────────────┐
│                           LOGIN FLOW                                │
│  Login Page ──► Auth Check ──► Dashboard (dengan seed data demo)   │
│     │                                                                 │
│     └── Ubah Kredensial ──► Simpan ke IndexedDB ──► Auto-fill form │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                         SCAN FLOW                                   │
│  Scan Kamera ──► Barcode Terbaca ──► Auto-detect Kurir             │
│       │                │                    │                        │
│       ▼                ▼                    ▼                        │
│  Input Manual    Duplicate? ──► Yes ──► Modal Warning              │
│                        │                    │                        │
│                        No                   └── Lihat Detail         │
│                        │                                             │
│                        ▼                                             │
│                  Form Data Paket                                    │
│                  (Nama, Kurir, Catatan, Foto)                       │
│                        │                                             │
│                        ▼                                             │
│                  Simpan ──► Confetti ──► Toast ──► Form Reset       │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                      PACKAGE LIFECYCLE                              │
│  "Menunggu" ──► Konfirmasi ──► "Sudah Diambil" ──► Riwayat        │
│                      │                                               │
│                      └── Timestamp otomatis + petugas penyerah      │
│                                                                      │
│  Hapus ──► Konfirmasi ──► Hapus dari IndexedDB + foto terkait     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                      EXPORT FLOW                                    │
│  Daftar Paket ──► Filter ──► Export CSV (rekap_paket_satpam.csv)  │
│  Riwayat ──► Filter ──► Export CSV (riwayat_paket_selesai.csv)    │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📊 Data Model

### Package

```typescript
interface Package {
  id: string;                    // Unique ID (auto-generated)
  nomor_paket: string;           // Nomor resi / barcode
  nama_penerima: string;         // Nama pemilik paket
  kurir: string;                 // Ekspedisi (9 opsi + custom)
  catatan?: string;              // Kondisi paket (fragile, dll)
  foto_paket_id?: string;        // IndexedDB key untuk foto
  foto_paket_dataurl?: string;   // Cache data URL untuk display
  status: 'Menunggu' | 'Sudah Diambil';
  tanggal_masuk: string;         // YYYY-MM-DD
  jam_masuk: string;             // HH:mm
  tanggal_diambil?: string;      // YYYY-MM-DD
  jam_diambil?: string;          // HH:mm
  petugas_penerima?: string;     // Nama satpam penerima
  petugas_penyerah?: string;     // Nama satpam penyerah
}
```

### Courier Options (`CourierOption`)
`JNE` · `J&T` · `SiCepat` · `Shopee Express` · `Lazada` · `Tokopedia` · `Anteraja` · `POS Indonesia` · `Lainnya`

### User Session
```typescript
interface UserSession {
  username: string;
  name: string;       // "Petugas Satpam" atau custom
  role: 'satpam';
  isLoggedIn: boolean;
}
```

### IndexedDB Schema

| Store | Key Path | Indexes | Deskripsi |
|-------|----------|---------|-----------|
| `packages` | `id` | `nomor_paket` (unique), `status`, `tanggal_masuk` | Data paket |
| `photos` | `id` | — | Blob foto kondisi paket |
| `settings` | `key` | — | Kredensial & konfigurasi |

---

## 🔒 Keamanan

| Fitur | Implementasi |
|-------|-------------|
| **Autentikasi** | Session-based dengan localStorage + IndexedDB |
| **Kredensial** | Dapat dikonfigurasi via `.env` atau UI |
| **Data** | Client-side only (IndexedDB), tidak dikirim ke server |
| **Foto** | Disimpan lokal (client-side), tidak ada upload eksternal |
| **Service Worker** | Hanya cache aset statis, tidak menyimpan data sensitif |

> ⚠️ Aplikasi ini dirancang untuk penggunaan **internal/lokal**. Untuk deployment publik, disarankan menambahkan backend API dengan autentikasi yang lebih kuat (JWT, rate limiting, dll).

---

## 🧪 Testing

```bash
# Type checking
npm run lint          # tsc --noEmit

# Development server + manual testing
npm run dev           # http://localhost:3000

# Production build verification
npm run build
npm run preview       # Preview build di http://localhost:4173
```

### Simulasi Scan Cepat

Untuk testing tanpa paket fisik, gunakan tombol **Simulasi Scan Cepat** di halaman Scan:

| Kurir | Nomor Resi Contoh |
|-------|-------------------|
| Shopee Express | `SPX998877665` |
| J&T Express | `JNT102938475` |
| JNE Reguler | `JNE112233445` |
| SiCepat Halu | `SCP887766554` |
| Tokopedia | `TKP332211009` |

---

## 📝 Lisensi

MIT © 2025 — [Kevin Adisurya Nugraha](https://github.com/kevinadisuryanugraha)

---

<div align="center">

**Dibangun dengan ❤️ untuk memudahkan pencatatan paket di pos satpam.**

[⬆ Kembali ke atas](#-sistem-penerimaan-paket-satpam)

</div>
