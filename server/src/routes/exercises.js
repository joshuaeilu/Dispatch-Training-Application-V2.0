const express = require("express");
const router = express.Router();
const pool = require("../../db"); // your PostgreSQL pool
const { auth } = require("../middleware/auth");

// 🔹 Create or update exercise (upsert)
router.put("/:id", auth(["admin"]), async (req, res) => {
  try {
    const exerciseId = req.params.id;
    const {
      id = exerciseId, // fallback
      name,
      type,
      difficulty,
      audience = "all",
      visibility = true,
      status = "draft",
      questions = [],
      createdBy = "Unknown",
    } = req.body;

    console.log("💾 Autosaving exercise:", name);

    if (!name || !type || !difficulty || !Array.isArray(questions)) {
      return res
        .status(400)
        .json({ error: "Missing required fields or invalid format" });
    }

    const query = `
      INSERT INTO exercises (
        id, name, type, difficulty, audience, visibility, status, questions, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (id) DO UPDATE
      SET
        name       = EXCLUDED.name,
        type       = EXCLUDED.type,
        difficulty = EXCLUDED.difficulty,
        audience   = EXCLUDED.audience,
        visibility = EXCLUDED.visibility,
        status     = EXCLUDED.status,
        questions  = EXCLUDED.questions,
        created_by = COALESCE(exercises.created_by, EXCLUDED.created_by)
      RETURNING *;
    `;

    const values = [
      id,
      name,
      type,
      difficulty,
      audience,
      visibility,
      status,
      JSON.stringify(questions),
      createdBy,
    ];

    const { rows } = await pool.query(query, values);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error("❌ Failed to create/update exercise:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 🔹 Get all exercises
router.get("/", auth(["admin", "trainee"]), async (req, res) => {
  try {
    const user = req.user; // decoded from JWT by auth middleware

    let query = `
      SELECT exercises.id,
             exercises.name,
             exercises.type,
             exercises.status,
             exercises.difficulty,
             exercises.visibility,
             exercises.audience,
             exercises.questions,
             json_build_object(
               'id', users.id,
               'name', users.username,
               'avatar_url', users.avatar
             ) AS created_by
      FROM exercises
      JOIN users ON users.id = exercises.created_by
    `;

    const values = [];

    // If the user is a trainee, restrict what they can see
    if (user.role === "trainee") {
      query += ` WHERE exercises.audience IN ($1, $2)`;
      values.push("Trainees", "All");
    }

    query += ` ORDER BY exercises.created_at DESC;`;

    const { rows } = await pool.query(query, values);
    res.status(200).json(rows);
  } catch (error) {
    console.error("❌ Failed to fetch exercises:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


// 🔹 Get a single exercise by ID
router.get("/:id", auth(["admin", "trainee"]), async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      `
      SELECT exercises.id,
             exercises.name,
             exercises.type,
             exercises.status,
             exercises.difficulty,
             exercises.visibility,
             exercises.audience,
             exercises.questions,
             exercises.created_by,
             json_build_object(
               'id', users.id,
               'name', users.username,
               'avatar_url', users.avatar
             ) AS created_by
      FROM exercises
      JOIN users ON users.id = exercises.created_by
      WHERE exercises.id = $1
      LIMIT 1;
    `,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Exercise not found" });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error("❌ Failed to fetch exercise:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 🔹 Update visibility only
router.patch("/:id", auth(["admin"]), async (req, res) => {
  const { id } = req.params;
  const { visibility } = req.body;

  try {
    const result = await pool.query(
      "UPDATE exercises SET visibility = $1 WHERE id = $2 RETURNING *",
      [visibility, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Exercise not found" });
    }

    res.status(200).json({
      message: "Visibility updated",
      exercise: result.rows[0],
    });
  } catch (error) {
    console.error("❌ Failed to update exercise visibility:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 🔹 Delete exercise
router.delete("/:id", auth(["admin"]), async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM exercises WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Exercise not found" });
    }

    res.status(200).json({
      message: "Exercise deleted successfully",
      exercise: result.rows[0],
    });
  } catch (error) {
    console.error("❌ Failed to delete exercise:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


module.exports = router;
