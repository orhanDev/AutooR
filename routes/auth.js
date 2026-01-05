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

        console.log('=== EMAIL KONTROLÜ ===');
        console.log('Orijinal email:', email);
        console.log('Normalize edilmiş email:', normalizedEmail);
        
        const existingUser = await query('SELECT * FROM users WHERE LOWER(TRIM(email)) = $1', [normalizedEmail]);
        console.log('Mevcut kullanıcı sayısı:', existingUser.rows.length);
        if (existingUser.rows.length > 0) {
            console.log('Bulunan kullanıcı:', existingUser.rows[0].email);
            return res.status(400).json({ 
                error: 'E-Mail bereits registriert',
                field: 'email',
                message: 'Diese E-Mail-Adresse ist bereits registriert. Bitte verwenden Sie eine andere E-Mail-Adresse oder melden Sie sich an.'
            });
        }
        console.log('Email kayıtlı değil, kayıt devam ediyor...');

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
        console.error('=== KAYIT HATASI ===');
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
        console.error('=== GİRİŞ HATASI ===');
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

        const user = await query(`
            SELECT user_id, first_name, last_name, email, phone_number, address, 
                   payment_card_json, payment_paypal_json, payment_klarna_json, 
                   is_admin, created_at 
            FROM users WHERE user_id = $1
        `, [userId]);

        if (user.rows.length === 0) {
            return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
        }

        res.json({
            message: 'Profil erfolgreich aktualisiert',
            user: user.rows[0]
        });

    } catch (error) {
        console.error('Kullanıcı bilgileri çekilirken hata:', error);
        res.status(500).json({ error: 'Serverfehler' });
    }
});

router.get('/user', authMiddleware, async (req, res) => {
    try {
        console.log('=== /user endpoint çalışıyor ===');
        console.log('req.user:', req.user);
        
        const userId = req.user.userId;
        console.log('userId:', userId);

        const user = await query(`
            SELECT user_id, first_name, last_name, email, phone_number, address, 
                   is_admin, created_at 
            FROM users WHERE user_id = $1
        `, [userId]);
        
        console.log('Database query sonucu:', user.rows);

        if (user.rows.length === 0) {
            console.log('Kullanıcı bulunamadı');
            return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
        }

        console.log('Kullanıcı bulundu:', user.rows[0]);
        
        res.json({
            message: 'Kullanıcı bilgileri başarıyla getirildi',
            user: user.rows[0]
        });

    } catch (error) {
        console.error('=== /user endpoint hatası ===');
        console.error('Hata detayı:', error);
        console.error('Stack trace:', error.stack);
        res.status(500).json({ error: 'Serverfehler', details: error.message });
    }
});

router.put('/profile', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { first_name, last_name, phone_number, address, payment_card_json, payment_paypal_json, payment_klarna_json } = req.body;

        const updatedUser = await query(`
            UPDATE users 
            SET first_name = $1, last_name = $2, phone_number = $3, address = $4,
                payment_card_json = $5, payment_paypal_json = $6, payment_klarna_json = $7
            WHERE user_id = $8
            RETURNING user_id, first_name, last_name, email, phone_number, address, 
                      payment_card_json, payment_paypal_json, payment_klarna_json, 
                      is_admin, created_at
        `, [first_name, last_name, phone_number, address, payment_card_json, payment_paypal_json, payment_klarna_json, userId]);

        if (updatedUser.rows.length === 0) {
            return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
        }

        res.json({
            message: 'Profil başarıyla güncellendi',
            user: updatedUser.rows[0]
        });

    } catch (error) {
        console.error('Profil güncelleme hatası:', error);
        res.status(500).json({ error: 'Serverfehler' });
    }
});

module.exports = router;