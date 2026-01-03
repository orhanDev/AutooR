const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { query } = require('../db/database');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Kayıt
router.post('/register', async (req, res) => {
    try {
        const { first_name, last_name, email, password, phone_number, address } = req.body;

        // Field validation
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
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
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
        
        // Password validation
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

        // Email kontrolü
        const existingUser = await query('SELECT * FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ 
                error: 'E-Mail bereits registriert',
                field: 'email',
                message: 'Diese E-Mail-Adresse ist bereits registriert. Bitte verwenden Sie eine andere E-Mail-Adresse oder melden Sie sich an.'
            });
        } 

        // Şifre hash'leme
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Yeni kullanıcı oluşturma (phone_number ve address opsiyonel)
        console.log('=== INSERT QUERY BAŞLIYOR ===');
        console.log('Values:', { first_name, last_name, email, phone_number: phone_number || null, address: address || null });
        
        let newUser;
        try {
            newUser = await query(`
                INSERT INTO users (first_name, last_name, email, password_hash, phone_number, address)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING user_id, first_name, last_name, email, phone_number, address, is_admin, created_at
            `, [first_name, last_name, email, passwordHash, phone_number || null, address || null]);
            console.log('=== INSERT QUERY BAŞARILI ===');
            console.log('newUser.rows:', newUser.rows);
        } catch (queryError) {
            console.error('=== INSERT QUERY HATASI ===');
            console.error('Query error:', queryError);
            throw queryError;
        }

        // user_id kullan (veritabanında user_id var)
        const userId = newUser.rows[0].user_id;
        const userEmail = newUser.rows[0].email;
        const isAdmin = newUser.rows[0].is_admin || false;

        // JWT token oluşturma (is_admin dahil)
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

// Giriş
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Kullanıcıyı bul
        const user = await query('SELECT * FROM users WHERE email = $1', [email]);
        if (user.rows.length === 0) {
            return res.status(401).json({ error: 'Ungültige Anmeldedaten' });
        }

        // Şifre kontrolü
        const isValidPassword = await bcrypt.compare(password, user.rows[0].password_hash);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Ungültige Anmeldedaten' });
        }

        // user_id kullan (veritabanında user_id var)
        const userId = user.rows[0].user_id;
        const userEmail = user.rows[0].email;
        const isAdmin = user.rows[0].is_admin || false;

        // JWT token oluşturma (is_admin dahil)
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

// Kullanıcı bilgilerini getir (korumalı rota)
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

// Kullanıcı bilgilerini getir (token ile)
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

// Kullanıcı bilgilerini güncelle (korumalı rota)
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