require("dotenv").config();

const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const multer = require("multer");

const { pool, initDb } = require("./src/db");

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

/* ===============================
   INIT DATABASE ON STARTUP
================================ */
initDb();

/* ===============================
   MIDDLEWARE
================================ */
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

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
   MULTER (MEMORY)
================================ */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

/* ===============================
   HEALTH CHECK
================================ */
app.get("/", (_req, res) => {
  res.json({ status: "OK" });
});

/* ===============================
   DEV LOGIN (AUTO-CREATE USER)
================================ */
app.post("/auth/login", async (_req, res) => {
  const result = await pool.query(`
    INSERT INTO users (email, role)
    VALUES ('dev@example.com', 'candidate')
    ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
    RETURNING id
  `);

  const userId = result.rows[0].id;

  const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ token });
});

/* ===============================
   UPLOAD PHOTO
================================ */
app.post("/candidates/upload/photo", auth, upload.single("photo"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Photo required" });

  const base64 = req.file.buffer.toString("base64");
  const dataUrl = `data:${req.file.mimetype};base64,${base64}`;

  await pool.query(
    `UPDATE users SET photo_url = $1 WHERE id = $2`,
    [dataUrl, req.user.userId]
  );

  res.json({ photo_url: dataUrl });
});

/* ===============================
   UPLOAD CV
================================ */
app.post("/candidates/upload/cv", auth, upload.single("cv"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "CV required" });

  const base64 = req.file.buffer.toString("base64");
  const dataUrl = `data:application/pdf;base64,${base64}`;

  await pool.query(
    `UPDATE users SET cv_url = $1 WHERE id = $2`,
    [dataUrl, req.user.userId]
  );

  res.json({ cv_url: dataUrl });
});

/* ===============================
   LOAD PROFILE
================================ */
app.get("/candidates/me", auth, async (req, res) => {
  const r = await pool.query(
    `SELECT * FROM users WHERE id = $1`,
    [req.user.userId]
  );
  res.json(r.rows[0] || {});
});

/* ===============================
   SAVE PROFILE
================================ */
app.post("/candidates/me", auth, async (req, res) => {
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
    UPDATE users SET
      name = $1,
      current_job_title = $2,
      specialization = $3,
      profile_summary = $4,
      photo_url = $5,
      cv_url = $6,
      updated_at = NOW()
    WHERE id = $7
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
});

/* ===============================
   START SERVER
================================ */
app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});
