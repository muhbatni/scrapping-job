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
