require("dotenv").config();

const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const multer = require("multer");

const pool = require("./src/db");
const { initDb } = require("./src/db");

const app = express();

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

/* ===============================
   INIT DATABASE
================================ */
initDb();

/* ===============================
   MIDDLEWARE
================================ */
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
   MULTER (MEMORY STORAGE)
================================ */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

/* ===============================
   DEV LOGIN
================================ */
app.post("/auth/login", (_req, res) => {
  const token = jwt.sign({ userId: "dev-user" }, JWT_SECRET, {
    expiresIn: "7d",
  });
  res.json({ token });
});

/* ===============================
   LOAD PROFILE
================================ */
app.get("/candidates/me", auth, async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT * FROM users WHERE id = $1`,
      [req.user.userId]
    );
    res.json(r.rows[0] || {});
  } catch (e) {
    console.error("LOAD PROFILE ERROR:", e.message);
    res.status(500).json({ message: "Load failed" });
  }
});

/* ===============================
   SAVE PROFILE
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
      INSERT INTO users (
        id,
        name,
        current_job_title,
        specialization,
        profile_summary,
        photo_url,
        cv_url
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        current_job_title = EXCLUDED.current_job_title,
        specialization = EXCLUDED.specialization,
        profile_summary = EXCLUDED.profile_summary,
        photo_url = EXCLUDED.photo_url,
        cv_url = EXCLUDED.cv_url
      `,
      [
        req.user.userId,
        name,
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
   UPLOAD PHOTO
================================ */
app.post(
  "/candidates/upload/photo",
  auth,
  upload.single("photo"),
  async (req, res) => {
    try {
      const base64 = req.file.buffer.toString("base64");

      await pool.query(
        `UPDATE users SET photo_url = $1 WHERE id = $2`,
        [`data:${req.file.mimetype};base64,${base64}`, req.user.userId]
      );

      res.json({ photo_url: `data:${req.file.mimetype};base64,${base64}` });
    } catch (e) {
      console.error("PHOTO UPLOAD ERROR:", e.message);
      res.status(500).json({ error: "Photo upload failed" });
    }
  }
);

/* ===============================
   UPLOAD CV
================================ */
app.post(
  "/candidates/upload/cv",
  auth,
  upload.single("cv"),
  async (req, res) => {
    try {
      const base64 = req.file.buffer.toString("base64");

      await pool.query(
        `UPDATE users SET cv_url = $1 WHERE id = $2`,
        [`data:application/pdf;base64,${base64}`, req.user.userId]
      );

      res.json({ cv_url: `data:application/pdf;base64,${base64}` });
    } catch (e) {
      console.error("CV UPLOAD ERROR:", e.message);
      res.status(500).json({ error: "CV upload failed" });
    }
  }
);

/* ===============================
   START SERVER
================================ */
app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});
