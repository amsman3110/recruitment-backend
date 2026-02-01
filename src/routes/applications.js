const express = require("express");
const { body, param, query, validationResult } = require("express-validator");
const router = express.Router();
const pool = require("../db");

/*
========================================
POST /applications
Create new application (candidate only)
========================================
*/
router.post(
  "/",
  [
    body("job_id")
      .isInt({ min: 1 })
      .withMessage("job_id must be a valid number"),
  ],
  async (req, res) => {
    if (req.user.role !== "candidate") {
      return res.status(403).json({
        error: "Only candidates can apply for jobs",
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const result = await pool.query(
        `INSERT INTO applications (job_id, candidate_id)
         VALUES ($1, $2)
         RETURNING *`,
        [req.body.job_id, req.user.userId]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

/*
========================================
PUT /applications/:id/status
Update application status (client/admin)
========================================
*/
router.put(
  "/:id/status",
  [
    param("id")
      .isInt({ min: 1 })
      .withMessage("Application ID must be valid"),
    body("status")
      .isIn(["applied", "reviewed", "accepted", "rejected"])
      .withMessage("Invalid status value"),
  ],
  async (req, res) => {
    if (!["client", "admin"].includes(req.user.role)) {
      return res.status(403).json({
        error: "Only recruiters or admins can update status",
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const result = await pool.query(
        `UPDATE applications
         SET status = $1
         WHERE id = $2
         RETURNING *`,
        [req.body.status, req.params.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: "Application not found",
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
GET /applications
Ownership enforced
========================================
*/
router.get(
  "/",
  [
    query("status")
      .optional()
      .isIn(["applied", "reviewed", "accepted", "rejected"]),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let queryStr = "SELECT * FROM applications WHERE 1=1";
    const values = [];

    // Candidate: only their own applications
    if (req.user.role === "candidate") {
      values.push(req.user.userId);
      queryStr += ` AND candidate_id = $${values.length}`;
    }

    // Optional status filter
    if (req.query.status) {
      values.push(req.query.status);
      queryStr += ` AND status = $${values.length}`;
    }

    queryStr += " ORDER BY applied_at DESC";

    try {
      const result = await pool.query(queryStr, values);
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;
