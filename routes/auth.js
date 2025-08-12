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

        // Email kontrolü
        const existingUser = await query('SELECT * FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: 'E-Mail bereits registriert' });
        }

        // Şifre hash'leme
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Yeni kullanıcı oluşturma
        const newUser = await query(`
            INSERT INTO users (first_name, last_name, email, password_hash, phone_number, address)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING user_id, first_name, last_name, email, phone_number, address, is_admin, created_at
        `, [first_name, last_name, email, passwordHash, phone_number, address]);

        // JWT token oluşturma
        const token = jwt.sign(
            { userId: newUser.rows[0].user_id, email: newUser.rows[0].email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'Registrierung erfolgreich',
            user: { id: newUser.rows[0].user_id, email: newUser.rows[0].email }
        });

    } catch (error) {
        console.error('Kayıt hatası:', error);
        res.status(500).json({ error: 'Serverfehler' });
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

        // JWT token oluşturma
        const token = jwt.sign(
            { userId: user.rows[0].user_id, email: user.rows[0].email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Anmeldung erfolgreich',
            token,
            user: { id: user.rows[0].user_id, email: user.rows[0].email }
        });

    } catch (error) {
        console.error('Giriş hatası:', error);
        res.status(500).json({ error: 'Serverfehler' });
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