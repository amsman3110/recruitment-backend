console.log("🔥🔥🔥 I AM RUNNING backend/index.js 🔥🔥🔥");

const express = require("express");
const app = express();

/**
 * Enable JSON body parsing
 */
app.use(express.json());

/**
 * Authentication middleware
 */
function authenticate(req, res, next) {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  if (token !== "secure-token") {
    return res.status(403).json({ message: "Invalid token." });
  }

  next();
}

/**
 * Temporary job data
 */
const jobs = [
  { id: 1, title: "Software Engineer", location: "Remote", experience: "3+" },
  { id: 2, title: "Backend Developer", location: "Germany", experience: "5+" },
  { id: 3, title: "Frontend Developer", location: "Remote", experience: "2+" }
];

/**
 * Temporary applications storage
 */
const applications = [];

/**
 * Root route
 */
app.get("/", (req, res) => {
  res.send("Backend is running successfully");
});

/**
 * GET /jobs
 */
app.get("/jobs", authenticate, (req, res) => {
  try {
    let filteredJobs = jobs;

    const { location, experience } = req.query;

    if (location) {
      filteredJobs = filteredJobs.filter(
        job => job.location.toLowerCase() === location.toLowerCase()
      );
    }

    if (experience) {
      filteredJobs = filteredJobs.filter(
        job => job.experience === experience
      );
    }

    res.status(200).json({
      success: true,
      count: filteredJobs.length,
      data: filteredJobs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while fetching jobs"
    });
  }
});

/**
 * GET /jobs/:id
 */
app.get("/jobs/:id", authenticate, (req, res) => {
  const jobId = Number(req.params.id);

  if (Number.isNaN(jobId)) {
    return res.status(400).json({
      success: false,
      message: "Job ID must be a number"
    });
  }

  const job = jobs.find(j => j.id === jobId);

  if (!job) {
    return res.status(404).json({
      success: false,
      message: "Job not found"
    });
  }

  res.status(200).json({
    success: true,
    data: job
  });
});

/**
 * POST /jobs/:id/apply
 */
app.post("/jobs/:id/apply", authenticate, (req, res) => {
  try {
    const jobId = Number(req.params.id);

    if (Number.isNaN(jobId)) {
      return res.status(400).json({
        success: false,
        message: "Job ID must be a number"
      });
    }

    const job = jobs.find(j => j.id === jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found"
      });
    }

    const { candidateName, email, resumeUrl } = req.body;

    if (!candidateName || !email) {
      return res.status(400).json({
        success: false,
        message: "candidateName and email are required"
      });
    }

    const application = {
      id: applications.length + 1,
      jobId,
      candidateName,
      email,
      resumeUrl: resumeUrl || null,
      status: "APPLIED",
      appliedAt: new Date().toISOString()
    };

    applications.push(application);

    res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      data: application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while applying to job"
    });
  }
});

/**
 * Server start (always last)
 */
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
