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
   HEALTH CHECK
================================ */
app.get("/", (_req, res) => {
  res.json({ status: "OK" });
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
   UPLOAD PHOTO
================================ */
app.post(
  "/candidates/upload/photo",
  auth,
  upload.single("photo"),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "Photo file is required" });
    }

    try {
      const base64 = req.file.buffer.toString("base64");

      // Saving to users table (correct table)
      await pool.query(
        `
        UPDATE users
        SET photo_url = $1
        WHERE id = $2 AND role = 'candidate'
        `,
        [`data:${req.file.mimetype};base64,${base64}`, req.user.userId]
      );

      res.json({
        photo_url: `data:${req.file.mimetype};base64,${base64}`,
      });
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
    if (!req.file) {
      return res.status(400).json({ error: "CV file is required" });
    }

    if (req.file.mimetype !== "application/pdf") {
      return res.status(400).json({ error: "Only PDF files allowed" });
    }

    try {
      const base64 = req.file.buffer.toString("base64");

      // Saving to users table (correct table)
      await pool.query(
        `
        UPDATE users
        SET cv_url = $1
        WHERE id = $2 AND role = 'candidate'
        `,
        [`data:application/pdf;base64,${base64}`, req.user.userId]
      );

      res.json({
        cv_url: `data:application/pdf;base64,${base64}`,
      });
    } catch (e) {
      console.error("CV UPLOAD ERROR:", e.message);
      res.status(500).json({ error: "CV upload failed" });
    }
  }
);

/* ===============================
   LOAD PROFILE
================================ */
app.get("/candidates/me", auth, async (_req, res) => {
  try {
    const r = await pool.query(
      `SELECT * FROM users WHERE id = $1 AND role = 'candidate'`,
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
      UPDATE users
      SET
        name = $1,
        current_job_title = $2,
        specialization = $3,
        profile_summary = $4,
        photo_url = $5,
        cv_url = $6
      WHERE id = $7 AND role = 'candidate'
      `,
      [
        name,
        current_job_title,
        specialization,
        profile_summary,
        photo_url,
        cv_url,
        req.user.userId,
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
