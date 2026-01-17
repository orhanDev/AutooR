const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { query } = require('../db/database');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

function createEmailTransporter() {
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    const emailHost = process.env.EMAIL_HOST || 'smtp.gmail.com';
    const emailPort = process.env.EMAIL_PORT || 587;
    const emailSecure = process.env.EMAIL_SECURE === 'true' || false;
    const emailProvider = process.env.EMAIL_PROVIDER || 'auto'; 
    
    if (!emailUser || !emailPass) {
        return null;
    }

    if (emailProvider === 'sendgrid' || emailHost === 'smtp.sendgrid.net') {
        console.log('Using SendGrid SMTP');
        return nodemailer.createTransport({
            host: 'smtp.sendgrid.net',
            port: 587,
            secure: false, 
            auth: {
                user: 'apikey', 
                pass: emailPass 
            },
            
            connectionTimeout: 10000,
            greetingTimeout: 10000,
            socketTimeout: 10000,
            tls: {
                rejectUnauthorized: false
            },
            debug: process.env.NODE_ENV !== 'production',
            logger: process.env.NODE_ENV !== 'production'
        });
    }

    if (emailProvider === 'gmail' || emailUser.includes('@gmail.com')) {
        
        return nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true, 
            auth: {
                user: emailUser,
                pass: emailPass
            },
            
            connectionTimeout: 30000, 
            greetingTimeout: 30000, 
            socketTimeout: 30000, 
            
            tls: {
                rejectUnauthorized: false, 
                minVersion: 'TLSv1.2'
            },
            
            debug: process.env.NODE_ENV !== 'production',
            logger: process.env.NODE_ENV !== 'production'
        });
    }

        return nodemailer.createTransport({
            host: emailHost,
            port: parseInt(emailPort),
            secure: emailSecure, 
            auth: {
                user: emailUser,
                pass: emailPass
            },
        
        connectionTimeout: 10000, 
        greetingTimeout: 10000, 
        socketTimeout: 10000, 
            tls: {
                rejectUnauthorized: false 
        },
        
        debug: process.env.NODE_ENV !== 'production',
        logger: process.env.NODE_ENV !== 'production'
            });
        }

