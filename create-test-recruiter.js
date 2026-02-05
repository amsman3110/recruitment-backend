require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function createTestRecruiter() {
  try {
    console.log('Creating test recruiter account...');
    
    const email = 'recruiter3@test.com';
    const password = 'password123';
    const name = 'Test Recruiter';
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Check if user already exists
    const existing = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    if (existing.rows.length > 0) {
      console.log('❌ User already exists! Updating password...');
      
      // Update the password
      await pool.query(
        'UPDATE users SET password = $1, role = $2 WHERE email = $3',
        [hashedPassword, 'recruiter', email]
      );
      
      console.log('✅ Password updated for:', email);
    } else {
      // Insert new recruiter
      const result = await pool.query(
        'INSERT INTO users (email, password, role, name) VALUES ($1, $2, $3, $4) RETURNING *',
        [email, hashedPassword, 'recruiter', name]
      );
      
      console.log('✅ Test recruiter created successfully!');
    }
    
    console.log('\n📋 Login credentials:');
    console.log('Email: recruiter3@test.com');
    console.log('Password: password123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createTestRecruiter();