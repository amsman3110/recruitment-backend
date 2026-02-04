// Add 20 diverse test jobs to test all filters
// node add-20-test-jobs.js

const API_URL = "https://recruitment-backend-production-7c10.up.railway.app";
const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjYsInJvbGUiOiJjYW5kaWRhdGUiLCJpYXQiOjE3NzAyMjI4MTIsImV4cCI6MTc3MDgyNzYxMn0.fNw8QXWL8jh8XBhGLL7tSaYPLi-pQ8roiNY0A4Y2qng";

const testJobs = [
  // Egypt Jobs
  {
    title: "Senior React Native Developer",
    description: "Build mobile apps for recruitment platform. Work with modern tech stack including TypeScript and Redux.",
    qualifications: "5+ years React Native, TypeScript, REST APIs, State Management",
    location: "Cairo, Egypt",
    company_name: "TechCorp Solutions",
    experience_years: 5,
    workplace: "hybrid",
    country: "Egypt",
    city: "Cairo",
    career_level: "Senior",
    job_category: "Software Development",
    job_type: "Full-Time"
  },
  {
    title: "Junior UI/UX Designer",
    description: "Design beautiful mobile and web interfaces. Learn from senior designers.",
    qualifications: "1+ year design, Figma proficiency, Portfolio required",
    location: "Alexandria, Egypt",
    company_name: "Design Studio Pro",
    experience_years: 1,
    workplace: "onsite",
    country: "Egypt",
    city: "Alexandria",
    career_level: "Junior",
    job_category: "Design",
    job_type: "Full-Time"
  },
  {
    title: "Freelance Content Writer",
    description: "Create engaging tech content for blog and social media.",
    qualifications: "Strong writing skills, Tech knowledge, SEO basics",
    location: "Remote",
    company_name: "Content Hub Egypt",
    experience_years: 2,
    workplace: "remote",
    country: "Egypt",
    city: "Cairo",
    career_level: "Mid-Senior",
    job_category: "Marketing",
    job_type: "Freelance"
  },
  {
    title: "Data Scientist",
    description: "Analyze user behavior data and build prediction models.",
    qualifications: "3+ years Python, ML, SQL, Statistical analysis",
    location: "Cairo, Egypt",
    company_name: "DataInsights",
    experience_years: 3,
    workplace: "hybrid",
    country: "Egypt",
    city: "Cairo",
    career_level: "Mid-Senior",
    job_category: "Data Science",
    job_type: "Full-Time"
  },
  
  // UAE Jobs
  {
    title: "DevOps Manager",
    description: "Lead infrastructure team. Manage CI/CD pipelines and cloud resources.",
    qualifications: "5+ years DevOps, AWS/Azure, Kubernetes, Leadership",
    location: "Dubai, UAE",
    company_name: "CloudTech Systems",
    experience_years: 5,
    workplace: "hybrid",
    country: "UAE",
    city: "Dubai",
    career_level: "Manager",
    job_category: "DevOps",
    job_type: "Full-Time"
  },
  {
    title: "Product Manager",
    description: "Define product strategy and roadmap for fintech platform.",
    qualifications: "4+ years product management, Agile, User research",
    location: "Dubai, UAE",
    company_name: "FinTech Innovations",
    experience_years: 4,
    workplace: "onsite",
    country: "UAE",
    city: "Dubai",
    career_level: "Manager",
    job_category: "Product Management",
    job_type: "Full-Time"
  },
  {
    title: "Senior Backend Developer",
    description: "Build scalable APIs using Node.js and microservices.",
    qualifications: "5+ years Node.js, PostgreSQL, Redis, Docker",
    location: "Abu Dhabi, UAE",
    company_name: "Tech Ventures",
    experience_years: 5,
    workplace: "hybrid",
    country: "UAE",
    city: "Abu Dhabi",
    career_level: "Senior",
    job_category: "Software Development",
    job_type: "Full-Time"
  },
  
  // Saudi Arabia Jobs
  {
    title: "QA Team Leader",
    description: "Lead quality assurance team. Define testing strategy.",
    qualifications: "4+ years QA, Automation, Team leadership",
    location: "Riyadh, Saudi Arabia",
    company_name: "Quality First",
    experience_years: 4,
    workplace: "onsite",
    country: "Saudi Arabia",
    city: "Riyadh",
    career_level: "Team Leader",
    job_category: "Quality Assurance",
    job_type: "Full-Time"
  },
  {
    title: "Cybersecurity Specialist",
    description: "Protect systems from threats. Conduct security audits.",
    qualifications: "3+ years security, CISSP certified, Penetration testing",
    location: "Jeddah, Saudi Arabia",
    company_name: "SecureNet",
    experience_years: 3,
    workplace: "hybrid",
    country: "Saudi Arabia",
    city: "Jeddah",
    career_level: "Mid-Senior",
    job_category: "Cybersecurity",
    job_type: "Full-Time"
  },
  {
    title: "Sales Executive",
    description: "Drive B2B sales for enterprise software solutions.",
    qualifications: "2+ years B2B sales, CRM experience, Arabic/English",
    location: "Riyadh, Saudi Arabia",
    company_name: "SalesForce Arabia",
    experience_years: 2,
    workplace: "onsite",
    country: "Saudi Arabia",
    city: "Riyadh",
    career_level: "Mid-Senior",
    job_category: "Sales",
    job_type: "Full-Time"
  },
  
  // Jordan Jobs
  {
    title: "Part-Time Data Analyst",
    description: "Analyze business data and create reports. Flexible hours.",
    qualifications: "2+ years data analysis, SQL, Python, Excel",
    location: "Amman, Jordan",
    company_name: "Business Intelligence",
    experience_years: 2,
    workplace: "remote",
    country: "Jordan",
    city: "Amman",
    career_level: "Mid-Senior",
    job_category: "Data Science",
    job_type: "Part-Time"
  },
  {
    title: "HR Manager",
    description: "Lead HR operations. Recruitment, training, and culture.",
    qualifications: "5+ years HR, SHRM certified, Leadership",
    location: "Amman, Jordan",
    company_name: "People First",
    experience_years: 5,
    workplace: "onsite",
    country: "Jordan",
    city: "Amman",
    career_level: "Manager",
    job_category: "Human Resources",
    job_type: "Full-Time"
  },
  
  // Kuwait Jobs
  {
    title: "Senior Financial Analyst",
    description: "Provide financial insights and forecasting for leadership.",
    qualifications: "5+ years finance, CFA preferred, Advanced Excel",
    location: "Kuwait City, Kuwait",
    company_name: "Gulf Finance Corp",
    experience_years: 5,
    workplace: "hybrid",
    country: "Kuwait",
    city: "Kuwait City",
    career_level: "Senior",
    job_category: "Finance",
    job_type: "Full-Time"
  },
  {
    title: "Customer Success Manager",
    description: "Ensure customer satisfaction and drive product adoption.",
    qualifications: "3+ years customer success, SaaS experience",
    location: "Kuwait City, Kuwait",
    company_name: "SaaS Solutions",
    experience_years: 3,
    workplace: "hybrid",
    country: "Kuwait",
    city: "Kuwait City",
    career_level: "Mid-Senior",
    job_category: "Customer Success",
    job_type: "Full-Time"
  },
  
  // Qatar Jobs
  {
    title: "Executive Director",
    description: "Lead company operations and strategy. Report to CEO.",
    qualifications: "10+ years leadership, MBA, Industry expertise",
    location: "Doha, Qatar",
    company_name: "Global Enterprises",
    experience_years: 10,
    workplace: "onsite",
    country: "Qatar",
    city: "Doha",
    career_level: "Executive",
    job_category: "Operations",
    job_type: "Full-Time"
  },
  {
    title: "IT Support Specialist",
    description: "Provide technical support to employees. Troubleshoot issues.",
    qualifications: "2+ years IT support, Windows/Mac, Network basics",
    location: "Doha, Qatar",
    company_name: "Tech Support Qatar",
    experience_years: 2,
    workplace: "onsite",
    country: "Qatar",
    city: "Doha",
    career_level: "Junior",
    job_category: "IT Support",
    job_type: "Full-Time"
  },
  
  // Remote Jobs
  {
    title: "Remote Full Stack Developer",
    description: "Build web apps with React and Node.js. Work from anywhere.",
    qualifications: "3+ years full stack, React, Node.js, MongoDB",
    location: "Remote",
    company_name: "Remote Tech Co",
    experience_years: 3,
    workplace: "remote",
    country: "Egypt",
    city: "Cairo",
    career_level: "Mid-Senior",
    job_category: "Software Development",
    job_type: "Full-Time"
  },
  {
    title: "Freelance Graphic Designer",
    description: "Create visual content for social media and marketing.",
    qualifications: "2+ years design, Adobe Suite, Branding experience",
    location: "Remote",
    company_name: "Creative Agency",
    experience_years: 2,
    workplace: "remote",
    country: "UAE",
    city: "Dubai",
    career_level: "Mid-Senior",
    job_category: "Design",
    job_type: "Freelance"
  },
  {
    title: "Part-Time Business Consultant",
    description: "Advise startups on business strategy and operations.",
    qualifications: "5+ years consulting, MBA, Startup experience",
    location: "Remote",
    company_name: "Startup Advisors",
    experience_years: 5,
    workplace: "remote",
    country: "Saudi Arabia",
    city: "Riyadh",
    career_level: "Senior Manager",
    job_category: "Consulting",
    job_type: "Part-Time"
  },
  {
    title: "Engineering Manager",
    description: "Lead engineering team. Define technical architecture.",
    qualifications: "7+ years engineering, 2+ years management",
    location: "Dubai, UAE",
    company_name: "Engineering Excellence",
    experience_years: 7,
    workplace: "hybrid",
    country: "UAE",
    city: "Dubai",
    career_level: "Senior Manager",
    job_category: "Engineering",
    job_type: "Full-Time"
  }
];

