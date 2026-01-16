const express = require('express');
const router = express.Router();
const pool = require('../../db');
const { auth } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

// Add a trash item
router.post('/', auth(['admin']), async (req, res) => {

    const { item_name, trash_item_id, who_deleted, item_type } = req.body;

    if (!trash_item_id || !who_deleted) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    const trash_id = uuidv4();

    try {
        const result = await pool.query(
            'INSERT INTO trash (id, item_name, trash_item, who_deleted, deleted_date, item_type) VALUES ($1, $2, $3, $4, NOW(), $5) RETURNING *',
            [trash_id, item_name, trash_item_id, who_deleted, item_type]
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

router.get('/', auth(['admin']), async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM trash ORDER BY deleted_date DESC');
        return res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching trash items:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Restore a trash item
router.put('/:id/restore', auth(['admin']), async (req, res) => {
    const { id } = req.params;
    try {
        // Get the trash item
        const trashResult = await pool.query('SELECT * FROM trash WHERE id = $1', [id]);
        if (trashResult.rows.length === 0) {
            return res.status(404).json({ error: 'Trash item not found' });
        }
        const trashItem = trashResult.rows[0];

        // Update the original item to remove from trash
        if (trashItem.item_type === 'resource') {
            await pool.query('UPDATE resources SET in_trash = FALSE, trash_id = NULL WHERE id = $1', [trashItem.trash_item]);
        } else if (trashItem.item_type === 'exercise') {
            await pool.query('UPDATE exercises SET in_trash = FALSE, trash_id = NULL WHERE id = $1', [trashItem.trash_item]);
        } else if (trashItem.item_type === 'scenario') {
            await pool.query('UPDATE scenarios SET in_trash = FALSE, trash_id = NULL WHERE id = $1', [trashItem.trash_item]);
        }

        // Delete from trash
        await pool.query('DELETE FROM trash WHERE id = $1', [id]);

        return res.status(200).json({ message: 'Item restored successfully' });
    } catch (error) {
        console.error('Error restoring trash item:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Permanently delete a trash item
router.delete('/:id', auth(['admin']), async (req, res) => {
    const { id } = req.params;
    try {
        // Get the trash item
        const trashResult = await pool.query('SELECT * FROM trash WHERE id = $1', [id]);
        if (trashResult.rows.length === 0) {
            return res.status(404).json({ error: 'Trash item not found' });
        }
        const trashItem = trashResult.rows[0];

        // Delete the original item
        if (trashItem.item_type === 'resource') {
            await pool.query('DELETE FROM resources WHERE id = $1', [trashItem.trash_item]);
        } else if (trashItem.item_type === 'exercise') {
            await pool.query('DELETE FROM exercises WHERE id = $1', [trashItem.trash_item]);
        } else if (trashItem.item_type === 'scenario') {
            await pool.query('DELETE FROM scenarios WHERE id = $1', [trashItem.trash_item]);
        }

        // Delete from trash
        await pool.query('DELETE FROM trash WHERE id = $1', [id]);

        return res.status(200).json({ message: 'Item permanently deleted' });
    } catch (error) {
        console.error('Error deleting trash item:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;