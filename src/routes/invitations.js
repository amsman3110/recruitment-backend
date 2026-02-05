const express = require("express");
const { body, param, validationResult } = require("express-validator");
const auth = require("../middleware/auth");
const pool = require("../db");

const router = express.Router();

/*
========================================
POST /invitations/send
Send job invitation to candidate
========================================
*/
router.post(
  "/send",
  auth,
  [
    body("candidate_id").isInt().withMessage("Valid candidate ID required"),
    body("job_id").isInt().withMessage("Valid job ID required"),
    body("message").optional().isString(),
  ],
  async (req, res) => {
    // Only recruiters can send invitations
    if (req.user.role !== "recruiter") {
      return res.status(403).json({
        error: "Only recruiters can send invitations",
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { candidate_id, job_id, message } = req.body;

    try {
      // Check if invitation already exists
      const existing = await pool.query(
        `SELECT id FROM invitations 
         WHERE candidate_id = $1 AND job_id = $2`,
        [candidate_id, job_id]
      );

      if (existing.rows.length > 0) {
        return res.status(400).json({
          error: "Invitation already sent to this candidate for this job",
        });
      }

      const result = await pool.query(
        `INSERT INTO invitations (candidate_id, job_id, recruiter_id, message, status)
         VALUES ($1, $2, $3, $4, 'pending')
         RETURNING *`,
        [candidate_id, job_id, req.user.userId, message || null]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

/*
========================================
GET /invitations/recruiter
Get all invitations sent by recruiter
========================================
*/
router.get("/recruiter", auth, async (req, res) => {
  // Only recruiters can view their invitations
  if (req.user.role !== "recruiter") {
    return res.status(403).json({
      error: "Only recruiters can view invitations",
    });
  }

  try {
    const result = await pool.query(
      `SELECT 
        i.id,
        i.message,
        i.status,
        i.created_at,
        j.id as job_id,
        j.title as job_title,
        u.id as candidate_id,
        u.name as candidate_name,
        u.email as candidate_email
       FROM invitations i
       JOIN jobs j ON i.job_id = j.id
       JOIN users u ON i.candidate_id = u.id
       WHERE i.recruiter_id = $1
       ORDER BY i.created_at DESC`,
      [req.user.userId]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/*
========================================
GET /invitations/candidate
Get all invitations received by candidate
========================================
*/
router.get("/candidate", auth, async (req, res) => {
  // Only candidates can view their invitations
  if (req.user.role !== "candidate") {
    return res.status(403).json({
      error: "Only candidates can view their invitations",
    });
  }

  try {
    const result = await pool.query(
      `SELECT 
        i.id,
        i.message,
        i.status,
        i.created_at,
        j.id as job_id,
        j.title as job_title,
        j.description as job_description,
        j.location as job_location,
        c.company_name,
        u.email as recruiter_email
       FROM invitations i
       JOIN jobs j ON i.job_id = j.id
       JOIN users u ON i.recruiter_id = u.id
       LEFT JOIN companies c ON c.user_id = u.id
       WHERE i.candidate_id = $1
       ORDER BY i.created_at DESC`,
      [req.user.userId]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/*
========================================
PUT /invitations/:id/status
Update invitation status (candidate accepts/declines)
========================================
*/
router.put(
  "/:id/status",
  auth,
  [
    param("id").isInt().withMessage("Invalid invitation ID"),
    body("status")
      .isIn(["accepted", "declined"])
      .withMessage("Status must be accepted or declined"),
  ],
  async (req, res) => {
    // Only candidates can update invitation status
    if (req.user.role !== "candidate") {
      return res.status(403).json({
        error: "Only candidates can respond to invitations",
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status } = req.body;

    try {
      const result = await pool.query(
        `UPDATE invitations
         SET status = $1
         WHERE id = $2 AND candidate_id = $3
         RETURNING *`,
        [status, req.params.id, req.user.userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: "Invitation not found",
        });
      }

      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;