require("dotenv").config();

const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const pool = require("./src/db"); // ✅ FIX: direct import

const app = express();

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

/* ===============================
   MIDDLEWARE
================================ */
app.use(cors());
app.use(express.json());

/* ===============================
   ENSURE UPLOAD DIRECTORIES
================================ */
const uploadDirs = ["uploads", "uploads/photos", "uploads/cv"];

uploadDirs.forEach((dir) => {
  const fullPath = path.join(__dirname, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

/* ===============================
   STATIC FILES
================================ */
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ===============================
   AUTH MIDDLEWARE
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
   MULTER CONFIG
================================ */
const uploadPhoto = multer({
  storage: multer.diskStorage({
    destination: path.join(__dirname, "uploads/photos"),
    filename: (_, file, cb) => cb(null, Date.now() + "-" + file.originalname),
  }),
});

const uploadCV = multer({
  storage: multer.diskStorage({
    destination: path.join(__dirname, "uploads/cv"),
    filename: (_, file, cb) => cb(null, Date.now() + "-" + file.originalname),
  }),
});

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
  const token = jwt.sign({ userId: 1 }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ token });
});

/* ===============================
   CANDIDATES: LOAD PROFILE
================================ */
app.get("/candidates/me", auth, async (_req, res) => {
  try {
    const r = await pool.query(
      "SELECT * FROM candidates ORDER BY created_at DESC LIMIT 1"
    );
    res.json(r.rows[0] || {});
  } catch (e) {
    console.error("LOAD PROFILE ERROR:", e.message);
    res.status(500).json({ message: "Load failed" });
  }
});

/* ===============================
   CANDIDATES: SAVE PROFILE
================================ */
app.post("/candidates/me", auth, async (req, res) => {
  try {
    const {
      name,
      current_job_title,
      specialization,
      profile_summary,
      photo_url,
      cv_url,
    } = req.body;

    await pool.query(
      `
      INSERT INTO candidates (
        name,
        email,
        password_hash,
        current_job_title,
        specialization,
        profile_summary,
        photo_url,
        cv_url
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      `,
      [
        name,
        "dev@example.com",
        "dev_password_hash",
        current_job_title,
        specialization,
        profile_summary,
        photo_url,
        cv_url,
      ]
    );

    res.json({ success: true });
  } catch (e) {
    console.error("SAVE PROFILE ERROR:", e.message);
    res.status(500).json({ message: "Save failed" });
  }
});

/* ===============================
   START SERVER
================================ */
app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});
