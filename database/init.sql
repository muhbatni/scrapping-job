-- Job Apply Assistant Indonesia
-- Database Initialization Script

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ENUMS

CREATE TYPE user_role AS ENUM ('admin', 'user');
CREATE TYPE work_type AS ENUM ('remote', 'hybrid', 'onsite');
CREATE TYPE job_type AS ENUM ('full_time', 'part_time', 'contract', 'internship', 'freelance');
CREATE TYPE experience_level AS ENUM ('entry', 'junior', 'mid', 'senior', 'lead', 'manager', 'director', 'executive');
CREATE TYPE application_status AS ENUM (
  'saved', 'viewed', 'applied', 'interview', 'technical_test',
  'hr_interview', 'user_interview', 'offering', 'accepted', 'rejected'
);
CREATE TYPE crawl_status AS ENUM ('pending', 'running', 'completed', 'failed');
CREATE TYPE job_source_type AS ENUM ('job_board', 'company_career');
CREATE TYPE notification_type AS ENUM ('new_job', 'favorite_company', 'status_change');

-- USERS
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role user_role DEFAULT 'user',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- USER PROFILES
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  full_name VARCHAR(255),
  phone VARCHAR(50),
  linkedin_url VARCHAR(500),
  github_url VARCHAR(500),
  portfolio_url VARCHAR(500),
  address TEXT,
  city VARCHAR(100),
  province VARCHAR(100),
  summary TEXT,
  cv_file_path VARCHAR(500),
  cover_letter_template TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SKILLS
CREATE TABLE skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  level INTEGER DEFAULT 1 CHECK (level >= 1 AND level <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- EDUCATION
CREATE TABLE education (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  institution VARCHAR(255) NOT NULL,
  degree VARCHAR(100),
  field_of_study VARCHAR(255),
  start_date DATE,
  end_date DATE,
  gpa DECIMAL(3,2),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- EXPERIENCE
CREATE TABLE experiences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company VARCHAR(255) NOT NULL,
  position VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  start_date DATE,
  end_date DATE,
  is_current BOOLEAN DEFAULT false,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- JOB SOURCES (Job Boards & Company Career Pages)
CREATE TABLE job_sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  type job_source_type NOT NULL,
  base_url VARCHAR(500) NOT NULL,
  logo_url VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  crawl_config JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- JOBS (Lowongan Kerja)
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_id UUID REFERENCES job_sources(id) ON DELETE SET NULL,
  external_id VARCHAR(255),
  title VARCHAR(500) NOT NULL,
  company VARCHAR(255) NOT NULL,
  company_logo VARCHAR(500),
  location VARCHAR(255),
  work_type work_type,
  job_type job_type,
  experience_level experience_level,
  salary_min BIGINT,
  salary_max BIGINT,
  salary_currency VARCHAR(10) DEFAULT 'IDR',
  description TEXT,
  requirements TEXT,
  benefits TEXT,
  tags TEXT[],
  original_url VARCHAR(1000),
  posted_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  raw_data JSONB,
  content_hash VARCHAR(64),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- JOB BOOKMARKS
CREATE TABLE job_bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, job_id)
);

-- JOB VIEWS
CREATE TABLE job_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, job_id)
);

-- APPLICATIONS (Lamaran)
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  status application_status DEFAULT 'saved',
  notes TEXT,
  applied_at TIMESTAMP WITH TIME ZONE,
  interview_date TIMESTAMP WITH TIME ZONE,
  cv_used VARCHAR(500),
  cover_letter TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, job_id)
);

-- APPLICATION STATUS HISTORY
CREATE TABLE application_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  old_status application_status,
  new_status application_status NOT NULL,
  notes TEXT,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CRAWL LOGS
CREATE TABLE crawl_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_id UUID REFERENCES job_sources(id) ON DELETE SET NULL,
  status crawl_status DEFAULT 'pending',
  jobs_found INTEGER DEFAULT 0,
  jobs_new INTEGER DEFAULT 0,
  jobs_updated INTEGER DEFAULT 0,
  jobs_skipped INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_ms INTEGER,
  retry_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AUTO APPLY LOGS
