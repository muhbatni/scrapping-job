# Job Apply Assistant Indonesia 🇮🇩

Aplikasi fullstack untuk membantu pencarian dan manajemen lamaran kerja di Indonesia. Berjalan sepenuhnya secara lokal menggunakan Docker Compose.

## 🚀 Quick Start

### Prerequisites

- [Docker](https://www.docker.com/get-started) & Docker Compose
- Minimal 4GB RAM tersedia

### Menjalankan Aplikasi

```bash
# Clone repository
git clone <repo-url>
cd scrapping-job

# Jalankan semua services
docker-compose up --build

# Atau jalankan di background
docker-compose up --build -d
```

### Akses Aplikasi

| Service | URL |
|---------|-----|
| 🌐 Frontend | [http://localhost](http://localhost) |
| 🔧 Backend API | [http://localhost/api](http://localhost/api) (atau direct port: `:3000`) |
| 📚 Swagger Docs | [http://localhost/api/docs](http://localhost/api/docs) |
| 🕷️ Crawler | [http://localhost:3001](http://localhost:3001) |
| ⏰ Scheduler | [http://localhost:3002](http://localhost:3002) |

### Default Admin Account

```
Email: admin@jobassist.id
Password: admin123
```

## 🏗️ Arsitektur

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Frontend   │────▶│  Backend API │◀────│   Crawler    │
│  (Vue.js 3)  │     │  (NestJS)    │     │ (Playwright) │
│   Port: 80   │     │  Port: 3000  │     │  Port: 3001  │
└──────────────┘     └──────┬───────┘     └──────────────┘
                            │                     ▲
                            ▼                     │
                     ┌──────────────┐     ┌──────────────┐
                     │  PostgreSQL  │     │  Scheduler   │
                     │  Port: 5432  │     │ (Cron Jobs)  │
                     └──────────────┘     │  Port: 3002  │
                                          └──────────────┘
```

## 📁 Struktur Folder

```
scrapping-job/
├── docker-compose.yml          # Docker Compose configuration
├── .env                        # Environment variables
├── database/
│   └── init.sql                # Database schema & seed data
├── backend/                    # NestJS Backend API
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── main.ts
│       ├── app.module.ts
│       ├── auth/               # JWT Authentication & RBAC
│       ├── users/              # User management
│       ├── profiles/           # User profiles, skills, education
│       ├── jobs/               # Job listings & search
│       ├── applications/       # Application management
│       ├── job-sources/        # Job sources (boards & companies)
│       ├── crawl-logs/         # Crawl history & logging
│       ├── notifications/      # Notification system
│       ├── dashboard/          # Dashboard statistics
│       ├── admin/              # Admin panel
│       └── upload/             # File upload (CV, screenshots)
├── crawler/                    # Playwright + Cheerio Crawler
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── main.ts
│       ├── engine/             # Crawler engine
│       └── crawlers/           # Site-specific crawlers
├── scheduler/                  # Cron Job Scheduler
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       └── main.ts
└── frontend/                   # Vue.js 3 Frontend
    ├── Dockerfile
    ├── nginx.conf
    ├── package.json
    └── src/
        ├── main.ts
        ├── App.vue
        ├── router/             # Vue Router
        ├── stores/             # Pinia stores
        ├── services/           # API service
        ├── layouts/            # Layout components
        └── views/              # Page components
```

## 🔧 Teknologi

### Frontend
- **Vue.js 3** + TypeScript
- **Vite** (build tool)
- **TailwindCSS** (styling)
- **Pinia** (state management)
- **Vue Router** (routing)
- **Chart.js** (charts)

### Backend
- **NestJS** + TypeScript
- **TypeORM** (ORM)
- **Passport + JWT** (authentication)
- **Swagger** (API documentation)
- **Multer** (file upload)

### Crawler
- **Playwright** (browser automation)
- **Cheerio** (HTML parsing)
- **Winston** (logging)

### Scheduler
- **node-cron** (cron scheduling)
- **Axios** (HTTP client)

### Database
- **PostgreSQL 16**

## 📋 Fitur

### 1. Dashboard
- Total lowongan ditemukan
- Total lowongan tersimpan
- Total lamaran & interview
- Statistik per bulan

### 2. Profil Pengguna
- Data pribadi lengkap
- Skill management (1-5 level)
- Riwayat pendidikan
- Pengalaman kerja
- Upload CV (PDF)
- Cover letter template

### 3. Pencarian Lowongan
- Keyword search (fuzzy)
- Filter lokasi, tipe kerja, jenis pekerjaan
- Filter level pengalaman & gaji minimum
- Sorting & pagination

### 4. Aggregator Lowongan
Sumber yang didukung:
- Jobstreet, LinkedIn Jobs, Glints
- Kalibrr, Karir.com, Indeed
- Foundit, Urbanhire, Tech in Asia Jobs
- Loker.id, TopKarir
- Career pages perusahaan (Gojek, Tokopedia, dll)

### 5. Crawling Engine
- Crawling terjadwal (setiap 6 jam)
- Deteksi lowongan baru (content hash)
- Hindari duplikasi
- Logging lengkap & retry
- Monitoring via admin panel

### 6. Manajemen Lamaran
Status tracking:
- Saved → Viewed → Applied → Interview
- Technical Test → HR Interview → User Interview
- Offering → Accepted / Rejected

### 7. Admin Panel
- Kelola sumber lowongan
- Tambah company career page
- Monitor crawler
- Error logs

### 8. Notifikasi
- Lowongan baru sesuai keyword
- Lowongan dari perusahaan favorit

### 9. Keamanan
- JWT Authentication
- Role Based Access Control (admin/user)
- Upload validation (PDF only for CV)
- Rate limiting

## 🔌 API Endpoints

### Auth
- `POST /api/auth/register` - Register
- `POST /api/auth/login` - Login

### Profile
- `GET /api/profiles/me` - Get profile
- `PUT /api/profiles/me` - Update profile
- `GET/POST/DELETE /api/profiles/skills` - Skills CRUD
- `GET/POST/PUT/DELETE /api/profiles/education` - Education CRUD
- `GET/POST/PUT/DELETE /api/profiles/experiences` - Experience CRUD

### Jobs
- `GET /api/jobs` - Search jobs
- `GET /api/jobs/:id` - Job detail
- `POST /api/jobs/:id/bookmark` - Toggle bookmark
- `GET /api/jobs/bookmarks` - Get bookmarks

### Applications
- `POST /api/applications` - Create application
- `GET /api/applications` - List applications
- `GET /api/applications/stats` - Statistics
- `PUT /api/applications/:id/status` - Update status
- `GET /api/applications/:id/history` - Status history

### Dashboard
- `GET /api/dashboard` - User dashboard
- `GET /api/dashboard/admin` - Admin dashboard

### Admin
- `GET/POST/PUT/DELETE /api/job-sources` - Manage sources
- `GET /api/crawl-logs` - Crawl logs
- `GET /api/admin/users` - User management

### Upload
- `POST /api/upload/cv` - Upload CV (PDF)

Full API documentation available at `/api/docs` (Swagger).

## 🐳 Docker Commands

```bash
# Start semua services
docker-compose up --build

# Start di background
docker-compose up -d

# Stop semua services
docker-compose down

# Lihat logs
docker-compose logs -f

# Lihat logs service tertentu
docker-compose logs -f backend-api
docker-compose logs -f crawler-service

# Restart service tertentu
docker-compose restart crawler-service

# Reset database
docker-compose down -v
docker-compose up --build
```

## 🕷️ Manual Crawl

```bash
# Crawl semua sumber
curl -X POST http://localhost:3001/crawl/all

# Crawl sumber tertentu
curl -X POST http://localhost:3001/crawl/source/{sourceId}

# Crawl halaman karir perusahaan
curl -X POST http://localhost:3001/crawl/companies

# Trigger via scheduler
curl -X POST http://localhost:3002/trigger/crawl-all
```

## ⏰ Jadwal Cron

| Job | Jadwal | Deskripsi |
|-----|--------|-----------|
| crawl-all | Setiap 6 jam | Crawl semua job board |
| crawl-companies | Setiap 12 jam | Crawl career pages |
| notify-new-jobs | Setiap 1 jam | Kirim notifikasi job baru |
| cleanup-expired | Setiap hari 00:00 | Nonaktifkan job expired |

## 📝 Catatan Deployment

- Aplikasi ini dirancang untuk berjalan **100% lokal** tanpa cloud service
- Semua data disimpan di PostgreSQL container
- Volume `postgres_data` memastikan data persist setelah restart
- Volume `backend_uploads` menyimpan file CV yang diupload
- Crawler menggunakan Playwright dengan headless Chromium
- Rate limiting diaktifkan untuk melindungi API

## 📄 License

MIT License
