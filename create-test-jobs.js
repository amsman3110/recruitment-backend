require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function createTestData() {
  try {
    console.log('Creating test data with 35 jobs...\n');
    
    const recruiterEmail = 'recruiter@test.com';
    const recruiterPassword = await bcrypt.hash('password123', 10);
    
    let recruiterResult = await pool.query('SELECT id FROM users WHERE email = $1', [recruiterEmail]);
    
    let recruiterId;
    if (recruiterResult.rows.length === 0) {
      recruiterResult = await pool.query(`INSERT INTO users (email, password, role, name) VALUES ($1, $2, $3, $4) RETURNING id`, [recruiterEmail, recruiterPassword, 'recruiter', 'John Recruiter']);
      recruiterId = recruiterResult.rows[0].id;
    } else {
      recruiterId = recruiterResult.rows[0].id;
    }

    const companyCheck = await pool.query('SELECT id FROM companies WHERE user_id = $1', [recruiterId]);
    let companyId = companyCheck.rows.length > 0 ? companyCheck.rows[0].id : (await pool.query(`INSERT INTO companies (user_id, company_name, industry) VALUES ($1, $2, $3) RETURNING id`, [recruiterId, 'TechCorp', 'Tech'])).rows[0].id;

    const jobTitles = ['Senior Software Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Mobile App Developer', 'DevOps Engineer', 'Data Scientist', 'Machine Learning Engineer', 'Cloud Architect', 'QA Automation Engineer', 'Cybersecurity Specialist', 'UI/UX Designer', 'Product Manager', 'Technical Lead', 'System Administrator', 'Business Analyst', 'Project Manager', 'Sales Manager', 'Marketing Manager', 'HR Manager', 'Financial Analyst', 'Operations Manager', 'Customer Success Manager', 'Account Executive', 'Business Development Manager', 'Graphic Designer', 'Content Writer', 'SEO Specialist', 'Social Media Manager', 'Video Editor', 'Accountant', 'Legal Advisor', 'Administrative Assistant', 'Executive Assistant', 'Office Manager'];

    let count = 0;
    for (let i = 0; i < jobTitles.length; i++) {
      const title = jobTitles[i];
      const exp = Math.floor(Math.random() * 8) + 1;
      await pool.query(`INSERT INTO jobs (title, description, qualifications, location, workplace, country, city, job_type, experience_years, status, posted_by, company_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`, [title, `Join our team as ${title}`, `${exp}+ years experience required`, 'Cairo, Egypt', 'Hybrid', 'Egypt', 'Cairo', 'Full-time', exp, 'open', recruiterId, companyId]);
      count++;
      console.log(`Job ${count}: ${title}`);
    }

    console.log(`\nDone! Created ${count} jobs`);
    console.log('Login: recruiter@test.com / password123');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

createTestData();