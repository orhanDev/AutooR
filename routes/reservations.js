const express = require('express');
const { query } = require('../db/database');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Yeni rezervasyon oluştur
router.post('/', authMiddleware, async (req, res) => {
    try {
        const {
            car_id,
            pickup_location_id,
            dropoff_location_id,
            pickup_date,
            dropoff_date,
            pickup_time,
            dropoff_time,
            extras,
            total_price
        } = req.body;

        const user_id = req.user.userId;

        // Tarih çakışması kontrolü
        const conflictCheck = await query(`
            SELECT COUNT(*)
            FROM reservations
            WHERE car_id = $1
            AND status IN ('Beklemede', 'Onaylandı')
            AND (
                (pickup_date, dropoff_date) OVERLAPS (CAST($2 AS DATE), CAST($3 AS DATE))
            );
        `, [car_id, pickup_date, dropoff_date]);

        if (parseInt(conflictCheck.rows[0].count) > 0) {
            return res.status(400).json({
                error: 'Fahrzeug für die ausgewählten Daten nicht verfügbar'
            });
        }

        // Rezervasyon oluştur
        const result = await query(`
            INSERT INTO reservations (
                user_id, car_id, pickup_location_id, dropoff_location_id,
                pickup_date, dropoff_date, pickup_time, dropoff_time, extras, total_price, status
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *;
        `, [
            user_id, car_id, pickup_location_id, dropoff_location_id,
            pickup_date, dropoff_date, pickup_time, dropoff_time, extras, total_price, 'Beklemede'
        ]);

        res.status(201).json({
            message: 'Reservierung erfolgreich erstellt',
            reservation: result.rows[0]
        });

    } catch (error) {
        console.error('Rezervasyon oluşturulurken hata:', error);
        res.status(500).json({ error: 'Serverfehler' });
    }
});

// Kullanıcı rezervasyonlarını getir
router.get('/user', authMiddleware, async (req, res) => {
    try {
        const user_id = req.user.userId;

        const result = await query(`
            SELECT r.*, c.make, c.model, c.year, c.image_url,
                   l1.name AS pickup_location_name, l2.name AS dropoff_location_name
            FROM reservations r
            JOIN cars c ON r.car_id = c.car_id
            LEFT JOIN locations l1 ON r.pickup_location_id = l1.location_id
            LEFT JOIN locations l2 ON r.dropoff_location_id = l2.location_id
            WHERE r.user_id = $1
            ORDER BY r.created_at DESC
        `, [user_id]);

        res.json(result.rows);

    } catch (error) {
        console.error('Kullanıcı rezervasyonları getirilirken hata:', error);
        res.status(500).json({ error: 'Serverfehler' });
    }
});

module.exports = router;