router.post('/register', async (req, res) => {
    try {
        const { first_name, last_name, email, password, phone_number, address } = req.body;

        if (!first_name || !first_name.trim()) {
            return res.status(400).json({ 
                error: 'Vorname ist erforderlich',
                field: 'first_name',
                message: 'Bitte geben Sie Ihren Vornamen ein.'
            });
        }
        
        if (!last_name || !last_name.trim()) {
            return res.status(400).json({ 
                error: 'Nachname ist erforderlich',
                field: 'last_name',
                message: 'Bitte geben Sie Ihren Nachnamen ein.'
            });
        }
        
        if (!email || !email.trim()) {
            return res.status(400).json({ 
                error: 'E-Mail ist erforderlich',
                field: 'email',
                message: 'Bitte geben Sie Ihre E-Mail-Adresse ein.'
            });
        }

        const normalizedEmail = email.trim().toLowerCase();
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(normalizedEmail)) {
            return res.status(400).json({ 
                error: 'Ungültige E-Mail-Adresse',
                field: 'email',
                message: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.'
            });
        }
        
        if (!password || !password.trim()) {
            return res.status(400).json({ 
                error: 'Passwort ist erforderlich',
                field: 'password',
                message: 'Bitte geben Sie ein Passwort ein.'
            });
        }

        if (password.length < 10 || password.length > 40) {
            return res.status(400).json({ 
                error: 'Passwort-Länge ungültig',
                field: 'password',
                message: 'Das Passwort muss zwischen 10 und 40 Zeichen lang sein.'
            });
        }
        
        if (!/[a-z]/.test(password)) {
            return res.status(400).json({ 
                error: 'Passwort-Anforderung nicht erfüllt',
                field: 'password',
                message: 'Das Passwort muss mindestens einen Kleinbuchstaben enthalten.'
            });
        }
        
        if (!/[A-Z]/.test(password)) {
            return res.status(400).json({ 
                error: 'Passwort-Anforderung nicht erfüllt',
                field: 'password',
                message: 'Das Passwort muss mindestens einen Großbuchstaben enthalten.'
            });
        }
        
        if (!/[0-9]/.test(password)) {
            return res.status(400).json({ 
                error: 'Passwort-Anforderung nicht erfüllt',
                field: 'password',
                message: 'Das Passwort muss mindestens eine Zahl enthalten.'
            });
        }
        
        if (!/[-.\/',;&@#*)(_+:"~]/.test(password)) {
            return res.status(400).json({ 
                error: 'Passwort-Anforderung nicht erfüllt',
                field: 'password',
                message: 'Das Passwort muss mindestens ein Sonderzeichen enthalten: - . / \' , ; & @ # * ) ( _ + : " ~'
            });
        }

        console.log('=== E-MAIL-PRÜFUNG ===');
        console.log('Originale E-Mail:', email);
        console.log('Normalisierte E-Mail:', normalizedEmail);
        
        const existingUser = await query('SELECT * FROM users WHERE LOWER(TRIM(email)) = $1', [normalizedEmail]);
        console.log('Anzahl vorhandener Benutzer:', existingUser.rows.length);
        if (existingUser.rows.length > 0) {
            console.log('Gefundener Benutzer:', existingUser.rows[0].email);
            return res.status(400).json({ 
                error: 'E-Mail bereits registriert',
                field: 'email',
                message: 'Diese E-Mail-Adresse ist bereits registriert. Bitte verwenden Sie eine andere E-Mail-Adresse oder melden Sie sich an.'
            });
        }
        console.log('E-Mail nicht registriert, Registrierung wird fortgesetzt...');

        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        const newUser = await query(`
            INSERT INTO users (first_name, last_name, email, password_hash, phone_number, address, is_verified)
            VALUES ($1, $2, $3, $4, $5, $6, TRUE)
                RETURNING user_id, first_name, last_name, email, phone_number, address, is_admin, created_at
            `, [first_name, last_name, normalizedEmail, passwordHash, phone_number || null, address || null]);

        const userId = newUser.rows[0].user_id;
        const userEmail = newUser.rows[0].email;
        const isAdmin = newUser.rows[0].is_admin || false;

        const token = jwt.sign(
            { userId: userId, email: userEmail, is_admin: isAdmin },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'Registrierung erfolgreich',
            token: token,
            user: { 
                id: userId, 
                user_id: userId,
                email: userEmail,
                first_name: newUser.rows[0].first_name,
                last_name: newUser.rows[0].last_name
            }
        });

    } catch (error) {
        console.error('=== REGISTRIERUNGSFEHLER ===');
        console.error('Error:', error);
        console.error('Error message:', error.message);
        console.error('Error code:', error.code);
        console.error('Error detail:', error.detail);
        console.error('Error stack:', error.stack);
        console.error('Request body:', req.body);
        
        res.status(500).json({ 
            error: 'Serverfehler',
            message: error.message || 'Ein unerwarteter Fehler ist aufgetreten.',
            details: error.detail || error.message,
            code: error.code,
            field: error.column || null
        });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const normalizedEmail = email.trim().toLowerCase();

        const user = await query('SELECT * FROM users WHERE LOWER(TRIM(email)) = $1', [normalizedEmail]);
        if (user.rows.length === 0) {
            return res.status(401).json({ error: 'Ungültige Anmeldedaten' });
        }

        const isValidPassword = await bcrypt.compare(password, user.rows[0].password_hash);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Ungültige Anmeldedaten' });
        }

        const userId = user.rows[0].user_id;
        const userEmail = user.rows[0].email;
        const isAdmin = user.rows[0].is_admin || false;

        const token = jwt.sign(
            { userId: userId, email: userEmail, is_admin: isAdmin },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Anmeldung erfolgreich',
            token,
            user: { 
                id: userId, 
                user_id: userId,
                email: userEmail 
            }
        });

    } catch (error) {
        console.error('=== ANMELDEFEHLER ===');
        console.error('Error:', error);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        console.error('Request body:', req.body);
        res.status(500).json({ 
            error: 'Serverfehler',
            message: error.message || 'Ein unerwarteter Fehler ist aufgetreten.'
        });
    }
});

