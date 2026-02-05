const express = require("express");
const { body, validationResult } = require("express-validator");
const auth = require("../middleware/auth");
const pool = require("../db");

const router = express.Router();

/*
========================================
GET /company/profile
Get company profile for logged-in recruiter
========================================
*/
router.get("/profile", auth, async (req, res) => {
  // Only recruiters can access
  if (req.user.role !== "recruiter") {
    return res.status(403).json({
      error: "Only recruiters can access company profiles",
    });
  }

  try {
    const result = await pool.query(
      `SELECT 
        id,
        user_id,
        company_name,
        industry,
        specialization,
        number_of_employees,
        company_summary,
        office_location,
        location_lat,
        location_lng,
        logo_base64,
        created_at,
        updated_at
       FROM companies
       WHERE user_id = $1`,
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Company profile not found",
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/*
========================================
PUT /company/profile
Update company profile
========================================
*/
router.put(
  "/profile",
  auth,
  [
    body("company_name")
      .optional()
      .notEmpty()
      .withMessage("Company name cannot be empty"),
    body("location_lat")
      .optional()
      .isDecimal()
      .withMessage("Latitude must be a valid number"),
    body("location_lng")
      .optional()
      .isDecimal()
      .withMessage("Longitude must be a valid number"),
  ],
  async (req, res) => {
    // Only recruiters can update
    if (req.user.role !== "recruiter") {
      return res.status(403).json({
        error: "Only recruiters can update company profiles",
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      company_name,
      industry,
      specialization,
      number_of_employees,
      company_summary,
      office_location,
      location_lat,
      location_lng,
      logo_base64,
    } = req.body;

    try {
      const result = await pool.query(
        `UPDATE companies
         SET
           company_name = COALESCE($1, company_name),
           industry = COALESCE($2, industry),
           specialization = COALESCE($3, specialization),
           number_of_employees = COALESCE($4, number_of_employees),
           company_summary = COALESCE($5, company_summary),
           office_location = COALESCE($6, office_location),
           location_lat = COALESCE($7, location_lat),
           location_lng = COALESCE($8, location_lng),
           logo_base64 = COALESCE($9, logo_base64),
           updated_at = NOW()
         WHERE user_id = $10
         RETURNING *`,
        [
          company_name || null,
          industry || null,
          specialization || null,
          number_of_employees || null,
          company_summary || null,
          office_location || null,
          location_lat || null,
          location_lng || null,
          logo_base64 || null,
          req.user.userId,
        ]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: "Company profile not found",
        });
      }

      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;