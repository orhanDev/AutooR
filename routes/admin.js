const express = require('express');
const router = express.Router();
const db = require('../db/database');
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');

// Yönetici paneli ana sayfası veya istatistikleri
router.get('/dashboard', [auth, admin], async (req, res) => {
    try {
        const totalUsers = await db.query('SELECT COUNT(*) FROM users');
        const totalCars = await db.query('SELECT COUNT(*) FROM cars');
        const totalReservations = await db.query('SELECT COUNT(*) FROM reservations');
        const pendingReservations = await db.query('SELECT COUNT(*) FROM reservations WHERE status = \'Beklemede\'');

        res.json({
            totalUsers: totalUsers.rows[0].count,
            totalCars: totalCars.rows[0].count,
            totalReservations: totalReservations.rows[0].count,
            pendingReservations: pendingReservations.rows[0].count
        });
    } catch (err) {
        console.error('Admin dashboard hatası:', err.message);
        res.status(500).send('Sunucu Hatası');
    }
});

// Tüm kullanıcıları getir (sadece yöneticiler)
router.get('/users', [auth, admin], async (req, res) => {
    try {
        const users = await db.query('SELECT user_id, first_name, last_name, email, phone_number, is_admin, created_at FROM users ORDER BY created_at DESC');
        res.json(users.rows);
    } catch (err) {
        console.error('Admin kullanıcıları çekme hatası:', err.message);
        res.status(500).send('Sunucu Hatası');
    }
});

