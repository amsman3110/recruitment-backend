require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function setupDatabase() {
  try {
    console.log('🔄 Setting up database...');
    console.log('Connecting to:', process.env.DATABASE_URL.split('@')[1]); // Show host only

    // Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT,
        email TEXT UNIQUE NOT NULL,
        password TEXT,
        role TEXT DEFAULT 'candidate',
        current_job_title TEXT,
        specialization TEXT,
        profile_summary TEXT,
        photo_url TEXT,
        cv_url TEXT,
        cv_filename TEXT,
        cv_uploaded_at TIMESTAMP,
        technical_skills TEXT[],
        soft_skills TEXT[],
        experience TEXT,
        education TEXT,
        courses TEXT,
        certificates TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Users table created');

    // Companies table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS companies (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        company_name TEXT,
        industry TEXT,
        specialization TEXT,
        number_of_employees TEXT,
        company_summary TEXT,
        office_location TEXT,
        location_lat DECIMAL,
        location_lng DECIMAL,
        logo_base64 TEXT,
        linkedin_url TEXT,
        website_url TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Companies table created (with linkedin_url and website_url)');

    // Jobs table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS jobs (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        qualifications TEXT,
        location TEXT,
        workplace TEXT,
        country TEXT,
        city TEXT,
        career_level TEXT,
        job_category TEXT,
        job_type TEXT,
        experience_years INTEGER,
        status TEXT DEFAULT 'open',
        posted_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        company_id INTEGER REFERENCES companies(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Jobs table created');

    // Applications table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS applications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
        status TEXT DEFAULT 'applied',
        applied_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, job_id)
      );
    `);
    console.log('✅ Applications table created');

    // Pipeline table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pipeline (
        id SERIAL PRIMARY KEY,
        recruiter_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        candidate_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
        stage TEXT DEFAULT 'screening',
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Pipeline table created');

    // Invitations table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS invitations (
        id SERIAL PRIMARY KEY,
        recruiter_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        candidate_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
        status TEXT DEFAULT 'pending',
        message TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Invitations table created');

    // Questions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS questions (
        id SERIAL PRIMARY KEY,
        job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
        question_text TEXT NOT NULL,
        question_type TEXT DEFAULT 'text',
        options TEXT[],
        required BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Questions table created');

    // Create indexes
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
      CREATE INDEX IF NOT EXISTS idx_jobs_posted_by ON jobs(posted_by);
      CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
      CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);
      CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications(job_id);
      CREATE INDEX IF NOT EXISTS idx_pipeline_recruiter_id ON pipeline(recruiter_id);
      CREATE INDEX IF NOT EXISTS idx_pipeline_candidate_id ON pipeline(candidate_id);
      CREATE INDEX IF NOT EXISTS idx_companies_user_id ON companies(user_id);
    `);
    console.log('✅ Indexes created');

    console.log('\n🎉 Database setup complete!');
    console.log('📋 All tables created successfully with all columns including:');
    console.log('   - linkedin_url in companies table');
    console.log('   - website_url in companies table');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  }
}

setupDatabase();