router.get('/profile', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.userId;
        let user;
        try {
            user = await query(`
                SELECT user_id, first_name, last_name, email, phone_number, address, 
                       date_of_birth, gender, city, postal_code, country,
                       payment_card_json, payment_paypal_json, payment_klarna_json, 
                       is_admin, created_at, updated_at
                FROM users WHERE user_id = $1
            `, [userId]);
        } catch (columnError) {
            console.log('Some columns may not exist, using basic query:', columnError.message);
            user = await query(`
            SELECT user_id, first_name, last_name, email, phone_number, address, 
                   payment_card_json, payment_paypal_json, payment_klarna_json, 
                       is_admin, created_at, updated_at
            FROM users WHERE user_id = $1
        `, [userId]);
        }

        if (user.rows.length === 0) {
            return res.status(404).json({ error: 'Benutzer nicht gefunden' });
        }
        console.log('GET /profile - User data:', JSON.stringify(user.rows[0], null, 2));
        console.log('GET /profile - Gender value:', user.rows[0].gender);

        res.json({
            message: 'Profil erfolgreich aktualisiert',
            user: user.rows[0]
        });

    } catch (error) {
        console.error('Fehler beim Abrufen der Benutzerinformationen:', error);
        res.status(500).json({ error: 'Serverfehler' });
    }
});

router.get('/user', authMiddleware, async (req, res) => {
    try {
        console.log('=== /user Endpunkt wird ausgeführt ===');
        console.log('req.user:', req.user);
        
        const userId = req.user.userId;
        console.log('userId:', userId);

        const user = await query(`
            SELECT user_id, first_name, last_name, email, phone_number, address, 
                   is_admin, created_at 
            FROM users WHERE user_id = $1
        `, [userId]);
        
        console.log('Datenbankabfrage-Ergebnis:', user.rows);

        if (user.rows.length === 0) {
            console.log('Benutzer nicht gefunden');
            return res.status(404).json({ error: 'Benutzer nicht gefunden' });
        }

        console.log('Benutzer gefunden:', user.rows[0]);
        
        res.json({
            message: 'Benutzerinformationen erfolgreich abgerufen',
            user: user.rows[0]
        });

    } catch (error) {
        console.error('=== /user Endpunkt-Fehler ===');
        console.error('Fehlerdetails:', error);
        console.error('Stack trace:', error.stack);
        res.status(500).json({ error: 'Serverfehler', details: error.message });
    }
});

