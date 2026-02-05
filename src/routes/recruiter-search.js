const express = require("express");
const { param, query, validationResult } = require("express-validator");
const auth = require("../middleware/auth");
const pool = require("../db");

const router = express.Router();

/*
========================================
GET /recruiter/candidates/search
Search candidates with filters
========================================
*/
router.get(
  "/candidates/search",
  auth,
  [
    query("keywords").optional().isString(),
    query("skills").optional().isString(),
    query("location").optional().isString(),
    query("experienceMin").optional().isInt({ min: 0 }),
    query("experienceMax").optional().isInt({ min: 0 }),
  ],
  async (req, res) => {
    // Only recruiters can search
    if (req.user.role !== "recruiter") {
      return res.status(403).json({
        error: "Only recruiters can search candidates",
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { keywords, skills, location, experienceMin, experienceMax } =
      req.query;

    try {
      let queryStr = `
        SELECT 
          id,
          name,
          email,
          current_job_title,
          specialization,
          profile_summary,
          technical_skills,
          soft_skills,
          experience,
          created_at
        FROM users
        WHERE role = 'candidate'
      `;

      const values = [];
      let paramIndex = 1;

      // Keyword search (searches in name, job_title, skills, summary)
      if (keywords) {
        values.push(`%${keywords}%`);
        queryStr += ` AND (
          name ILIKE $${paramIndex} OR
          current_job_title ILIKE $${paramIndex} OR
          profile_summary ILIKE $${paramIndex} OR
          specialization ILIKE $${paramIndex}
        )`;
        paramIndex++;
      }

      // Skills search (searches in technical_skills array)
      if (skills) {
        const skillsArray = skills.split(",").map((s) => s.trim());
        values.push(skillsArray);
        queryStr += ` AND technical_skills && $${paramIndex}`;
        paramIndex++;
      }

      // Location search
      if (location) {
        values.push(`%${location}%`);
        queryStr += ` AND (
          experience ILIKE $${paramIndex} OR
          education ILIKE $${paramIndex}
        )`;
        paramIndex++;
      }

      queryStr += " ORDER BY created_at DESC LIMIT 50";

      const result = await pool.query(queryStr, values);

      res.json({
        count: result.rows.length,
        candidates: result.rows,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

/*
========================================
GET /recruiter/candidates/:id
Get full candidate profile
========================================
*/
router.get(
  "/candidates/:id",
  auth,
  [param("id").isInt().withMessage("Invalid candidate ID")],
  async (req, res) => {
    // Only recruiters can view
    if (req.user.role !== "recruiter") {
      return res.status(403).json({
        error: "Only recruiters can view candidate profiles",
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const result = await pool.query(
        `SELECT 
          id,
          name,
          email,
          current_job_title,
          specialization,
          profile_summary,
          technical_skills,
          soft_skills,
          experience,
          education,
          courses,
          certificates,
          photo_base64,
          created_at
         FROM users
         WHERE id = $1 AND role = 'candidate'`,
        [req.params.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: "Candidate not found",
        });
      }

      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

/*
========================================
GET /recruiter/candidates/:id/cv
Download candidate CV
========================================
*/
router.get(
  "/candidates/:id/cv",
  auth,
  [param("id").isInt().withMessage("Invalid candidate ID")],
  async (req, res) => {
    // Only recruiters can download CVs
    if (req.user.role !== "recruiter") {
      return res.status(403).json({
        error: "Only recruiters can download CVs",
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const result = await pool.query(
        `SELECT cv_base64, name
         FROM users
         WHERE id = $1 AND role = 'candidate'`,
        [req.params.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: "Candidate not found",
        });
      }

      const { cv_base64, name } = result.rows[0];

      if (!cv_base64) {
        return res.status(404).json({
          error: "CV not uploaded by candidate",
        });
      }

      res.json({
        cv_base64: cv_base64,
        filename: `${name || "candidate"}_CV.pdf`,
        mime_type: "application/pdf",
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;