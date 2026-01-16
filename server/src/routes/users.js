

// server/src/routes/users.js (or keep in your auth router if you prefer)
const express = require('express');
const pool = require('../../db');
const { auth } = require('../middleware/auth');
const router = express.Router();
const bcrypt = require('bcrypt');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

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
    try {
      const ext = path.extname(file.originalname).toLowerCase();

      // ✅ For update routes, use ID directly from params
      if (req.params.id) {
        cb(null, `user_${req.params.id}${ext}`);
        return;
      }

      // ✅ For signup, we don’t have ID yet → temporary file
      cb(null, `temp_${Date.now()}${ext}`);
    } catch (err) {
      console.error('Multer filename error:', err);
      cb(err, `upload-error${Date.now()}.png`); // fallback safe name
    }
  }
});

const upload = multer({ storage });



// GET /users/dispatchers?search=john&page=1&pageSize=20
// Get all dispatcher accounts (admin only)
router.get('/', auth(['admin']), async (req, res) => {
  try {
    const result = await pool.query(
  `SELECT 
      id,
      username AS name,
      avatar,
      role
   FROM users
   ORDER BY username DESC`
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


// DELETE USER WITH PASSWORD VERIFICATION
router.post('/:id/delete', auth(['admin']), async (req, res) => {
  const { password } = req.body;
  const targetUserId = req.params.id;
  const requesterId = req.user.id; // from JWT
  const requesterRole = req.user.role;

  try {
    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    // ✅ Get the current logged-in user's full record
    const requester = await pool.query(`SELECT id, password FROM users WHERE id = $1`, [requesterId]);
    if (requester.rows.length === 0) {
      return res.status(404).json({ error: 'Requester not found' });
    }

    // ✅ Verify password matches requester’s password
    const isMatch = await bcrypt.compare(password, requester.rows[0].password);
    if (!isMatch) {
      return res.status(403).json({ error: 'Incorrect password' }); // NOT 401
    }

    // ✅ Make sure requester can delete (admin only, or add rules here)
    if (requesterRole.toLowerCase() !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete users' });
    }

    // ✅ Delete the target user
    const result = await pool.query(`DELETE FROM users WHERE id = $1 RETURNING id, username`, [targetUserId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: `User ${result.rows[0].username} deleted successfully`, id: result.rows[0].id });

  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});



// routes/users.js
router.put('/:id', auth(['admin']), upload.single('profileImage'), async (req, res) => {
  try {
    const { id } = req.params;
    let { username, role, password } = req.body;

    if (username) username = username.trim().toLowerCase();
    if (role) role = role.trim().toLowerCase();

    let updates = [];
    let values = [];
    let idx = 1;

    if (username) {
      updates.push(`username = $${idx++}`);
      values.push(username);
    }
    if (role) {
      updates.push(`role = $${idx++}`);
      values.push(role);
    }
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.push(`password = $${idx++}`);
      values.push(hashedPassword);
    }
    if (req.file) {
      const ext = path.extname(req.file.originalname).toLowerCase();
      const newFileName = `user_${id}${ext}`;
      const newPath = path.join(__dirname, '../../profile_pics', newFileName);

      fs.renameSync(req.file.path, newPath);
      const avatarPath = `/profile_pics/${newFileName}`;
      updates.push(`avatar = $${idx++}`);
      values.push(avatarPath);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);
    const query = `
      UPDATE users
      SET ${updates.join(', ')}
      WHERE id = $${idx}
      RETURNING id, username, role, avatar, created_at
    `;
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update user' });
  }
});




module.exports = router;
