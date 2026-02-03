require("dotenv").config();

const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const pool = require("./src/db");
const { initDb } = require("./src/db");

const app = express();

const PORT = process.env.PORT || 10000;
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

/* ===============================
   INITIALIZE DATABASE
================================ */
initDb();

/* ===============================
   MIDDLEWARE
================================ */
app.use(cors());
app.use(express.json());

// Log every request (VERY IMPORTANT for debugging)
app.use((req, _res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

/* ===============================
   AUTH MIDDLEWARE
================================ */
function auth(req, res, next) {
  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).json({ message: "No token" });
  }

  try {
    const token = header.split(" ")[1];
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (error) {
    console.error("❌ Invalid token", error);
    return res.status(401).json({ message: "Invalid token" });
  }
}

/* ===============================
   HEALTH CHECK
================================ */
app.get("/", (_req, res) => {
  res.json({ status: "OK" });
});

/* ===============================
   DEV LOGIN
================================ */
app.post("/auth/login", (_req, res) => {
  const token = jwt.sign({ id: "dev-user" }, JWT_SECRET, {
    expiresIn: "7d",
  });
  res.json({ token });
});

/* ===============================
   SAVE PROFILE
================================ */
app.post("/profile", auth, async (req, res) => {
  console.log("➡️ POST /profile BODY:", req.body);

  try {
    const {
      name,
      specialization,
      current_job_title,
      profile_summary,
      experience,
      technical_skills,
      soft_skills,
      education,
      photo_url,
      cv_url,
    } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    await pool.query(
      `
      INSERT INTO candidates (
        name,
        specialization,
        current_job_title,
        profile_summary,
        experience,
        technical_skills,
        soft_skills,
        education,
        photo_url,
        cv_url
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      `,
      [
        name,
        specialization || null,
        current_job_title || null,
        profile_summary || null,
        experience || {},
        technical_skills || [],
        soft_skills || [],
        education || {},
        photo_url || null,
        cv_url || null,
      ]
    );

    console.log("✅ Profile saved successfully");
    res.json({ success: true });
  } catch (error) {
    console.error("❌ SAVE PROFILE ERROR:", error);
    res.status(500).json({ message: "Save failed" });
  }
});

/* ===============================
   LOAD PROFILE
================================ */
app.get("/profile", auth, async (_req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM candidates ORDER BY created_at DESC LIMIT 1"
    );

    res.json(result.rows[0] || {});
  } catch (error) {
    console.error("❌ LOAD PROFILE ERROR:", error);
    res.status(500).json({ message: "Load failed" });
  }
});

/* ===============================
   START SERVER
================================ */
app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});
