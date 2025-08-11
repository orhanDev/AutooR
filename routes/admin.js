const express = require('express');
const { query } = require('../db/database');
const adminMiddleware = require('../middleware/adminMiddleware');
const router = express.Router();

// Admin panel ana sayfası veya istatistikler
router.get('/dashboard', adminMiddleware, async (req, res) => {
    try {
        // Toplam kullanıcı sayısı
        const userCount = await query('SELECT COUNT(*) FROM users');
        
        // Toplam araç sayısı
        const carCount = await query('SELECT COUNT(*) FROM cars');
        
        // Toplam rezervasyon sayısı
        const reservationCount = await query('SELECT COUNT(*) FROM reservations');
        
        // Bekleyen rezervasyon sayısı
        const pendingReservations = await query("SELECT COUNT(*) FROM reservations WHERE status = 'Beklemede'");
        
        // Toplam gelir (onaylanmış rezervasyonlardan)
        const totalRevenue = await query("SELECT COALESCE(SUM(total_price), 0) FROM reservations WHERE status = 'Onaylandı'");

        res.json({
            stats: {
                totalUsers: parseInt(userCount.rows[0].count),
                totalCars: parseInt(carCount.rows[0].count),
                totalReservations: parseInt(reservationCount.rows[0].count),
                pendingReservations: parseInt(pendingReservations.rows[0].count),
                totalRevenue: parseFloat(totalRevenue.rows[0].coalesce)
            }
        });

    } catch (error) {
        console.error('Dashboard verileri getirilirken hata:', error);
        res.status(500).json({ error: 'Serverfehler' });
    }
});

// Tüm kullanıcıları getir (sadece adminler)
router.get('/users', adminMiddleware, async (req, res) => {
    try {
        const result = await query(`
            SELECT user_id, first_name, last_name, email, phone_number, address, is_admin, created_at 
            FROM users 
            ORDER BY created_at DESC
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Kullanıcılar getirilirken hata:', error);
        res.status(500).json({ error: 'Serverfehler' });
    }
});

// Tüm rezervasyonları getir (sadece adminler)
router.get('/reservations', adminMiddleware, async (req, res) => {
    try {
        const result = await query(`
            SELECT r.*, u.first_name, u.last_name, u.email, c.make, c.model, c.year
            FROM reservations r
            JOIN users u ON r.user_id = u.user_id
            JOIN cars c ON r.car_id = c.car_id
            ORDER BY r.created_at DESC
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Rezervasyonlar getirilirken hata:', error);
        res.status(500).json({ error: 'Serverfehler' });
    }
});

// Rezervasyon durumunu güncelle (sadece adminler)
router.put('/reservations/:id/status', adminMiddleware, async (req, res) => {
    try {
    const { id } = req.params;
    const { status } = req.body;

        // Geçerli durumları kontrol et
        const validStatuses = ['Beklemede', 'Onaylandı', 'Reddedildi', 'Tamamlandı', 'İptal Edildi'];
    if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Geçersiz durum' });
        }

        const result = await query(`
            UPDATE reservations 
            SET status = $1, updated_at = CURRENT_TIMESTAMP
            WHERE reservation_id = $2
            RETURNING *
        `, [status, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Reservierung nicht gefunden' });
        }

        res.json({
            message: 'Reservierungsstatus erfolgreich aktualisiert',
            reservation: result.rows[0]
        });

    } catch (error) {
        console.error('Rezervasyon durumu güncellenirken hata:', error);
        res.status(500).json({ error: 'Serverfehler' });
    }
});

// Araç ekle (sadece adminler)
router.post('/cars', adminMiddleware, async (req, res) => {
    try {
        const {
            make, model, year, license_plate, daily_rate,
            transmission_type, fuel_type, seating_capacity,
            color, image_url, location_id, description
        } = req.body;

        const result = await query(`
            INSERT INTO cars (
                make, model, year, license_plate, daily_rate,
                transmission_type, fuel_type, seating_capacity,
                color, image_url, location_id, description
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING *
        `, [make, model, year, license_plate, daily_rate,
             transmission_type, fuel_type, seating_capacity,
             color, image_url, location_id, description]);

        res.status(201).json({
            message: 'Fahrzeug erfolgreich hinzugefügt',
            car: result.rows[0]
        });

    } catch (error) {
        console.error('Araç eklenirken hata:', error);
        res.status(500).json({ error: 'Serverfehler' });
    }
});

// Araç güncelle (sadece adminler)
router.put('/cars/:id', adminMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const {
            make, model, year, license_plate, daily_rate,
            transmission_type, fuel_type, seating_capacity,
            color, image_url, location_id, description, is_available
        } = req.body;

        const result = await query(`
            UPDATE cars SET
                make = $1, model = $2, year = $3, license_plate = $4,
                daily_rate = $5, transmission_type = $6, fuel_type = $7,
                seating_capacity = $8, color = $9, image_url = $10,
                location_id = $11, description = $12, is_available = $13
            WHERE car_id = $14
            RETURNING *
        `, [make, model, year, license_plate, daily_rate,
             transmission_type, fuel_type, seating_capacity,
             color, image_url, location_id, description, is_available, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Fahrzeug nicht gefunden' });
        }

        res.json({
            message: 'Fahrzeug erfolgreich aktualisiert',
            car: result.rows[0]
        });

    } catch (error) {
        console.error('Araç güncellenirken hata:', error);
        res.status(500).json({ error: 'Serverfehler' });
    }
});

