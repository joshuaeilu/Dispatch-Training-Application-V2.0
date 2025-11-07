const express = require("express");
const router = express.Router();
const pool = require("../../db");
const { auth } = require("../middleware/auth");




// GET /api/submissions/exercises/:userId
router.get("/exercises/:userId", async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    const query = `
      SELECT DISTINCT exercise_id
      FROM exercise_submissions
      WHERE user_id = $1
    `;

    const { rows } = await pool.query(query, [userId]);

    const exerciseIds = rows.map(row => row.exercise_id);

    return res.status(200).json({ userId, exerciseIds });
  } catch (error) {
    console.error("Error fetching exercise IDs:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

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



// ✅ Define totals route FIRST
router.get("/summary/totals", async (_req, res) => {
  try {
    const [exerciseTotalRes, scenarioTotalRes] = await Promise.all([
      pool.query(`SELECT COUNT(*) AS total FROM exercises WHERE status = 'published'`),
      pool.query(`SELECT COUNT(*) AS total FROM scenarios WHERE status = 'published'`),
    ]);

    const totalExercises = Number(exerciseTotalRes.rows[0]?.total || 0);
    const totalScenarios = Number(scenarioTotalRes.rows[0]?.total || 0);

    return res.status(200).json({
      totals: {
        exercises: totalExercises,
        scenarios: totalScenarios,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching totals:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ Define user summary route AFTER
router.get("/summary/:userId", async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    const [exerciseCompletedRes, scenarioCompletedRes] = await Promise.all([
      pool.query(
        `SELECT COUNT(DISTINCT exercise_id) AS count
         FROM exercise_submissions
         WHERE user_id = $1`,
        [userId]
      ),
      pool.query(
        `SELECT COUNT(DISTINCT scenario_id) AS count
         FROM scenario_completions
         WHERE user_id = $1`,
        [userId]
      ),
    ]);

    const exercisesCompleted = Number(exerciseCompletedRes.rows[0]?.count || 0);
    const scenariosCompleted = Number(scenarioCompletedRes.rows[0]?.count || 0);

    return res.status(200).json({
      userId,
      completed: {
        exercises: exercisesCompleted,
        scenarios: scenariosCompleted,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching user progress:", error);
    return res.status(500).json({ error: "Internal server error" });
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

// GET /api/submissions/scenarios/:userId
router.get("/scenarios/:userId", async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    const query = `
      SELECT DISTINCT scenario_id
      FROM scenario_completions
      WHERE user_id = $1
    `;

    const { rows } = await pool.query(query, [userId]);

    const scenarioIds = rows.map(row => row.scenario_id);

    return res.status(200).json({ userId, scenarioIds });
  } catch (error) {
    console.error("❌ Error fetching scenario completions:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});



module.exports = router;