# 🕒 TimeBlock To-Do (Monorepo)

Aplikasi **Time-Blocking To-Do List** modern yang terhubung langsung dengan Google Calendar, memecahkan masalah tenggat waktu terlewat dan catatan berantakan dengan filosofi desain **"Calm Productivity"**.

---

## 🏛️ Arsitektur Monorepo

```
to-do-list/
├── frontend/             # Client Workspace (React 18, Vite, TypeScript, Tailwind CSS, Lucide React)
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/       # App Shell: TopBar, Sidebar, MobileBottomNav
│   │   │   ├── dashboard/    # DailyProgressRing, OverdueSection, WeekStrip, TodayTasks, TimeBlocking, Upcoming
│   │   │   └── modals/       # QuickAddModal, ConflictResolverModal
│   │   ├── data/             # Mock Data (tasks, timeline, week days, upcoming)
│   │   ├── types/            # TypeScript interfaces & types
│   │   ├── App.tsx           # Main App coordinator & state manager
│   │   ├── main.tsx
│   │   └── index.css         # Tailwind & typography directives
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── package.json
│
├── backend/              # Server Workspace (Node.js, Express, TypeScript)
│   ├── src/
│   │   └── index.ts          # Express API server starter
│   ├── tsconfig.json
│   └── package.json
│
├── package.json          # Root Monorepo configuration (npm workspaces)
└── README.md
```

---

## 🚀 Cara Menjalankan

### 1. Install Seluruh Dependensi
```bash
npm install
```

### 2. Jalankan Frontend (Client)
```bash
npm run dev:frontend
```
Frontend akan berjalan di `http://localhost:5173`.

### 3. Jalankan Backend (Server)
```bash
npm run dev:backend
```
Backend API berjalan di `http://localhost:5000`.

---

## 🎨 Fitur Frontend yang Sudah Diimplementasikan

1. **App Shell Komprehensif:**
   - **TopBar**: Brand logo, Quick Search (⌘K), Notifikasi dengan unread badge, avatar profil.
   - **Sidebar (Desktop)**: Menu navigasi utama (Hari Ini, Semua Tugas, Kalender, Analitik, Pengaturan), filter kategori (Kerja, Kuliah, Pribadi), status sinkronisasi Google Calendar, dan streak counter.
   - **Mobile Bottom Nav**: Navigasi ramah layar sentuh dengan Floating Action Button (+) di tengah.

2. **Dashboard "Hari Ini" (Slicing Hasil Google Stitch):**
   - **Daily Progress Ring**: Kalkulasi persentase dinamis dengan SVG progress ring animasi & micro progress bar.
   - **Perlu Diselesaikan Segera (Overdue)**: Kartu tugas tertunda dengan aksen error lembut dan penanda sinkronisasi Google Calendar.
   - **Horizontal Week Strip**: Navigasi tanggal sepekan dengan active day indicator.
   - **Tugas Hari Ini**: Inline quick add tugas + checklist interaktif, visualisasi sub-task progress bar, dan tombol expand subtask.
   - **Jadwal & Time-Blocking**: Blok fokus, Google Meet event, waktu istirahat, dan deteksi bentrok jadwal interaktif dengan tombol **"Geser Jam"**.
   - **Besok & Mendatang**: Kartu agenda mendatang dengan icon kategori.

3. **Modals & Interaktivitas:**
   - **Quick Add Modal**: Input tugas baru lengkap dengan pemilihan kategori, prioritas, time-block, sub-task list, dan toggle Google Calendar.
   - **Conflict Resolver Modal**: Menawarkan slot waktu kosong alternatif untuk menjadwal ulang bentrok acara tanpa overlap.