// Araç sil (sadece adminler)
router.delete('/cars/:id', adminMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        const result = await query(`
            DELETE FROM cars WHERE car_id = $1 RETURNING *
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Fahrzeug nicht gefunden' });
        }

        res.json({
            message: 'Fahrzeug erfolgreich gelöscht',
            car: result.rows[0]
        });

    } catch (error) {
        console.error('Araç silinirken hata:', error);
        res.status(500).json({ error: 'Serverfehler' });
    }
});

// Yeni lokasyon ekle
router.post('/locations', adminMiddleware, async (req, res) => {
    try {
        const { name, address, city, state_province, zip_code, country } = req.body;

        const result = await query(`
            INSERT INTO locations (name, address, city, state_province, zip_code, country)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `, [name, address, city, state_province, zip_code, country]);

        res.status(201).json({
            message: 'Lokasyon başarıyla eklendi',
            location: result.rows[0]
        });

    } catch (error) {
        console.error('Lokasyon eklenirken hata:', error);
        res.status(500).json({ error: 'Serverfehler' });
    }
});

// Lokasyon güncelle
router.put('/locations/:id', adminMiddleware, async (req, res) => {
    try {
    const { id } = req.params;
    const { name, address, city, state_province, zip_code, country } = req.body;

        const result = await query(`
            UPDATE locations SET
                name = $1, address = $2, city = $3, state_province = $4,
                zip_code = $5, country = $6
            WHERE location_id = $7
            RETURNING *
        `, [name, address, city, state_province, zip_code, country, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Lokasyon bulunamadı' });
        }

        res.json({
            message: 'Lokasyon başarıyla güncellendi',
            location: result.rows[0]
        });

    } catch (error) {
        console.error('Lokasyon güncellenirken hata:', error);
        res.status(500).json({ error: 'Serverfehler' });
    }
});

// Lokasyon sil
router.delete('/locations/:id', adminMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        const result = await query(`
            DELETE FROM locations WHERE location_id = $1 RETURNING *
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Lokasyon bulunamadı' });
        }

        res.json({
            message: 'Lokasyon başarıyla silindi',
            location: result.rows[0]
        });

    } catch (error) {
        console.error('Lokasyon silinirken hata:', error);
        res.status(500).json({ error: 'Serverfehler' });
    }
});

// Yeni özellik ekle
router.post('/features', adminMiddleware, async (req, res) => {
    try {
        const { feature_name } = req.body;

        const result = await query(`
            INSERT INTO car_features (feature_name)
            VALUES ($1)
            RETURNING *
        `, [feature_name]);

        res.status(201).json({
            message: 'Özellik başarıyla eklendi',
            feature: result.rows[0]
        });

    } catch (error) {
        console.error('Özellik eklenirken hata:', error);
        res.status(500).json({ error: 'Serverfehler' });
    }
});

// Özellikleri güncelle
router.put('/features/:id', adminMiddleware, async (req, res) => {
    try {
    const { id } = req.params;
    const { feature_name } = req.body;

        const result = await query(`
            UPDATE car_features SET feature_name = $1
            WHERE feature_id = $2
            RETURNING *
        `, [feature_name, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Özellik bulunamadı' });
        }

        res.json({
            message: 'Özellik başarıyla güncellendi',
            feature: result.rows[0]
        });

    } catch (error) {
        console.error('Özellik güncellenirken hata:', error);
        res.status(500).json({ error: 'Serverfehler' });
    }
});

// Özellik sil
router.delete('/features/:id', adminMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        const result = await query(`
            DELETE FROM car_features WHERE feature_id = $1 RETURNING *
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Özellik bulunamadı' });
        }

        res.json({
            message: 'Özellik başarıyla silindi',
            feature: result.rows[0]
        });

    } catch (error) {
        console.error('Özellik silinirken hata:', error);
        res.status(500).json({ error: 'Serverfehler' });
    }
});

module.exports = router;