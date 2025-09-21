const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT || 5432,
});

module.exports = pool;

// Test the connection
pool.query('SELECT 1', (err, result) => {
  if (err) {
    console.error('DB connection error', err);
  } else {
    console.log('DB connected!');
  }
});
