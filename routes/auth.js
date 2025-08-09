const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/database');
const auth = require('../middleware/authMiddleware'); // auth middleware'i ekleniyor

// Kayıt (Register)
router.post('/register', async (req, res) => {
    const { first_name, last_name, email, password, phone_number, address } = req.body;

    try {
        // Kullanıcının zaten var olup olmadığını kontrol et
        const existingUser = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ message: 'Bu e-posta adresi zaten kayıtlı.' });
        }

        // Şifreyi hashle
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // Yeni kullanıcıyı veritabanına ekle
        const newUser = await db.query(
            'INSERT INTO users (first_name, last_name, email, password_hash, phone_number, address) VALUES ($1, $2, $3, $4, $5, $6) RETURNING user_id, email, first_name, last_name, is_admin;',
            [first_name, last_name, email, password_hash, phone_number, address]
        );

        // JWT oluştur
        const payload = {
            user: {
                id: newUser.rows[0].user_id,
                is_admin: newUser.rows[0].is_admin
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET, // Ortam değişkeninden alınacak sır anahtarı
            { expiresIn: '1h' }, // Token geçerlilik süresi
            (err, token) => {
                if (err) throw err;
                res.status(201).json({ token });
            }
        );

    } catch (err) {
        console.error('Kayıt hatası:', err.message);
        res.status(500).send('Sunucu Hatası');
    }
});

// Giriş (Login)
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Kullanıcıyı e-posta ile bul
        const userResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userResult.rows.length === 0) {
            return res.status(400).json({ message: 'Geçersiz kimlik bilgileri.' });
        }

        const user = userResult.rows[0];

        // Şifreyi doğrula
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Geçersiz kimlik bilgileri.' });
        }

        // JWT oluştur
        const payload = {
            user: {
                id: user.user_id,
                is_admin: user.is_admin
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );

    } catch (err) {
        console.error('Giriş hatası:', err.message);
        res.status(500).send('Sunucu Hatası');
    }
});

// Kullanıcının kendi bilgilerini getir (korumalı rota)
router.get('/user', auth, async (req, res) => {
    try {
        // auth middleware'i sayesinde req.user mevcut
        const user = await db.query(
            'SELECT user_id, first_name, last_name, email, phone_number, address, payment_card_json, payment_paypal_json, payment_klarna_json, is_admin, created_at FROM users WHERE user_id = $1',
            [req.user.id]
        );

        if (user.rows.length === 0) {
            return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
        }

        res.json(user.rows[0]);
    } catch (err) {
        console.error('Kullanıcı bilgileri çekilirken hata:', err.message);
        res.status(500).send('Sunucu Hatası');
    }
});

// Kullanıcının kendi bilgilerini güncelle (korumalı rota)
router.put('/user', auth, async (req, res) => {
    const { first_name, last_name, phone_number, address, payment_card_json, payment_paypal_json, payment_klarna_json } = req.body;
    try {
        const result = await db.query(
            'UPDATE users SET first_name = $1, last_name = $2, phone_number = $3, address = $4, payment_card_json = $5, payment_paypal_json = $6, payment_klarna_json = $7 WHERE user_id = $8 RETURNING user_id, first_name, last_name, email, phone_number, address, payment_card_json, payment_paypal_json, payment_klarna_json, is_admin, created_at',
            [first_name, last_name, phone_number, address, payment_card_json || null, payment_paypal_json || null, payment_klarna_json || null, req.user.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Kullanıcı güncelleme hatası:', err.message);
        res.status(500).send('Sunucu Hatası');
    }
});

module.exports = router;