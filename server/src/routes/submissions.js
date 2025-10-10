const express = require("express");
const router = express.Router();
const pool = require("../../db");
const { auth } = require("../middleware/auth");



// routes/submissions.js
router.post("/", auth(["trainee", "admin"]), async (req, res) => {
    console.log("📥 Received submission:", req.body);
  const { exercise_id, user_id, submitted_at,  answers } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO exercise_submissions (exercise_id, user_id, submitted_at,  answers)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [exercise_id, user_id, submitted_at, JSON.stringify(answers)]
    );

    res.status(201).json({ message: "Submission saved", submission: result.rows[0] });
  } catch (err) {
    console.error("❌ Failed to save submission:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get submissions for a specific user
// routes/submissions.js
router.get("/:userId", auth(["trainee", "admin"]), async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await pool.query(
      `SELECT exercise_id FROM exercise_submissions WHERE user_id = $1`,
      [userId]
    );

    const exerciseIds = result.rows.map((row) => row.exercise_id);
    res.status(200).json(exerciseIds);
  } catch (err) {
    console.error("❌ Failed to fetch submissions:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


module.exports = router;