require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function create50Jobs() {
  try {
    console.log('🚀 Creating 50+ jobs with full details...\n');
    
    // Create/Get recruiter
    const recruiterEmail = 'recruiter@test.com';
    const recruiterPassword = await bcrypt.hash('password123', 10);
    
    let recruiterResult = await pool.query('SELECT id FROM users WHERE email = $1', [recruiterEmail]);
    
    let recruiterId;
    if (recruiterResult.rows.length === 0) {
      recruiterResult = await pool.query(
        `INSERT INTO users (email, password, role, name) VALUES ($1, $2, $3, $4) RETURNING id`,
        [recruiterEmail, recruiterPassword, 'recruiter', 'Tech Recruiter']
      );
      recruiterId = recruiterResult.rows[0].id;
      console.log('✅ Created recruiter account');
    } else {
      recruiterId = recruiterResult.rows[0].id;
      console.log('✅ Using existing recruiter');
    }

    // Create/Get company
    const companyCheck = await pool.query('SELECT id FROM companies WHERE user_id = $1', [recruiterId]);
    let companyId;
    
    if (companyCheck.rows.length > 0) {
      companyId = companyCheck.rows[0].id;
      console.log('✅ Using existing company');
    } else {
      const companyResult = await pool.query(
        `INSERT INTO companies (user_id, company_name, industry, specialization, number_of_employees, company_summary, office_location) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
        [
          recruiterId,
          'TechCorp Solutions',
          'Technology',
          'Software Development & AI',
          '500-1000',
          'Leading technology company specializing in innovative software solutions and artificial intelligence.',
          'Cairo, Egypt'
        ]
      );
      companyId = companyResult.rows[0].id;
      console.log('✅ Created company');
    }

    // Job data with full details
    const jobs = [
      // Tech Jobs
      {
        title: 'Senior Software Engineer',
        description: 'We are seeking an experienced Senior Software Engineer to join our development team. You will be responsible for designing, developing, and maintaining scalable applications using modern technologies.',
        qualifications: 'Bachelor degree in Computer Science or related field. 5+ years of experience in software development. Strong knowledge of JavaScript, Python, or Java. Experience with cloud platforms (AWS/Azure/GCP).',
        location: 'Cairo, Egypt',
        workplace: 'Hybrid',
        country: 'Egypt',
        city: 'Cairo',
        career_level: 'Senior',
        job_category: 'Software Development',
        job_type: 'Full-time',
        experience_years: 5,
        status: 'open'
      },
      {
        title: 'Frontend Developer - React',
        description: 'Join our frontend team to build beautiful, responsive web applications using React and modern JavaScript frameworks. Work on exciting projects for international clients.',
        qualifications: 'Strong proficiency in React.js, HTML5, CSS3, and JavaScript ES6+. Experience with Redux or Context API. Understanding of responsive design and cross-browser compatibility.',
        location: 'Cairo, Egypt',
        workplace: 'Remote',
        country: 'Egypt',
        city: 'Cairo',
        career_level: 'Mid-Level',
        job_category: 'Software Development',
        job_type: 'Full-time',
        experience_years: 3,
        status: 'open'
      },
      {
        title: 'Backend Developer - Node.js',
        description: 'Looking for a skilled Backend Developer to design and implement server-side logic, APIs, and database structures. You will work with cutting-edge technologies and microservices architecture.',
        qualifications: 'Proficiency in Node.js and Express.js. Experience with PostgreSQL or MongoDB. Knowledge of RESTful APIs and authentication systems. Understanding of Docker and CI/CD pipelines.',
        location: 'Alexandria, Egypt',
        workplace: 'On-site',
        country: 'Egypt',
        city: 'Alexandria',
        career_level: 'Mid-Level',
        job_category: 'Software Development',
        job_type: 'Full-time',
        experience_years: 4,
        status: 'open'
      },
      {
        title: 'Full Stack Developer',
        description: 'Seeking a versatile Full Stack Developer to work on both frontend and backend systems. Build complete features from database to user interface.',
        qualifications: 'Experience with React/Vue.js and Node.js. Knowledge of SQL and NoSQL databases. Familiarity with Git, Agile methodologies, and modern development practices.',
        location: 'Cairo, Egypt',
        workplace: 'Hybrid',
        country: 'Egypt',
        city: 'Cairo',
        career_level: 'Mid-Level',
        job_category: 'Software Development',
        job_type: 'Full-time',
        experience_years: 3,
        status: 'open'
      },
      {
        title: 'Mobile App Developer - React Native',
        description: 'Develop cross-platform mobile applications using React Native. Work on consumer-facing apps with millions of users.',
        qualifications: 'Strong knowledge of React Native and mobile development best practices. Experience with iOS and Android platforms. Understanding of mobile UI/UX principles.',
        location: 'Cairo, Egypt',
        workplace: 'Remote',
        country: 'Egypt',
        city: 'Cairo',
        career_level: 'Mid-Level',
        job_category: 'Mobile Development',
        job_type: 'Full-time',
        experience_years: 3,
        status: 'open'
      },
      {
        title: 'iOS Developer - Swift',
        description: 'Join our mobile team to create native iOS applications. Work on innovative features and deliver exceptional user experiences.',
        qualifications: 'Proficiency in Swift and iOS SDK. Experience with UIKit or SwiftUI. Knowledge of Apple Human Interface Guidelines and App Store submission process.',
        location: 'Cairo, Egypt',
        workplace: 'Hybrid',
        country: 'Egypt',
        city: 'Cairo',
        career_level: 'Senior',
        job_category: 'Mobile Development',
        job_type: 'Full-time',
        experience_years: 5,
        status: 'open'
      },
      {
        title: 'Android Developer - Kotlin',
        description: 'Develop high-quality Android applications using Kotlin and modern Android development tools. Contribute to architecture decisions and code reviews.',
        qualifications: 'Strong experience with Kotlin and Android SDK. Familiarity with Jetpack components and Material Design. Experience with MVVM or Clean Architecture.',
        location: 'Giza, Egypt',
        workplace: 'On-site',
        country: 'Egypt',
        city: 'Giza',
        career_level: 'Mid-Level',
        job_category: 'Mobile Development',
        job_type: 'Full-time',
        experience_years: 4,
        status: 'open'
      },
      {
        title: 'DevOps Engineer',
        description: 'Manage and optimize our cloud infrastructure. Implement CI/CD pipelines and ensure system reliability and scalability.',
        qualifications: 'Experience with AWS/Azure/GCP. Strong knowledge of Docker, Kubernetes, and containerization. Proficiency in scripting (Bash, Python). Understanding of infrastructure as code (Terraform/CloudFormation).',
        location: 'Cairo, Egypt',
        workplace: 'Hybrid',
        country: 'Egypt',
        city: 'Cairo',
        career_level: 'Senior',
        job_category: 'DevOps',
        job_type: 'Full-time',
        experience_years: 5,
        status: 'open'
      },
      {
        title: 'Data Scientist',
        description: 'Apply machine learning and statistical analysis to solve complex business problems. Work with large datasets and build predictive models.',
        qualifications: 'Masters degree in Data Science, Statistics, or related field. Proficiency in Python and ML libraries (scikit-learn, TensorFlow, PyTorch). Experience with data visualization tools.',
        location: 'Cairo, Egypt',
        workplace: 'Remote',
        country: 'Egypt',
        city: 'Cairo',
        career_level: 'Senior',
        job_category: 'Data Science',
        job_type: 'Full-time',
        experience_years: 5,
        status: 'open'
      },
      {
        title: 'Machine Learning Engineer',
        description: 'Design and deploy machine learning models in production. Work on cutting-edge AI projects and collaborate with cross-functional teams.',
        qualifications: 'Strong background in machine learning algorithms and deep learning. Experience deploying ML models to production. Knowledge of MLOps practices.',
        location: 'Cairo, Egypt',
        workplace: 'Hybrid',
        country: 'Egypt',
        city: 'Cairo',
        career_level: 'Senior',
        job_category: 'AI/ML',
        job_type: 'Full-time',
        experience_years: 6,
        status: 'open'
      },
      {
        title: 'Cloud Architect',
        description: 'Design and implement enterprise cloud solutions. Lead cloud migration projects and establish best practices for cloud infrastructure.',
        qualifications: 'Extensive experience with cloud platforms (AWS/Azure/GCP). Cloud certifications preferred. Strong understanding of cloud security and compliance.',
        location: 'Cairo, Egypt',
        workplace: 'Hybrid',
        country: 'Egypt',
        city: 'Cairo',
        career_level: 'Expert',
        job_category: 'Cloud Computing',
        job_type: 'Full-time',
        experience_years: 8,
        status: 'open'
      },
      {
        title: 'QA Automation Engineer',
        description: 'Build and maintain automated test suites. Ensure software quality through comprehensive testing strategies.',
        qualifications: 'Experience with test automation frameworks (Selenium, Cypress, Jest). Knowledge of CI/CD integration. Strong analytical and problem-solving skills.',
        location: 'Alexandria, Egypt',
        workplace: 'Remote',
        country: 'Egypt',
        city: 'Alexandria',
        career_level: 'Mid-Level',
        job_category: 'Quality Assurance',
        job_type: 'Full-time',
        experience_years: 3,
        status: 'open'
      },
      {
        title: 'Cybersecurity Specialist',
        description: 'Protect our systems and data from security threats. Conduct security audits, implement security measures, and respond to incidents.',
        qualifications: 'Strong knowledge of security protocols and encryption. Experience with penetration testing and vulnerability assessment. Security certifications (CISSP, CEH) preferred.',
        location: 'Cairo, Egypt',
        workplace: 'On-site',
        country: 'Egypt',
        city: 'Cairo',
        career_level: 'Senior',
        job_category: 'Cybersecurity',
        job_type: 'Full-time',
        experience_years: 6,
        status: 'open'
      },
      {
        title: 'UI/UX Designer',
        description: 'Create beautiful and intuitive user interfaces. Conduct user research and translate insights into design solutions.',
        qualifications: 'Proficiency in Figma, Adobe XD, or Sketch. Strong portfolio demonstrating UX process and UI design skills. Understanding of design systems and accessibility.',
        location: 'Cairo, Egypt',
        workplace: 'Hybrid',
        country: 'Egypt',
        city: 'Cairo',
        career_level: 'Mid-Level',
        job_category: 'Design',
        job_type: 'Full-time',
        experience_years: 3,
        status: 'open'
      },
      {
        title: 'Product Manager',
        description: 'Lead product development from concept to launch. Work with engineering, design, and business teams to deliver exceptional products.',
        qualifications: 'Proven experience in product management. Strong analytical and communication skills. Experience with Agile methodologies and product analytics tools.',
        location: 'Cairo, Egypt',
        workplace: 'Hybrid',
        country: 'Egypt',
        city: 'Cairo',
        career_level: 'Senior',
        job_category: 'Product Management',
        job_type: 'Full-time',
        experience_years: 5,
        status: 'open'
      },

      // Business & Management
      {
        title: 'Technical Lead',
        description: 'Lead a team of developers and guide technical decisions. Mentor junior developers and ensure code quality standards.',
        qualifications: '7+ years of software development experience. Strong leadership and communication skills. Experience with system architecture and design patterns.',
        location: 'Cairo, Egypt',
        workplace: 'On-site',
        country: 'Egypt',
        city: 'Cairo',
        career_level: 'Expert',
        job_category: 'Management',
        job_type: 'Full-time',
        experience_years: 7,
        status: 'open'
      },
      {
        title: 'System Administrator',
        description: 'Maintain and monitor IT infrastructure. Manage servers, networks, and ensure system uptime and performance.',
        qualifications: 'Experience with Linux/Windows server administration. Knowledge of networking, backup solutions, and monitoring tools.',
        location: 'Cairo, Egypt',
        workplace: 'On-site',
        country: 'Egypt',
        city: 'Cairo',
        career_level: 'Mid-Level',
        job_category: 'IT Support',
        job_type: 'Full-time',
        experience_years: 4,
        status: 'open'
      },
      {
        title: 'Business Analyst',
        description: 'Bridge the gap between business needs and technical solutions. Gather requirements and document business processes.',
        qualifications: 'Strong analytical and documentation skills. Experience with requirement gathering and process mapping. Knowledge of Agile methodologies.',
        location: 'Cairo, Egypt',
        workplace: 'Hybrid',
        country: 'Egypt',
        city: 'Cairo',
        career_level: 'Mid-Level',
        job_category: 'Business Analysis',
        job_type: 'Full-time',
        experience_years: 3,
        status: 'open'
      },
      {
        title: 'Project Manager - IT',
        description: 'Manage software development projects from initiation to delivery. Coordinate teams, track progress, and ensure project success.',
        qualifications: 'PMP or similar certification. Experience managing software projects. Strong leadership and stakeholder management skills.',
        location: 'Cairo, Egypt',
        workplace: 'Hybrid',
        country: 'Egypt',
        city: 'Cairo',
        career_level: 'Senior',
        job_category: 'Project Management',
        job_type: 'Full-time',
        experience_years: 5,
        status: 'open'
      },
      {
        title: 'Sales Manager - Software Solutions',
        description: 'Drive software sales and build client relationships. Identify new business opportunities and close deals.',
        qualifications: 'Proven track record in B2B software sales. Excellent communication and negotiation skills. Understanding of technology solutions.',
        location: 'Cairo, Egypt',
        workplace: 'Hybrid',
        country: 'Egypt',
        city: 'Cairo',
        career_level: 'Senior',
        job_category: 'Sales',
        job_type: 'Full-time',
        experience_years: 5,
        status: 'open'
      },
      {
        title: 'Digital Marketing Manager',
        description: 'Develop and execute digital marketing strategies. Manage campaigns across various channels and analyze performance.',
        qualifications: 'Experience with SEO, SEM, social media marketing, and email campaigns. Strong analytical skills and knowledge of marketing tools (Google Analytics, HubSpot).',
        location: 'Cairo, Egypt',
        workplace: 'Remote',
        country: 'Egypt',
        city: 'Cairo',
        career_level: 'Mid-Level',
        job_category: 'Marketing',
        job_type: 'Full-time',
        experience_years: 4,
        status: 'open'
      },
      {
        title: 'HR Manager',
        description: 'Lead HR operations including recruitment, employee relations, and performance management. Build a positive workplace culture.',
        qualifications: 'HR degree or certification. Experience in all HR functions. Strong interpersonal and organizational skills.',
        location: 'Cairo, Egypt',
        workplace: 'On-site',
        country: 'Egypt',
        city: 'Cairo',
        career_level: 'Senior',
        job_category: 'Human Resources',
        job_type: 'Full-time',
        experience_years: 6,
        status: 'open'
      },
      {
        title: 'Financial Analyst',
        description: 'Analyze financial data and provide insights to support business decisions. Prepare reports and forecasts.',
        qualifications: 'Degree in Finance or Accounting. Strong Excel and financial modeling skills. Experience with financial analysis and reporting.',
        location: 'Cairo, Egypt',
        workplace: 'Hybrid',
        country: 'Egypt',
        city: 'Cairo',
        career_level: 'Mid-Level',
        job_category: 'Finance',
        job_type: 'Full-time',
        experience_years: 3,
        status: 'open'
      },
      {
        title: 'Operations Manager',
        description: 'Oversee daily operations and optimize processes. Ensure efficiency and quality in service delivery.',
        qualifications: 'Experience in operations management. Strong problem-solving and process improvement skills. Leadership experience required.',
        location: 'Cairo, Egypt',
        workplace: 'On-site',
        country: 'Egypt',
        city: 'Cairo',
        career_level: 'Senior',
        job_category: 'Operations',
        job_type: 'Full-time',
        experience_years: 6,
        status: 'open'
      },
      {
        title: 'Customer Success Manager',
        description: 'Ensure customer satisfaction and retention. Build strong relationships with clients and drive product adoption.',
        qualifications: 'Experience in customer success or account management. Excellent communication skills. Tech-savvy with understanding of SaaS products.',
        location: 'Cairo, Egypt',
        workplace: 'Remote',
        country: 'Egypt',
        city: 'Cairo',
        career_level: 'Mid-Level',
        job_category: 'Customer Success',
        job_type: 'Full-time',
        experience_years: 3,
        status: 'open'
      },

      // Additional roles
      {
        title: 'Account Executive',
        description: 'Manage client accounts and drive revenue growth. Identify upselling opportunities and ensure client satisfaction.',
        qualifications: 'Sales or account management experience. Strong relationship building skills. Goal-oriented with proven track record.',
        location: 'Alexandria, Egypt',
        workplace: 'Hybrid',
        country: 'Egypt',
        city: 'Alexandria',
        career_level: 'Mid-Level',
        job_category: 'Sales',
        job_type: 'Full-time',
        experience_years: 3,
        status: 'open'
      },
      {
        title: 'Business Development Manager',
        description: 'Identify and pursue new business opportunities. Build partnerships and expand market presence.',
        qualifications: 'Business development or sales experience. Strong networking and negotiation skills. Strategic thinking ability.',
        location: 'Cairo, Egypt',
        workplace: 'Hybrid',
        country: 'Egypt',
        city: 'Cairo',
        career_level: 'Senior',
        job_category: 'Business Development',
        job_type: 'Full-time',
        experience_years: 5,
        status: 'open'
      },
      {
        title: 'Graphic Designer',
        description: 'Create visual content for digital and print media. Design marketing materials, social media graphics, and brand assets.',
        qualifications: 'Proficiency in Adobe Creative Suite (Photoshop, Illustrator, InDesign). Strong portfolio showcasing design skills. Understanding of brand guidelines.',
        location: 'Cairo, Egypt',
        workplace: 'Remote',
        country: 'Egypt',
        city: 'Cairo',
        career_level: 'Junior',
        job_category: 'Design',
        job_type: 'Full-time',
        experience_years: 2,
        status: 'open'
      },
      {
        title: 'Content Writer',
        description: 'Produce engaging content for blogs, websites, and marketing materials. Research topics and write SEO-optimized articles.',
        qualifications: 'Excellent writing and editing skills. Experience with SEO and content management systems. Ability to write for different audiences.',
        location: 'Cairo, Egypt',
        workplace: 'Remote',
        country: 'Egypt',
        city: 'Cairo',
        career_level: 'Mid-Level',
        job_category: 'Content',
        job_type: 'Full-time',
        experience_years: 2,
        status: 'open'
      },
      {
        title: 'SEO Specialist',
        description: 'Optimize website content for search engines. Conduct keyword research and implement SEO strategies.',
        qualifications: 'Experience with SEO tools (Google Analytics, SEMrush, Ahrefs). Knowledge of on-page and off-page SEO. Understanding of search engine algorithms.',
        location: 'Cairo, Egypt',
        workplace: 'Remote',
        country: 'Egypt',
        city: 'Cairo',
        career_level: 'Mid-Level',
        job_category: 'Marketing',
        job_type: 'Full-time',
        experience_years: 3,
        status: 'open'
      },
      {
        title: 'Social Media Manager',
        description: 'Manage social media presence across platforms. Create content calendars and engage with online communities.',
        qualifications: 'Experience managing social media accounts. Knowledge of social media analytics and advertising. Creative content creation skills.',
        location: 'Cairo, Egypt',
        workplace: 'Hybrid',
        country: 'Egypt',
        city: 'Cairo',
        career_level: 'Mid-Level',
        job_category: 'Marketing',
        job_type: 'Full-time',
        experience_years: 3,
        status: 'open'
      },
      {
        title: 'Video Editor',
        description: 'Edit video content for marketing, training, and social media. Create engaging visual stories.',
        qualifications: 'Proficiency in video editing software (Premiere Pro, Final Cut Pro, DaVinci Resolve). Understanding of video production workflow. Creative storytelling skills.',
        location: 'Cairo, Egypt',
        workplace: 'On-site',
        country: 'Egypt',
        city: 'Cairo',
        career_level: 'Mid-Level',
        job_category: 'Media Production',
        job_type: 'Full-time',
        experience_years: 3,
        status: 'open'
      },
      {
        title: 'Accountant',
        description: 'Manage financial records and prepare financial statements. Handle accounts payable/receivable and reconciliations.',
        qualifications: 'Accounting degree or CPA certification. Experience with accounting software (QuickBooks, SAP). Strong attention to detail.',
        location: 'Cairo, Egypt',
        workplace: 'On-site',
        country: 'Egypt',
        city: 'Cairo',
        career_level: 'Mid-Level',
        job_category: 'Accounting',
        job_type: 'Full-time',
        experience_years: 3,
        status: 'open'
      },
      {
        title: 'Legal Advisor',
        description: 'Provide legal counsel on contracts, compliance, and corporate matters. Review agreements and manage legal documentation.',
        qualifications: 'Law degree and bar admission. Experience in corporate law. Strong analytical and negotiation skills.',
        location: 'Cairo, Egypt',
        workplace: 'On-site',
        country: 'Egypt',
        city: 'Cairo',
        career_level: 'Senior',
        job_category: 'Legal',
        job_type: 'Full-time',
        experience_years: 5,
        status: 'open'
      },
      {
        title: 'Administrative Assistant',
        description: 'Provide administrative support to executives and teams. Manage schedules, correspondence, and office operations.',
        qualifications: 'Organizational and multitasking skills. Proficiency in MS Office. Professional communication abilities.',
        location: 'Cairo, Egypt',
        workplace: 'On-site',
        country: 'Egypt',
        city: 'Cairo',
        career_level: 'Entry-Level',
        job_category: 'Administration',
        job_type: 'Full-time',
        experience_years: 1,
        status: 'open'
      },
      {
        title: 'Executive Assistant',
        description: 'Support C-level executives with complex scheduling, travel arrangements, and confidential matters.',
        qualifications: 'Proven experience supporting executives. Excellent organizational skills. Discretion and professionalism required.',
        location: 'Cairo, Egypt',
        workplace: 'On-site',
        country: 'Egypt',
        city: 'Cairo',
        career_level: 'Mid-Level',
        job_category: 'Administration',
        job_type: 'Full-time',
        experience_years: 3,
        status: 'open'
      },
      {
        title: 'Office Manager',
        description: 'Oversee office operations and facilities. Manage vendors, supplies, and ensure smooth daily operations.',
        qualifications: 'Office management experience. Strong organizational and leadership skills. Budget management capabilities.',
        location: 'Giza, Egypt',
        workplace: 'On-site',
        country: 'Egypt',
        city: 'Giza',
        career_level: 'Mid-Level',
        job_category: 'Administration',
        job_type: 'Full-time',
        experience_years: 4,
        status: 'open'
      },

      // More specialized tech roles
      {
        title: 'Solutions Architect',
        description: 'Design technical solutions for complex business requirements. Work with clients to understand needs and propose architectures.',
        qualifications: 'Extensive software development experience. Strong system design skills. Excellent communication and presentation abilities.',
        location: 'Cairo, Egypt',
        workplace: 'Hybrid',
        country: 'Egypt',
        city: 'Cairo',
        career_level: 'Expert',
        job_category: 'Architecture',
        job_type: 'Full-time',
        experience_years: 8,
        status: 'open'
      },
      {
        title: 'Database Administrator',
        description: 'Manage and optimize database systems. Ensure data integrity, performance, and security.',
        qualifications: 'Experience with PostgreSQL, MySQL, or Oracle. Knowledge of database performance tuning. Understanding of backup and recovery procedures.',
        location: 'Cairo, Egypt',
        workplace: 'Hybrid',
        country: 'Egypt',
        city: 'Cairo',
        career_level: 'Senior',
        job_category: 'Database',
        job_type: 'Full-time',
        experience_years: 5,
        status: 'open'
      },
      {
        title: 'Game Developer - Unity',
        description: 'Develop engaging games using Unity engine. Work on gameplay mechanics, graphics, and user experience.',
        qualifications: 'Proficiency in Unity and C#. Understanding of game development lifecycle. Portfolio of published games preferred.',
        location: 'Cairo, Egypt',
        workplace: 'Remote',
        country: 'Egypt',
        city: 'Cairo',
        career_level: 'Mid-Level',
        job_category: 'Game Development',
        job_type: 'Full-time',
        experience_years: 3,
        status: 'open'
      },
      {
        title: 'Blockchain Developer',
        description: 'Build decentralized applications and smart contracts. Work with blockchain technologies and cryptocurrencies.',
        qualifications: 'Experience with Solidity and Ethereum. Understanding of blockchain principles. Knowledge of Web3 technologies.',
        location: 'Cairo, Egypt',
        workplace: 'Remote',
        country: 'Egypt',
        city: 'Cairo',
        career_level: 'Senior',
        job_category: 'Blockchain',
        job_type: 'Full-time',
        experience_years: 4,
        status: 'open'
      },
      {
        title: 'AI Research Engineer',
        description: 'Conduct research in artificial intelligence and machine learning. Publish papers and develop novel algorithms.',
        qualifications: 'PhD or Masters in Computer Science or AI. Publications in top-tier conferences. Strong mathematical background.',
        location: 'Cairo, Egypt',
        workplace: 'Hybrid',
        country: 'Egypt',
        city: 'Cairo',
        career_level: 'Expert',
        job_category: 'Research',
        job_type: 'Full-time',
        experience_years: 6,
        status: 'open'
      },
      {
        title: 'Junior Frontend Developer',
        description: 'Learn and grow as a frontend developer. Work with senior developers to build web applications.',
        qualifications: 'Basic knowledge of HTML, CSS, and JavaScript. Eagerness to learn React or Vue.js. Good problem-solving skills.',
        location: 'Cairo, Egypt',
        workplace: 'On-site',
        country: 'Egypt',
        city: 'Cairo',
        career_level: 'Entry-Level',
        job_category: 'Software Development',
        job_type: 'Full-time',
        experience_years: 1,
        status: 'open'
      },
      {
        title: 'Junior Backend Developer',
        description: 'Start your backend development career. Learn server-side programming and database management.',
        qualifications: 'Basic understanding of programming (Python, Node.js, or Java). Willingness to learn. Good communication skills.',
        location: 'Alexandria, Egypt',
        workplace: 'On-site',
        country: 'Egypt',
        city: 'Alexandria',
        career_level: 'Entry-Level',
        job_category: 'Software Development',
        job_type: 'Full-time',
        experience_years: 1,
        status: 'open'
      },
      {
        title: 'Data Analyst',
        description: 'Analyze data to extract insights and support decision-making. Create reports and dashboards.',
        qualifications: 'Proficiency in SQL and Excel. Experience with data visualization tools (Tableau, Power BI). Strong analytical thinking.',
        location: 'Cairo, Egypt',
        workplace: 'Remote',
        country: 'Egypt',
        city: 'Cairo',
        career_level: 'Mid-Level',
        job_category: 'Data Analysis',
        job_type: 'Full-time',
        experience_years: 2,
        status: 'open'
      },
      {
        title: 'Scrum Master',
        description: 'Facilitate Agile ceremonies and remove impediments for development teams. Coach teams on Scrum practices.',
        qualifications: 'Scrum Master certification (CSM/PSM). Experience with Agile methodologies. Strong facilitation and coaching skills.',
        location: 'Cairo, Egypt',
        workplace: 'Hybrid',
        country: 'Egypt',
        city: 'Cairo',
        career_level: 'Mid-Level',
        job_category: 'Agile',
        job_type: 'Full-time',
        experience_years: 3,
        status: 'open'
      },
      {
        title: 'Technical Writer',
        description: 'Create technical documentation, API references, and user guides. Translate complex technical concepts into clear documentation.',
        qualifications: 'Excellent writing skills. Technical background or ability to understand technical concepts. Experience with documentation tools.',
        location: 'Cairo, Egypt',
        workplace: 'Remote',
        country: 'Egypt',
        city: 'Cairo',
        career_level: 'Mid-Level',
        job_category: 'Documentation',
        job_type: 'Full-time',
        experience_years: 2,
        status: 'open'
      },
      {
        title: 'Network Engineer',
        description: 'Design, implement, and maintain network infrastructure. Ensure network security and performance.',
        qualifications: 'Network certifications (CCNA/CCNP). Experience with routers, switches, and firewalls. Knowledge of network protocols.',
        location: 'Cairo, Egypt',
        workplace: 'On-site',
        country: 'Egypt',
        city: 'Cairo',
        career_level: 'Senior',
        job_category: 'Networking',
        job_type: 'Full-time',
        experience_years: 5,
        status: 'open'
      },
      {
        title: 'IT Support Specialist',
        description: 'Provide technical support to end users. Troubleshoot hardware and software issues.',
        qualifications: 'IT support experience. Knowledge of Windows/Mac systems. Good customer service and problem-solving skills.',
        location: 'Giza, Egypt',
        workplace: 'On-site',
        country: 'Egypt',
        city: 'Giza',
        career_level: 'Junior',
        job_category: 'IT Support',
        job_type: 'Full-time',
        experience_years: 2,
        status: 'open'
      },
      {
        title: 'Sales Executive - Tech Products',
        description: 'Sell technology products and services to businesses. Build relationships and meet sales targets.',
        qualifications: 'Sales experience, preferably in tech. Excellent communication and presentation skills. Self-motivated and target-driven.',
        location: 'Cairo, Egypt',
        workplace: 'Hybrid',
        country: 'Egypt',
        city: 'Cairo',
        career_level: 'Mid-Level',
        job_category: 'Sales',
        job_type: 'Full-time',
        experience_years: 2,
        status: 'open'
      },
      {
        title: 'Customer Support Representative',
        description: 'Assist customers with product inquiries and issues. Provide excellent customer service via phone, email, and chat.',
        qualifications: 'Customer service experience. Excellent communication skills. Patience and problem-solving abilities.',
        location: 'Cairo, Egypt',
        workplace: 'Remote',
        country: 'Egypt',
        city: 'Cairo',
        career_level: 'Entry-Level',
        job_category: 'Customer Support',
        job_type: 'Full-time',
        experience_years: 1,
        status: 'open'
      },
      {
        title: 'Recruitment Specialist',
        description: 'Source, screen, and hire talent for tech positions. Manage the full recruitment cycle.',
        qualifications: 'Recruiting or HR experience. Knowledge of tech roles and skills. Strong interviewing and assessment skills.',
        location: 'Cairo, Egypt',
        workplace: 'Hybrid',
        country: 'Egypt',
        city: 'Cairo',
        career_level: 'Mid-Level',
        job_category: 'Human Resources',
        job_type: 'Full-time',
        experience_years: 3,
        status: 'open'
      }
    ];

    // Insert all jobs
    let count = 0;
    for (const job of jobs) {
      await pool.query(
        `INSERT INTO jobs (
          title, description, qualifications, location, workplace,
          country, city, career_level, job_category, job_type,
          experience_years, status, posted_by, company_id
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
        [
          job.title,
          job.description,
          job.qualifications,
          job.location,
          job.workplace,
          job.country,
          job.city,
          job.career_level,
          job.job_category,
          job.job_type,
          job.experience_years,
          job.status,
          recruiterId,
          companyId
        ]
      );
      count++;
      console.log(`✅ Created job ${count}: ${job.title}`);
    }

    console.log(`\n🎉 Successfully created ${count} jobs!`);
    console.log('\n📋 Test Login Credentials:');
    console.log('Email: recruiter@test.com');
    console.log('Password: password123');
    console.log('\n✅ All done!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

create50Jobs();