router.put('/profile', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { first_name, last_name, phone_number, address, date_of_birth, gender, city, postal_code, country, payment_card_json, payment_paypal_json, payment_klarna_json } = req.body;
        console.log('PUT /profile - Received gender:', gender);
        let updatedUser;
        try {
            updatedUser = await query(`
                UPDATE users 
                SET first_name = $1, 
                    last_name = $2, 
                    phone_number = $3, 
                    address = $4,
                    date_of_birth = $5, 
                    gender = $6,
                    city = $7, 
                    postal_code = $8, 
                    country = $9,
                    payment_card_json = $10, 
                    payment_paypal_json = $11, 
                    payment_klarna_json = $12,
                    updated_at = CURRENT_TIMESTAMP
                WHERE user_id = $13
                RETURNING user_id, first_name, last_name, email, phone_number, address, 
                          date_of_birth, gender, city, postal_code, country,
                          payment_card_json, payment_paypal_json, payment_klarna_json, 
                          is_admin, created_at, updated_at
            `, [
                first_name, 
                last_name, 
                phone_number || null, 
                address || null, 
                date_of_birth || null, 
                gender || null,
                city || null, 
                postal_code || null, 
                country || null, 
                payment_card_json || null, 
                payment_paypal_json || null, 
                payment_klarna_json || null, 
                userId
            ]);
        } catch (columnError) {
            console.log('Some columns may not exist, using basic update. Run migration: npm run db:migrate');
            console.log('Error:', columnError.message);
            updatedUser = await query(`
            UPDATE users 
                SET first_name = $1, 
                    last_name = $2, 
                    phone_number = $3, 
                    address = $4,
                    payment_card_json = $5, 
                    payment_paypal_json = $6, 
                    payment_klarna_json = $7,
                    updated_at = CURRENT_TIMESTAMP
            WHERE user_id = $8
            RETURNING user_id, first_name, last_name, email, phone_number, address, 
                      payment_card_json, payment_paypal_json, payment_klarna_json, 
                          is_admin, created_at, updated_at
            `, [
                first_name, 
                last_name, 
                phone_number || null, 
                address || null, 
                payment_card_json || null, 
                payment_paypal_json || null, 
                payment_klarna_json || null, 
                userId
            ]);
        }

        if (updatedUser.rows.length === 0) {
            return res.status(404).json({ error: 'Benutzer nicht gefunden' });
        }

        res.json({
            message: 'Profil erfolgreich aktualisiert',
            user: updatedUser.rows[0]
        });

    } catch (error) {
        console.error('Fehler beim Aktualisieren des Profils:', error);
        res.status(500).json({ error: 'Serverfehler' });
    }
});

router.delete('/account', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.userId;
        const deletedUser = await query(
            'DELETE FROM users WHERE user_id = $1 RETURNING user_id, email, first_name, last_name',
            [userId]
        );
        
        if (deletedUser.rows.length === 0) {
            return res.status(404).json({ error: 'Benutzer nicht gefunden' });
        }
        
        res.json({
            message: 'Konto erfolgreich gelöscht',
            user: deletedUser.rows[0]
        });
    } catch (error) {
        console.error('Fehler beim Löschen des Kontos:', error);
        res.status(500).json({ error: 'Serverfehler' });
    }
});

router.get('/statistics', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.userId;
        const userEmail = req.user.email;
        
        console.log('GET /statistics - userId:', userId, 'userEmail:', userEmail);
        let actualUserId = userId;
        try {
            const userCheck = await query(
                'SELECT user_id FROM users WHERE email = $1 OR user_id = $2',
                [userEmail, userId]
            );
            if (userCheck.rows.length > 0) {
                actualUserId = userCheck.rows[0].user_id;
                console.log('GET /statistics - Found user_id:', actualUserId);
            }
        } catch (err) {
            console.log('GET /statistics - Error checking user_id, using provided userId:', err.message);
        }
        let bookingsResult;
        let totalBookings = 0;
        let totalSpent = 0;
        
        try {
            bookingsResult = await query(
                'SELECT COUNT(*) as total FROM reservations WHERE user_id = $1',
                [actualUserId]
            );
            totalBookings = parseInt(bookingsResult.rows[0]?.total || 0);
            
            if (totalBookings === 0) {
                try {
                    bookingsResult = await query(
                        'SELECT COUNT(*) as total FROM reservations WHERE id = $1',
                        [actualUserId]
                    );
                    totalBookings = parseInt(bookingsResult.rows[0]?.total || 0);
                } catch (e) {
                    console.log('GET /statistics - Error with id column:', e.message);
                }
            }
            try {
                const totalPriceResult = await query(
                    'SELECT COALESCE(SUM(total_price), 0) as total FROM reservations WHERE user_id = $1',
                    [actualUserId]
                );
                totalSpent = parseFloat(totalPriceResult.rows[0]?.total || 0);
            } catch (e) {
                console.log('GET /statistics - Error getting total_price:', e.message);
                try {
                    const totalPriceResult = await query(
                        'SELECT COALESCE(SUM(price), 0) as total FROM reservations WHERE user_id = $1',
                        [actualUserId]
                    );
                    totalSpent = parseFloat(totalPriceResult.rows[0]?.total || 0);
                } catch (e2) {
                    console.log('GET /statistics - Error with price column:', e2.message);
                }
            }
        } catch (error) {
            console.error('GET /statistics - Error querying reservations:', error);
            totalBookings = 0;
            totalSpent = 0;
        }
        const totalDistance = totalBookings * 200;
        const totalSavings = Math.round(totalSpent * 0.1);
        const loyaltyPoints = totalBookings * 100;
        
        console.log('GET /statistics - Results:', {
            totalBookings,
            totalDistance,
            totalSavings,
            loyaltyPoints,
            totalSpent
        });
        
        res.json({
            success: true,
            statistics: {
                totalBookings: totalBookings,
                totalDistance: totalDistance,
                totalSavings: totalSavings,
                loyaltyPoints: loyaltyPoints
            }
        });
    } catch (error) {
        console.error('Fehler beim Abrufen der Statistiken:', error);
        res.status(500).json({ error: 'Serverfehler', details: error.message });
    }
});