CREATE TABLE auto_apply_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID REFERENCES applications(id) ON DELETE SET NULL,
  job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  status VARCHAR(50) NOT NULL,
  steps JSONB DEFAULT '[]',
  screenshot_path VARCHAR(500),
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- NOTIFICATIONS
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- FAVORITE COMPANIES
CREATE TABLE favorite_companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, company_name)
);

-- KEYWORD ALERTS
CREATE TABLE keyword_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  keyword VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- INDEXES
CREATE INDEX idx_jobs_title ON jobs USING gin(title gin_trgm_ops);
CREATE INDEX idx_jobs_company ON jobs USING gin(company gin_trgm_ops);
CREATE INDEX idx_jobs_location ON jobs(location);
CREATE INDEX idx_jobs_work_type ON jobs(work_type);
CREATE INDEX idx_jobs_job_type ON jobs(job_type);
CREATE INDEX idx_jobs_experience_level ON jobs(experience_level);
CREATE INDEX idx_jobs_salary ON jobs(salary_min, salary_max);
CREATE INDEX idx_jobs_posted_at ON jobs(posted_at);
CREATE INDEX idx_jobs_is_active ON jobs(is_active);
CREATE INDEX idx_jobs_source_id ON jobs(source_id);
CREATE INDEX idx_jobs_content_hash ON jobs(content_hash);
CREATE INDEX idx_jobs_external_id ON jobs(external_id);

