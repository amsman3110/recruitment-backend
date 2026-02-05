const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const pool = require("../db");

const router = express.Router();

/*
========================================
POST /auth/register
Register as CANDIDATE
========================================
*/
router.post(
  "/register",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name } = req.body;

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      const result = await pool.query(
        `INSERT INTO users (email, password, role, name)
         VALUES ($1, $2, 'candidate', $3)
         RETURNING id, email, role, name`,
        [email, hashedPassword, name || null]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      if (error.code === "23505") {
        return res.status(400).json({
          error: "Email already exists",
        });
      }

      res.status(500).json({ error: error.message });
    }
  }
);

/*
========================================
POST /auth/login
Login as CANDIDATE
========================================
*/
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      const result = await pool.query(
        `SELECT id, email, password, role FROM users WHERE email = $1`,
        [email]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({
          error: "Invalid email or password",
        });
      }

      const user = result.rows[0];
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        return res.status(401).json({
          error: "Invalid email or password",
        });
      }

      const token = jwt.sign(
        {
          userId: user.id,
          role: user.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

/*
========================================
POST /auth/register-recruiter
Register as RECRUITER/COMPANY
Creates user + company profile
========================================
*/
router.post(
  "/register-recruiter",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("companyName")
      .notEmpty()
      .withMessage("Company name is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, companyName, industry } = req.body;

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // 1. Create user with recruiter role
      const hashedPassword = await bcrypt.hash(password, 10);

      const userResult = await client.query(
        `INSERT INTO users (email, password, role)
         VALUES ($1, $2, 'recruiter')
         RETURNING id, email, role`,
        [email, hashedPassword]
      );

      const user = userResult.rows[0];

      // 2. Create company profile
      const companyResult = await client.query(
        `INSERT INTO companies (user_id, company_name, industry)
         VALUES ($1, $2, $3)
         RETURNING id, company_name, industry`,
        [user.id, companyName, industry || null]
      );

      await client.query("COMMIT");

      res.status(201).json({
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        company: companyResult.rows[0],
      });
    } catch (error) {
      await client.query("ROLLBACK");

      if (error.code === "23505") {
        return res.status(400).json({
          error: "Email already exists",
        });
      }

      res.status(500).json({ error: error.message });
    } finally {
      client.release();
    }
  }
);

/*
========================================
POST /auth/login-recruiter
Login as RECRUITER
Returns user + company data
========================================
*/
router.post(
  "/login-recruiter",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // Get user
      const userResult = await pool.query(
        `SELECT id, email, password, role FROM users WHERE email = $1`,
        [email]
      );

      if (userResult.rows.length === 0) {
        return res.status(401).json({
          error: "Invalid email or password",
        });
      }

      const user = userResult.rows[0];

      // Check if user is recruiter
      if (user.role !== "recruiter") {
        return res.status(403).json({
          error: "This account is not a recruiter account",
        });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        return res.status(401).json({
          error: "Invalid email or password",
        });
      }

      // Get company profile
      const companyResult = await pool.query(
        `SELECT id, company_name, industry, specialization, 
                number_of_employees, company_summary, office_location,
                location_lat, location_lng, logo_base64
         FROM companies 
         WHERE user_id = $1`,
        [user.id]
      );

      const token = jwt.sign(
        {
          userId: user.id,
          role: user.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        company: companyResult.rows[0] || null,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;