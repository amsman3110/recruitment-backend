/* ===============================
   USERS TABLE
   Stores authentication + full candidate/recruiter profile
================================ */

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,

  -- Basic Info
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  password TEXT,  -- Changed from password_hash to match code

  -- Role
  role TEXT DEFAULT 'candidate',

  -- Candidate Profile Fields
  current_job_title TEXT,
  specialization TEXT,
  profile_summary TEXT,

  -- Photo and CV (stored as URLs/base64)
  photo_url TEXT,
  cv_url TEXT,

  -- Skills (stored as JSON arrays)
  technical_skills TEXT[],
  soft_skills TEXT[],

  -- Additional Profile Sections
  experience TEXT,
  education TEXT,
  courses TEXT,
  certificates TEXT,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);


/* ===============================
   JOBS TABLE
   Job listings created by recruiters
================================ */

CREATE TABLE IF NOT EXISTS jobs (
  id SERIAL PRIMARY KEY,

  title TEXT NOT NULL,
  description TEXT,
  qualifications TEXT,

  location TEXT,
  company_name TEXT,
  experience_years INTEGER,

  posted_by INTEGER REFERENCES users(id) ON DELETE SET NULL,

  created_at TIMESTAMP DEFAULT NOW()
);


/* ===============================
   APPLICATIONS TABLE
   Candidates applying to jobs
================================ */

CREATE TABLE IF NOT EXISTS applications (
  id SERIAL PRIMARY KEY,

  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,

  status TEXT DEFAULT 'applied',

  applied_at TIMESTAMP DEFAULT NOW(),

  -- Prevent duplicate applications
  UNIQUE(user_id, job_id)
);


/* ===============================
   INDEXES FOR PERFORMANCE
================================ */

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_jobs_posted_by ON jobs(posted_by);
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications(job_id);