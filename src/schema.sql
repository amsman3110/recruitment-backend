/* ===============================
   USERS TABLE
   Stores authentication + full candidate profile
================================ */

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,

  name TEXT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,

  role TEXT DEFAULT 'candidate',

  current_job_title TEXT,
  specialization TEXT,
  profile_summary TEXT,

  photo_url TEXT,
  cv_url TEXT,

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

  applied_at TIMESTAMP DEFAULT NOW()
);
