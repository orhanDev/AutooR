const express = require('express');
const { Pool } = require('pg');
const router = express.Router();

// PostgreSQL Verbindungspool
const pool = new Pool({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT || 5432,
});

// Reservierung erstellen
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
                message: 'Erforderliche Felder fehlen' 
            });
        }

        // Benutzer finden (Unterstützung für id oder user_id)
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
                message: 'Benutzer nicht gefunden' 
            });
        }

        const userId = user.rows[0].id;

        // Überprüfen, ob Standorttabelle vorhanden ist
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
                    message: 'Standort nicht gefunden'
                });
            }

            pickupLocationId = pickupLoc.rows[0].location_id;
            dropoffLocationId = dropoffLoc.rows[0].location_id;
        }

        // Daten und Zeiten mit Datenbanktypen kompatibel machen
        const pickupTimeStr = pickupTime && pickupTime.length === 5 ? pickupTime + ':00' : (pickupTime || '09:00:00');
        const dropoffTimeStr = dropoffTime && dropoffTime.length === 5 ? dropoffTime + ':00' : (dropoffTime || '10:00:00');

        let reservation;
        if (hasLocationsTable) {
            // Schema: location_id-Spalten vorhanden
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
            // Altes/alternatives Schema: Textspalten (pickup_location, return_location)
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
            message: 'Reservierung erfolgreich erstellt',
            reservation: reservation.rows[0]
        });
    } catch (error) {
        console.error('Fehler beim Erstellen der Reservierung:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Serverfehler',
            code: error && error.code,
            detail: error && (error.detail || error.message)
        });
    }
});

// Reservierungen des Benutzers abrufen
router.get('/user/:userEmail', async (req, res) => {
    try {
        const { userEmail } = req.params;
        
        // Benutzer finden
        const user = await pool.query(
            'SELECT id FROM users WHERE email = $1',
            [userEmail]
        );

        if (user.rows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Benutzer nicht gefunden' 
            });
        }

        const userId = user.rows[0].id;

        // Reservierungen abrufen (alle Reservierungen)
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
        console.error('Fehler beim Abrufen der Reservierungsliste:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Serverfehler' 
        });
    }
});

// Reservierungsdetails abrufen
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
                message: 'Reservierung nicht gefunden' 
            });
        }

        res.json({
            success: true,
            reservation: reservation.rows[0]
        });
    } catch (error) {
        console.error('Fehler beim Abrufen der Reservierungsdetails:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Serverfehler' 
        });
    }
});

// Reservierung aktualisieren
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
                message: 'Reservierung nicht gefunden' 
            });
        }

        res.json({
            success: true,
            message: 'Reservierung erfolgreich aktualisiert',
            reservation: reservation.rows[0]
        });
    } catch (error) {
        console.error('Fehler beim Aktualisieren der Reservierung:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Serverfehler' 
        });
    }
});

// Reservierung stornieren
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
                message: 'Reservierung nicht gefunden' 
            });
        }

        res.json({
            success: true,
            message: 'Reservierung erfolgreich storniert',
            reservation: reservation.rows[0]
        });
    } catch (error) {
        console.error('Fehler beim Stornieren der Reservierung:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Serverfehler' 
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
                message: 'Ungültiger Zahlungsstatus' 
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
                message: 'Reservierung nicht gefunden' 
            });
        }

        res.json({
            success: true,
            message: 'Zahlungsstatus erfolgreich aktualisiert',
            reservation: reservation.rows[0]
        });
    } catch (error) {
        console.error('Fehler beim Aktualisieren des Zahlungsstatus:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Serverfehler' 
        });
    }
});

// Reservierung löschen
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
                message: 'Reservierung nicht gefunden' 
            });
        }

        res.json({
            success: true,
            message: 'Reservierung erfolgreich gelöscht',
            reservation: deletedReservation.rows[0]
        });
    } catch (error) {
        console.error('Fehler beim Löschen der Reservierung:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Serverfehler' 
        });
    }
});

module.exports = router;