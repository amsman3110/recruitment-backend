const express = require("express");
const { body, query, validationResult } = require("express-validator");
const router = express.Router();
const pool = require("../db");

/*
========================================
POST /jobs
Create a new job posting (validated)
========================================
*/
router.post(
  "/",
  [
    body("title")
      .notEmpty()
      .withMessage("Job title is required"),
    body("experience_years")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Experience must be a non-negative number"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, location, experience_years } = req.body;

    try {
      const result = await pool.query(
        `INSERT INTO jobs (title, description, location, experience_years)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [
          title,
          description || null,
          location || null,
          experience_years || null,
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
Update job posting (validated)
========================================
*/
router.put(
  "/:id",
  [
    body("title")
      .optional()
      .notEmpty()
      .withMessage("Title cannot be empty"),
    body("experience_years")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Experience must be a non-negative number"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { title, description, location, experience_years } = req.body;

    if (!title && !description && !location && experience_years === undefined) {
      return res.status(400).json({
        error: "At least one field is required",
      });
    }

    try {
      const result = await pool.query(
        `UPDATE jobs
         SET
           title = COALESCE($1, title),
           description = COALESCE($2, description),
           location = COALESCE($3, location),
           experience_years = COALESCE($4, experience_years)
         WHERE id = $5
         RETURNING *`,
        [
          title || null,
          description || null,
          location || null,
          experience_years !== undefined ? experience_years : null,
          id,
        ]
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
DELETE /jobs/:id
Delete job posting
========================================
*/
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `DELETE FROM jobs WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Job not found" });
    }

    res.json({
      message: "Job deleted successfully",
      job: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/*
========================================
GET /jobs
Filter jobs (validated query params)
========================================
*/
router.get(
  "/",
  [
    query("min_experience")
      .optional()
      .isInt({ min: 0 })
      .withMessage("min_experience must be a non-negative number"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { location, min_experience } = req.query;

    let queryStr = "SELECT * FROM jobs WHERE 1=1";
    const values = [];

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

module.exports = router;
