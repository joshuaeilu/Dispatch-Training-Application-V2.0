const express = require('express');
const router = express.Router();
const pool = require('../../db');
const { auth } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

// Add a trash item
router.post('/', auth(['admin']), async (req, res) => {

    const { trash_item_id, who_deleted, item_type } = req.body;

    if (!trash_item_id || !who_deleted) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    const trash_id = uuidv4();

    try {
        const result = await pool.query(
            'INSERT INTO trash (id, trash_item, who_deleted, deleted_date, item_type) VALUES ($1, $2, $3, NOW(), $4) RETURNING *',
            [trash_id, trash_item_id, who_deleted, item_type]
        );
        if (item_type === 'resource') {
         await pool.query(
            'UPDATE resources SET in_trash = TRUE, trash_id = $1 WHERE id = $2',
            [trash_id, trash_item_id]
        );
        }
        if (item_type === 'exercise') {
         await pool.query(
            'UPDATE exercises SET in_trash = TRUE, trash_id = $1 WHERE id = $2',
            [trash_id, trash_item_id]
        );
        }
        if( item_type === 'scenario') {
         await pool.query(
            'UPDATE scenarios SET in_trash = TRUE, trash_id = $1 WHERE id = $2',
            [trash_id, trash_item_id]
        );
        }

        return res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error adding trash item:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;