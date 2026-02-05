const express = require("express");
const { body, param, validationResult } = require("express-validator");
const auth = require("../middleware/auth");
const pool = require("../db");

const router = express.Router();

/*
========================================
POST /questions/:jobId
Add shortlisting question to job
========================================
*/
router.post(
  "/:jobId",
  auth,
  [
    param("jobId").isInt().withMessage("Invalid job ID"),
    body("question").notEmpty().withMessage("Question is required"),
    body("question_type")
      .optional()
      .isIn(["text", "multiple_choice", "yes_no"])
      .withMessage("Invalid question type"),
    body("options").optional().isArray(),
    body("required").optional().isBoolean(),
  ],
  async (req, res) => {
    // Only recruiters can add questions
    if (req.user.role !== "recruiter") {
      return res.status(403).json({
        error: "Only recruiters can add questions",
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { question, question_type, options, required } = req.body;

    try {
      const result = await pool.query(
        `INSERT INTO shortlisting_questions (job_id, question, question_type, options, required)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [
          req.params.jobId,
          question,
          question_type || "text",
          options ? JSON.stringify(options) : null,
          required !== undefined ? required : true,
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
GET /questions/:jobId
Get all questions for a job
========================================
*/
router.get(
  "/:jobId",
  auth,
  [param("jobId").isInt().withMessage("Invalid job ID")],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const result = await pool.query(
        `SELECT * FROM shortlisting_questions
         WHERE job_id = $1
         ORDER BY created_at ASC`,
        [req.params.jobId]
      );

      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

/*
========================================
DELETE /questions/:id
Delete a question
========================================
*/
router.delete(
  "/:id",
  auth,
  [param("id").isInt().withMessage("Invalid question ID")],
  async (req, res) => {
    // Only recruiters can delete questions
    if (req.user.role !== "recruiter") {
      return res.status(403).json({
        error: "Only recruiters can delete questions",
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const result = await pool.query(
        `DELETE FROM shortlisting_questions
         WHERE id = $1
         RETURNING *`,
        [req.params.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: "Question not found",
        });
      }

      res.json({
        message: "Question deleted successfully",
        question: result.rows[0],
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

/*
========================================
GET /questions/answers/:applicationId
Get candidate's answers for an application
========================================
*/
router.get(
  "/answers/:applicationId",
  auth,
  [param("applicationId").isInt().withMessage("Invalid application ID")],
  async (req, res) => {
    // Only recruiters can view answers
    if (req.user.role !== "recruiter") {
      return res.status(403).json({
        error: "Only recruiters can view answers",
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const result = await pool.query(
        `SELECT 
          sa.id,
          sa.answer,
          sa.created_at,
          sq.question,
          sq.question_type,
          sq.options
         FROM shortlisting_answers sa
         JOIN shortlisting_questions sq ON sa.question_id = sq.id
         WHERE sa.application_id = $1
         ORDER BY sa.created_at ASC`,
        [req.params.applicationId]
      );

      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;