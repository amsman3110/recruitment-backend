const express = require("express");
const { body, validationResult } = require("express-validator");
const multer = require("multer");
const auth = require("../middleware/auth");
const pool = require("../db");

const router = express.Router();

/*
========================================
MULTER CONFIG (MEMORY STORAGE)
Railway-safe (no filesystem usage)
========================================
*/
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

/*
========================================
GET /candidates/me
Get own candidate profile
========================================
*/
router.get("/me", auth, async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        id,
        email,
        role,
        photo_base64,
        cv_base64,
        created_at
      FROM users
      WHERE id = $1 AND role = 'candidate'
      `,
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Candidate profile not found",
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({
      error: "Failed to load profile",
    });
  }
});

/*
========================================
POST /candidates/upload/photo
Upload candidate profile photo
========================================
*/
router.post(
  "/upload/photo",
  auth,
  upload.single("photo"),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        error: "Photo file is required",
      });
    }

    try {
      const base64Photo = req.file.buffer.toString("base64");

      await pool.query(
        `
        UPDATE users
        SET photo_base64 = $1
        WHERE id = $2 AND role = 'candidate'
        `,
        [base64Photo, req.user.userId]
      );

      res.json({
        photo_url:
          "data:" + req.file.mimetype + ";base64," + base64Photo,
      });
    } catch (error) {
      res.status(500).json({
        error: "Photo upload failed",
      });
    }
  }
);

/*
========================================
POST /candidates/upload/cv
Upload candidate CV (PDF)
========================================
*/
router.post(
  "/upload/cv",
  auth,
  upload.single("cv"),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        error: "CV file is required",
      });
    }

    if (req.file.mimetype !== "application/pdf") {
      return res.status(400).json({
        error: "Only PDF files are allowed",
      });
    }

    try {
      const base64CV = req.file.buffer.toString("base64");

      await pool.query(
        `
        UPDATE users
        SET cv_base64 = $1
        WHERE id = $2 AND role = 'candidate'
        `,
        [base64CV, req.user.userId]
      );

      res.json({
        cv_url: "data:application/pdf;base64," + base64CV,
      });
    } catch (error) {
      res.status(500).json({
        error: "CV upload failed",
      });
    }
  }
);
