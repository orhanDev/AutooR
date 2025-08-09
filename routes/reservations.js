const express = require('express');
const router = express.Router();
const db = require('../db/database');
const auth = require('../middleware/authMiddleware');

// Yeni rezervasyon oluştur
router.post('/', auth, async (req, res) => {
    // user_id'yi artık req.user.id'den alıyoruz
    const { car_id, pickup_location_id, dropoff_location_id, pickup_date, dropoff_date, pickup_time, dropoff_time, extras, total_price, status } = req.body;
    const user_id = req.user.id;

    try {
        // Tarih çakışması kontrolü (detaylı kontrol burada da yapılabilir veya front-end'den gelen validasyon güvenilebilir)
        const conflictCheckQuery = `
            SELECT COUNT(*)
            FROM reservations
            WHERE car_id = $1
            AND status IN ('Beklemede', 'Onaylandı')
            AND (
                (pickup_date, dropoff_date) OVERLAPS (CAST($2 AS DATE), CAST($3 AS DATE))
            );
        `;
        const conflictCheckResult = await db.query(conflictCheckQuery, [car_id, pickup_date, dropoff_date]);

        if (conflictCheckResult.rows[0].count > 0) {
            return res.status(409).json({ message: 'Seçilen tarihlerde araç müsait değil.' });
        }

        const query = `
            INSERT INTO reservations (
                user_id, car_id, pickup_location_id, dropoff_location_id,
                pickup_date, dropoff_date, pickup_time, dropoff_time, extras, total_price, status
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *;
        `;
        const params = [
            user_id, car_id, pickup_location_id, dropoff_location_id,
            pickup_date, dropoff_date, pickup_time, dropoff_time, extras || null, total_price, status
        ];

        const result = await db.query(query, params);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Rezervasyon oluşturulurken hata:', err.message);
        res.status(500).send('Sunucu Hatası');
    }
});

// Kullanıcının kendi rezervasyonlarını getir
router.get('/user', auth, async (req, res) => {
    try {
        const reservations = await db.query(
            `SELECT 
                r.reservation_id,
                r.pickup_date,
                r.dropoff_date,
                r.pickup_time,
                r.dropoff_time,
                r.total_price,
                r.status,
                c.make,
                c.model,
                c.year,
                c.license_plate,
                c.image_url,
                l_pickup.name AS pickup_location_name,
                l_dropoff.name AS dropoff_location_name
            FROM reservations r
            JOIN cars c ON r.car_id = c.car_id
            JOIN locations l_pickup ON r.pickup_location_id = l_pickup.location_id
            JOIN locations l_dropoff ON r.dropoff_location_id = l_dropoff.location_id
            WHERE r.user_id = $1
            ORDER BY r.created_at DESC;`,
            [req.user.id]
        );

        res.json(reservations.rows);

    } catch (err) {
        console.error('Kullanıcı rezervasyonları çekilirken hata:', err.message);
        res.status(500).send('Sunucu Hatası');
    }
});

module.exports = router;