// Tüm rezervasyonları getir (sadece yöneticiler)
router.get('/reservations', [auth, admin], async (req, res) => {
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
                l_pickup.name AS pickup_location_name,
                l_dropoff.name AS dropoff_location_name,
                u.first_name || ' ' || u.last_name AS user_full_name,
                u.email AS user_email
            FROM reservations r
            JOIN cars c ON r.car_id = c.car_id
            JOIN locations l_pickup ON r.pickup_location_id = l_pickup.location_id
            JOIN locations l_dropoff ON r.dropoff_location_id = l_dropoff.location_id
            JOIN users u ON r.user_id = u.user_id
            ORDER BY r.created_at DESC;`
        );
        res.json(reservations.rows);
    } catch (err) {
        console.error('Admin rezervasyonları çekme hatası:', err.message);
        res.status(500).send('Sunucu Hatası');
    }
});

// Rezervasyon durumunu güncelle (sadece yöneticiler)
router.put('/reservations/:id/status', [auth, admin], async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
        return res.status(400).json({ message: 'Durum bilgisi gereklidir.' });
    }
    const validStatuses = ['Beklemede', 'Onaylandı', 'Reddedildi', 'Tamamlandı', 'İptal Edildi'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Geçersiz durum.' });
    }

    try {
        const result = await db.query(
            'UPDATE reservations SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE reservation_id = $2 RETURNING *;',
            [status, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Rezervasyon bulunamadı.' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Rezervasyon durumu güncelleme hatası:', err.message);
        res.status(500).send('Sunucu Hatası');
    }
});

// Araç Ekle (sadece yöneticiler)
router.post('/cars', [auth, admin], async (req, res) => {
    const { make, model, year, license_plate, daily_rate, transmission_type, fuel_type, seating_capacity, color, image_url, location_id, description, features } = req.body;

    try {
        const newCar = await db.query(
            'INSERT INTO cars (make, model, year, license_plate, daily_rate, transmission_type, fuel_type, seating_capacity, color, image_url, location_id, description) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *;',
            [make, model, year, license_plate, daily_rate, transmission_type, fuel_type, seating_capacity, color, image_url, location_id, description]
        );

        const carId = newCar.rows[0].car_id;

        // Özellikleri ekle
        if (features && features.length > 0) {
            const featureInserts = features.map(featureId => 
                `INSERT INTO car_carfeatures (car_id, feature_id) VALUES ('${carId}', '${featureId}') ON CONFLICT (car_id, feature_id) DO NOTHING;`
            ).join('\n');
            await db.query(featureInserts);
        }

        res.status(201).json(newCar.rows[0]);
    } catch (err) {
        console.error('Araç ekleme hatası:', err.message);
        res.status(500).send('Sunucu Hatası');
    }
});

// Araç Güncelle (sadece yöneticiler)
router.put('/cars/:id', [auth, admin], async (req, res) => {
    const { id } = req.params;
    const { make, model, year, license_plate, daily_rate, transmission_type, fuel_type, seating_capacity, color, image_url, location_id, description, features } = req.body;

    try {
        const updatedCar = await db.query(
            'UPDATE cars SET make = $1, model = $2, year = $3, license_plate = $4, daily_rate = $5, transmission_type = $6, fuel_type = $7, seating_capacity = $8, color = $9, image_url = $10, location_id = $11, description = $12 WHERE car_id = $13 RETURNING *;',
            [make, model, year, license_plate, daily_rate, transmission_type, fuel_type, seating_capacity, color, image_url, location_id, description, id]
        );

        if (updatedCar.rows.length === 0) {
            return res.status(404).json({ message: 'Araç bulunamadı.' });
        }

        // Mevcut özellikleri sil ve yenilerini ekle
        await db.query('DELETE FROM car_carfeatures WHERE car_id = $1;', [id]);
        if (features && features.length > 0) {
            const featureInserts = features.map(featureId => 
                `INSERT INTO car_carfeatures (car_id, feature_id) VALUES ('${id}', '${featureId}') ON CONFLICT (car_id, feature_id) DO NOTHING;`
            ).join('\n');
            await db.query(featureInserts);
        }

        res.json(updatedCar.rows[0]);
    } catch (err) {
        console.error('Araç güncelleme hatası:', err.message);
        res.status(500).send('Sunucu Hatası');
    }
});

// Araç Sil (sadece yöneticiler)
router.delete('/cars/:id', [auth, admin], async (req, res) => {
    const { id } = req.params;

    try {
        const result = await db.query('DELETE FROM cars WHERE car_id = $1 RETURNING *;', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Araç bulunamadı.' });
        }

        res.json({ message: 'Araç başarıyla silindi.' });
    } catch (err) {
        console.error('Araç silme hatası:', err.message);
        res.status(500).send('Sunucu Hatası');
    }
});

// Yeni lokasyon ekle
router.post('/locations', [auth, admin], async (req, res) => {
    const { name, address, city, state_province, zip_code, country } = req.body;

    try {
        const newLocation = await db.query(
            'INSERT INTO locations (name, address, city, state_province, zip_code, country) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;',
            [name, address, city, state_province, zip_code, country]
        );
        res.status(201).json(newLocation.rows[0]);
    } catch (err) {
        console.error('Lokasyon ekleme hatası:', err.message);
        res.status(500).send('Sunucu Hatası');
    }
});

// Lokasyon güncelle
router.put('/locations/:id', [auth, admin], async (req, res) => {
    const { id } = req.params;
    const { name, address, city, state_province, zip_code, country } = req.body;

    try {
        const updatedLocation = await db.query(
            'UPDATE locations SET name = $1, address = $2, city = $3, state_province = $4, zip_code = $5, country = $6 WHERE location_id = $7 RETURNING *;',
            [name, address, city, state_province, zip_code, country, id]
        );

        if (updatedLocation.rows.length === 0) {
            return res.status(404).json({ message: 'Lokasyon bulunamadı.' });
        }
        res.json(updatedLocation.rows[0]);
    } catch (err) {
        console.error('Lokasyon güncelleme hatası:', err.message);
        res.status(500).send('Sunucu Hatası');
    }
});

// Lokasyon sil
router.delete('/locations/:id', [auth, admin], async (req, res) => {
    const { id } = req.params;

    try {
        const result = await db.query('DELETE FROM locations WHERE location_id = $1 RETURNING *;', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Lokasyon bulunamadı.' });
        }
        res.json({ message: 'Lokasyon başarıyla silindi.' });
    } catch (err) {
        console.error('Lokasyon silme hatası:', err.message);
        res.status(500).send('Sunucu Hatası');
    }
});

// Yeni özellik ekle
router.post('/features', [auth, admin], async (req, res) => {
    const { feature_name } = req.body;

    try {
        const newFeature = await db.query(
            'INSERT INTO car_features (feature_name) VALUES ($1) ON CONFLICT (feature_name) DO NOTHING RETURNING *;',
            [feature_name]
        );
        res.status(201).json(newFeature.rows[0]);
    } catch (err) {
        console.error('Özellik ekleme hatası:', err.message);
        res.status(500).send('Sunucu Hatası');
    }
});

// Özellikleri güncelle
router.put('/features/:id', [auth, admin], async (req, res) => {
    const { id } = req.params;
    const { feature_name } = req.body;

    try {
        const updatedFeature = await db.query(
            'UPDATE car_features SET feature_name = $1 WHERE feature_id = $2 RETURNING *;',
            [feature_name, id]
        );

        if (updatedFeature.rows.length === 0) {
            return res.status(404).json({ message: 'Özellik bulunamadı.' });
        }
        res.json(updatedFeature.rows[0]);
    } catch (err) {
        console.error('Özellik güncelleme hatası:', err.message);
        res.status(500).send('Sunucu Hatası');
    }
});

// Özellik sil
router.delete('/features/:id', [auth, admin], async (req, res) => {
    const { id } = req.params;

    try {
        const result = await db.query('DELETE FROM car_features WHERE feature_id = $1 RETURNING *;', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Özellik bulunamadı.' });
        }
        res.json({ message: 'Özellik başarıyla silindi.' });
    } catch (err) {
        console.error('Özellik silme hatası:', err.message);
        res.status(500).send('Sunucu Hatası');
    }
});

module.exports = router;