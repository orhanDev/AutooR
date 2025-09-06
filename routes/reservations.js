const express = require('express');
const { Pool } = require('pg');
const router = express.Router();

// PostgreSQL bağlantı havuzu
const pool = new Pool({
    user: process.env.PGUSER || 'autor_user',
    host: process.env.PGHOST || 'localhost',
    database: process.env.PGDATABASE || 'autor_db',
    password: process.env.PGPASSWORD || 'Vekil4023.',
    port: process.env.PGPORT || 5432,
});

// Rezervasyon oluşturma
router.post('/create', async (req, res) => {
    try {
        const { 
            userEmail, 
            vehicleId, 
            vehicleName, 
            vehicleImage, 
            pickupLocation, 
            dropoffLocation, 
            pickupDate, 
            pickupTime, 
            dropoffDate, 
            dropoffTime, 
            totalPrice, 
            basePrice, 
            insurancePrice, 
            extrasPrice,
            insuranceType,
            extras
        } = req.body;
        
        if (!userEmail || !vehicleId || !pickupLocation || !dropoffLocation || !pickupDate || !dropoffDate || !totalPrice) {
            return res.status(400).json({ 
                success: false, 
                message: 'Gerekli alanlar eksik' 
            });
        }

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

        // Benzersiz booking ID oluştur
        const bookingId = 'AUT-' + new Date().getFullYear() + '-' + 
                         String(Date.now()).slice(-6) + '-' + 
                         Math.random().toString(36).substr(2, 3).toUpperCase();

        // Rezervasyon oluştur
        const reservation = await pool.query(
            `INSERT INTO reservations (
                user_id, booking_id, vehicle_id, vehicle_name, vehicle_image,
                pickup_location, return_location, pickup_date, pickup_time,
                return_date, return_time, total_price, base_price,
                insurance_price, extras_price, insurance_type, extras,
                status, payment_status, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19) 
            RETURNING id, booking_id, vehicle_name, pickup_location, return_location, 
                     pickup_date, return_date, total_price, status, payment_status, created_at`,
            [
                userId, bookingId, vehicleId, vehicleName, vehicleImage,
                pickupLocation, dropoffLocation, pickupDate, pickupTime,
                dropoffDate, dropoffTime, totalPrice, basePrice,
                insurancePrice, extrasPrice, insuranceType, JSON.stringify(extras),
                'confirmed', 'pending', new Date()
            ]
        );

        res.json({
            success: true,
            message: 'Rezervasyon başarıyla oluşturuldu',
            reservation: reservation.rows[0]
        });
    } catch (error) {
        console.error('Rezervasyon oluşturma hatası:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Sunucu hatası' 
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

        // Rezervasyonları getir
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