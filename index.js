// v4 - Base64 uploads with logging
require("dotenv").config();

var express = require("express");
var cors = require("cors");
var jwt = require("jsonwebtoken");
var bcrypt = require("bcrypt");
var Pool = require("pg").Pool;

var app = express();
var PORT = process.env.PORT || 3000;
var JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

var pool = new Pool({ connectionString: process.env.DATABASE_URL });

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Log all requests
app.use(function(req, res, next) {
  console.log("📨 Request:", req.method, req.url);
  console.log("📨 Content-Type:", req.headers['content-type']);
  console.log("📨 Content-Length:", req.headers['content-length']);
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
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (e) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

app.get("/", function (req, res) {
  res.json({ status: "OK" });
});

app.get("/run-migration", async function (req, res) {
  try {
    await pool.query("CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, name TEXT, email TEXT UNIQUE NOT NULL, password TEXT, role TEXT DEFAULT 'candidate', current_job_title TEXT, specialization TEXT, profile_summary TEXT, photo_url TEXT, cv_url TEXT, technical_skills TEXT[], soft_skills TEXT[], experience TEXT, education TEXT, courses TEXT, certificates TEXT, created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW())");
    await pool.query("CREATE TABLE IF NOT EXISTS jobs (id SERIAL PRIMARY KEY, title TEXT NOT NULL, description TEXT, qualifications TEXT, location TEXT, company_name TEXT, experience_years INTEGER, posted_by INTEGER REFERENCES users(id) ON DELETE SET NULL, created_at TIMESTAMP DEFAULT NOW())");
    await pool.query("CREATE TABLE IF NOT EXISTS applications (id SERIAL PRIMARY KEY, user_id INTEGER REFERENCES users(id) ON DELETE CASCADE, job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE, status TEXT DEFAULT 'applied', applied_at TIMESTAMP DEFAULT NOW())");
    await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS technical_skills TEXT[]");
    await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS soft_skills TEXT[]");
    await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS experience TEXT");
    await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS education TEXT");
    await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS courses TEXT");
    await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS certificates TEXT");
    await pool.query("ALTER TABLE jobs ADD COLUMN IF NOT EXISTS experience_years INTEGER");
    var c = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'password_hash'");
    if (c.rows.length > 0) {
      await pool.query("ALTER TABLE users RENAME COLUMN password_hash TO password");
    }
    var r = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'users'");
    res.json({ status: "SUCCESS", total_columns: r.rows.length, columns: r.rows.map(function (x) { return x.column_name; }) });
  } catch (e) {
    res.status(500).json({ status: "FAILED", error: e.message });
  }
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
    await pool.query(
      "UPDATE users SET name = $1, current_job_title = $2, specialization = $3, profile_summary = $4, photo_url = $5, cv_url = $6, technical_skills = $7, soft_skills = $8, experience = $9, education = $10, courses = $11, certificates = $12, updated_at = NOW() WHERE id = $13",
      [
        b.name || null,
        b.jobTitle || b.current_job_title || null,
        b.specialization || null,
        b.summary || b.profile_summary || null,
        b.photo_url || null,
        b.cv_url || null,
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
    res.status(500).json({ error: e.message });
  }
});

app.get("/candidates/me", auth, async function (req, res) {
  try {
    var r = await pool.query("SELECT * FROM users WHERE id = $1", [req.user.userId]);
    res.json(r.rows[0] || {});
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/candidates/me", auth, async function (req, res) {
  try {
    var b = req.body;
    await pool.query(
      "UPDATE users SET name = $1, current_job_title = $2, specialization = $3, profile_summary = $4, photo_url = $5, cv_url = $6, updated_at = NOW() WHERE id = $7",
      [b.name, b.current_job_title, b.specialization, b.profile_summary, b.photo_url, b.cv_url, req.user.userId]
    );
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/candidates/upload/photo", auth, async function (req, res) {
  try {
    console.log("=== PHOTO UPLOAD DEBUG ===");
    console.log("Request body keys:", Object.keys(req.body));
    console.log("photo_base64 exists:", !!req.body.photo_base64);
    console.log("photo_base64 type:", typeof req.body.photo_base64);
    console.log("photo_base64 length:", req.body.photo_base64 ? req.body.photo_base64.length : 0);
    
    var base64Data = req.body.photo_base64;
    
    if (!base64Data) {
      console.log("ERROR: photo_base64 is missing or empty");
      return res.status(400).json({ error: "photo_base64 is required" });
    }

    var dataUrl = base64Data;
    if (!base64Data.startsWith("data:")) {
      dataUrl = "data:image/jpeg;base64," + base64Data;
    }

    console.log("Saving photo to database, length:", dataUrl.length);
    await pool.query("UPDATE users SET photo_url = $1 WHERE id = $2", [dataUrl, req.user.userId]);
    console.log("Photo saved successfully");
    
    res.json({ photo_url: dataUrl });
  } catch (e) {
    console.log("Photo upload error:", e.message);
    res.status(500).json({ error: e.message });
  }
});

app.post("/candidates/upload/cv", auth, async function (req, res) {
  try {
    console.log("=== CV UPLOAD DEBUG ===");
    console.log("Request body keys:", Object.keys(req.body));
    console.log("cv_base64 exists:", !!req.body.cv_base64);
    
    var base64Data = req.body.cv_base64;
    
    if (!base64Data) {
      return res.status(400).json({ error: "cv_base64 is required" });
    }

    var dataUrl = base64Data;
    if (!base64Data.startsWith("data:")) {
      dataUrl = "data:application/pdf;base64," + base64Data;
    }

    await pool.query("UPDATE users SET cv_url = $1 WHERE id = $2", [dataUrl, req.user.userId]);
    res.json({ cv_url: dataUrl });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/jobs", async function (req, res) {
  try {
    var queryStr = "SELECT * FROM jobs WHERE 1=1";
    var values = [];

    if (req.query.location) {
      values.push(req.query.location);
      queryStr += " AND location = $" + values.length;
    }

    if (req.query.min_experience) {
      values.push(Number(req.query.min_experience));
      queryStr += " AND experience_years >= $" + values.length;
    }

    queryStr += " ORDER BY created_at DESC";
    var result = await pool.query(queryStr, values);
    res.json(result.rows);
  } catch (e) {
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
      "INSERT INTO jobs (title, description, qualifications, location, company_name, experience_years, posted_by) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
      [b.title, b.description || null, b.qualifications || null, b.location || null, b.company_name || null, b.experience_years || null, req.user.userId]
    );

    res.status(201).json(result.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put("/jobs/:id", auth, async function (req, res) {
  try {
    var b = req.body;
    var result = await pool.query(
      "UPDATE jobs SET title = COALESCE($1, title), description = COALESCE($2, description), qualifications = COALESCE($3, qualifications), location = COALESCE($4, location), company_name = COALESCE($5, company_name), experience_years = COALESCE($6, experience_years) WHERE id = $7 RETURNING *",
      [b.title || null, b.description || null, b.qualifications || null, b.location || null, b.company_name || null, b.experience_years !== undefined ? b.experience_years : null, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Job not found" });
    }

    res.json(result.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete("/jobs/:id", auth, async function (req, res) {
  try {
    var result = await pool.query("DELETE FROM jobs WHERE id = $1 RETURNING *", [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Job not found" });
    }
    res.json({ message: "Job deleted successfully", job: result.rows[0] });
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

app.put("/applications/:id/status", auth, async function (req, res) {
  try {
    var status = req.body.status;
    var validStatuses = ["applied", "reviewed", "accepted", "rejected"];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status. Must be: applied, reviewed, accepted, rejected" });
    }

    var result = await pool.query(
      "UPDATE applications SET status = $1 WHERE id = $2 RETURNING *",
      [status, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Application not found" });
    }

    res.json(result.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, function () {
  console.log("Backend running on port " + PORT);

  pool.query("CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, name TEXT, email TEXT UNIQUE NOT NULL, password TEXT, role TEXT DEFAULT 'candidate', current_job_title TEXT, specialization TEXT, profile_summary TEXT, photo_url TEXT, cv_url TEXT, technical_skills TEXT[], soft_skills TEXT[], experience TEXT, education TEXT, courses TEXT, certificates TEXT, created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW())")
  .then(function () { console.log("users table OK"); return pool.query("CREATE TABLE IF NOT EXISTS jobs (id SERIAL PRIMARY KEY, title TEXT NOT NULL, description TEXT, qualifications TEXT, location TEXT, company_name TEXT, experience_years INTEGER, posted_by INTEGER REFERENCES users(id) ON DELETE SET NULL, created_at TIMESTAMP DEFAULT NOW())"); })
  .then(function () { console.log("jobs table OK"); return pool.query("CREATE TABLE IF NOT EXISTS applications (id SERIAL PRIMARY KEY, user_id INTEGER REFERENCES users(id) ON DELETE CASCADE, job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE, status TEXT DEFAULT 'applied', applied_at TIMESTAMP DEFAULT NOW())"); })
  .then(function () { console.log("applications table OK"); return pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS technical_skills TEXT[]"); })
  .then(function () { return pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS soft_skills TEXT[]"); })
  .then(function () { return pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS experience TEXT"); })
  .then(function () { return pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS education TEXT"); })
  .then(function () { return pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS courses TEXT"); })
  .then(function () { return pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS certificates TEXT"); })
  .then(function () { return pool.query("ALTER TABLE jobs ADD COLUMN IF NOT EXISTS experience_years INTEGER"); })
  .then(function () { return pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'password_hash'"); })
  .then(function (c) { if (c.rows.length > 0) return pool.query("ALTER TABLE users RENAME COLUMN password_hash TO password"); })
  .then(function () { return pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'users'"); })
  .then(function (r) { console.log("Migration done! Users table has " + r.rows.length + " columns"); })
  .catch(function (e) { console.log("Migration error: " + e.message); });
});