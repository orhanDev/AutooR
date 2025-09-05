const express = require('express');
const { Pool } = require('pg');
const crypto = require('crypto');
const router = express.Router();

// PostgreSQL bağlantı havuzu
const pool = new Pool({
    user: process.env.PGUSER || 'autor_user',
    host: process.env.PGHOST || 'localhost',
    database: process.env.PGDATABASE || 'autor_db',
    password: process.env.PGPASSWORD || 'Vekil4023.',
    port: process.env.PGPORT || 5432,
});

// Şifreleme anahtarı (production'da environment variable olmalı)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-32-character-secret-key-here!';
const ALGORITHM = 'aes-256-cbc';

// Şifreleme fonksiyonu
function encrypt(text) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(ALGORITHM, ENCRYPTION_KEY);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
}

// Şifre çözme fonksiyonu
function decrypt(text) {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = textParts.join(':');
    const decipher = crypto.createDecipher(ALGORITHM, ENCRYPTION_KEY);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

// Kart tipini belirleme
function getCardType(cardNumber) {
    const number = cardNumber.replace(/\D/g, '');
    if (number.startsWith('4')) return 'visa';
    if (number.startsWith('5') || number.startsWith('2')) return 'mastercard';
    if (number.startsWith('3')) return 'amex';
    return 'unknown';
}

// Kredi kartı kaydetme
router.post('/credit-card', async (req, res) => {
    try {
        const { userEmail, cardHolderName, cardNumber, expiryMonth, expiryYear, cvv } = req.body;
        
        if (!userEmail || !cardHolderName || !cardNumber || !expiryMonth || !expiryYear || !cvv) {
            return res.status(400).json({ 
                success: false, 
                message: 'Tüm alanlar gereklidir' 
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
        const cardNumberClean = cardNumber.replace(/\D/g, '');
        const cardNumberLast4 = cardNumberClean.slice(-4);
        const cardType = getCardType(cardNumberClean);

        // Kart numarasını ve CVV'yi şifrele
        const encryptedCardNumber = encrypt(cardNumberClean);
        const encryptedCvv = encrypt(cvv);

        // Mevcut kartları kontrol et (aynı kart var mı?)
        const existingCard = await pool.query(
            'SELECT id FROM credit_cards WHERE user_id = $1 AND card_number_last4 = $2 AND expiry_month = $3 AND expiry_year = $4',
            [userId, cardNumberLast4, expiryMonth, expiryYear]
        );

        if (existingCard.rows.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Bu kart zaten kayıtlı' 
            });
        }

        // Yeni kart kaydet
        const newCard = await pool.query(
            'INSERT INTO credit_cards (user_id, card_holder_name, card_number_encrypted, card_number_last4, expiry_month, expiry_year, cvv_encrypted, card_type, is_default) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id, card_holder_name, card_number_last4, expiry_month, expiry_year, card_type, is_default, created_at',
            [userId, cardHolderName, encryptedCardNumber, cardNumberLast4, expiryMonth, expiryYear, encryptedCvv, cardType, false]
        );

        res.json({
            success: true,
            message: 'Kredi kartı başarıyla kaydedildi',
            card: newCard.rows[0]
        });
    } catch (error) {
        console.error('Kredi kartı kayıt hatası:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Sunucu hatası' 
        });
    }
});

// Kullanıcının kredi kartlarını getir
router.get('/credit-cards/:userEmail', async (req, res) => {
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

        // Kullanıcının kartlarını getir (şifrelenmiş bilgileri gösterme)
        const cards = await pool.query(
            'SELECT id, card_holder_name, card_number_last4, expiry_month, expiry_year, card_type, is_default, created_at FROM credit_cards WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC',
            [userId]
        );

        res.json({
            success: true,
            cards: cards.rows
        });
    } catch (error) {
        console.error('Kredi kartı listesi hatası:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Sunucu hatası' 
        });
    }
});

