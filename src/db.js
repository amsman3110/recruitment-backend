require("dotenv").config();
const { Pool } = require("pg");

/**
 * Determine if DATABASE_URL is usable
 * (Railway injects a real URL in production only)
 */
const hasValidDatabaseUrl =
  typeof process.env.DATABASE_URL === "string" &&
  process.env.DATABASE_URL.startsWith("postgres");

/**
 * Create pool ONLY if DATABASE_URL is valid
 */
const pool = hasValidDatabaseUrl
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
    })
  : null;

/**
 * BE-027
 * Initialize database schema for candidates
 * - Runs ONLY when database is available
 * - Skips safely in local development
 */
async function initDb() {
  if (!pool) {
    console.log("Database not initialized (no DATABASE_URL)");
    return;
  }

  await pool.query(`
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    CREATE TABLE IF NOT EXISTS candidates (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

      name VARCHAR(150) NOT NULL,
      email VARCHAR(150) UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,

      specialization VARCHAR(150),
      current_job_title VARCHAR(150),
      profile_summary TEXT,
      experience TEXT,

      technical_skills TEXT[],
      soft_skills TEXT[],

      education JSONB,
      courses JSONB,
      certificates JSONB,

      cv_url TEXT,
      photo_url TEXT,

      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `);
}

module.exports = {
  pool,
  initDb,
};
