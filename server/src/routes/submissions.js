const express = require("express");
const router = express.Router();
const pool = require("../../db");
const { auth } = require("../middleware/auth");



// routes/submissions.js
router.post("/", auth(["trainee", "dispatcher"]), async (req, res) => {
  const { user } = req;
  const { exerciseId, answers } = req.body;

  try {
    const result = await pool.query(
      `
      INSERT INTO exercise_submissions (user_id, exercise_id, answers)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, exercise_id)
      DO UPDATE SET answers = $3, submitted_at = NOW()
      RETURNING *;
      `,
      [user.id, exerciseId, answers]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("❌ Submission failed:", err);
    res.status(500).json({ error: "Failed to submit exercise" });
  }
});

// GET /submissions/status?exercise_ids[]=uuid1&exercise_ids[]=uuid2...
router.get("/status", auth(["trainee", "dispatcher"]), async (req, res) => {
  const { user } = req;

  // Support both forms: exercise_ids and exercise_ids[]
  const exerciseIds =
    req.query.exercise_ids || req.query["exercise_ids[]"];


  if (!Array.isArray(exerciseIds) || exerciseIds.length === 0) {
    return res.status(400).json({ error: "Missing or invalid exercise_ids" });
  }

  try {
    const { rows } = await pool.query(
      `
      SELECT exercise_id
      FROM exercise_submissions
      WHERE user_id = $1 AND exercise_id = ANY($2)
      `,
      [user.id, exerciseIds]
    );

    const completedMap = Object.fromEntries(rows.map((r) => [r.exercise_id, true]));
    res.status(200).json({ completedMap });
  } catch (err) {
    console.error("❌ Failed to fetch submission statuses:", err);
    res.status(500).json({ error: "Server error" });
  }
});



// Get submissions for a specific user
router.get("/:exerciseId", auth(["trainee", "dispatcher"]), async (req, res) => {
  const { user } = req;
  const { exerciseId } = req.params;

  try {
    const { rows } = await pool.query(
      `
      SELECT answers, submitted_at FROM exercise_submissions
      WHERE user_id = $1 AND exercise_id = $2
      `,
      [user.id, exerciseId]
    );

    if (rows.length === 0) {
      return res.status(200).json({ submitted: false });
    }

    res.status(200).json({ submitted: true, answers: rows[0].answers, submitted_at: rows[0].submitted_at });
  } catch (err) {
    console.error("❌ Error checking submission:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST: Mark scenario as completed in walkthrough
router.post("/scenario_walkthrough", auth(["trainee", "dispatcher"]), async (req, res) => {
  const { scenarioId } = req.body;
  const userId = req.user?.id || req.user; // Adjust depending on your auth structure

  if (!scenarioId) {
    return res.status(400).json({ error: "scenarioId is required" });
  }

  try {
    await pool.query(
      `
      INSERT INTO scenario_completions (user_id, scenario_id)
      VALUES ($1, $2)
      ON CONFLICT (user_id, scenario_id) DO NOTHING
    `,
      [userId, scenarioId]
    );

    return res.status(201).json({ message: "Scenario completion recorded" });
  } catch (err) {
    console.error("❌ Error recording scenario completion:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// GET /submissions/scenario_walkthrough/status?scenario_ids[]=uuid1&scenario_ids[]=uuid2
router.get("/scenario_walkthrough/status", auth(["trainee", "dispatcher"]), async (req, res) => {
  const { user } = req;
  let scenarioIds = req.query.scenario_ids || req.query["scenario_ids[]"];

  if (!scenarioIds) {
    return res.status(400).json({ error: "Missing scenario_ids" });
  }

  if (typeof scenarioIds === "string") {
    scenarioIds = [scenarioIds];
  }

  if (!Array.isArray(scenarioIds)) {
    return res.status(400).json({ error: "scenario_ids must be an array" });
  }

  try {
    const { rows } = await pool.query(
      `
      SELECT scenario_id
      FROM scenario_completions
      WHERE user_id = $1 AND scenario_id = ANY($2::uuid[])
      `,
      [user.id, scenarioIds]
    );

    const completedMap = Object.fromEntries(rows.map((r) => [r.scenario_id, true]));

    res.status(200).json({ completedMap });
  } catch (err) {
    console.error("❌ Failed to fetch scenario completion statuses:", err);
    res.status(500).json({ error: "Server error" });
  }
});



module.exports = router;