// Kredi kartı silme
router.delete('/credit-card/:cardId', async (req, res) => {
    try {
        const { cardId } = req.params;
        
        const deletedCard = await pool.query(
            'DELETE FROM credit_cards WHERE id = $1 RETURNING id, card_holder_name, card_number_last4',
            [cardId]
        );

        if (deletedCard.rows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Kart bulunamadı' 
            });
        }

        res.json({
            success: true,
            message: 'Kredi kartı başarıyla silindi',
            card: deletedCard.rows[0]
        });
    } catch (error) {
        console.error('Kredi kartı silme hatası:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Sunucu hatası' 
        });
    }
});

// Varsayılan kart belirleme
router.put('/credit-card/:cardId/default', async (req, res) => {
    try {
        const { cardId } = req.params;
        
        // Önce tüm kartları varsayılan olmaktan çıkar
        await pool.query(
            'UPDATE credit_cards SET is_default = false WHERE user_id = (SELECT user_id FROM credit_cards WHERE id = $1)',
            [cardId]
        );

        // Seçilen kartı varsayılan yap
        const updatedCard = await pool.query(
            'UPDATE credit_cards SET is_default = true WHERE id = $1 RETURNING id, card_holder_name, card_number_last4, is_default',
            [cardId]
        );

        if (updatedCard.rows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Kart bulunamadı' 
            });
        }

        res.json({
            success: true,
            message: 'Varsayılan kart güncellendi',
            card: updatedCard.rows[0]
        });
    } catch (error) {
        console.error('Varsayılan kart güncelleme hatası:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Sunucu hatası' 
        });
    }
});

// Ödeme işlemi
router.post('/process', async (req, res) => {
    try {
        const { userEmail, cardId, amount, currency = 'EUR', paymentMethod, reservationId } = req.body;
        
        if (!userEmail || !cardId || !amount || !paymentMethod) {
            return res.status(400).json({ 
                success: false, 
                message: 'Gerekli bilgiler eksik' 
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

        // Kartı bul
        const card = await pool.query(
            'SELECT * FROM credit_cards WHERE id = $1 AND user_id = $2',
            [cardId, userId]
        );

        if (card.rows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Kredi kartı bulunamadı' 
            });
        }

        // Simüle edilmiş ödeme işlemi (gerçek uygulamada Stripe, PayPal vb. kullanılır)
        const transactionId = 'TXN_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        const paymentStatus = Math.random() > 0.1 ? 'success' : 'failed'; // %90 başarı oranı

        // Ödeme kaydını oluştur
        const payment = await pool.query(
            'INSERT INTO payments (reservation_id, user_id, amount, currency, payment_method, transaction_id, status, payment_gateway, gateway_response) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id, transaction_id, status, amount, created_at',
            [reservationId, userId, amount, currency, paymentMethod, transactionId, paymentStatus, 'simulated', JSON.stringify({ simulated: true })]
        );

        // Eğer rezervasyon varsa, ödeme durumunu güncelle
        if (reservationId) {
            await pool.query(
                'UPDATE reservations SET payment_status = $1, payment_method = $2 WHERE id = $3',
                [paymentStatus, paymentMethod, reservationId]
            );
        }

        res.json({
            success: paymentStatus === 'success',
            message: paymentStatus === 'success' ? 'Ödeme başarılı' : 'Ödeme başarısız',
            payment: payment.rows[0]
        });
    } catch (error) {
        console.error('Ödeme işlemi hatası:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Sunucu hatası' 
        });
    }
});

// Ödeme geçmişi
router.get('/history/:userEmail', async (req, res) => {
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

        // Ödeme geçmişini getir
        const payments = await pool.query(
            'SELECT p.*, r.booking_id, r.vehicle_name FROM payments p LEFT JOIN reservations r ON p.reservation_id = r.id WHERE p.user_id = $1 ORDER BY p.created_at DESC',
            [userId]
        );

        res.json({
            success: true,
            payments: payments.rows
        });
    } catch (error) {
        console.error('Ödeme geçmişi hatası:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Sunucu hatası' 
        });
    }
});

module.exports = router;