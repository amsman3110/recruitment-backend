/**
 * Load environment variables
 */
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const pool = require("./src/db");

const app = express();

/* ===============================
   Environment Variables
================================ */
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || "development";
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

/* ===============================
   Middleware
================================ */
app.use(cors());
app.use(express.json());

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
   Health Check
================================ */
app.get("/", (_req, res) => {
  res.json({ status: "OK", env: NODE_ENV });
});

/* ===============================
   AUTH
================================ */
app.post("/auth/login", (req, res) => {
  const { email } = req.body;

  const token = jwt.sign({ id: 1, email }, JWT_SECRET, {
    expiresIn: "7d",
  });

  res.json({ token });
});

/* ===============================
   SAVE CANDIDATE PROFILE
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

    // 🔒 ARRAY SAFETY
    const techSkills = Array.isArray(technical_skills)
      ? technical_skills
      : [];

    const softSkills = Array.isArray(soft_skills)
      ? soft_skills
      : [];

    // 🔒 JSON SAFETY (THIS FIXES YOUR ERROR)
    const expJson =
      experience &&
      typeof experience === "object" &&
      !Array.isArray(experience)
        ? experience
        : {};

    const eduJson =
      education &&
      typeof education === "object" &&
      !Array.isArray(education)
        ? education
        : {};

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
      ON CONFLICT (name)
      DO UPDATE SET
        current_job_title = EXCLUDED.current_job_title,
        specialization = EXCLUDED.specialization,
        profile_summary = EXCLUDED.profile_summary,
        technical_skills = EXCLUDED.technical_skills,
        soft_skills = EXCLUDED.soft_skills,
        experience = EXCLUDED.experience,
        education = EXCLUDED.education,
        cv_url = EXCLUDED.cv_url,
        photo_url = EXCLUDED.photo_url
      `,
      [
        name,
        current_job_title,
        specialization,
        profile_summary,
        techSkills,
        softSkills,
        expJson,
        eduJson,
        cv_url || null,
        photo_url || null,
      ]
    );

    res.json({ success: true });
  } catch (error) {
    console.error("SAVE PROFILE ERROR:", error);
    res.status(500).json({ message: "Failed to save profile" });
  }
});

/* ===============================
   GET PROFILE
================================ */
app.get("/profile", auth, async (_req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM candidates ORDER BY id DESC LIMIT 1"
    );
    res.json(result.rows[0] || {});
  } catch (error) {
    console.error("LOAD PROFILE ERROR:", error);
    res.status(500).json({ message: "Failed to load profile" });
  }
});

/* ===============================
   404
================================ */
app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" });
});

/* ===============================
   START SERVER
================================ */
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT} (${NODE_ENV})`);
});
