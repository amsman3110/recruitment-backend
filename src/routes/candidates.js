const express = require("express");
const { body, validationResult } = require("express-validator");
const pool = require("../db");

const router = express.Router();

/*
========================================
GET /candidates/me
Get own candidate profile
========================================
*/
router.get("/me", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, email, role, created_at
       FROM users
       WHERE id = $1 AND role = 'candidate'`,
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Candidate profile not found",
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/*
========================================
PUT /candidates/me
Update own candidate profile
(Phase One: email only)
========================================
*/
router.put(
  "/me",
  [
    body("email")
      .optional()
      .isEmail()
      .withMessage("Valid email is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: "Nothing to update",
      });
    }

    try {
      const result = await pool.query(
        `UPDATE users
         SET email = $1
         WHERE id = $2 AND role = 'candidate'
         RETURNING id, email, role, created_at`,
        [email, req.user.userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: "Candidate profile not found",
        });
      }

      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;
