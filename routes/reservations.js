const express = require('express');
const { Pool } = require('pg');
const router = express.Router();

// PostgreSQL bağlantı havuzu
const pool = new Pool({
    user: process.env.PGUSER || 'AutooR_user',
    host: process.env.PGHOST || 'localhost',
    database: process.env.PGDATABASE || 'AutooR',
    password: process.env.PGPASSWORD || 'Vekil4023.',
    port: process.env.PGPORT || 5432,
});

// Rezervasyon oluşturma
router.post('/create', async (req, res) => {
    try {
        const { 
            userEmail, 
            vehicleId, 
            pickupLocation, 
            dropoffLocation, 
            pickupDate, 
            pickupTime, 
            dropoffDate, 
            dropoffTime, 
            totalPrice
        } = req.body;

        if (!userEmail || !vehicleId || !pickupLocation || !dropoffLocation || !pickupDate || !dropoffDate || !totalPrice) {
            return res.status(400).json({ 
                success: false, 
                message: 'Gerekli alanlar eksik' 
            });
        }

        // Kullanıcıyı bul (id ya da user_id desteği)
        let user;
        try {
            user = await pool.query('SELECT id FROM users WHERE email = $1', [userEmail]);
        } catch (e) {
            if (e && e.code === '42703') { // undefined_column
                user = await pool.query('SELECT user_id AS id FROM users WHERE email = $1', [userEmail]);
            } else {
                throw e;
            }
        }

        if (!user || user.rows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Kullanıcı bulunamadı' 
            });
        }

        const userId = user.rows[0].id;

        // Lokasyon tablosu var mı kontrol et
        let hasLocationsTable = true;
        try {
            await pool.query('SELECT 1 FROM locations LIMIT 1');
        } catch (e) {
            if (e && e.code === '42P01') { // undefined_table
                hasLocationsTable = false;
            } else {
                throw e;
            }
        }

        let pickupLocationId = null;
        let dropoffLocationId = null;
        if (hasLocationsTable) {
            const pickupLoc = await pool.query(
                'SELECT location_id FROM locations WHERE name = $1 OR CAST(location_id AS TEXT) = $1',
                [pickupLocation]
            );
            const dropoffLoc = await pool.query(
                'SELECT location_id FROM locations WHERE name = $1 OR CAST(location_id AS TEXT) = $1',
                [dropoffLocation]
            );

            if (pickupLoc.rows.length === 0 || dropoffLoc.rows.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Lokasyon bulunamadı'
                });
            }

            pickupLocationId = pickupLoc.rows[0].location_id;
            dropoffLocationId = dropoffLoc.rows[0].location_id;
        }

        // Tarih ve saatleri veritabanı tipleriyle uyumlu hale getir
        const pickupTimeStr = pickupTime && pickupTime.length === 5 ? pickupTime + ':00' : (pickupTime || '09:00:00');
        const dropoffTimeStr = dropoffTime && dropoffTime.length === 5 ? dropoffTime + ':00' : (dropoffTime || '10:00:00');

        let reservation;
        if (hasLocationsTable) {
            // Şema: location_id kolonları mevcut
            reservation = await pool.query(
                `INSERT INTO reservations (
                    user_id, car_id, pickup_date, dropoff_date, pickup_time, dropoff_time,
                    pickup_location_id, dropoff_location_id, total_price, status, created_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'Beklemede', CURRENT_TIMESTAMP)
                RETURNING reservation_id, user_id, car_id, pickup_date, dropoff_date, total_price, status, created_at`,
                [
                    userId, vehicleId, pickupDate, dropoffDate, pickupTimeStr, dropoffTimeStr,
                    pickupLocationId, dropoffLocationId, totalPrice
                ]
            );
        } else {
            // Eski/alternatif şema: metin kolonları (pickup_location, return_location)
            reservation = await pool.query(
                `INSERT INTO reservations (
                    user_id, car_id, pickup_date, dropoff_date, pickup_time, dropoff_time,
                    pickup_location, return_location, total_price, status, created_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'Beklemede', CURRENT_TIMESTAMP)
                RETURNING reservation_id, user_id, car_id, pickup_date, dropoff_date, total_price, status, created_at`,
                [
                    userId, vehicleId, pickupDate, dropoffDate, pickupTimeStr, dropoffTimeStr,
                    pickupLocation, dropoffLocation, totalPrice
                ]
            );
        }

        res.json({
            success: true,
            message: 'Rezervasyon başarıyla oluşturuldu',
            reservation: reservation.rows[0]
        });
    } catch (error) {
        console.error('Rezervasyon oluşturma hatası:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Sunucu hatası',
            code: error && error.code,
            detail: error && (error.detail || error.message)
        });
    }
});

// Kullanıcının rezervasyonlarını getir
router.get('/user/:userEmail', async (req, res) => {
    try {
        const { userEmail } = req.params;
        
        // Kullanıcıyı bul
        const user = await pool.query(
            'SELECT id FROM users WHERE email = $1',
            [userEmail]
        );

        if (user.rows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Kullanıcı bulunamadı' 
            });
        }

        const userId = user.rows[0].id;

        // Rezervasyonları getir (tüm rezervasyonlar)
        const reservations = await pool.query(
            `SELECT id, booking_id, vehicle_name, vehicle_image, pickup_location, 
                    return_location, pickup_date, pickup_time, return_date, return_time,
                    total_price, status, payment_status, created_at
             FROM reservations 
             WHERE user_id = $1 
             ORDER BY created_at DESC`,
            [userId]
        );

        res.json({
            success: true,
            reservations: reservations.rows
        });
    } catch (error) {
        console.error('Rezervasyon listesi hatası:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Sunucu hatası' 
        });
    }
});