CREATE INDEX idx_applications_user_id ON applications(user_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_job_id ON applications(job_id);

CREATE INDEX idx_bookmarks_user_id ON job_bookmarks(user_id);
CREATE INDEX idx_views_user_id ON job_views(user_id);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

CREATE INDEX idx_crawl_logs_source_id ON crawl_logs(source_id);
CREATE INDEX idx_crawl_logs_status ON crawl_logs(status);
CREATE INDEX idx_crawl_logs_created_at ON crawl_logs(created_at);

-- SEED DATA: Default Admin User
-- Password: admin123 (bcrypt hashed)
INSERT INTO users (email, password, role) VALUES
  ('admin@jobassist.id', '$2b$10$Ctz6U0eKKz0tcrG7W3TT.enUYAzLg.lsETcP3eZloiOiwUiCahusa', 'admin');

-- SEED DATA: Default Job Sources
INSERT INTO job_sources (name, type, base_url, is_active, crawl_config) VALUES
  ('Jobstreet', 'job_board', 'https://www.jobstreet.co.id', true, '{"searchPath": "/id/job-search", "selectors": {"title": ".job-title", "company": ".company-name", "location": ".location"}}'),
  ('LinkedIn Jobs', 'job_board', 'https://www.linkedin.com/jobs', true, '{"searchPath": "/search", "selectors": {"title": ".base-search-card__title", "company": ".base-search-card__subtitle", "location": ".job-search-card__location"}}'),
  ('Glints', 'job_board', 'https://glints.com', true, '{"searchPath": "/id/opportunities/jobs", "selectors": {"title": ".job-title", "company": ".company-name"}}'),
  ('Kalibrr', 'job_board', 'https://www.kalibrr.id', true, '{"searchPath": "/id-ID/job-board/te", "selectors": {}}'),
  ('Karir.com', 'job_board', 'https://www.karir.com', true, '{"searchPath": "/search", "selectors": {}}'),
  ('Indeed', 'job_board', 'https://id.indeed.com', true, '{"searchPath": "/jobs", "selectors": {"title": ".jobTitle", "company": ".companyName", "location": ".companyLocation"}}'),
  ('Foundit', 'job_board', 'https://www.foundit.id', true, '{"searchPath": "/srp/results", "selectors": {}}'),
  ('Urbanhire', 'job_board', 'https://www.urbanhire.com', true, '{"searchPath": "/jobs", "selectors": {}}'),
  ('Tech in Asia Jobs', 'job_board', 'https://www.techinasia.com/jobs', true, '{"searchPath": "/search", "selectors": {}}'),
  ('Loker.id', 'job_board', 'https://www.loker.id', true, '{"searchPath": "/cari-lowongan-kerja", "selectors": {}}'),
  ('TopKarir', 'job_board', 'https://www.topkarir.com', true, '{"searchPath": "/lowongan-kerja", "selectors": {}}');

-- SEED DATA: Default Company Career Pages
INSERT INTO job_sources (name, type, base_url, is_active, crawl_config) VALUES
  ('Gojek Careers', 'company_career', 'https://www.gotocompany.com/careers', true, '{"selectors": {"jobList": ".career-list", "title": ".job-title", "location": ".job-location"}}'),
  ('Tokopedia Careers', 'company_career', 'https://www.tokopedia.com/careers', true, '{"selectors": {}}'),
  ('Traveloka Careers', 'company_career', 'https://www.traveloka.com/en-id/careers', true, '{"selectors": {}}'),
  ('Telkom Careers', 'company_career', 'https://careers.telkom.co.id', true, '{"selectors": {}}'),
  ('BCA Careers', 'company_career', 'https://karir.bca.co.id', true, '{"selectors": {}}'),
  ('Bank Mandiri Careers', 'company_career', 'https://www.bankmandiri.co.id/karir', true, '{"selectors": {}}'),
  ('Astra Careers', 'company_career', 'https://www.astra.co.id/Career', true, '{"selectors": {}}'),
  ('Unilever Careers', 'company_career', 'https://careers.unilever.com/indonesia', true, '{"selectors": {}}');

-- SEED DATA: Realistic initial jobs for Indonesia
INSERT INTO jobs (
  source_id, external_id, title, company, location, work_type, job_type, experience_level,
  salary_min, salary_max, salary_currency, description, requirements, benefits, tags, original_url, posted_at, content_hash
) VALUES
(
  (SELECT id FROM job_sources WHERE name = 'BCA Careers' LIMIT 1),
  'bca-it-support-01',
  'IT Support & Operations Specialist',
  'PT Bank Central Asia Tbk',
  'Jakarta Pusat',
  'onsite',
  'full_time',
  'entry',
  8500000,
  14000000,
  'IDR',
  'Bertanggung jawab atas pemeliharaan perangkat keras (hardware), sistem operasi, jaringan lokal cabang (LAN/WLAN), dan penanganan insiden teknologi informasi perbankan harian.',
  'Pendidikan S1 Teknik Informatika, Ilmu Komputer, atau Sistem Informasi dengan IPK minimal 3.00. Menguasai troubleshooting hardware, Windows Server, Active Directory, dan dasar jaringan TCP/IP.',
  'Tunjangan hari raya, bonus tantiem tahunan, asuransi kesehatan keluarga, program pelatihan sertifikasi IT perbankan.',
  ARRAY['IT Support', 'Hardware', 'Networking', 'Banking', 'Windows Server'],
  'https://karir.bca.co.id/it-support',
  NOW() - INTERVAL '2 days',
  md5('IT Support & Operations Specialist|PT Bank Central Asia Tbk|Jakarta Pusat')
),
(
  (SELECT id FROM job_sources WHERE name = 'Gojek Careers' LIMIT 1),
  'gojek-be-golang-02',
  'Senior Backend Engineer (Golang)',
  'Gojek',
  'Jakarta Selatan',
  'hybrid',
  'full_time',
  'senior',
  25000000,
  42000000,
  'IDR',
  'Merancang dan membangun arsitektur microservices skala masif jutaan transaksi harian pada ekosistem Gojek (Transport, Food, & Logistics).',
  'Pengalaman minimal 4 tahun dengan Golang atau Java. Memiliki pemahaman kuat tentang distributed systems, Kafka, Redis, PostgreSQL, dan Docker/Kubernetes.',
  'Asuransi kesehatan swasta internasional, alokasi tunjangan hybrid work, MacBook Pro M3, bonus kinerja tahunan.',
  ARRAY['Golang', 'Microservices', 'Kafka', 'PostgreSQL', 'Docker'],
  'https://www.gotocompany.com/careers/backend-engineer',
  NOW() - INTERVAL '1 day',
  md5('Senior Backend Engineer (Golang)|Gojek|Jakarta Selatan')
),
(
  (SELECT id FROM job_sources WHERE name = 'Tokopedia Careers' LIMIT 1),
  'tokopedia-fe-vue-03',
  'Frontend Engineer (Vue 3 / TypeScript)',
  'Tokopedia',
  'Jakarta Barat',
  'hybrid',
  'full_time',
  'mid',
  15000000,
  25000000,
  'IDR',
  'Mengembangkan fitur baru dan mengoptimalkan performa web marketplace Tokopedia dengan Vue.js 3, TypeScript, dan TailwindCSS.',
  'Pengalaman 2+ tahun dalam modern JavaScript/TypeScript framework (Vue/React). Memahami SSR, SEO optimization, state management Pinia, dan web performance tuning.',
  'Asuransi kesehatan rawat jalan & rawat inap, voucher diskon Tokopedia, tunjangan komunikasi, flexible working arrangement.',
  ARRAY['Frontend', 'Vue3', 'TypeScript', 'TailwindCSS', 'Vite'],
  'https://www.tokopedia.com/careers/fe-engineer',
  NOW() - INTERVAL '3 days',
  md5('Frontend Engineer (Vue 3 / TypeScript)|Tokopedia|Jakarta Barat')
),
(
  (SELECT id FROM job_sources WHERE name = 'Traveloka Careers' LIMIT 1),
  'traveloka-fullstack-04',
  'Full Stack Software Engineer',
  'Traveloka',
  'Tangerang Selatan',
  'hybrid',
  'full_time',
  'mid',
  18000000,
  30000000,
  'IDR',
  'Mengembangkan aplikasi pemesanan tiket penerbangan dan hotel end-to-end dengan arsitektur cloud terdistribusi di AWS.',
  'Keahlian dalam Java / Kotlin backend dan React / Vue frontend. Memahami REST API design, asynchronous processing, dan CI/CD pipeline.',
  'Tunjangan traveling tahunan, asuransi kesehatan komprehensif, makan siang gratis di kantor, program stock options.',
  ARRAY['Fullstack', 'Java', 'React', 'AWS', 'PostgreSQL'],
  'https://www.traveloka.com/en-id/careers/fullstack',
  NOW() - INTERVAL '4 days',
  md5('Full Stack Software Engineer|Traveloka|Tangerang Selatan')
),
(
  (SELECT id FROM job_sources WHERE name = 'Telkom Careers' LIMIT 1),
  'telkom-devops-05',
  'DevOps & Cloud Engineer',
  'PT Telkom Indonesia (Persero) Tbk',
  'Bandung',
  'hybrid',
  'full_time',
  'senior',
  16000000,
  27000000,
  'IDR',
  'Mengelola infrastruktur cloud BUMN, cluster Kubernetes, observabilitas sistem monitoring, serta mengotomatisasi delivery software berskala nasional.',
  'Pengalaman 3+ tahun mengelola Linux, Kubernetes, Terraform, Docker, GitLab CI, dan arsitektur hybrid cloud.',
  'Status pegawai BUMN tetap, tunjangan telekomunikasi, fasilitas kesehatan lengkap, dana pensiun BUMN.',
  ARRAY['DevOps', 'Kubernetes', 'Docker', 'Linux', 'Terraform'],
  'https://careers.telkom.co.id/devops',
  NOW() - INTERVAL '2 days',
  md5('DevOps & Cloud Engineer|PT Telkom Indonesia (Persero) Tbk|Bandung')
),
(
  (SELECT id FROM job_sources WHERE name = 'Bank Mandiri Careers' LIMIT 1),
  'mandiri-odp-06',
  'Officer Development Program (ODP) - IT',
  'PT Bank Mandiri (Persero) Tbk',
  'Jakarta Selatan',
  'onsite',
  'full_time',
  'entry',
  10000000,
  16000000,
  'IDR',
  'Program akselerasi kepemimpinan teknologi informasi untuk calon pimpinan IT perbankan terbesar di Indonesia.',
  'Lulusan baru (fresh graduate) S1/S2 Ilmu Komputer, Teknik Informatika, Sistem Informasi, Teknik Elektro dengan IPK minimal 3.00.',
  'Jalur karir manajerial cepat, asuransi kesehatan BUMN, bonus kinerja perbankan, fasilitas pembiayaan karyawan.',
  ARRAY['ODP', 'Banking', 'Management Trainee', 'Software Engineering'],
  'https://www.bankmandiri.co.id/karir/odp-it',
  NOW() - INTERVAL '5 days',
  md5('Officer Development Program (ODP) - IT|PT Bank Mandiri (Persero) Tbk|Jakarta Selatan')
),
(
  (SELECT id FROM job_sources WHERE name = 'Astra Careers' LIMIT 1),
  'astra-it-analyst-07',
  'IT Support & Infrastructure Analyst',
  'PT Astra International Tbk',
  'Jakarta Utara',
  'onsite',
  'full_time',
  'junior',
  9000000,
  15000000,
  'IDR',
  'Menangani troubleshooting perangkat IT, instalasi jaringan, implementasi sistem keamanan end-point, dan pemeliharaan server lokal.',
  'Pendidikan S1 di bidang terkait IT. Memiliki sertifikasi MCSA / CCNA menjadi nilai tambah. Kemampuan komunikasi yang baik.',
  'Koperasi karyawan Astra, fasilitas kesehatan keluarga, bonus tahunan Astra Group, program pelatihan berkelanjutan.',
  ARRAY['IT Support', 'Infrastructure', 'Cisco', 'Network', 'Hardware'],
  'https://www.astra.co.id/Career/it-analyst',
  NOW() - INTERVAL '6 days',
  md5('IT Support & Infrastructure Analyst|PT Astra International Tbk|Jakarta Utara')
),
(
  (SELECT id FROM job_sources WHERE name = 'Jobstreet' LIMIT 1),
  'jobstreet-mobile-flutter-08',
  'Mobile App Developer (Flutter / Dart)',
  'PT Shopee International Indonesia',
  'Jakarta Selatan',
  'hybrid',
  'full_time',
  'mid',
  14000000,
  24000000,
  'IDR',
  'Mengembangkan aplikasi mobile e-commerce dan financial services multi-platform berbasis Flutter dengan performa 60 FPS yang mulus.',
  'Pengalaman 2+ tahun dalam Flutter & Dart. Memahami State Management (Bloc / Riverpod), Clean Architecture, REST API, dan integrasi push notification.',
  'Tunjangan makan siang, asuransi kesehatan swasta, peralatan kerja Apple, voucher belanja.',
  ARRAY['Flutter', 'Dart', 'Mobile', 'Android', 'iOS'],
  'https://www.jobstreet.co.id/id/job-search/job-vacancy/flutter-developer',
  NOW() - INTERVAL '1 day',
  md5('Mobile App Developer (Flutter / Dart)|PT Shopee International Indonesia|Jakarta Selatan')
),
(
  (SELECT id FROM job_sources WHERE name = 'LinkedIn Jobs' LIMIT 1),
  'linkedin-qa-automation-09',
  'QA Automation Engineer',
  'PT Global Digital Niaga (Blibli)',
  'Jakarta Barat',
  'hybrid',
  'full_time',
  'mid',
  13000000,
  22000000,
  'IDR',
  'Menyusun skenario pengujian otomatis untuk web dan mobile application, melakukan stress test, dan mengintegrasikan testing ke dalam pipeline CI/CD.',
  'Pengalaman minimal 2 tahun dalam automated testing. Menguasai Playwright, Cypress, Selenium, JMeter, atau Appium. Memahami metodologi Agile/Scrum.',
  'Asuransi kesehatan lengkap, tunjangan kebugaran, program kepemilikan gadget, cuti tahunan tambahan.',
  ARRAY['QA', 'Automation', 'Playwright', 'Cypress', 'Testing'],
  'https://www.linkedin.com/jobs/view/qa-automation-blibli',
  NOW() - INTERVAL '2 days',
  md5('QA Automation Engineer|PT Global Digital Niaga (Blibli)|Jakarta Barat')
),
(
  (SELECT id FROM job_sources WHERE name = 'Glints' LIMIT 1),
  'glints-data-analyst-10',
  'Data Analyst & Business Intelligence',
  'Bukalapak',
  'Jakarta Selatan',
  'remote',
  'full_time',
  'mid',
  13000000,
  21000000,
  'IDR',
  'Mengolah data transaksi dan perilaku pengguna menjadi visualisasi dashboard interaktif serta memberikan rekomendasi bisnis berbasis data statistik.',
  'Mahir SQL tingkat lanjut, Tableau / PowerBI, Python/R dasar untuk data wrangling, serta pemahaman metrik e-commerce / fintech.',
  'Peluang kerja remote dari mana saja di Indonesia, tunjangan internet bulanan, asuransi rawat jalan swasta.',
  ARRAY['Data Analyst', 'SQL', 'Tableau', 'PowerBI', 'Python'],
  'https://glints.com/id/opportunities/jobs/data-analyst',
  NOW() - INTERVAL '3 days',
  md5('Data Analyst & Business Intelligence|Bukalapak|Jakarta Selatan')
),
(
  (SELECT id FROM job_sources WHERE name = 'Kalibrr' LIMIT 1),
  'kalibrr-uiux-11',
  'UI/UX Product Designer',
  'DANA Indonesia',
  'Jakarta Selatan',
  'hybrid',
  'full_time',
  'mid',
  14000000,
  23000000,
  'IDR',
  'Merancang antarmuka dan alur pengalaman pengguna aplikasi dompet digital nasional yang intuitif, accessible, dan menyenangkan.',
  'Portofolio desain yang solid dalam Figma. Memahami design system, user research, wireframing, prototyping, dan usability testing.',
  'Asuransi kesehatan komprehensif, tunjangan wellness, flexible working hours, budget training.',
  ARRAY['UI/UX', 'Figma', 'Product Design', 'Prototyping', 'Fintech'],
  'https://www.kalibrr.id/job-board/ui-ux-designer',
  NOW() - INTERVAL '4 days',
  md5('UI/UX Product Designer|DANA Indonesia|Jakarta Selatan')
),
(
  (SELECT id FROM job_sources WHERE name = 'Jobstreet' LIMIT 1),
  'jobstreet-it-support-12',
  'IT Helpdesk & Technical Support',
  'PT Solusi Teknologi Nusantara',
  'Bandung',
  'onsite',
  'full_time',
  'entry',
  6000000,
  9500000,
  'IDR',
  'Memberikan bantuan teknis bagi pengguna komputer kantor, instalasi software berlisensi, manajemen akun user, dan setup perangkat meeting video conference.',
  'Pendidikan minimal SMK / D3 / S1 Teknik Komputer / Informatika. Memahami dasar troubleshooting Windows dan Mac, printer sharing, dan kabel LAN.',
  'BPJS lengkap, tunjangan makan, lembur berbayar, lingkungan kerja kolaboratif.',
  ARRAY['IT Support', 'Helpdesk', 'Hardware', 'Windows', 'LAN'],
  'https://www.jobstreet.co.id/id/job-search/job-vacancy/it-helpdesk',
  NOW() - INTERVAL '1 day',
  md5('IT Helpdesk & Technical Support|PT Solusi Teknologi Nusantara|Bandung')
);
