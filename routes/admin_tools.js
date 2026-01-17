const express = require('express');
const path = require('path');
const fs = require('fs');
const { Pool } = require('pg');
require('dotenv').config();

const router = express.Router();

const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
});

router.get('/seed', async (req, res) => {
  try {
    const secret = req.query.secret || '';
    const expected = process.env.ADMIN_TOOL_SECRET || 'devsecret';
    if (secret !== expected) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const client = await pool.connect();
    try {
      try {
        await client.query('CREATE EXTENSION IF NOT EXISTS pgcrypto;');
      } catch (e) {
        
      }
      const initSql = fs.readFileSync(path.join(__dirname, '..', 'db', 'init.sql'), 'utf8');
      const seedSql = fs.readFileSync(path.join(__dirname, '..', 'db', 'seed.sql'), 'utf8');
      if (initSql.trim()) await client.query(initSql);
      if (seedSql.trim()) await client.query(seedSql);
      res.json({ ok: true, message: 'Seed completed' });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Admin seed error:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;