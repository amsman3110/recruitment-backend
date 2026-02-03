require("dotenv").config();
const { Pool } = require("pg");

const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    })
  : null;

async function initDb() {
  if (!pool) {
    console.log("ℹ️ Skipping DB init (no DATABASE_URL)");
    return;
  }

  try {
    await pool.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

      CREATE TABLE IF NOT EXISTS candidates (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name TEXT NOT NULL,
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

    console.log("✅ Database initialized");
  } catch (err) {
    console.error("❌ DB INIT ERROR:", err);
  }
}

module.exports = pool;
module.exports.initDb = initDb;
