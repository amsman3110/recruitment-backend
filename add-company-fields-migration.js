const pool = require('./src/db');

async function addCompanyFields() {
  try {
    console.log('Adding LinkedIn and Website fields to companies table...');
    
    // Add linkedin_url column
    await pool.query(`
      ALTER TABLE companies 
      ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
    `);
    console.log('✅ Added linkedin_url column');
    
    // Add website_url column
    await pool.query(`
      ALTER TABLE companies 
      ADD COLUMN IF NOT EXISTS website_url TEXT;
    `);
    console.log('✅ Added website_url column');
    
    console.log('✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    process.exit(1);
  }
}

addCompanyFields();