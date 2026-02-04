// add-test-jobs.js
const API_URL = "https://recruitment-backend-production-7c10.up.railway.app";

const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc3MDIwMjU5OSwiZXhwIjoxNzcwODA3Mzk5fQ.4cWkurQNaIlsQ9DWNXF7LCIFDdsbmTZZoF3DXqE855M";

const testJobs = [
  {
    title: "Senior React Native Developer",
    description: "We're looking for an experienced React Native developer to join our mobile team. You'll be working on a cutting-edge recruitment platform used by thousands of job seekers daily.",
    qualifications: "5+ years React Native experience, TypeScript, REST APIs, State Management (Redux/Context), Git, Agile methodologies",
    location: "Cairo, Egypt",
    company_name: "TechCorp Solutions",
    experience_years: 5
  },
  {
    title: "Full Stack Node.js Developer",
    description: "Join our backend team to build scalable APIs and microservices. Work with modern technologies including Node.js, PostgreSQL, and Docker.",
    qualifications: "3+ years Node.js/Express, PostgreSQL, RESTful APIs, Docker, CI/CD pipelines, Strong problem-solving skills",
    location: "Remote",
    company_name: "DevHub Inc",
    experience_years: 3
  },
  {
    title: "Junior Frontend Developer",
    description: "Great opportunity for junior developers to grow their skills. Work with React, learn best practices, and contribute to real-world projects.",
    qualifications: "1+ year JavaScript/React, HTML/CSS, Basic Git knowledge, Willingness to learn, Team player",
    location: "Alexandria, Egypt",
    company_name: "StartupLab",
    experience_years: 1
  },
  {
    title: "UI/UX Designer",
    description: "Design beautiful and intuitive user interfaces for mobile and web applications. Collaborate with developers to bring designs to life.",
    qualifications: "2+ years UI/UX design, Figma proficiency, Mobile-first design, User research, Portfolio required",
    location: "Cairo, Egypt",
    company_name: "Design Studio Pro",
    experience_years: 2
  },
  {
    title: "DevOps Engineer",
    description: "Manage cloud infrastructure and CI/CD pipelines. Ensure high availability and scalability of our platform.",
    qualifications: "3+ years DevOps, AWS/GCP, Docker/Kubernetes, CI/CD (GitHub Actions/Jenkins), Monitoring tools",
    location: "Remote",
    company_name: "CloudTech Systems",
    experience_years: 3
  }
];

async function addJobs() {
  console.log("🚀 Adding test jobs to database...\n");

  for (const job of testJobs) {
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
        console.log(`✅ Added: ${job.title}`);
      } else {
        console.log(`❌ Failed: ${job.title} - ${data.error || data.message}`);
      }
    } catch (error) {
      console.log(`❌ Error adding ${job.title}:`, error.message);
    }
  }

  console.log("\n🎉 Done! Check your app's Jobs tab.");
}

addJobs();