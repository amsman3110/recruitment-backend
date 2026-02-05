// v10 - Phase 2: Recruiter System
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Import route modules
const authRoutes = require("./src/routes/auth");
const companyRoutes = require("./src/routes/company");
const recruiterSearchRoutes = require("./src/routes/recruiter-search");
const pipelineRoutes = require("./src/routes/pipeline");
const invitationRoutes = require("./src/routes/invitations");
const questionRoutes = require("./src/routes/questions");
const jobRoutes = require("./src/routes/jobs");

const app = express();
const PORT = process.env.PORT || 3000;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Log all requests
app.use((req, res, next) => {
  console.log("📨 Request:", req.method, req.url);
  next();
});

// Handle JSON parsing errors
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error("❌ JSON Parse Error:", err.message);
    return res.status(400).json({ error: "Invalid JSON" });
  }
  next();
});

// Auth middleware (for legacy routes)
function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: "No token" });
  try {
    const token = header.split(" ")[1];
    const jwt = require("jsonwebtoken");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    req.user = {
      userId: decoded.userId || decoded.id,
      role: decoded.role
    };
    
    next();
  } catch (e) {
    console.error("❌ Auth failed:", e.message);
    return res.status(401).json({ message: "Invalid token" });
  }
}

// ========================================
// REGISTER ROUTES
// ========================================

// Health check
app.get("/", (req, res) => {
  res.json({ status: "OK", version: "v10-recruiter-system" });
});

// Phase 2 Routes
app.use("/auth", authRoutes);
app.use("/company", companyRoutes);
app.use("/recruiter", recruiterSearchRoutes);
app.use("/pipeline", pipelineRoutes);
app.use("/invitations", invitationRoutes);
app.use("/questions", questionRoutes);
app.use("/jobs", jobRoutes);

// ========================================
// LEGACY CANDIDATE ROUTES (Keep for Phase 1)
// ========================================

