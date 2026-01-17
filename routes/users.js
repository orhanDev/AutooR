const express = require('express');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const router = express.Router();

const pool = new Pool({
    user: process.env.PGUSER || 'AutooR_user',
    host: process.env.PGHOST || 'localhost',
    database: process.env.PGDATABASE || 'AutooR',
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT || 5432,
});

router.post('/register', async (req, res) => {
    try {
        const { email, firstName, lastName, loginMethod = 'google' } = req.body;
        
        if (!email || !firstName || !lastName) {
            return res.status(400).json({ 
                success: false, 
                message: 'E-Mail, Vorname und Nachname sind erforderlich' 
            });
        }

        const existingUser = await pool.query(
            'SELECT id, email, first_name, last_name FROM users WHERE email = $1',
            [email]
        );

        let user;
        
        if (existingUser.rows.length > 0) {
            
            const updatedUser = await pool.query(
                'UPDATE users SET first_name = $1, last_name = $2, login_method = $3, updated_at = CURRENT_TIMESTAMP WHERE email = $4 RETURNING id, email, first_name, last_name, is_verified, login_method',
                [firstName, lastName, loginMethod, email]
            );
            user = updatedUser.rows[0];
        } else {
            
            const newUser = await pool.query(
                'INSERT INTO users (email, first_name, last_name, login_method, is_verified) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, first_name, last_name, is_verified, login_method',
                [email, firstName, lastName, loginMethod, true]
            );
            user = newUser.rows[0];
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email, is_admin: false },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );
        
        return res.json({
            success: true,
            message: 'Benutzer erfolgreich registriert',
            user: user,
            token: token
        });
    } catch (error) {
        console.error('Fehler beim Registrieren des Benutzers:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Serverfehler' 
        });
    }
});

router.get('/profile/:email', async (req, res) => {
    try {
        const { email } = req.params;
        
        const user = await pool.query(
            'SELECT id, email, first_name, last_name, phone, date_of_birth, address, city, postal_code, country, driver_license, driver_license_date, is_verified, login_method, created_at FROM users WHERE email = $1',
            [email]
        );

        if (user.rows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Benutzer nicht gefunden' 
            });
        }

        res.json({
            success: true,
            user: user.rows[0]
        });
    } catch (error) {
        console.error('Fehler beim Abrufen des Benutzerprofils:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Serverfehler' 
        });
    }
});

router.put('/profile/:email', async (req, res) => {
    try {
        const { email } = req.params;
        const { phone, dateOfBirth, address, city, postalCode, country, driverLicense, driverLicenseDate } = req.body;
        
        const updatedUser = await pool.query(
            'UPDATE users SET phone = $1, date_of_birth = $2, address = $3, city = $4, postal_code = $5, country = $6, driver_license = $7, driver_license_date = $8, updated_at = CURRENT_TIMESTAMP WHERE email = $9 RETURNING id, email, first_name, last_name, phone, date_of_birth, address, city, postal_code, country, driver_license, driver_license_date',
            [phone, dateOfBirth, address, city, postalCode, country, driverLicense, driverLicenseDate, email]
        );

        if (updatedUser.rows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Benutzer nicht gefunden' 
            });
        }

        res.json({
            success: true,
            message: 'Profil erfolgreich aktualisiert',
            user: updatedUser.rows[0]
        });
    } catch (error) {
        console.error('Fehler beim Aktualisieren des Profils:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Serverfehler' 
        });
    }
});

router.get('/reservations/:email', async (req, res) => {
    try {
        const { email } = req.params;

        const user = await pool.query(
            'SELECT id FROM users WHERE email = $1',
            [email]
        );

        if (user.rows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Benutzer nicht gefunden' 
            });
        }

        const userId = user.rows[0].id;

        const reservations = await pool.query(
            'SELECT * FROM reservations WHERE user_id = $1 ORDER BY created_at DESC',
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

router.delete('/delete/:email', async (req, res) => {
    try {
        const { email } = req.params;
        
        const deletedUser = await pool.query(
            'DELETE FROM users WHERE email = $1 RETURNING id, email, first_name, last_name',
            [email]
        );

        if (deletedUser.rows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Benutzer nicht gefunden' 
            });
        }

        res.json({
            success: true,
            message: 'Benutzer erfolgreich gelöscht',
            user: deletedUser.rows[0]
        });
    } catch (error) {
        console.error('Fehler beim Löschen des Benutzers:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Serverfehler' 
        });
    }
});

module.exports = router;