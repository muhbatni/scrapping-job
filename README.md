# Job Apply Assistant Indonesia

[![Platform](https://img.shields.io/badge/Platform-Docker%20Compose-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![Backend](https://img.shields.io/badge/Backend-NestJS%2010-E0234E?logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Frontend](https://img.shields.io/badge/Frontend-Vue.js%203%20%2B%20Vite-4FC08D?logo=vuedotjs&logoColor=white)](https://vuejs.org/)
[![Database](https://img.shields.io/badge/Database-PostgreSQL%2016-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Crawler](https://img.shields.io/badge/Crawler-Playwright-2EAD33?logo=playwright&logoColor=white)](https://playwright.dev/)
[![Styling](https://img.shields.io/badge/Styling-TailwindCSS%203-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Platform fullstack cerdas untuk agregasi, pencarian, dan pelacakan lamaran kerja di Indonesia. Sistem ini dirancang untuk berjalan **100% lokal** dan mandiri menggunakan Docker Compose tanpa ketergantungan pada layanan cloud berbayar.

---

## Daftar Isi

- [Ikhtisar Proyek](#ikhtisar-proyek)
- [Arsitektur Sistem](#arsitektur-sistem)
- [Teknologi yang Digunakan](#teknologi-yang-digunakan)
- [Fitur Utama](#fitur-utama)
- [Persyaratan Sistem](#persyaratan-sistem)
- [Panduan Instalasi & Menjalankan](#panduan-instalasi--menjalankan)
- [Akses Layanan & Port](#akses-layanan--port)
- [Akun Default Administrator](#akun-default-administrator)
- [Konfigurasi Environment](#konfigurasi-environment)
- [Dokumentasi API Endpoints](#dokumentasi-api-endpoints)
- [Struktur Database & Relasi Data](#struktur-database--relasi-data)
- [Mesin Crawler & Penjadwalan Otomatis](#mesin-crawler--penjadwalan-otomatis)
- [Pengujian Fitur & Hasil Verifikasi](#pengujian-fitur--hasil-verifikasi)
- [Struktur Direktori Proyek](#struktur-direktori-proyek)
- [Operasional & Perintah Docker](#operasional--perintah-docker)
- [Troubleshooting & Solusi Masalah Umum](#troubleshooting--solusi-masalah-umum)
- [Keamanan & Praktik Terbaik](#keamanan--praktik-terbaik)
- [Lisensi](#lisensi)

---

## Ikhtisar Proyek

Job Apply Assistant Indonesia adalah solusi terintegrasi bagi para pencari kerja profesional di Indonesia. Platform ini mengumpulkan ribuan lowongan dari portal kerja terkemuka (Jobstreet, LinkedIn, Glints, Kalibrr, Indeed, Tech in Asia, dan lainnya) serta halaman karir perusahaan teknologi dan korporasi teratas (Gojek, Tokopedia, Traveloka, BCA, Mandiri, Telkom, Astra, Unilever).

Platform menyediakan manajemen profil karir (riwayat pendidikan, keahlian berskala 1-5, pengalaman kerja, upload CV format PDF), pelacakan progres lamaran kerja bertahap (Kanban-style status pipeline), notifikasi lowongan baru, dashboard analitik, dan panel kontrol crawler bagi administrator.

---

## Arsitektur Sistem

Sistem terdiri dari 5 kontainer terisolasi yang saling terhubung dalam jaringan Docker bridge:

```
+---------------------------------------------------------------------------------+
|                                 USER BROWSER                                    |
+---------------------------------------------------------------------------------+
                                      |
                                      v
+---------------------------------------------------------------------------------+
|                       FRONTEND CONTAINER (Port 80)                              |
|                       Nginx Reverse Proxy + Vue.js 3 SPA                        |
+---------------------------------------------------------------------------------+
          |                                               |
          | Static Assets (SPA)                           | Proxy Pass /api
          v                                               v
+-----------------------+               +-----------------------------------------+
|   Vue 3 Client App    |               |       BACKEND API CONTAINER (Port 3000) |
|   - Pinia State Store |               |       NestJS + TypeORM + Passport JWT   |
|   - Vue Router        |               +-----------------------------------------+
|   - TailwindCSS UI    |                                 |
+-----------------------+                                 v
                                                +---------------------------------+
                                                |   POSTGRESQL CONTAINER (5432)   |
                                                |   PostgreSQL 16 Alpine          |
                                                |   Extensions: uuid-ossp, pg_trgm|
                                                +---------------------------------+
                                                          ^             ^
                                                          |             |
                                  Database Read/Write     |             |
                 +----------------------------------------+             |
                 |                                                      |
+---------------------------------------+             +---------------------------+
|    CRAWLER CONTAINER (Port 3001)      |             | SCHEDULER CONTAINER (3002)|
|    Playwright Chromium Engine         |<------------| node-cron Orchestration   |
|    Cheerio HTML Parser + Winston Logs |   Trigger   | Automasi Sinkronisasi     |
+---------------------------------------+             +---------------------------+
```

### Alur Komunikasi Antar Komponen

1. **Frontend (Nginx)**: Melayani antarmuka SPA di port `80` dan meneruskan semua panggilan API `/api/*` langsung ke kontainer `backend-api:3000`.
2. **Backend API (NestJS)**: Mengelola otentikasi JWT, RBAC, logika bisnis profil, pencarian lowongan, pelacakan lamaran, dan unggahan berkas.
3. **Database (PostgreSQL 16)**: Menyimpan seluruh entitas sistem secara persisten pada volume Docker `postgres_data`.
4. **Crawler Service (Playwright)**: Layanan headless browser automation yang mengekstraksi data lowongan, menghitung content hash untuk pencegahan duplikasi, dan memperbarui basis data.
5. **Scheduler Service (node-cron)**: Menjalankan tugas periodik (crawling rutin, pembersihan lowongan kedaluwarsa, pengiriman notifikasi berkala).

---

## Teknologi yang Digunakan

### Frontend
- **Framework**: Vue.js 3 (Composition API dengan `<script setup lang="ts">`)
- **Build Tool**: Vite 5
- **State Management**: Pinia 2
- **Routing**: Vue Router 4
- **CSS Framework**: TailwindCSS 3
- **Iconography**: Heroicons Vue
- **Visualisasi Grafik**: Chart.js 4 & vue-chartjs

### Backend
- **Framework**: NestJS 10 (TypeScript)
- **Object Relational Mapper**: TypeORM 0.3
- **Database Driver**: PostgreSQL Client (`pg`)
- **Autentikasi & Keamanan**: Passport.js, JWT (`@nestjs/jwt`), Bcrypt
- **Validasi Data**: `class-validator` & `class-transformer`
- **Dokumentasi Terintegrasi**: Swagger OpenAPI 3.0 (`@nestjs/swagger`)
- **Manajemen File**: Multer (`diskStorage`)
- **Rate Limiting**: NestJS Throttler

### Mesin Crawler & Penjadwalan
- **Automasi Browser**: Playwright Chromium (Headless)
- **HTML Parsing**: Cheerio
- **HTTP Client**: Axios
- **Task Scheduling**: node-cron
- **Logging Engine**: Winston Logger

---

## Fitur Utama

### 1. Dashboard Interaktif
- **Ringkasan Metrik**: Total lowongan aktif, lowongan yang dibookmark, total lamaran, status interview, offering, dan penolakan.
- **Grafik Tren Lamaran**: Visualisasi aktivitas pelamaran kerja bulanan berbasis riwayat.
- **Lowongan Terbaru**: Widget daftar cepat lowongan kerja terbaru dengan filter satu-klik.

### 2. Manajemen Profil & Portofolio Karir
- **Data Diri Lengkap**: Kontak, domisili (kota & provinsi), tautan LinkedIn, GitHub, dan portofolio.
- **Manajemen Keahlian (Skills)**: Penilaian tingkat kemahiran berskala 1 hingga 5.
- **Riwayat Pendidikan**: Universitas/institusi, jenjang, program studi, tanggal studi, IPK, dan deskripsi prestasi.
- **Pengalaman Kerja**: Perusahaan, jabatan, lokasi, periode kerja, status pekerjaan saat ini, dan rincian tanggung jawab.
- **Template Surat Lamaran (Cover Letter)**: Penyimpanan template pengantar kustom yang siap disesuaikan.
- **Unggah CV Profesional**: Validasi berkas khusus PDF dengan pembatasan ukuran maksimal (10 MB).

### 3. Pencarian & Eksplorasi Lowongan Lanjutan
- **Pencarian Multi-Kata Kunci**: Pencarian cepat berbasis trigram index (`pg_trgm`) pada judul lowongan, nama perusahaan, dan deskripsi.
- **Filter Fleksibel**:
  - Tipe Kerja: Remote, Hybrid, Onsite
  - Jenis Kontrak: Full Time, Part Time, Contract, Internship, Freelance
  - Level Pengalaman: Entry, Junior, Mid, Senior, Lead, Manager, Director
  - Estimasi Gaji Minimum: Filter rentang kompensasi IDR
  - Sumber Lowongan: Filter berdasarkan portal atau situs perusahaan
- **Penanda Buku (Bookmark)**: Simpan lowongan favorit untuk ditinjau kemudian.
- **Pencatatan Riwayat Dilihat (View Counter)**: Otomatis mendeteksi status lowongan yang telah dilihat.

### 4. Pelacakan Pipeline Lamaran (Application Tracker)
- **Alur Status Lengkap**:
  `Saved` -> `Viewed` -> `Applied` -> `Interview` -> `Technical Test` -> `HR Interview` -> `User Interview` -> `Offering` -> `Accepted` / `Rejected`
- **Catatan & Audit Trail**: Setiap perubahan status dicatat ke dalam riwayat audit (`application_status_history`) lengkap dengan stempel waktu dan catatan khusus.
- **Statistik Pelamaran**: Distribusi lamaran berdasarkan status keberhasilan.

### 5. Sistem Notifikasi Otomatis
- Peringatan lowongan baru yang sesuai dengan kata kunci pengguna.
- Pembaruan status lamaran dan notifikasi dari perusahaan favorit.
- Fitur penandaan sudah dibaca perorangan atau seluruhnya sekaligus.

### 6. Panel Administrasi & Pengawasan Crawler
- **Manajemen Pengguna**: Tinjau akun terdaftar, aktivasi/deaktivasi akun, dan ubah peran pengguna (`admin` / `user`).
- **Kelola Sumber Lowongan (Job Sources)**: Tambah, edit, aktifkan, atau nonaktifkan job board dan situs karir korporat.
- **Pemantauan Riwayat Crawling**: Log komprehensif metrik perayapan (jumlah lowongan baru, diperbarui, dilewati, waktu eksekusi, serta pesan galat).
- **Trigger Crawl Manual**: Eksekusi perayapan langsung per sumber atau seluruh portal melalui tombol aksi.

---

## Persyaratan Sistem

- **Sistem Operasi**: Windows 10/11 (dengan WSL2), macOS, atau Linux (Ubuntu 20.04+)
- **Docker Engine**: Versi 24.0.0 atau lebih baru
- **Docker Compose**: Versi 2.20.0 atau lebih baru
- **Hardware Minimum**:
  - CPU: 2 Core (disarankan 4 Core)
  - RAM: Minimal 4 GB (disarankan 8 GB untuk kestabilan Playwright Chromium)
  - Disk Space: 5 GB ruang penyimpanan bebas

---

## Panduan Instalasi & Menjalankan

### Langkah 1: Kloning Repositori

```bash
git clone <repository-url>
cd scrapping-job
```

### Langkah 2: Persiapkan Berkas Environment

Salin template konfigurasi `.env.example` menjadi `.env`:

```bash
cp .env.example .env
```

*(Pada Windows PowerShell)*:
```powershell
Copy-Item .env.example .env
```

### Langkah 3: Jalankan Aplikasi Menggunakan Docker Compose

Jalankan seluruh service dalam satu perintah:

```bash
docker-compose up --build -d
```

Docker Compose akan otomatis mengunduh base image, menginisialisasi skema PostgreSQL dan data benih (seed), mengompilasi backend, crawler, scheduler, serta membangun bundle frontend Nginx.

### Langkah 4: Verifikasi Kontainer yang Sedang Berjalan

```bash
docker ps
```

Pastikan kelima kontainer berikut berstatus `Up`:
- `jobassist-postgres` (PostgreSQL 16)
- `jobassist-backend` (NestJS API)
- `jobassist-frontend` (Vue.js 3 Nginx)
- `jobassist-crawler` (Playwright Engine)
- `jobassist-scheduler` (Cron Tasks)

---

## Akses Layanan & Port

| Layanan | Protokol / Port | URL Akses Langsung | Keterangan |
|---|---|---|---|
| **Antarmuka Pengguna (Web)** | HTTP :80 | [http://localhost](http://localhost) | Halaman utama Vue.js SPA via Nginx |
| **Backend API Gateway** | HTTP :3000 | [http://localhost/api](http://localhost/api) | API Endpoint (tersedia via Nginx atau port 3000) |
| **Dokumentasi Swagger** | HTTP :3000 | [http://localhost/api/docs](http://localhost/api/docs) | OpenAPI interactive documentation |
| **Database PostgreSQL** | TCP :5432 | `localhost:5432` | Kredensial: user `jobassist`, db `jobassist_db` |
| **Crawler Service** | HTTP :3001 | [http://localhost:3001](http://localhost:3001) | Endpoint trigger & status crawler |
| **Scheduler Service** | HTTP :3002 | [http://localhost:3002](http://localhost:3002) | Endpoint monitoring & trigger cron |

---

## Akun Default Administrator

Sistem telah dilengkapi dengan data akun administrator default yang terisi otomatis saat inisialisasi database:

| Atribut | Nilai |
|---|---|
| **Email** | `admin@jobassist.id` |
| **Password** | `admin123` |
| **Peran** | `admin` |

---

## Konfigurasi Environment

Konfigurasi sistem diatur terpusat melalui berkas `.env`:

| Variabel | Default | Deskripsi |
|---|---|---|
| `POSTGRES_HOST` | `postgres` | Host koneksi PostgreSQL (nama service Docker) |
| `POSTGRES_PORT` | `5432` | Port internal PostgreSQL |
| `POSTGRES_USER` | `jobassist` | Username database PostgreSQL |
| `POSTGRES_PASSWORD` | `jobassist_secret_2024` | Kata sandi database PostgreSQL |
| `POSTGRES_DB` | `jobassist_db` | Nama database utama |
| `BACKEND_PORT` | `3000` | Port publik untuk Backend NestJS API |
| `JWT_SECRET` | `job-assist-jwt-super-secret-key-2024` | Kunci enkripsi tanda tangan token JWT |
| `JWT_EXPIRATION` | `7d` | Masa berlaku token JWT (contoh: 7d, 24h) |
| `BCRYPT_ROUNDS` | `10` | Salt rounds hashing kata sandi |
| `FRONTEND_PORT` | `80` | Port publik web aplikasi frontend Nginx |
| `VITE_API_URL` | `http://localhost/api` | Base URL API yang digunakan oleh frontend client |
| `CRAWLER_PORT` | `3001` | Port publik service Crawler Playwright |
| `CRAWLER_CONCURRENCY` | `3` | Jumlah peramban simultan saat crawling berjalan |
| `CRAWLER_TIMEOUT` | `30000` | Waktu tunggu maksimal halaman (milidetik) |
| `SCHEDULER_PORT` | `3002` | Port publik service Scheduler cron |
| `THROTTLE_TTL` | `60` | Periode window pembatasan laju permintaan (detik) |
| `THROTTLE_LIMIT` | `100` | Batas maksimum request per window per IP |
| `MAX_FILE_SIZE` | `10485760` | Batas maksimal ukuran unggahan berkas (10 MB) |
| `UPLOAD_DIR` | `./uploads` | Direktori penyimpanan berkas unggahan di server |

---

## Dokumentasi API Endpoints

### 1. Autentikasi (`/api/auth`)
- `POST /api/auth/register` : Mendaftarkan akun baru (menerima `email`, `password`, dan opsional `fullName`).
- `POST /api/auth/login` : Masuk menggunakan kredensial dan memperoleh Bearer JWT Token.

### 2. Manajemen Profil (`/api/profiles`)
- `GET /api/profiles/me` : Mengambil data profil pengguna aktif.
- `PUT /api/profiles/me` : Memperbarui data kontak, bio, domisili, dan template surat lamaran.
- `GET /api/profiles/skills` : Mengambil daftar keahlian pengguna.
- `POST /api/profiles/skills` : Menambahkan keahlian baru (nama keahlian dan level 1-5).
- `DELETE /api/profiles/skills/:id` : Menghapus keahlian berdasarkan ID.
- `GET /api/profiles/education` : Mengambil riwayat pendidikan.
- `POST /api/profiles/education` : Menambahkan riwayat pendidikan.
- `PUT /api/profiles/education/:id` : Memperbarui rincian pendidikan (mendukung pembaruan parsial).
- `DELETE /api/profiles/education/:id` : Menghapus riwayat pendidikan.
- `GET /api/profiles/experiences` : Mengambil daftar pengalaman kerja.
- `POST /api/profiles/experiences` : Menambahkan pengalaman kerja baru.
- `PUT /api/profiles/experiences/:id` : Memperbarui rincian pengalaman kerja (parsial).
- `DELETE /api/profiles/experiences/:id` : Menghapus catatan pengalaman kerja.

### 3. Unggah Berkas (`/api/upload`)
- `POST /api/upload/cv` : Mengunggah berkas CV format PDF (validasi MIME type `application/pdf`).
- `POST /api/upload/screenshot` : Mengunggah tangkapan layar bukti lamaran (format gambar).

### 4. Eksplorasi Lowongan (`/api/jobs`)
- `GET /api/jobs` : Mencari lowongan dengan pagination dan filter (`keyword`, `location`, `workType`, `jobType`, `experienceLevel`, `salaryMin`, `sortBy`, `sortOrder`, `page`, `limit`).
- `GET /api/jobs/:id` : Menampilkan rincian lowongan kerja, otomatis mencatat status dilihat (`viewed`).
- `POST /api/jobs/:id/bookmark` : Menandai atau membatalkan penanda buku (toggle bookmark).
- `GET /api/jobs/bookmarks` : Mengambil daftar lowongan yang telah ditandai oleh pengguna.

### 5. Pelacakan Lamaran (`/api/applications`)
- `POST /api/applications` : Membuat entri lamaran baru pada lowongan tertentu.
- `GET /api/applications` : Menampilkan seluruh lamaran pengguna dengan filter status opsional.
- `GET /api/applications/stats` : Ringkasan jumlah lamaran per status progres.
- `GET /api/applications/monthly-stats` : Agregasi statistik bulanan untuk visualisasi diagram.
- `GET /api/applications/:id` : Menampilkan detail spesifik dari sebuah lamaran.
- `PUT /api/applications/:id/status` : Memperbarui status alur lamaran beserta catatan tahapan.
- `GET /api/applications/:id/history` : Riwayat audit jejak perubahan tahapan status lamaran.
- `DELETE /api/applications/:id` : Menghapus entri lamaran kerja.

### 6. Sumber Lowongan (`/api/job-sources`)
- `GET /api/job-sources` : Menampilkan seluruh sumber lowongan yang terdaftar.
- `GET /api/job-sources/active` : Menampilkan hanya sumber lowongan yang berstatus aktif.
- `POST /api/job-sources` : *(Admin)* Mendaftarkan sumber lowongan atau portal karir baru.
- `PUT /api/job-sources/:id` : *(Admin)* Memperbarui konfigurasi sumber lowongan.
- `PUT /api/job-sources/:id/toggle` : *(Admin)* Mengubah status aktif/nonaktif sumber.
- `DELETE /api/job-sources/:id` : *(Admin)* Menghapus sumber lowongan.

### 7. Notifikasi (`/api/notifications`)
- `GET /api/notifications` : Mengambil daftar notifikasi pengguna dengan pagination.
- `GET /api/notifications/unread-count` : Mengambil jumlah notifikasi yang belum dibaca.
- `PUT /api/notifications/:id/read` : Menandai satu notifikasi sebagai telah dibaca.
- `PUT /api/notifications/read-all` : Menandai semua notifikasi pengguna sebagai telah dibaca.
- `DELETE /api/notifications/:id` : Menghapus sebuah notifikasi.

### 8. Dashboard & Analitik (`/api/dashboard`)
- `GET /api/dashboard` : Mengambil metrik performa pencari kerja (ringkasan lamaran, interview, bookmark, recent jobs).
- `GET /api/dashboard/admin` : *(Admin)* Mengambil metrik sistem (total lowongan, pengguna, logs, dan statistik perayapan).

### 9. Panel Administrasi (`/api/admin` & `/api/crawl-logs`)
- `GET /api/admin/users` : Tinjau seluruh pengguna terdaftar dan status akun.
- `PUT /api/admin/users/:id/role` : Mengubah wewenang pengguna (`admin` atau `user`).
- `PUT /api/admin/users/:id/deactivate` : Menonaktifkan akses akun pengguna.
- `GET /api/admin/crawl-stats` : Ringkasan efisiensi dan durasi perayapan crawler.
- `GET /api/admin/error-logs` : Daftar kegagalan atau pesan galat crawler terkini.
- `GET /api/crawl-logs` : Riwayat log operasional crawler lengkap dengan filter dan pagination.

---

## Struktur Database & Relasi Data

Skema database PostgreSQL dirancang secara modular dan relasional:

- **`users`**: Akun pengguna, peran (admin/user), kata sandi terenkripsi bcrypt, dan status aktif.
- **`user_profiles`**: Data identitas diri, kontak, media sosial, berkas CV, dan template surat lamaran (relasi 1-to-1 dengan `users`).
- **`skills`**: Keahlian teknis atau non-teknis pengguna beserta tingkat kompetensi 1-5 (relasi N-to-1 dengan `users`).
- **`education`**: Catatan riwayat akademis, institusi, gelar, IPK, dan tanggal kelulusan.
- **`experiences`**: Portofolio pengalaman kerja profesional dan rincian tanggung jawab.
- **`job_sources`**: Direktori sumber perayapan lowongan (`job_board` atau `company_career`) lengkap dengan konfigurasi selektor CSS/XPath JSONB.
- **`jobs`**: Entitas lowongan kerja dengan metadata lengkap, rentang gaji, tipe kerja, tag keahlian, dan `content_hash` untuk deduplikasi.
- **`job_bookmarks`**: Relasi penanda buku antar pengguna dan lowongan (dengan constraint `UNIQUE(user_id, job_id)`).
- **`job_views`**: Pelacakan riwayat pembacaan lowongan oleh pengguna.
- **`applications`**: Entitas lamaran kerja yang menghubungkan pengguna dan lowongan dengan status tahapan aktif.
- **`application_status_history`**: Tabel histori audit jejak setiap transisi status lamaran.
- **`crawl_logs`**: Log metrik eksekusi perayapan, durasi milidetik, jumlah entri baru/diperbarui, dan jejak error.
- **`notifications`**: Pesan peringatan dan pengumuman yang ditujukan bagi pengguna spesifik.

---

## Mesin Crawler & Penjadwalan Otomatis

### Sumber Perayapan yang Didukung

#### Job Boards Nasional & Regional
- **Jobstreet Indonesia**
- **LinkedIn Jobs Indonesia**
- **Glints**
- **Kalibrr**
- **Karir.com**
- **Indeed Indonesia**
- **Foundit Indonesia**
- **Tech in Asia Jobs**
- **Loker.id**
- **TopKarir**
- **Urbanhire**

#### Halaman Karir Perusahaan Unggulan
- **Gojek (GoTo)**
- **Tokopedia**
- **Traveloka**
- **Telkom Indonesia**
- **Bank Central Asia (BCA)**
- **Bank Mandiri**
- **Astra International**
- **Unilever Indonesia**

### Jadwal Otomatisasi (Cron Expression)

| Identitas Tugas | Jadwal Cron | Frekuensi Eksekusi | Deskripsi Tugas |
|---|---|---|---|
| `crawl-all` | `0 */6 * * *` | Setiap 6 Jam | Mengeksekusi perayapan menyeluruh ke semua job board aktif |
| `crawl-companies` | `0 */12 * * *` | Setiap 12 Jam | Mengekstrak lowongan dari situs resmi karir korporat |
| `notify-new-jobs` | `0 * * * *` | Setiap 1 Jam | Memeriksa kecocokan kata kunci dan mengirimkan notifikasi |
| `cleanup-expired` | `0 0 * * *` | Setiap Hari (00:00) | Menonaktifkan lowongan yang telah melewati masa kedaluwarsa |

### Trigger Manual Melalui API

Anda dapat memicu crawler secara instan kapan saja tanpa menunggu cron:

```bash
# Perayapan semua sumber aktif
curl -X POST http://localhost:3001/crawl/all

# Perayapan hanya situs karir perusahaan
curl -X POST http://localhost:3001/crawl/companies

# Perayapan sumber spesifik menggunakan ID
curl -X POST http://localhost:3001/crawl/source/<SOURCE_UUID>

# Pemicuan melalui scheduler service
curl -X POST http://localhost:3002/trigger/crawl-all
```

---

## Pengujian Fitur & Hasil Verifikasi

Seluruh fungsionalitas sistem telah diuji secara komprehensif menggunakan test runner terintegrasi ([test-all-features.js](file:///c:/Users/ibat3/Downloads/scrapping-job/test-all-features.js)).

### Menjalankan Pengujian Menyeluruh

Pastikan kontainer Docker sedang berjalan, lalu jalankan:

```bash
node test-all-features.js
```

### Ringkasan Hasil Pengujian

```
----------------------------------------------------------------
  Job Apply Assistant Indonesia - Comprehensive Verification
----------------------------------------------------------------

--- 1. Infrastructure & Service Health ---
  [PASS] Crawler Service Health (/health)
  [PASS] Scheduler Service Health (/health)
  [PASS] Backend Swagger Documentation (/api/docs)
  [PASS] Frontend Web Application (Port 80 Nginx)

--- 2. Authentication & Authorization ---
  [PASS] Admin Login (admin@jobassist.id)
  [PASS] Reject Invalid Password with HTTP 401
  [PASS] User Registration with Full Name
  [PASS] Registered User Login

--- 3. Profile Management ---
  [PASS] Get User Profile (GET /api/profiles/me)
  [PASS] Update Profile Details (PUT /api/profiles/me)
  [PASS] Add Skill (POST /api/profiles/skills)
  [PASS] List Skills (GET /api/profiles/skills)
  [PASS] Delete Skill (DELETE /api/profiles/skills/:id)
  [PASS] Add Education (POST /api/profiles/education)
  [PASS] Update Education (PUT /api/profiles/education/:id)
  [PASS] List Education (GET /api/profiles/education)
  [PASS] Add Experience (POST /api/profiles/experiences)
  [PASS] Update Experience (PUT /api/profiles/experiences/:id)
  [PASS] List Experience (GET /api/profiles/experiences)

--- 4. File Upload (CV PDF & Screenshot) ---
  [PASS] Upload CV PDF (POST /api/upload/cv)
  [PASS] CV Upload Rejects Non-PDF with HTTP 400
  [PASS] Upload Screenshot Image (POST /api/upload/screenshot)

--- 5. Job Sources Management ---
  [PASS] List All Job Sources (GET /api/job-sources)
  [PASS] List Active Job Sources (GET /api/job-sources/active)
  [PASS] Admin Create Job Source (POST /api/job-sources)
  [PASS] Admin Toggle Job Source Status (PUT /api/job-sources/:id/toggle)
  [PASS] Admin Delete Job Source (DELETE /api/job-sources/:id)

--- 6. Job Search, Filters & Bookmarking ---
  [PASS] List Jobs (GET /api/jobs)
  [PASS] Search Jobs by Keyword "Backend"
  [PASS] Filter Jobs by workType=remote
  [PASS] Filter Jobs by experienceLevel=senior
  [PASS] Filter Jobs by salaryMin >= 20,000,000 IDR
  [PASS] Get Job Detail (GET /api/jobs/:id)
  [PASS] Bookmark Job (POST /api/jobs/:id/bookmark)
  [PASS] List Bookmarks (GET /api/jobs/bookmarks)
  [PASS] Unbookmark Job (POST /api/jobs/:id/bookmark)

--- 7. Applications Tracking & Workflow Pipeline ---
  [PASS] Create Job Application (POST /api/applications)
  [PASS] List User Applications (GET /api/applications)
  [PASS] Progress Application Status Through Pipeline (saved -> applied -> interview -> technical_test -> offering -> accepted)
  [PASS] Verify Application Status Audit History (GET /api/applications/:id/history)
  [PASS] Application Statistics Summary (GET /api/applications/stats)
  [PASS] Monthly Application Trend Statistics (GET /api/applications/monthly-stats)
  [PASS] Delete Application (DELETE /api/applications/:id)

--- 8. Notifications System ---
  [PASS] List Notifications (GET /api/notifications)
  [PASS] Get Unread Count (GET /api/notifications/unread-count)
  [PASS] Mark Single Notification Read (PUT /api/notifications/:id/read)
  [PASS] Mark All Notifications Read (PUT /api/notifications/read-all)

--- 9. User & Admin Dashboards ---
  [PASS] User Dashboard Metrics (GET /api/dashboard)
  [PASS] Admin Dashboard Metrics (GET /api/dashboard/admin)

--- 10. Admin Management Panel ---
  [PASS] Admin Get Users List (GET /api/admin/users)
  [PASS] Admin Get Crawl Logs (GET /api/crawl-logs)
  [PASS] Admin Crawl Statistics (GET /api/admin/crawl-stats)
  [PASS] Admin Error Logs (GET /api/admin/error-logs)

--- 11. Crawler & Scheduler Orchestration ---
  [PASS] Crawler Engine Status (GET :3001/status)
  [PASS] Scheduler Registered Cron Jobs (GET :3002/jobs)

----------------------------------------------------------------
  VERIFICATION RESULTS: 55 PASSED, 0 FAILED (TOTAL: 55)
----------------------------------------------------------------
```

Tingkat keberhasilan pengujian: **100% (55 dari 55 modul pengujian berhasil diverifikasi)**.

---

## Struktur Direktori Proyek

```
scrapping-job/
|-- docker-compose.yml              # Konfigurasi orkestrasi 5 container Docker
|-- .env                            # Berkas variabel environment aktif
|-- .env.example                    # Template konfigurasi environment
|-- test-all-features.js            # Script otomasi uji komprehensif (55 fitur)
|-- database/
|   `-- init.sql                    # Skema PostgreSQL, extensions, enums, & seed data
|-- backend/                        # Backend REST API (NestJS + TypeORM)
|   |-- Dockerfile                  # Multi-stage image build backend
|   |-- package.json
|   `-- src/
|       |-- main.ts                 # Bootstrap server, Swagger, & folder sanitizer
|       |-- app.module.ts           # Root dependency injection module
|       |-- auth/                   # Autentikasi JWT, password hashing, guards, DTOs
|       |-- users/                  # Layanan entitas akun pengguna
|       |-- profiles/               # Profil pengguna, skills, pendidikan, pengalaman kerja
|       |-- jobs/                   # Agregasi lowongan, pencarian multi-kriteria, bookmarks
|       |-- applications/           # Pelacakan status lamaran & histori audit
|       |-- job-sources/            # Sumber perayapan (job board & corporate career pages)
|       |-- crawl-logs/             # Pencatatan riwayat & analitik durasi crawling
|       |-- notifications/          # Sistem notifikasi interaktif pengguna
|       |-- dashboard/              # Metrik agregat analitik pencari kerja & administrator
|       |-- admin/                  # Kontrol operasional administrator
|       `-- upload/                 # Validasi berkas CV (PDF) dan tangkapan layar
|-- crawler/                        # Layanan Perayap Web (Playwright + Cheerio)
|   |-- Dockerfile                  # Instalasi library Chromium & dependensi Linux
|   |-- package.json
|   `-- src/
|       |-- main.ts                 # Express microservice crawler
|       |-- engine/                 # Logika perayapan, concurrency, & deduplikasi hash
|       |-- utils/                  # Winston logger formatter
|       `-- crawlers/               # Strategi spesifik job board & company career pages
|-- scheduler/                      # Penjadwalan Tugas Otomatis (node-cron)
|   |-- Dockerfile
|   |-- package.json
|   `-- src/
|       `-- main.ts                 # Definisi task cron & endpoint pemicu manual
`-- frontend/                       # Antarmuka Modern Web SPA (Vue.js 3 + Vite)
    |-- Dockerfile                  # Multi-stage build Vue & Nginx production
    |-- nginx.conf                  # Konfigurasi reverse proxy port 80 & API routing
    |-- package.json
    |-- tailwind.config.js          # Konfigurasi palette warna dark glassmorphism
    `-- src/
        |-- main.ts                 # Inisialisasi Vue, Pinia, dan Vue Router
        |-- App.vue                 # Root layout container
        |-- layouts/MainLayout.vue  # Shell navigasi, sidebar responsif, dan header
        |-- router/                 # Guard otentikasi dan navigasi rute
        |-- stores/                 # State management (auth, jobs, applications)
        |-- services/api.ts         # Axios client terkonfigurasi JWT interceptor
        `-- views/                  # Halaman aplikasi (Dashboard, Jobs, Profile, dll.)
```

---

## Operasional & Perintah Docker

### Manajemen Siklus Hidup Kontainer

```bash
# Menjalankan seluruh kontainer dan build ulang image jika ada perubahan
docker-compose up --build -d

# Meninjau status kontainer yang sedang aktif
docker-compose ps

# Menghentikan seluruh kontainer tanpa menghapus data
docker-compose stop

# Memulai kembali kontainer yang dihentikan
docker-compose start

# Menghentikan dan menghapus kontainer serta network virtual
docker-compose down

# Menghapus seluruh data (termasuk database dan upload) untuk reset total
docker-compose down -v
```

### Pemantauan Log Kontainer (Live Streaming)

```bash
# Pantau log seluruh kontainer secara real-time
docker-compose logs -f

# Pantau log kontainer tertentu
docker-compose logs -f backend-api
docker-compose logs -f crawler-service
docker-compose logs -f scheduler-service
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Melakukan Build Ulang Service Tertentu

Apabila Anda mengubah kode di salah satu modul (misalnya `backend` atau `frontend`), Anda dapat membangun ulang service tersebut secara independen:

```bash
# Build ulang dan restart backend saja
docker-compose up -d --build backend-api

# Build ulang dan restart frontend saja
docker-compose up -d --build frontend
```

---

## Troubleshooting & Solusi Masalah Umum

### 1. Docker Daemon Tidak Terhubung di Windows
Jika muncul pesan `failed to connect to the docker API at npipe:////./pipe/dockerDesktopLinuxEngine`:
- Pastikan aplikasi **Docker Desktop** telah dibuka dan berjalan.
- Tunggu sekitar 20-30 detik hingga status mesin WSL2 di pojok kiri bawah Docker Desktop berwarna hijau ("Engine running").

### 2. Port Sudah Digunakan Aplikasi Lain
Jika port `80`, `3000`, atau `5432` bentrok dengan layanan lokal Anda yang lain (seperti Apache/IIS/Postgres lokal):
- Buka berkas `.env` dan sesuaikan port publik, misalnya:
  ```env
  FRONTEND_PORT=8080
  BACKEND_PORT=3005
  ```
- Jalankan ulang kontainer dengan `docker-compose up -d`.

### 3. Mereset Database Menjadi Bersih
Jika Anda ingin mengembalikan database ke kondisi awal (mengosongkan data dan memuat ulang data benih `init.sql`):
```bash
docker-compose down -v
docker-compose up -d postgres
```

---

## Keamanan & Praktik Terbaik

1. **Hashing Kata Sandi**: Kata sandi pengguna tidak pernah disimpan dalam teks biasa; menggunakan enkripsi satu arah Bcrypt dengan 10 salt rounds.
2. **Otentikasi Berbasis Token**: Setiap sesi dilindungi oleh JSON Web Token (JWT) yang divalidasi via Passport strategy pada setiap request private.
3. **Role-Based Access Control (RBAC)**: Endpoint sensitif (manajemen sumber crawler, manipulasi pengguna) diamankan menggunakan `RolesGuard` dan decorator `@Roles(UserRole.ADMIN)`.
4. **Validasi File Upload Ketat**: Pengunggahan berkas CV dibatasi secara tegas hanya untuk format PDF melalui pemeriksaan MIME type Multer di level middleware.
5. **Mitigasi Serangan DoS**: Dilengkapi rate-limiting via NestJS Throttler untuk membatasi lonjakan request abnormal.
6. **Data Sanitization**: TypeORM parameter binding digunakan di seluruh kueri database untuk mencegah kerentanan SQL Injection.

---

## Lisensi

Proyek ini dilisensikan di bawah lisensi terbuka [MIT License](LICENSE).
Bebas digunakan, dikembangkan, dan dimodifikasi untuk keperluan pribadi maupun komersial.
