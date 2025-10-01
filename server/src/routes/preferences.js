const express = require('express');
const router = express.Router();
const pool = require('../../db'); // your PostgreSQL pool
const { auth } = require('../middleware/auth');


// Get the admin preferences
router.get('/', auth(['admin', 'trainee']), async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM admin_preferences LIMIT 1');
    if (rows.length === 0) return res.status(404).json({ error: 'No preferences found' });
    res.status(200).json(rows[0]);
  } catch (err) {
    console.error('Error getting admin preferences:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});



router.patch('/:field', auth(['admin']), async (req, res) => {
  const { field } = req.params;
  const { value } = req.body;

  // Define valid fields you allow updates for
  const validFields = ['exercise_types', 'scenario_types', 'speakers'];

  if (!validFields.includes(field)) {
    return res.status(400).json({ error: 'Invalid field' });
  }

  if (!Array.isArray(value)) {
    return res.status(400).json({ error: 'Value must be an array' });
  }

  try {
    const { rows } = await pool.query(
      `UPDATE admin_preferences SET ${field} = $1, updated_at = NOW() WHERE id = 1 RETURNING *`,
      [value]
    );
    res.status(200).json(rows[0]);
  } catch (err) {
    console.error(`Error updating ${field}:`, err);
    res.status(500).json({ error: 'Internal server error' });
  }
});



module.exports = router;