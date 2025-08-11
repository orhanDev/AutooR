const express = require('express');
const { query } = require('../db/database');
const router = express.Router();

// Tüm lokasyonları getir
router.get('/', async (req, res) => {
    try {
        const result = await query('SELECT location_id, name FROM locations');
        res.json(result.rows);
    } catch (error) {
        console.error('Lokasyonlar getirilirken hata:', error);
        res.status(500).json({ error: 'Serverfehler' });
    }
});

module.exports = router;