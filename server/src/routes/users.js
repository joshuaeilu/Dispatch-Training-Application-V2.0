

// server/src/routes/users.js (or keep in your auth router if you prefer)
const express = require('express');
const pool = require('../../db');
const { auth } = require('../middleware/auth');

const router = express.Router();

// GET /users/dispatchers?search=john&page=1&pageSize=20
// Get all dispatcher accounts (admin only)
router.get('/users', auth(['admin']), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT username AS name, avatar, role
       FROM users
       ORDER BY username ASC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});
// GET /users/:id
router.get("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "SELECT id, name, avatar_url FROM users WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
