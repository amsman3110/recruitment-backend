const express = require("express");
const { body, query, param, validationResult } = require("express-validator");
const auth = require("../middleware/auth");
const router = express.Router();
const pool = require("../db");

/*
========================================
POST /jobs
Create a new job posting (recruiter only)
========================================
*/
router.post(
  "/",
  auth,
  [
    body("title").notEmpty().withMessage("Job title is required"),
    body("experience_years")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Experience must be a non-negative number"),
    body("status")
      .optional()
      .isIn(["draft", "open", "closed"])
      .withMessage("Status must be draft, open, or closed"),
  ],
  async (req, res) => {
    // Only recruiters can post jobs
    if (req.user.role !== "recruiter") {
      return res.status(403).json({
        error: "Only recruiters can post jobs",
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      description,
      qualifications,
      location,
      workplace,
      country,
      city,
      career_level,
      job_category,
      job_type,
      experience_years,
      status,
    } = req.body;

    try {
      // Get recruiter's company_id
      const companyResult = await pool.query(
        `SELECT id FROM companies WHERE user_id = $1`,
        [req.user.userId]
      );

      const company_id =
        companyResult.rows.length > 0 ? companyResult.rows[0].id : null;

      const result = await pool.query(
        `INSERT INTO jobs (
          title, description, qualifications, location, workplace,
          country, city, career_level, job_category, job_type,
          experience_years, status, posted_by, company_id
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
         RETURNING *`,
        [
          title,
          description || null,
          qualifications || null,
          location || null,
          workplace || null,
          country || null,
          city || null,
          career_level || null,
          job_category || null,
          job_type || null,
          experience_years || null,
          status || "open",
          req.user.userId,
          company_id,
        ]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

/*
========================================
PUT /jobs/:id
Update job posting (recruiter only)
========================================
*/
router.put(
  "/:id",
  auth,
  [
    param("id").isInt().withMessage("Invalid job ID"),
    body("title").optional().notEmpty().withMessage("Title cannot be empty"),
    body("experience_years")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Experience must be a non-negative number"),
    body("status")
      .optional()
      .isIn(["draft", "open", "closed"])
      .withMessage("Status must be draft, open, or closed"),
  ],
  async (req, res) => {
    // Only recruiters can update jobs
    if (req.user.role !== "recruiter") {
      return res.status(403).json({
        error: "Only recruiters can update jobs",
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const {
      title,
      description,
      qualifications,
      location,
      workplace,
      country,
      city,
      career_level,
      job_category,
      job_type,
      experience_years,
      status,
    } = req.body;

    try {
      const result = await pool.query(
        `UPDATE jobs
         SET
           title = COALESCE($1, title),
           description = COALESCE($2, description),
           qualifications = COALESCE($3, qualifications),
           location = COALESCE($4, location),
           workplace = COALESCE($5, workplace),
           country = COALESCE($6, country),
           city = COALESCE($7, city),
           career_level = COALESCE($8, career_level),
           job_category = COALESCE($9, job_category),
           job_type = COALESCE($10, job_type),
           experience_years = COALESCE($11, experience_years),
           status = COALESCE($12, status)
         WHERE id = $13 AND posted_by = $14
         RETURNING *`,
        [
          title || null,
          description || null,
          qualifications || null,
          location || null,
          workplace || null,
          country || null,
          city || null,
          career_level || null,
          job_category || null,
          job_type || null,
          experience_years !== undefined ? experience_years : null,
          status || null,
          id,
          req.user.userId,
        ]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: "Job not found or you don't have permission to update it",
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
DELETE /jobs/:id
Delete job posting (recruiter only)
========================================
*/
router.delete(
  "/:id",
  auth,
  [param("id").isInt().withMessage("Invalid job ID")],
  async (req, res) => {
    // Only recruiters can delete jobs
    if (req.user.role !== "recruiter") {
      return res.status(403).json({
        error: "Only recruiters can delete jobs",
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;

    try {
      const result = await pool.query(
        `DELETE FROM jobs WHERE id = $1 AND posted_by = $2 RETURNING *`,
        [id, req.user.userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: "Job not found or you don't have permission to delete it",
        });
      }

      res.json({
        message: "Job deleted successfully",
        job: result.rows[0],
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

/*
========================================
GET /jobs
Get all jobs (public for candidates, filtered for recruiters)
========================================
*/
router.get(
  "/",
  [
    query("min_experience")
      .optional()
      .isInt({ min: 0 })
      .withMessage("min_experience must be a non-negative number"),
    query("status")
      .optional()
      .isIn(["draft", "open", "closed"])
      .withMessage("Invalid status"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { location, min_experience, status } = req.query;

    let queryStr = "SELECT * FROM jobs WHERE 1=1";
    const values = [];

    // Candidates only see open jobs
    // Recruiters see all their jobs
    if (!req.user || req.user.role === "candidate") {
      queryStr += " AND status = 'open'";
    } else if (req.user.role === "recruiter") {
      values.push(req.user.userId);
      queryStr += ` AND posted_by = $${values.length}`;

      if (status) {
        values.push(status);
        queryStr += ` AND status = $${values.length}`;
      }
    }

    if (location) {
      values.push(location);
      queryStr += ` AND location = $${values.length}`;
    }

    if (min_experience) {
      values.push(Number(min_experience));
      queryStr += ` AND experience_years >= $${values.length}`;
    }

    queryStr += " ORDER BY created_at DESC";

    try {
      const result = await pool.query(queryStr, values);
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

/*
========================================
GET /jobs/stats
Get job statistics for recruiter
========================================
*/
router.get("/stats", auth, async (req, res) => {
  // Only recruiters can view stats
  if (req.user.role !== "recruiter") {
    return res.status(403).json({
      error: "Only recruiters can view job statistics",
    });
  }

  try {
    const result = await pool.query(
      `SELECT 
        COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_count,
        COUNT(CASE WHEN status = 'open' THEN 1 END) as open_count,
        COUNT(CASE WHEN status = 'closed' THEN 1 END) as closed_count,
        COUNT(*) as total_jobs
       FROM jobs
       WHERE posted_by = $1`,
      [req.user.userId]
    );

    const stats = result.rows[0];

    // Get total applications
    const appResult = await pool.query(
      `SELECT COUNT(*) as total_applications
       FROM applications a
       JOIN jobs j ON a.job_id = j.id
       WHERE j.posted_by = $1`,
      [req.user.userId]
    );

    res.json({
      draft: parseInt(stats.draft_count) || 0,
      open: parseInt(stats.open_count) || 0,
      closed: parseInt(stats.closed_count) || 0,
      total_jobs: parseInt(stats.total_jobs) || 0,
      total_applications: parseInt(appResult.rows[0].total_applications) || 0,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/*
========================================
GET /jobs/:id
Get single job details
========================================
*/
router.get(
  "/:id",
  [param("id").isInt().withMessage("Invalid job ID")],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const result = await pool.query(
        `SELECT j.*, c.company_name
         FROM jobs j
         LEFT JOIN companies c ON j.company_id = c.id
         WHERE j.id = $1`,
        [req.params.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Job not found" });
      }

      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

/*
========================================
GET /jobs/:id/applications
Get all applications for a job (recruiter only)
========================================
*/
router.get(
  "/:id/applications",
  auth,
  [param("id").isInt().withMessage("Invalid job ID")],
  async (req, res) => {
    // Only recruiters can view applications
    if (req.user.role !== "recruiter") {
      return res.status(403).json({
        error: "Only recruiters can view applications",
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const result = await pool.query(
        `SELECT 
          a.id as application_id,
          a.status,
          a.applied_at,
          u.id as candidate_id,
          u.name as candidate_name,
          u.email as candidate_email,
          u.current_job_title,
          u.photo_base64
         FROM applications a
         JOIN users u ON a.user_id = u.id
         JOIN jobs j ON a.job_id = j.id
         WHERE j.id = $1 AND j.posted_by = $2
         ORDER BY a.applied_at DESC`,
        [req.params.id, req.user.userId]
      );

      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;