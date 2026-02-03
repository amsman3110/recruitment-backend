const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Function to initialize the database schema
async function initDb() {
  try {
    // Path to the schema.sql file in the 'src' folder
    const schemaPath = path.join(__dirname, "../schema.sql");

    // Check if the schema.sql file exists
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, "utf-8");

      // Execute the schema file to create tables and structures
      await pool.query(schema);
      console.log("✅ Database schema initialized successfully.");
    } else {
      console.log("⚠️ Error: Schema file 'schema.sql' does not exist. Please ensure it is in the correct location.");
    }

    // Run migration to add missing columns
    const migrationPath = path.join(__dirname, "../migrations/001_add_profile_columns.js");
    if (fs.existsSync(migrationPath)) {
      const { runMigration } = require(migrationPath);
      await runMigration();
    }

  } catch (error) {
    console.error("❌ Database initialization failed:", error.message);
  }
}

// Export the pool for querying and the initDb function to initialize schema
module.exports = {
  pool,
  initDb,
};