async function addJobs() {
  console.log("🚀 Adding 20 diverse test jobs...\n");

  for (let i = 0; i < testJobs.length; i++) {
    const job = testJobs[i];
    try {
      const response = await fetch(`${API_URL}/jobs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${TOKEN}`
        },
        body: JSON.stringify(job)
      });

      const data = await response.json();

      if (response.ok) {
        console.log(`✅ ${i+1}/20 Added: ${job.title} (${job.workplace}, ${job.city})`);
      } else {
        console.log(`❌ ${i+1}/20 Failed: ${job.title} - ${data.error || data.message}`);
      }
    } catch (error) {
      console.log(`❌ ${i+1}/20 Error: ${job.title} - ${error.message}`);
    }
  }

  console.log("\n🎉 Done! Added 20 jobs with diverse filters:");
  console.log("📍 Countries: Egypt, UAE, Saudi Arabia, Jordan, Kuwait, Qatar");
  console.log("💼 Workplaces: Onsite, Hybrid, Remote");
  console.log("👔 Career Levels: Junior, Mid-Senior, Senior, Manager, Executive");
  console.log("🏢 Job Types: Full-Time, Part-Time, Freelance");
  console.log("📂 Categories: Software Dev, Design, Marketing, Sales, HR, Finance, etc.");
  console.log("\n✨ Go test your filters now!");
}

addJobs();