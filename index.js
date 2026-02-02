require("dotenv").config();

const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const pool = require("./src/db");

const app = express();

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

app.use(cors());
app.use(express.json());

/* ===============================
   Helpers (CRITICAL)
================================ */
function safeJson(value) {
  if (!value) return {};
  if (typeof value === "object") return value;

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  }

  return {};
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

/* ===============================
   Auth Middleware
================================ */
function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: "No token" });

  try {
    const token = header.split(" ")[1];
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}

/* ===============================
   Health
================================ */
app.get("/", (_req, res) => {
  res.json({ status: "OK" });
});

/* ===============================
   Login
================================ */
app.post("/auth/login", (_req, res) => {
  const token = jwt.sign({ id: 1 }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ token });
});

/* ===============================
   Save Profile
================================ */
app.post("/profile", auth, async (req, res) => {
  try {
    const {
      name,
      current_job_title,
      specialization,
      profile_summary,
      technical_skills,
      soft_skills,
      experience,
      education,
      cv_url,
      photo_url,
    } = req.body;

    const techSkills = safeArray(technical_skills);
    const softSkills = safeArray(soft_skills);
    const experienceJson = safeJson(experience);
    const educationJson = safeJson(education);

    await pool.query(
      `
      INSERT INTO candidates (
        name,
        current_job_title,
        specialization,
        profile_summary,
        technical_skills,
        soft_skills,
        experience,
        education,
        cv_url,
        photo_url
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      `,
      [
        name || null,
        current_job_title || null,
        specialization || null,
        profile_summary || null,
        techSkills,
        softSkills,
        experienceJson,
        educationJson,
        cv_url || null,
        photo_url || null,
      ]
    );

    res.json({ success: true });
  } catch (error) {
    console.error("SAVE PROFILE ERROR:", error);
    res.status(500).json({ message: "Save failed" });
  }
});

/* ===============================
   Load Profile
================================ */
app.get("/profile", auth, async (_req, res) => {
  try {
    const r = await pool.query(
      "SELECT * FROM candidates ORDER BY id DESC LIMIT 1"
    );
    res.json(r.rows[0] || {});
  } catch (error) {
    res.status(500).json({ message: "Load failed" });
  }
});

/* ===============================
   Start Server
================================ */
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
