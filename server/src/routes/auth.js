const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../../db'); // PostgreSQL pool
require('dotenv').config();
const { auth } = require('../middleware/auth');


const router = express.Router();

router.post('/signup', auth(['admin']), async (req, res) => {
  const { username, password, role, avatar } = req.body;

  try {
    // 2. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Insert into DB
    const result = await pool.query(
      `INSERT INTO users (username, password, role, avatar)
       VALUES ($1, $2, $3, $4)
       RETURNING id, username, role, created_at`,
      [username, hashedPassword, role, avatar]
    );

    // 4. Return new user (no password)
    res.status(201).json(result.rows[0]);

  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Username already exists' });
    }
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});




router.post('/signin', async (req, res) => {
  const { username, password } = req.body;

  try {
    // 2. Find user
    const result = await pool.query(
      `SELECT * FROM users WHERE username = $1`,
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Login failed due to invalid credentials. Please try again.' });
    }

    const user = result.rows[0];

    // 3. Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Wrong password. Please try again.' });
    }

    // 4. Generate JWT
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // 5. Send token and user info
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        avatar: user.avatar,
        created_at: user.created_at,
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;