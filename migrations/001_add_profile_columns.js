const { pool } = require("../src/db");

/**
 * Migration: Add missing profile columns to users table
 * This runs once to update the existing database schema
 */
async function runMigration() {
  console.log("🔄 Running migration: Add profile columns...");

  try {
    // Add missing columns to users table
    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS name TEXT;
    `);
    
    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS technical_skills TEXT[];
    `);
    
    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS soft_skills TEXT[];
    `);
    
    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS experience TEXT;
    `);
    
    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS education TEXT;
    `);
    
    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS courses TEXT;
    `);
    
    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS certificates TEXT;
    `);

    // Add experience_years to jobs table
    await pool.query(`
      ALTER TABLE jobs ADD COLUMN IF NOT EXISTS experience_years INTEGER;
    `);

    // Rename password_hash to password if it exists
    const checkColumn = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'password_hash';
    `);

    if (checkColumn.rows.length > 0) {
      await pool.query(`
        ALTER TABLE users RENAME COLUMN password_hash TO password;
      `);
      console.log("✅ Renamed password_hash to password");
    }

    // Add unique constraint for applications
    await pool.query(`
      ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_user_job_unique;
    `);
    
    await pool.query(`
      ALTER TABLE applications ADD CONSTRAINT applications_user_job_unique UNIQUE(user_id, job_id);
    `);

    console.log("✅ Migration completed successfully!");
    
    // Verify columns
    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users'
      ORDER BY ordinal_position;
    `);
    
    console.log(`✅ Users table now has ${result.rows.length} columns`);
    
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    throw error;
  }
}

module.exports = { runMigration };