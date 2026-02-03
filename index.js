require("dotenv").config();
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const { pool } = require("./src/db");

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

app.use(cors());
app.use(express.json());

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
   STATIC FILES (IMPORTANT)
================================ */
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ===============================
   MULTER CONFIG
================================ */
const photoStorage = multer.diskStorage({
  destination: "uploads/photos",
  filename: (_, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const cvStorage = multer.diskStorage({
  destination: "uploads/cv",
  filename: (_, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const uploadPhoto = multer({ storage: photoStorage });
const uploadCV = multer({ storage: cvStorage });

/* ===============================
   UPLOAD PHOTO
================================ */
app.post(
  "/upload/photo",
  auth,
  uploadPhoto.single("photo"),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const photoUrl = `/uploads/photos/${req.file.filename}`;
    res.json({ photo_url: photoUrl });
  }
);

/* ===============================
   UPLOAD CV
================================ */
app.post(
  "/upload/cv",
  auth,
  uploadCV.single("cv"),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const cvUrl = `/uploads/cv/${req.file.filename}`;
    res.json({ cv_url: cvUrl });
  }
);

/* ===============================
   PROFILE ROUTES
================================ */
app.get("/profile", auth, async (_req, res) => {
  const r = await pool.query(
    "SELECT * FROM candidates ORDER BY created_at DESC LIMIT 1"
  );
  res.json(r.rows[0] || {});
});

app.post("/profile", auth, async (req, res) => {
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
      current_job_title,
      specialization,
      profile_summary,
      photo_url,
      cv_url
    )
    VALUES ($1,$2,$3,$4,$5,$6)
    `,
    [
      name,
      current_job_title,
      specialization,
      profile_summary,
      photo_url,
      cv_url,
    ]
  );

  res.json({ success: true });
});

/* ===============================
   START
================================ */
app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});
