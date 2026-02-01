/**
 * Load environment variables
 */
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();

/* ===============================
   Environment Variables
================================ */
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || "development";
const JWT_SECRET = process.env.JWT_SECRET;
const CORS_ORIGINS = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",")
  : ["*"];

/* ===============================
   Middleware
================================ */
app.use(
  cors({
    origin: CORS_ORIGINS,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

/* ===============================
   Auth Middleware
================================ */
function auth(req, res, next) {
  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

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
   Auth Routes (TEMP – Phase 2)
================================ */
app.post("/auth/login", (req, res) => {
  const { email } = req.body;

  // Mock login (replace later with DB validation)
  const token = jwt.sign(
    {
      id: 1,
      email,
    },
    JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    }
  );

  res.json({ token });
});

/* ===============================
   Jobs Routes
================================ */
app.get("/jobs", (req, res) => {
  res.json([
    { id: 1, title: "Software Engineer", location: "Cairo" },
    { id: 2, title: "Frontend Developer", location: "Remote" },
    { id: 3, title: "Backend Developer", location: "Alexandria" },
  ]);
});

/**
 * Apply to Job (Protected)
 */
app.post("/jobs/:id/apply", auth, (req, res) => {
  const jobId = req.params.id;

  res.json({
    success: true,
    message: `Application submitted successfully for job ${jobId}`,
    user: req.user,
  });
});

/* ===============================
   404 Handler
================================ */
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

/* ===============================
   Start Server
================================ */
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT} (${NODE_ENV})`);
});