// Rezervasyon detaylarını getir
router.get('/:bookingId', async (req, res) => {
    try {
        const { bookingId } = req.params;
        
        const reservation = await pool.query(
            `SELECT r.*, u.first_name, u.last_name, u.email
             FROM reservations r
             JOIN users u ON r.user_id = u.id
             WHERE r.booking_id = $1`,
            [bookingId]
        );

        if (reservation.rows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Rezervasyon bulunamadı' 
            });
        }

        res.json({
            success: true,
            reservation: reservation.rows[0]
        });
    } catch (error) {
        console.error('Rezervasyon detay hatası:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Sunucu hatası' 
        });
    }
});

// Rezervasyon güncelleme
router.put('/:bookingId', async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { 
            pickupLocation, dropoffLocation, pickupDate, pickupTime,
            dropoffDate, dropoffTime, totalPrice, basePrice,
            insurancePrice, extrasPrice, insuranceType, extras
        } = req.body;
        
        const reservation = await pool.query(
            `UPDATE reservations SET
                pickup_location = COALESCE($1, pickup_location),
                return_location = COALESCE($2, return_location),
                pickup_date = COALESCE($3, pickup_date),
                pickup_time = COALESCE($4, pickup_time),
                return_date = COALESCE($5, return_date),
                return_time = COALESCE($6, return_time),
                total_price = COALESCE($7, total_price),
                base_price = COALESCE($8, base_price),
                insurance_price = COALESCE($9, insurance_price),
                extras_price = COALESCE($10, extras_price),
                insurance_type = COALESCE($11, insurance_type),
                extras = COALESCE($12, extras),
                updated_at = CURRENT_TIMESTAMP
             WHERE booking_id = $13
             RETURNING id, booking_id, vehicle_name, pickup_location, return_location,
                      pickup_date, return_date, total_price, status, payment_status`,
            [
                pickupLocation, dropoffLocation, pickupDate, pickupTime,
                dropoffDate, dropoffTime, totalPrice, basePrice,
                insurancePrice, extrasPrice, insuranceType, JSON.stringify(extras),
                bookingId
            ]
        );

        if (reservation.rows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Rezervasyon bulunamadı' 
            });
        }

        res.json({
            success: true,
            message: 'Rezervasyon başarıyla güncellendi',
            reservation: reservation.rows[0]
        });
    } catch (error) {
        console.error('Rezervasyon güncelleme hatası:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Sunucu hatası' 
        });
    }
});

// Rezervasyon iptal etme
router.put('/:bookingId/cancel', async (req, res) => {
    try {
        const { bookingId } = req.params;
        
        const reservation = await pool.query(
            `UPDATE reservations SET
                status = 'cancelled',
                updated_at = CURRENT_TIMESTAMP
             WHERE booking_id = $1
             RETURNING id, booking_id, vehicle_name, status`,
            [bookingId]
        );

        if (reservation.rows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Rezervasyon bulunamadı' 
            });
        }

        res.json({
            success: true,
            message: 'Rezervasyon başarıyla iptal edildi',
            reservation: reservation.rows[0]
        });
    } catch (error) {
        console.error('Rezervasyon iptal hatası:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Sunucu hatası' 
        });
    }
});

// Payment status update
router.put('/:bookingId/payment-status', async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { paymentStatus } = req.body;
        
        if (!paymentStatus || !['pending', 'completed', 'failed'].includes(paymentStatus)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Geçersiz ödeme durumu' 
            });
        }
        
        const reservation = await pool.query(
            `UPDATE reservations SET
                payment_status = $1,
                updated_at = CURRENT_TIMESTAMP
             WHERE booking_id = $2
             RETURNING id, booking_id, vehicle_name, payment_status`,
            [paymentStatus, bookingId]
        );

        if (reservation.rows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Rezervasyon bulunamadı' 
            });
        }

        res.json({
            success: true,
            message: 'Ödeme durumu başarıyla güncellendi',
            reservation: reservation.rows[0]
        });
    } catch (error) {
        console.error('Ödeme durumu güncelleme hatası:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Sunucu hatası' 
        });
    }
});

// Rezervasyon silme
router.delete('/:bookingId', async (req, res) => {
    try {
        const { bookingId } = req.params;
        
        const deletedReservation = await pool.query(
            'DELETE FROM reservations WHERE booking_id = $1 RETURNING id, booking_id, vehicle_name',
            [bookingId]
        );

        if (deletedReservation.rows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Rezervasyon bulunamadı' 
            });
        }

        res.json({
            success: true,
            message: 'Rezervasyon başarıyla silindi',
            reservation: deletedReservation.rows[0]
        });
    } catch (error) {
        console.error('Rezervasyon silme hatası:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Sunucu hatası' 
        });
    }
});

module.exports = router;