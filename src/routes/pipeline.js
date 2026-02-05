const express = require("express");
const { body, param, validationResult } = require("express-validator");
const auth = require("../middleware/auth");
const pool = require("../db");

const router = express.Router();

/*
========================================
GET /pipeline/:jobId
Get all candidates in pipeline for a job
========================================
*/
router.get(
  "/:jobId",
  auth,
  [param("jobId").isInt().withMessage("Invalid job ID")],
  async (req, res) => {
    if (req.user.role !== "recruiter") {
      return res.status(403).json({
        error: "Only recruiters can view pipeline",
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const result = await pool.query(
        `SELECT 
          ps.id,
          ps.stage,
          ps.notes,
          ps.created_at,
          ps.updated_at,
          u.id as candidate_id,
          u.name as candidate_name,
          u.email as candidate_email,
          u.current_job_title,
          u.photo_base64
         FROM pipeline_stages ps
         JOIN users u ON ps.candidate_id = u.id
         WHERE ps.job_id = $1
         ORDER BY ps.updated_at DESC`,
        [req.params.jobId]
      );

      const pipeline = {
        applied: [],
        shortlisted: [],
        rejected: [],
        on_hold: [],
        interview_scheduled: [],
        interviewing: [],
        job_offer: [],
        hired: [],
      };

      result.rows.forEach((row) => {
        if (pipeline[row.stage]) {
          pipeline[row.stage].push({
            pipeline_id: row.id,
            candidate_id: row.candidate_id,
            candidate_name: row.candidate_name,
            candidate_email: row.candidate_email,
            current_job_title: row.current_job_title,
            photo_base64: row.photo_base64,
            notes: row.notes,
            moved_at: row.updated_at,
          });
        }
      });

      res.json(pipeline);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

/*
========================================
POST /pipeline/move
Move candidate to different stage
========================================
*/
router.post(
  "/move",
  auth,
  [
    body("candidate_id").isInt().withMessage("Valid candidate ID required"),
    body("job_id").isInt().withMessage("Valid job ID required"),
    body("stage")
      .isIn([
        "applied",
        "shortlisted",
        "rejected",
        "on_hold",
        "interview_scheduled",
        "interviewing",
        "job_offer",
        "hired",
      ])
      .withMessage("Invalid stage"),
    body("notes").optional().isString(),
  ],
  async (req, res) => {
    if (req.user.role !== "recruiter") {
      return res.status(403).json({
        error: "Only recruiters can move candidates",
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { candidate_id, job_id, stage, notes } = req.body;

    try {
      const existing = await pool.query(
        `SELECT id FROM pipeline_stages 
         WHERE job_id = $1 AND candidate_id = $2`,
        [job_id, candidate_id]
      );

      let result;

      if (existing.rows.length > 0) {
        result = await pool.query(
          `UPDATE pipeline_stages
           SET stage = $1, notes = $2, moved_by = $3, updated_at = NOW()
           WHERE job_id = $4 AND candidate_id = $5
           RETURNING *`,
          [stage, notes || null, req.user.userId, job_id, candidate_id]
        );
      } else {
        result = await pool.query(
          `INSERT INTO pipeline_stages (job_id, candidate_id, stage, notes, moved_by)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING *`,
          [job_id, candidate_id, stage, notes || null, req.user.userId]
        );
      }

      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

/*
========================================
POST /pipeline/add
Add candidate to pipeline
========================================
*/
router.post(
  "/add",
  auth,
  [
    body("candidate_id").isInt().withMessage("Valid candidate ID required"),
    body("job_id").isInt().withMessage("Valid job ID required"),
    body("stage").optional().isString(),
  ],
  async (req, res) => {
    if (req.user.role !== "recruiter") {
      return res.status(403).json({
        error: "Only recruiters can add candidates to pipeline",
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { candidate_id, job_id, stage } = req.body;

    try {
      const result = await pool.query(
        `INSERT INTO pipeline_stages (job_id, candidate_id, stage, moved_by)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (job_id, candidate_id) 
         DO UPDATE SET stage = $3, moved_by = $4, updated_at = NOW()
         RETURNING *`,
        [job_id, candidate_id, stage || "shortlisted", req.user.userId]
      );

      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;