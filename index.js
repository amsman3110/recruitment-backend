/**
 * Load environment variables
 */
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { pool, initDb } = require("./src/db");

const app = express();

/* ===============================
   Environment Variables
================================ */
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || "development";
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

/* ===============================
   Middleware
================================ */
app.use(cors());
app.use(express.json());

/* ===============================
   Root / Health Check
================================ */
app.get("/", (req, res) => {
  res.json({
    status: "OK",
    message: "Backend is running",
    environment: NODE_ENV,
  });
});

/* ===============================
   AUTH (TEMP)
================================ */
app.post("/auth/login", (req, res) => {
  const { email } = req.body;

  const token = jwt.sign({ email }, JWT_SECRET, {
    expiresIn: "7d",
  });

  res.json({ token });
});

/* ===============================
   CANDIDATE PROFILE
================================ */

/**
 * GET candidate profile
 * Phase 3: returns the first candidate
 */
app.get("/candidate/profile", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM candidates LIMIT 1"
    );

    if (result.rows.length === 0) {
      return res.json({});
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load profile" });
  }
});

/**
 * UPDATE candidate profile
 */
app.put("/candidate/profile", async (req, res) => {
  const {
    name,
    current_job_title,
    specialization,
    profile_summary,
    technical_skills,
    soft_skills,
    experience,
    education,
    courses,
    certificates,
  } = req.body;

  try {
    await pool.query(
      `
      UPDATE candidates
      SET
        name = $1,
        current_job_title = $2,
        specialization = $3,
        profile_summary = $4,
        technical_skills = $5,
        soft_skills = $6,
        experience = $7,
        education = $8,
        courses = $9,
        certificates = $10,
        updated_at = NOW()
      WHERE id = (SELECT id FROM candidates LIMIT 1)
      `,
      [
        name,
        current_job_title,
        specialization,
        profile_summary,
        technical_skills,
        soft_skills,
        experience,
        education,
        courses,
        certificates,
      ]
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update profile" });
  }
});

/* ===============================
   START SERVER
================================ */
initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT} (${NODE_ENV})`);
  });
});
