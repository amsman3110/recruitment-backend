/**
 * Load environment variables
 */
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");

/**
 * Database (BE-027)
 */
const { initDb } = require("./src/db");

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
   Auth Routes (Phase 3)
================================ */

/**
 * REGISTER (MB-025)
 */
app.post("/auth/register", (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      message: "Name, email, and password are required",
    });
  }

  // 🔴 TEMP: No DB insert yet (BE-028 will handle this)
  // BE-027 only ensures the table exists

  return res.status(201).json({
    success: true,
    message: "User registered successfully",
    user: {
      id: 1,
      name,
      email,
    },
  });
});

/**
 * LOGIN
 */
app.post("/auth/login", (req, res) => {
  const { email } = req.body;

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
   Start Server (BE-027)
================================ */
initDb()
  .then(() => {
    console.log("Database initialized");

    app.listen(PORT, () => {
      console.log(`Backend running on port ${PORT} (${NODE_ENV})`);
    });
  })
  .catch((err) => {
    console.error("Database initialization failed", err);
    process.exit(1);
  });
