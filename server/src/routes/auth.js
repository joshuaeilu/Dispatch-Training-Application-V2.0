const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../../db'); // PostgreSQL pool
require('dotenv').config();
const { auth } = require('../middleware/auth');
const multer = require('multer');
const fs = require('fs');
const path = require('path');


const router = express.Router();

/* ==========================
   Multer Storage Config
========================== */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../profile_pics');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // temporary filename before we know the userId
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `temp_${Date.now()}${ext}`);
  }
});
const upload = multer({ storage });


/* ==========================
   SIGNUP (Admin Only)
========================== */
router.post('/signup', auth(['admin']), upload.single('profileImage'), async (req, res) => {
  try {
    let { username, password, role } = req.body;
    username = username.trim().toLowerCase();

    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user without avatar first
    const result = await pool.query(
      `INSERT INTO users (username, password, role)
       VALUES ($1, $2, $3)
       RETURNING id, username, role, created_at`,
      [username, hashedPassword, role]
    );
    const user = result.rows[0];

    let avatarPath = null;
    if (req.file) {
      const ext = path.extname(req.file.originalname).toLowerCase();
      const newFileName = `user_${user.id}${ext}`;
      const newPath = path.join(__dirname, '../../profile_pics', newFileName);

      // rename the uploaded file
      fs.renameSync(req.file.path, newPath);
      avatarPath = `/profile_pics/${newFileName}`;

      await pool.query(`UPDATE users SET avatar = $1 WHERE id = $2`, [avatarPath, user.id]);
    }

    res.status(201).json({ ...user, avatar: avatarPath });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});




router.post('/signin', async (req, res) => {
  try {
    let { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // ✅ normalize username (case-insensitive login)
    username = username.trim().toLowerCase();

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
    console.error('Signin error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;