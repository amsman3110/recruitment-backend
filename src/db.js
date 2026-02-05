const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Function to initialize the database schema
async function initDb() {
  try {
    // Path to schema.sql (one level up from src folder)
    const schemaPath = path.join(__dirname, "../schema.sql");

    // Check if the schema.sql file exists
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, "utf-8");

      // Execute the schema file to create tables and structures
      await pool.query(schema);
      console.log("Database schema initialized successfully.");
    } else {
      console.log("Schema file schema.sql does not exist.");
    }

    // ============================================
    // RUN MIGRATION: Add missing columns
    // ============================================
    console.log("Running database migration...");

    // Add missing columns to users table
    await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS name TEXT;");
    await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS technical_skills TEXT[];");
    await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS soft_skills TEXT[];");
    await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS experience TEXT;");
    await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS education TEXT;");
    await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS courses TEXT;");
    await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS certificates TEXT;");

    // Add experience_years to jobs table
    await pool.query("ALTER TABLE jobs ADD COLUMN IF NOT EXISTS experience_years INTEGER;");

    // Add missing status and other columns to jobs table
    await pool.query("ALTER TABLE jobs ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'open';");
    await pool.query("ALTER TABLE jobs ADD COLUMN IF NOT EXISTS workplace TEXT;");
    await pool.query("ALTER TABLE jobs ADD COLUMN IF NOT EXISTS country TEXT;");
    await pool.query("ALTER TABLE jobs ADD COLUMN IF NOT EXISTS city TEXT;");
    await pool.query("ALTER TABLE jobs ADD COLUMN IF NOT EXISTS career_level TEXT;");
    await pool.query("ALTER TABLE jobs ADD COLUMN IF NOT EXISTS job_category TEXT;");
    await pool.query("ALTER TABLE jobs ADD COLUMN IF NOT EXISTS job_type TEXT;");
    await pool.query("ALTER TABLE jobs ADD COLUMN IF NOT EXISTS company_id INTEGER;");

    // Add LinkedIn and Website columns to companies table
    await pool.query("ALTER TABLE companies ADD COLUMN IF NOT EXISTS linkedin_url TEXT;");
    await pool.query("ALTER TABLE companies ADD COLUMN IF NOT EXISTS website_url TEXT;");
    console.log("✅ Added linkedin_url and website_url to companies table");

    // Check if password_hash exists and rename it to password
    const checkColumn = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'password_hash';");

    if (checkColumn.rows.length > 0) {
      await pool.query("ALTER TABLE users RENAME COLUMN password_hash TO password;");
      console.log("Renamed password_hash to password");
    }

    // Add unique constraint for applications table
    await pool.query("ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_user_job_unique;");
    await pool.query("ALTER TABLE applications ADD CONSTRAINT applications_user_job_unique UNIQUE(user_id, job_id);");

    console.log("Migration completed successfully!");

    // Verify columns count
    const result = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'users';");
    console.log("Users table now has " + result.rows.length + " columns");

  } catch (error) {
    console.error("Database initialization failed: " + error.message);
  }
}

// Export the pool for querying and the initDb function to initialize schema
module.exports = pool;