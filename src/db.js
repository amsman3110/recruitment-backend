require("dotenv").config();
const { Pool } = require("pg");

/* ===============================
   CREATE POOL (RENDER SAFE)
================================ */
const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    })
  : null;

/* ===============================
   INIT DATABASE (AUTO FIX)
================================ */
async function initDb() {
  if (!pool) {
    console.log("ℹ️ Skipping DB init (no DATABASE_URL)");
    return;
  }

  try {
    // Enable UUID extension
    await pool.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

    // Ensure candidates table exists (DEV MODE)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS candidates (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

        name TEXT NOT NULL,

        email TEXT,
        password_hash TEXT,

        specialization TEXT,
        current_job_title TEXT,
        profile_summary TEXT,
        experience JSONB,

        technical_skills TEXT[],
        soft_skills TEXT[],

        education JSONB,

        photo_url TEXT,
        cv_url TEXT,

        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // 🔧 FIX OLD CONSTRAINTS (CRITICAL)
    await pool.query(`
      ALTER TABLE candidates
      ALTER COLUMN email DROP NOT NULL;
    `);

    await pool.query(`
      ALTER TABLE candidates
      ALTER COLUMN password_hash DROP NOT NULL;
    `);

    console.log("✅ Database initialized & constraints fixed");
  } catch (error) {
    console.error("❌ DB INIT ERROR:", error);
  }
}

/* ===============================
   EXPORTS
================================ */
module.exports = pool;
module.exports.initDb = initDb;
