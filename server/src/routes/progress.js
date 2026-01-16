const express = require('express');
const router = express.Router();
const pool = require('../../db');
const { auth } = require('../middleware/auth');

/* -----------------------------
   Helper Functions
----------------------------- */

// 🔹 Total number of exercises available to a given role
async function getTotalNumberOfExercises(role) {
  try {
    const { rows } = await pool.query(
      `
      SELECT COUNT(*) AS total
      FROM exercises
      WHERE audience IN ($1, 'All')
      AND status = 'published'
      `,
      [role]
    );
    return parseInt(rows[0].total, 10);
  } catch (err) {
    console.error("❌ Failed to fetch total number of exercises:", err);
    throw err;
  }
}

// 🔹 Total number of completed exercises for a given user
async function getTotalNumberOfCompletedExercises(userId) {
  try {

    const { rows } = await pool.query(
      `
      SELECT COUNT(DISTINCT exercise_id) AS completed
      FROM exercise_submissions
      WHERE user_id = $1
      `,
      [userId]
    );
    return parseInt(rows[0].completed, 10);
  } catch (err) {
    console.error("❌ Failed to fetch total number of completed exercises:", err);
    throw err;
  }
}

// 🔹 Total number of scenarios available to a given role
async function getTotalNumberOfScenarios(role) {
  try {
    const { rows } = await pool.query(
      `
      SELECT COUNT(*) AS total
FROM scenarios
WHERE scenario_data->>'audience' IN ($1, 'All')
AND scenario_data->>'status' = 'published';

      `,
      [role]
    );
    return parseInt(rows[0].total, 10);
  } catch (err) {
    console.error("❌ Failed to fetch total number of scenarios:", err);
    throw err;
  }
}

// 🔹 Total number of completed scenarios for a given user
async function getTotalNumberOfCompletedScenarios(userId) {
  try {
    const { rows } = await pool.query(
      `
      SELECT COUNT(DISTINCT scenario_id) AS completed
      FROM scenario_completions
      WHERE user_id = $1
      `,
      [userId]
    );
    return parseInt(rows[0].completed, 10);
  } catch (err) {
    console.error("❌ Failed to fetch total number of completed scenarios:", err);
    throw err;
  }
}

/* -----------------------------
   Routes
----------------------------- */

// 🔹 GET total available exercises + scenarios for a role
router.get('/totals', auth(['admin']), async (req, res) => {
  const role = req.query.role;

  if (!role) {
    return res.status(400).json({ error: 'Missing role parameter' });
  }

  try {
    const [totalExercises, totalScenarios] = await Promise.all([
      getTotalNumberOfExercises(role),
      getTotalNumberOfScenarios(role),
    ]);

    res.json({ totalExercises, totalScenarios });
  } catch (err) {
    console.error("❌ Failed to fetch dispatcher totals:", err);
    res.status(500).json({ error: 'Failed to fetch dispatcher totals' });
  }
});

// 🔹 GET completed progress for multiple users
router.get('/completed', auth(['admin']), async (req, res) => {
  let { userIds } = req.query;

  // Normalize query: allow both ?userIds=a,b,c and ?userIds[]=a&userIds[]=b
  if (!userIds) {
    return res.status(400).json({ error: 'userIds parameter is required' });
  }

  if (typeof userIds === 'string') {
    userIds = userIds.split(',');
  }

  // Filter invalid IDs
  const validUserIds = userIds.filter(id => id && id.trim() !== '');

  if (validUserIds.length === 0) {
    return res.status(400).json({ error: 'No valid user IDs provided' });
  }


  try {
    const results = {};

    // Fetch all users’ completed progress concurrently
    await Promise.all(
      validUserIds.map(async (userId) => {
        const [completedExercises, completedScenarios] = await Promise.all([
          getTotalNumberOfCompletedExercises(userId),
          getTotalNumberOfCompletedScenarios(userId),
        ]);

        results[userId] = {
          completedExercises,
          completedScenarios,
        };
      })
    );

    res.json(results);
  } catch (err) {
    console.error("❌ Failed to fetch completed progress:", err);
    res.status(500).json({ error: 'Failed to fetch completed progress' });
  }
});

// 🔹 GET recent activity for exercises and scenarios
router.get('/recent-activity', auth(['admin']), async (req, res) => {
  try {
    // Get recent exercise submissions with exercise details
    const exercisesQuery = `
      SELECT 
        e.id,
        e.name,
        COUNT(DISTINCT es.user_id) as completed_count,
        COUNT(DISTINCT u.id) as total_users
      FROM exercises e
      LEFT JOIN exercise_submissions es ON e.id = es.exercise_id
      LEFT JOIN users u ON u.role IN ('trainee', 'dispatcher')
      WHERE e.in_trash = false AND e.status = 'published'
      GROUP BY e.id, e.name
      ORDER BY MAX(es.submitted_at) DESC NULLS LAST, e.created_at DESC
      LIMIT 5
    `;

    // Get recent scenario completions with scenario details
    const scenariosQuery = `
      SELECT 
        s.id,
        s.scenario_data->>'name' as name,
        COUNT(DISTINCT sc.user_id) as completed_count,
        COUNT(DISTINCT u.id) as total_users
      FROM scenarios s
      LEFT JOIN scenario_completions sc ON s.id = sc.scenario_id
      LEFT JOIN users u ON u.role IN ('trainee', 'dispatcher')
      WHERE s.in_trash = false AND s.scenario_data->>'status' = 'published'
      GROUP BY s.id, s.scenario_data->>'name'
      ORDER BY MAX(sc.completed_at) DESC NULLS LAST, s.created_at DESC
      LIMIT 5
    `;

    const [exercisesResult, scenariosResult] = await Promise.all([
      pool.query(exercisesQuery),
      pool.query(scenariosQuery)
    ]);

    const exercises = exercisesResult.rows.map(row => ({
      id: row.id,
      name: row.name,
      completed: parseInt(row.completed_count),
      total: parseInt(row.total_users)
    }));

    const scenarios = scenariosResult.rows.map(row => ({
      id: row.id,
      name: row.name,
      completed: parseInt(row.completed_count),
      total: parseInt(row.total_users)
    }));

    res.json({ exercises, scenarios });
  } catch (err) {
    console.error("❌ Failed to fetch recent activity:", err);
    res.status(500).json({ error: 'Failed to fetch recent activity' });
  }
});

module.exports = router;