app.get("/candidate/profile", auth, async (req, res) => {
  try {
    const r = await pool.query("SELECT * FROM users WHERE id = $1", [req.user.userId]);
    res.json(r.rows[0] || {});
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/candidate/update-profile", auth, async (req, res) => {
  try {
    const b = req.body;
    
    await pool.query(
      "UPDATE users SET name = $1, current_job_title = $2, specialization = $3, profile_summary = $4, photo_url = $5, cv_url = $6, cv_filename = $7, cv_uploaded_at = $8, technical_skills = $9, soft_skills = $10, experience = $11, education = $12, courses = $13, certificates = $14, updated_at = NOW() WHERE id = $15",
      [
        b.name || null,
        b.jobTitle || b.current_job_title || null,
        b.specialization || null,
        b.summary || b.profile_summary || null,
        b.photo_url || null,
        b.cv_url || null,
        b.cv_filename || null,
        b.cv_uploaded_at || null,
        b.technicalSkills || b.technical_skills || null,
        b.softSkills || b.soft_skills || null,
        JSON.stringify(b.experience || []),
        JSON.stringify(b.education || []),
        JSON.stringify(b.courses || []),
        JSON.stringify(b.certificates || []),
        req.user.userId,
      ]
    );
    
    res.json({ success: true });
  } catch (e) {
    console.error("❌ Update profile error:", e.message);
    res.status(500).json({ error: e.message });
  }
});

app.post("/candidates/upload/photo", auth, async (req, res) => {
  try {
    let base64Data = req.body.photo_base64;
    
    if (!base64Data) {
      return res.status(400).json({ error: "photo_base64 is required" });
    }

    let dataUrl = base64Data;
    if (!base64Data.startsWith("data:")) {
      dataUrl = "data:image/jpeg;base64," + base64Data;
    }

    await pool.query("UPDATE users SET photo_url = $1 WHERE id = $2", [dataUrl, req.user.userId]);
    
    res.json({ photo_url: dataUrl });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/candidates/upload/cv", auth, async (req, res) => {
  try {
    let base64Data = req.body.cv_base64;
    const filename = req.body.cv_filename || "Resume.pdf";
    
    if (!base64Data) {
      return res.status(400).json({ error: "cv_base64 is required" });
    }

    let dataUrl = base64Data;
    if (!base64Data.startsWith("data:")) {
      dataUrl = "data:application/pdf;base64," + base64Data;
    }

    const uploadedAt = new Date().toISOString();
    
    await pool.query(
      "UPDATE users SET cv_url = $1, cv_filename = $2, cv_uploaded_at = $3 WHERE id = $4",
      [dataUrl, filename, uploadedAt, req.user.userId]
    );
    
    res.json({ 
      cv_url: dataUrl,
      cv_filename: filename,
      cv_uploaded_at: uploadedAt
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/applications", auth, async (req, res) => {
  try {
    const jobId = req.body.job_id;
    if (!jobId) {
      return res.status(400).json({ error: "job_id is required" });
    }

    const result = await pool.query(
      "INSERT INTO applications (user_id, job_id) VALUES ($1, $2) RETURNING *",
      [req.user.userId, jobId]
    );

    res.status(201).json(result.rows[0]);
  } catch (e) {
    if (e.code === "23505") {
      return res.status(400).json({ error: "You already applied for this job" });
    }
    res.status(500).json({ error: e.message });
  }
});

app.get("/applications", auth, async (req, res) => {
  try {
    let queryStr = "SELECT a.*, j.title as job_title, j.location as job_location FROM applications a LEFT JOIN jobs j ON a.job_id = j.id WHERE 1=1";
    const values = [];

    if (req.user.role === "candidate" || !req.user.role) {
      values.push(req.user.userId);
      queryStr += " AND a.user_id = $" + values.length;
    }

    if (req.query.status) {
      values.push(req.query.status);
      queryStr += " AND a.status = $" + values.length;
    }

    queryStr += " ORDER BY a.applied_at DESC";
    const result = await pool.query(queryStr, values);
    res.json(result.rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ========================================
// AI CAREER COACH ENDPOINTS
// ========================================

app.post("/ai/analyze-profile", auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const profileResult = await pool.query("SELECT * FROM users WHERE id = $1", [userId]);
    const profile = profileResult.rows[0];

    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    const profileData = {
      name: profile.name || "Not provided",
      jobTitle: profile.current_job_title || "Not provided",
      specialization: profile.specialization || "Not provided",
      summary: profile.profile_summary || "Not provided",
      technicalSkills: profile.technical_skills || [],
      softSkills: profile.soft_skills || [],
      experience: profile.experience || "Not provided",
      education: profile.education || "Not provided",
      hasPhoto: !!profile.photo_url,
      hasCV: !!profile.cv_url,
    };

    let completeness = 0;
    if (profile.name) completeness += 10;
    if (profile.current_job_title) completeness += 10;
    if (profile.specialization) completeness += 10;
    if (profile.profile_summary) completeness += 15;
    if (profile.technical_skills && profile.technical_skills.length > 0) completeness += 15;
    if (profile.soft_skills && profile.soft_skills.length > 0) completeness += 10;
    if (profile.experience) completeness += 10;
    if (profile.education) completeness += 10;
    if (profile.photo_url) completeness += 5;
    if (profile.cv_url) completeness += 5;

    const prompt = `You are a professional career coach. Analyze this job seeker's profile and provide specific, actionable advice.

Profile Data:
- Name: ${profileData.name}
- Current Job Title: ${profileData.jobTitle}
- Specialization: ${profileData.specialization}
- Summary: ${profileData.summary}
- Technical Skills: ${profileData.technicalSkills.join(", ") || "None listed"}
- Soft Skills: ${profileData.softSkills.join(", ") || "None listed"}
- Experience: ${profileData.experience}
- Education: ${profileData.education}
- Has Profile Photo: ${profileData.hasPhoto ? "Yes" : "No"}
- Has CV Uploaded: ${profileData.hasCV ? "Yes" : "No"}

Provide a brief analysis (max 200 words) with:
1. Overall assessment
2. 3 specific strengths
3. 3 areas to improve
4. 2 actionable next steps

Be encouraging but honest.`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const analysis = response.text();

    res.json({
      completeness,
      analysis,
      profileData,
    });
  } catch (error) {
    console.error("AI Profile Analysis Error:", error);
    res.status(500).json({ error: "Failed to analyze profile" });
  }
});

app.post("/ai/analyze-cv", auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const profileResult = await pool.query("SELECT cv_url, cv_filename, current_job_title FROM users WHERE id = $1", [userId]);
    const profile = profileResult.rows[0];

    if (!profile || !profile.cv_url) {
      return res.status(404).json({ error: "No CV uploaded" });
    }

    const prompt = `You are an expert CV reviewer. Provide advice for a ${profile.current_job_title || "job seeker"}'s CV.

Give specific tips on:
1. CV Structure and Format (3 tips)
2. Content and Keywords (3 tips)
3. Common mistakes to avoid (3 tips)
4. How to stand out (2 tips)

Keep it practical and actionable. Max 250 words.`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const analysis = response.text();

    res.json({
      cvFilename: profile.cv_filename,
      analysis,
    });
  } catch (error) {
    console.error("AI CV Analysis Error:", error);
    res.status(500).json({ error: "Failed to analyze CV" });
  }
});

app.post("/ai/interview-prep", auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const jobTitle = req.body.jobTitle;
    
    const profileResult = await pool.query("SELECT current_job_title, specialization FROM users WHERE id = $1", [userId]);
    const profile = profileResult.rows[0];

    const targetRole = jobTitle || profile.current_job_title || "your target role";

    const prompt = `You are an interview coach. Generate interview preparation tips for someone applying for: ${targetRole}

Provide:
1. 5 common interview questions for this role (with brief answer guidance)
2. 3 behavioral questions (STAR method tips)
3. 3 questions the candidate should ask the interviewer
4. 2 key preparation tips

Be specific to the role. Max 300 words.`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const advice = response.text();

    res.json({
      targetRole,
      advice,
    });
  } catch (error) {
    console.error("AI Interview Prep Error:", error);
    res.status(500).json({ error: "Failed to generate interview prep" });
  }
});

app.post("/ai/job-tips", auth, async (req, res) => {
  try {
    const jobId = req.body.jobId;
    const userId = req.user.userId;

    if (!jobId) {
      return res.status(400).json({ error: "Job ID required" });
    }

    const jobResult = await pool.query("SELECT title, description, qualifications FROM jobs WHERE id = $1", [jobId]);
    const job = jobResult.rows[0];

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    const profileResult = await pool.query("SELECT current_job_title, specialization, technical_skills FROM users WHERE id = $1", [userId]);
    const profile = profileResult.rows[0];

    const prompt = `You are a job application coach. Help a candidate apply for this job:

Job Title: ${job.title}
Description: ${job.description || "Not provided"}
Requirements: ${job.qualifications || "Not provided"}

Candidate Background:
- Current Role: ${profile.current_job_title || "Not specified"}
- Specialization: ${profile.specialization || "Not specified"}
- Skills: ${profile.technical_skills ? profile.technical_skills.join(", ") : "Not specified"}

Provide:
1. Why they're a good fit (3 points)
2. Skills to emphasize in application (3 skills)
3. Potential concerns to address (2 points)
4. Cover letter tips (2 tips)

Be encouraging and specific. Max 200 words.`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const tips = response.text();

    res.json({
      jobTitle: job.title,
      tips,
    });
  } catch (error) {
    console.error("AI Job Tips Error:", error);
    res.status(500).json({ error: "Failed to generate job tips" });
  }
});

// ========================================
// START SERVER & RUN MIGRATIONS IN BACKGROUND
// ========================================

// Start server immediately
app.listen(PORT, () => {
  console.log("Backend running on port " + PORT);
  console.log("Version: v10 - Phase 2 Recruiter System");
  console.log("✅ All routes registered");
  
  // Run migrations in background (non-blocking)
  setTimeout(async () => {
    try {
      console.log("🔄 Running database migrations in background...");
      await pool.query("ALTER TABLE companies ADD COLUMN IF NOT EXISTS linkedin_url TEXT;");
      await pool.query("ALTER TABLE companies ADD COLUMN IF NOT EXISTS website_url TEXT;");
      console.log("✅ LinkedIn and Website columns added to companies table");
    } catch (error) {
      console.error("⚠️ Migration warning:", error.message);
      console.log("Note: Columns may already exist or database is unavailable");
    }
  }, 2000); // Wait 2 seconds after server starts
});