const express = require('express');
const router = express.Router();
const db = require('../db/database');

// Tüm lokasyonları getir
router.get('/', async (req, res) => {
    try {
        const result = await db.query('SELECT location_id, name FROM locations');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Sunucu Hatası');
    }
});

module.exports = router;