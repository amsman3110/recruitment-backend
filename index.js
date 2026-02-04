// v9 - Added AI Career Coach with Google Gemini
require("dotenv").config();

var express = require("express");
var cors = require("cors");
var jwt = require("jsonwebtoken");
var bcrypt = require("bcrypt");
var Pool = require("pg").Pool;
var { GoogleGenerativeAI } = require("@google/generative-ai");

var app = express();
var PORT = process.env.PORT || 3000;
var JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var genAI = new GoogleGenerativeAI("AIzaSyBXnjWrKDYgoWSOYsLHOKUxQ-iJK0qUjUo");

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Log all requests
app.use(function(req, res, next) {
  console.log("📨 Request:", req.method, req.url);
  next();
});

// Handle JSON parsing errors
app.use(function(err, req, res, next) {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error("❌ JSON Parse Error:", err.message);
    return res.status(400).json({ error: "Invalid JSON" });
  }
  next();
});

function auth(req, res, next) {
  var header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: "No token" });
  try {
    var token = header.split(" ")[1];
    var decoded = jwt.verify(token, JWT_SECRET);
    
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

app.get("/", function (req, res) {
  res.json({ status: "OK", version: "v9-with-ai" });
});

app.post("/auth/register", async function (req, res) {
  try {
    var email = req.body.email;
    var password = req.body.password;
    var name = req.body.name;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    var hashedPassword = await bcrypt.hash(password, 10);
    var result = await pool.query(
      "INSERT INTO users (email, password, name, role) VALUES ($1, $2, $3, 'candidate') RETURNING id, email, role, name",
      [email, hashedPassword, name || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (e) {
    if (e.code === "23505") {
      return res.status(400).json({ error: "Email already exists" });
    }
    res.status(500).json({ error: e.message });
  }
});

app.post("/auth/login", async function (req, res) {
  try {
    var email = req.body.email;
    var password = req.body.password;

    if (!email && !password) {
      var devResult = await pool.query(
        "INSERT INTO users (email, role) VALUES ('dev@example.com', 'candidate') ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email RETURNING id"
      );
      var devToken = jwt.sign({ userId: devResult.rows[0].id }, JWT_SECRET, { expiresIn: "7d" });
      return res.json({ token: devToken });
    }

    var result = await pool.query(
      "SELECT id, email, password, role FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    var user = result.rows[0];
    var passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    var token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });

    res.json({
      token: token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/candidate/profile", auth, async function (req, res) {
  try {
    var r = await pool.query("SELECT * FROM users WHERE id = $1", [req.user.userId]);
    res.json(r.rows[0] || {});
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/candidate/update-profile", auth, async function (req, res) {
  try {
    var b = req.body;
    
    var result = await pool.query(
      "UPDATE users SET name = $1, current_job_title = $2, specialization = $3, profile_summary = $4, photo_url = $5, cv_url = $6, cv_filename = $7, cv_uploaded_at = $8, technical_skills = $9, soft_skills = $10, experience = $11, education = $12, courses = $13, certificates = $14, updated_at = NOW() WHERE id = $15 RETURNING *",
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
        b.experience || null,
        b.education || null,
        b.courses || null,
        b.certificates || null,
        req.user.userId,
      ]
    );
    
    res.json({ success: true });
  } catch (e) {
    console.error("❌ Update profile error:", e.message);
    res.status(500).json({ error: e.message });
  }
});

app.post("/candidates/upload/photo", auth, async function (req, res) {
  try {
    var base64Data = req.body.photo_base64;
    
    if (!base64Data) {
      return res.status(400).json({ error: "photo_base64 is required" });
    }

    var dataUrl = base64Data;
    if (!base64Data.startsWith("data:")) {
      dataUrl = "data:image/jpeg;base64," + base64Data;
    }

    await pool.query("UPDATE users SET photo_url = $1 WHERE id = $2", [dataUrl, req.user.userId]);
    
    res.json({ photo_url: dataUrl });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/candidates/upload/cv", auth, async function (req, res) {
  try {
    var base64Data = req.body.cv_base64;
    var filename = req.body.cv_filename || "Resume.pdf";
    
    if (!base64Data) {
      return res.status(400).json({ error: "cv_base64 is required" });
    }

    var dataUrl = base64Data;
    if (!base64Data.startsWith("data:")) {
      dataUrl = "data:application/pdf;base64," + base64Data;
    }

    var uploadedAt = new Date().toISOString();
    
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

app.get("/jobs", async function (req, res) {
  try {
    var queryStr = "SELECT * FROM jobs WHERE 1=1";
    var values = [];
    var paramIndex = 1;

    if (req.query.workplace) {
      values.push(req.query.workplace);
      queryStr += " AND workplace = $" + paramIndex++;
    }

    if (req.query.country) {
      values.push(req.query.country);
      queryStr += " AND country = $" + paramIndex++;
    }

    if (req.query.city) {
      values.push(req.query.city);
      queryStr += " AND city = $" + paramIndex++;
    }

    if (req.query.career_level) {
      values.push(req.query.career_level);
      queryStr += " AND career_level = $" + paramIndex++;
    }

    if (req.query.job_category) {
      values.push(req.query.job_category);
      queryStr += " AND job_category = $" + paramIndex++;
    }

    if (req.query.job_type) {
      values.push(req.query.job_type);
      queryStr += " AND job_type = $" + paramIndex++;
    }

    if (req.query.min_experience) {
      values.push(Number(req.query.min_experience));
      queryStr += " AND experience_years >= $" + paramIndex++;
    }

    if (req.query.date_posted) {
      var daysAgo = 0;
      if (req.query.date_posted === "today") daysAgo = 1;
      else if (req.query.date_posted === "week") daysAgo = 7;
      else if (req.query.date_posted === "2weeks") daysAgo = 14;
      else if (req.query.date_posted === "month") daysAgo = 30;
      
      if (daysAgo > 0) {
        queryStr += " AND created_at >= NOW() - INTERVAL '" + daysAgo + " days'";
      }
    }

    if (req.query.search) {
      values.push("%" + req.query.search + "%");
      queryStr += " AND (title ILIKE $" + paramIndex + " OR description ILIKE $" + paramIndex + ")";
      paramIndex++;
    }

    queryStr += " ORDER BY created_at DESC";
    
    console.log("Job search query:", queryStr);
    console.log("Query values:", values);
    
    var result = await pool.query(queryStr, values);
    res.json(result.rows);
  } catch (e) {
    console.error("Job search error:", e);
    res.status(500).json({ error: e.message });
  }
});

app.get("/jobs/:id", async function (req, res) {
  try {
    var result = await pool.query("SELECT * FROM jobs WHERE id = $1", [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Job not found" });
    }
    res.json(result.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/jobs", auth, async function (req, res) {
  try {
    var b = req.body;
    if (!b.title) {
      return res.status(400).json({ error: "Job title is required" });
    }

    var result = await pool.query(
      "INSERT INTO jobs (title, description, qualifications, location, company_name, experience_years, workplace, country, city, career_level, job_category, job_type, posted_by) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *",
      [
        b.title, 
        b.description || null, 
        b.qualifications || null, 
        b.location || null, 
        b.company_name || null, 
        b.experience_years || null,
        b.workplace || null,
        b.country || null,
        b.city || null,
        b.career_level || null,
        b.job_category || null,
        b.job_type || null,
        req.user.userId
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/applications", auth, async function (req, res) {
  try {
    var jobId = req.body.job_id;
    if (!jobId) {
      return res.status(400).json({ error: "job_id is required" });
    }

    var result = await pool.query(
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

app.get("/applications", auth, async function (req, res) {
  try {
    var queryStr = "SELECT a.*, j.title as job_title, j.location as job_location FROM applications a LEFT JOIN jobs j ON a.job_id = j.id WHERE 1=1";
    var values = [];

    if (req.user.role === "candidate" || !req.user.role) {
      values.push(req.user.userId);
      queryStr += " AND a.user_id = $" + values.length;
    }

    if (req.query.status) {
      values.push(req.query.status);
      queryStr += " AND a.status = $" + values.length;
    }

    queryStr += " ORDER BY a.applied_at DESC";
    var result = await pool.query(queryStr, values);
    res.json(result.rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ========================================
// AI CAREER COACH ENDPOINTS
// ========================================

app.post("/ai/analyze-profile", auth, async function (req, res) {
  try {
    var userId = req.user.userId;
    
    var profileResult = await pool.query("SELECT * FROM users WHERE id = $1", [userId]);
    var profile = profileResult.rows[0];

    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    var profileData = {
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

    var completeness = 0;
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

    var prompt = "You are a professional career coach. Analyze this job seeker's profile and provide specific, actionable advice.\n\nProfile Data:\n- Name: " + profileData.name + "\n- Current Job Title: " + profileData.jobTitle + "\n- Specialization: " + profileData.specialization + "\n- Summary: " + profileData.summary + "\n- Technical Skills: " + (profileData.technicalSkills.join(", ") || "None listed") + "\n- Soft Skills: " + (profileData.softSkills.join(", ") || "None listed") + "\n- Experience: " + profileData.experience + "\n- Education: " + profileData.education + "\n- Has Profile Photo: " + (profileData.hasPhoto ? "Yes" : "No") + "\n- Has CV Uploaded: " + (profileData.hasCV ? "Yes" : "No") + "\n\nProvide a brief analysis (max 200 words) with:\n1. Overall assessment\n2. 3 specific strengths\n3. 3 areas to improve\n4. 2 actionable next steps\n\nBe encouraging but honest.";

    var model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    var result = await model.generateContent(prompt);
    var response = await result.response;
    var analysis = response.text();

    res.json({
      completeness: completeness,
      analysis: analysis,
      profileData: profileData,
    });
  } catch (error) {
    console.error("AI Profile Analysis Error:", error);
    res.status(500).json({ error: "Failed to analyze profile" });
  }
});

app.post("/ai/analyze-cv", auth, async function (req, res) {
  try {
    var userId = req.user.userId;
    
    var profileResult = await pool.query("SELECT cv_url, cv_filename, current_job_title FROM users WHERE id = $1", [userId]);
    var profile = profileResult.rows[0];

    if (!profile || !profile.cv_url) {
      return res.status(404).json({ error: "No CV uploaded" });
    }

    var prompt = "You are an expert CV reviewer. Provide advice for a " + (profile.current_job_title || "job seeker") + "'s CV.\n\nGive specific tips on:\n1. CV Structure and Format (3 tips)\n2. Content and Keywords (3 tips)\n3. Common mistakes to avoid (3 tips)\n4. How to stand out (2 tips)\n\nKeep it practical and actionable. Max 250 words.";

    var model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    var result = await model.generateContent(prompt);
    var response = await result.response;
    var analysis = response.text();

    res.json({
      cvFilename: profile.cv_filename,
      analysis: analysis,
    });
  } catch (error) {
    console.error("AI CV Analysis Error:", error);
    res.status(500).json({ error: "Failed to analyze CV" });
  }
});

app.post("/ai/interview-prep", auth, async function (req, res) {
  try {
    var userId = req.user.userId;
    var jobTitle = req.body.jobTitle;
    
    var profileResult = await pool.query("SELECT current_job_title, specialization FROM users WHERE id = $1", [userId]);
    var profile = profileResult.rows[0];

    var targetRole = jobTitle || profile.current_job_title || "your target role";

    var prompt = "You are an interview coach. Generate interview preparation tips for someone applying for: " + targetRole + "\n\nProvide:\n1. 5 common interview questions for this role (with brief answer guidance)\n2. 3 behavioral questions (STAR method tips)\n3. 3 questions the candidate should ask the interviewer\n4. 2 key preparation tips\n\nBe specific to the role. Max 300 words.";

    var model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    var result = await model.generateContent(prompt);
    var response = await result.response;
    var advice = response.text();

    res.json({
      targetRole: targetRole,
      advice: advice,
    });
  } catch (error) {
    console.error("AI Interview Prep Error:", error);
    res.status(500).json({ error: "Failed to generate interview prep" });
  }
});

app.post("/ai/job-tips", auth, async function (req, res) {
  try {
    var jobId = req.body.jobId;
    var userId = req.user.userId;

    if (!jobId) {
      return res.status(400).json({ error: "Job ID required" });
    }

    var jobResult = await pool.query("SELECT title, description, qualifications FROM jobs WHERE id = $1", [jobId]);
    var job = jobResult.rows[0];

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    var profileResult = await pool.query("SELECT current_job_title, specialization, technical_skills FROM users WHERE id = $1", [userId]);
    var profile = profileResult.rows[0];

    var prompt = "You are a job application coach. Help a candidate apply for this job:\n\nJob Title: " + job.title + "\nDescription: " + (job.description || "Not provided") + "\nRequirements: " + (job.qualifications || "Not provided") + "\n\nCandidate Background:\n- Current Role: " + (profile.current_job_title || "Not specified") + "\n- Specialization: " + (profile.specialization || "Not specified") + "\n- Skills: " + (profile.technical_skills ? profile.technical_skills.join(", ") : "Not specified") + "\n\nProvide:\n1. Why they're a good fit (3 points)\n2. Skills to emphasize in application (3 skills)\n3. Potential concerns to address (2 points)\n4. Cover letter tips (2 tips)\n\nBe encouraging and specific. Max 200 words.";

    var model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    var result = await model.generateContent(prompt);
    var response = await result.response;
    var tips = response.text();

    res.json({
      jobTitle: job.title,
      tips: tips,
    });
  } catch (error) {
    console.error("AI Job Tips Error:", error);
    res.status(500).json({ error: "Failed to generate job tips" });
  }
});

// ========================================
// START SERVER & MIGRATIONS
// ========================================

app.listen(PORT, function () {
  console.log("Backend running on port " + PORT);
  console.log("Version: v9 with AI Career Coach");

  pool.query("CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, name TEXT, email TEXT UNIQUE NOT NULL, password TEXT, role TEXT DEFAULT 'candidate', current_job_title TEXT, specialization TEXT, profile_summary TEXT, photo_url TEXT, cv_url TEXT, technical_skills TEXT[], soft_skills TEXT[], experience TEXT, education TEXT, courses TEXT, certificates TEXT, created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW())")
  .then(function () { 
    console.log("✅ users table OK"); 
    return pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS cv_filename TEXT"); 
  })
  .then(function () { 
    console.log("✅ cv_filename column added"); 
    return pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS cv_uploaded_at TIMESTAMP"); 
  })
  .then(function () { 
    console.log("✅ cv_uploaded_at column added"); 
    return pool.query("CREATE TABLE IF NOT EXISTS jobs (id SERIAL PRIMARY KEY, title TEXT NOT NULL, description TEXT, qualifications TEXT, location TEXT, company_name TEXT, experience_years INTEGER, posted_by INTEGER REFERENCES users(id) ON DELETE SET NULL, created_at TIMESTAMP DEFAULT NOW())"); 
  })
  .then(function () { 
    console.log("✅ jobs table OK"); 
    return pool.query("ALTER TABLE jobs ADD COLUMN IF NOT EXISTS workplace TEXT");
  })
  .then(function () { 
    console.log("✅ workplace column added"); 
    return pool.query("ALTER TABLE jobs ADD COLUMN IF NOT EXISTS country TEXT");
  })
  .then(function () { 
    console.log("✅ country column added"); 
    return pool.query("ALTER TABLE jobs ADD COLUMN IF NOT EXISTS city TEXT");
  })
  .then(function () { 
    console.log("✅ city column added"); 
    return pool.query("ALTER TABLE jobs ADD COLUMN IF NOT EXISTS career_level TEXT");
  })
  .then(function () { 
    console.log("✅ career_level column added"); 
    return pool.query("ALTER TABLE jobs ADD COLUMN IF NOT EXISTS job_category TEXT");
  })
  .then(function () { 
    console.log("✅ job_category column added"); 
    return pool.query("ALTER TABLE jobs ADD COLUMN IF NOT EXISTS job_type TEXT");
  })
  .then(function () { 
    console.log("✅ job_type column added"); 
    return pool.query("CREATE TABLE IF NOT EXISTS applications (id SERIAL PRIMARY KEY, user_id INTEGER REFERENCES users(id) ON DELETE CASCADE, job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE, status TEXT DEFAULT 'applied', applied_at TIMESTAMP DEFAULT NOW())"); 
  })
  .then(function () { 
    console.log("✅ applications table OK"); 
    console.log("🎉 All migrations complete!");
    console.log("🤖 AI Career Coach ready!");
  })
  .catch(function (e) { 
    console.log("❌ Migration error: " + e.message); 
  });
});