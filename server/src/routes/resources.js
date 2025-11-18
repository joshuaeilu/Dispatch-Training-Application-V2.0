const express = require('express');
const router = express.Router();
const pool = require('../../db'); // your PostgreSQL pool
const { auth } = require('../middleware/auth');
const multer = require('multer');
const  path  = require('path');
const fs = require('fs');
const RESOURCE_DIR = path.join(__dirname, '../../resources');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {

    const uploadPath = path.join(__dirname, '../../resources');

    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const baseName = req.body.name || 'unnamed';

    const safeName = baseName
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-zA-Z0-9._-]/g, '');

    const ext = path.extname(file.originalname); // keep correct extension

    const finalFilename = `${safeName}-${timestamp}${ext}`; // use same timestamp
    req.uploadResourceUrl = `/resources/${finalFilename}`; // also build the URL here (optional)

    cb(null, finalFilename);
  }
});

const upload = multer({ storage });

router.post('/', auth(['admin']), upload.single('file'), async(req, res) => {
    const { id, name, type, description, size, mime_type, visibility } = req.body;
    const created_by = req.user.id;
    const url = req.uploadResourceUrl;

     if (!id || !name || !type || !size || !mime_type || !url || !created_by) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {

    const result = await pool.query(
        'INSERT INTO resources (id, name, type, description, size, mime_type, url, created_by, visibility) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
        [id, name, type, description, size, mime_type, url, created_by, visibility]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating resource:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
})

router.get('/', auth(['admin', 'trainee', 'dispatcher']), async (req, res) => {
  try {
    const result = await pool.query(`SELECT
  resources.id, resources.name, resources.type, resources.mime_type, resources.url, resources.size,
  resources.description, resources.created_at, resources.visibility,
  json_build_object(
    'id', users.id,
    'name', users.username,
    'avatar_url', users.avatar
  ) AS created_by
FROM resources
LEFT JOIN users ON users.id = resources.created_by
ORDER BY resources.created_at DESC;
`);
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching resources:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});


router.delete('/:id', auth(['admin']), async (req, res) => {
  const { id } = req.params;

  try {
    // Check if the resource exists
    const checkResult = await pool.query('SELECT * FROM resources WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    // Delete the resource
    await pool.query('DELETE FROM resources WHERE id = $1', [id]);

    // Delete the file from the filesystem
    const filePath = path.join(__dirname, '../../resources', checkResult.rows[0].url.split('/').pop());
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return res.status(200).json({ message: 'Resource deleted successfully' });
  } catch (error) {
    console.error('Error deleting resource:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/:id', auth(['admin']), async (req, res) => {
  const { id } = req.params;
  const {  visibility } = req.body;

  try {
    const result = await pool.query(
      'UPDATE resources SET visibility = $1 WHERE id = $2 RETURNING *',
      [visibility, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error updating resource:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:filename', auth(['admin']), async (req, res) => {
  const fileName = req.params.filename;
  const filePath = path.join(RESOURCE_DIR, fileName);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  // Detect PDF and set correct MIME type
  const ext = path.extname(fileName).toLowerCase();

  if (ext === ".pdf") {
    res.setHeader("Content-Type", "application/pdf");
  }

  res.sendFile(filePath);
});



module.exports = router;