router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ error: 'E-Mail-Adresse ist erforderlich' });
        }
        const userResult = await query(
            'SELECT user_id, email, first_name, last_name FROM users WHERE LOWER(TRIM(email)) = $1',
            [email.trim().toLowerCase()]
        );
        if (userResult.rows.length === 0) {
            return res.json({
                message: 'Wenn diese E-Mail-Adresse registriert ist, erhalten Sie eine E-Mail mit Anweisungen zum Zurücksetzen Ihres Passworts.'
            });
        }
        
        const user = userResult.rows[0];
        const resetToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 1); // Token expires in 1 hour
        await query(
            'DELETE FROM password_reset_tokens WHERE email = $1',
            [email.trim().toLowerCase()]
        );
        await query(
            'INSERT INTO password_reset_tokens (email, token, expires_at) VALUES ($1, $2, $3)',
            [email.trim().toLowerCase(), resetToken, expiresAt]
        );
        const transporter = createEmailTransporter();
        if (transporter) {
            const resetUrl = `${req.protocol}://${req.get('host')}/reset-password?token=${resetToken}`;
            
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: user.email,
                subject: 'Passwort zurücksetzen - AutooR',
                html: `
                    <h2>Passwort zurücksetzen</h2>
                    <p>Hallo ${user.first_name},</p>
                    <p>Sie haben eine Anfrage zum Zurücksetzen Ihres Passworts gestellt.</p>
                    <p>Klicken Sie auf den folgenden Link, um Ihr Passwort zurückzusetzen:</p>
                    <p><a href="${resetUrl}" style="background-color: #7B7668; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Passwort zurücksetzen</a></p>
                    <p>Dieser Link ist 1 Stunde gültig.</p>
                    <p>Wenn Sie diese Anfrage nicht gestellt haben, ignorieren Sie diese E-Mail.</p>
                    <p>Mit freundlichen Grüßen,<br>Ihr AutooR Team</p>
                `
            });
        } else {
            console.warn('Email transporter not configured, password reset email not sent');
        }
        
        res.json({
            message: 'Wenn diese E-Mail-Adresse registriert ist, erhalten Sie eine E-Mail mit Anweisungen zum Zurücksetzen Ihres Passworts.'
        });
    } catch (error) {
        console.error('Fehler beim Zurücksetzen des Passworts:', error);
        res.status(500).json({ error: 'Serverfehler' });
    }
});

module.exports = router;