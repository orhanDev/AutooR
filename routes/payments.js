const express = require('express');
const { Pool } = require('pg');
const crypto = require('crypto');
const router = express.Router();

const pool = new Pool({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT || 5432,
});

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-32-character-secret-key-here!';
const ALGORITHM = 'aes-256-cbc';

function encrypt(text) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY.slice(0, 32)), iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
}

function decrypt(text) {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = textParts.join(':');
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY.slice(0, 32)), iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

function getCardType(cardNumber) {
    const number = cardNumber.replace(/\D/g, '');
    if (number.startsWith('4')) return 'visa';
    if (number.startsWith('5') || number.startsWith('2')) return 'mastercard';
    if (number.startsWith('3')) return 'amex';
    return 'unknown';
}

router.post('/credit-card', async (req, res) => {
    try {
        const { userEmail, cardHolderName, cardNumber, expiryMonth, expiryYear, cvv } = req.body;
        
        if (!userEmail || !cardHolderName || !cardNumber || !expiryMonth || !expiryYear || !cvv) {
            return res.status(400).json({ 
                success: false, 
                message: 'Alle Felder sind erforderlich' 
            });
        }

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
        const cardNumberClean = cardNumber.replace(/\D/g, '');
        const cardNumberLast4 = cardNumberClean.slice(-4);
        const cardType = getCardType(cardNumberClean);

        const encryptedCardNumber = encrypt(cardNumberClean);
        const encryptedCvv = encrypt(cvv);

        const existingCard = await pool.query(
            'SELECT id FROM credit_cards WHERE user_id = $1 AND card_number_last4 = $2 AND expiry_month = $3 AND expiry_year = $4',
            [userId, cardNumberLast4, expiryMonth, expiryYear]
        );

        if (existingCard.rows.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Diese Karte ist bereits registriert' 
            });
        }

        const newCard = await pool.query(
            'INSERT INTO credit_cards (user_id, card_holder_name, card_number_encrypted, card_number_last4, expiry_month, expiry_year, cvv_encrypted, card_type, is_default) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id, card_holder_name, card_number_last4, expiry_month, expiry_year, card_type, is_default, created_at',
            [userId, cardHolderName, encryptedCardNumber, cardNumberLast4, expiryMonth, expiryYear, encryptedCvv, cardType, false]
        );

        res.json({
            success: true,
            message: 'Kreditkarte erfolgreich gespeichert',
            card: newCard.rows[0]
        });
    } catch (error) {
        console.error('Fehler beim Speichern der Kreditkarte:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Serverfehler' 
        });
    }
});

router.get('/credit-cards/:userEmail', async (req, res) => {
    try {
        const { userEmail } = req.params;

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

        const cards = await pool.query(
            'SELECT id, card_holder_name, card_number_last4, expiry_month, expiry_year, card_type, is_default, created_at FROM credit_cards WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC',
            [userId]
        );

        res.json({
            success: true,
            cards: cards.rows
        });
    } catch (error) {
        console.error('Fehler beim Abrufen der Kreditkartenliste:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Serverfehler' 
        });
    }
});

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
                message: 'Karte nicht gefunden' 
            });
        }

        res.json({
            success: true,
            message: 'Kreditkarte erfolgreich gelöscht',
            card: deletedCard.rows[0]
        });
    } catch (error) {
        console.error('Fehler beim Löschen der Kreditkarte:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Serverfehler' 
        });
    }
});

router.put('/credit-card/:cardId/default', async (req, res) => {
    try {
        const { cardId } = req.params;

        await pool.query(
            'UPDATE credit_cards SET is_default = false WHERE user_id = (SELECT user_id FROM credit_cards WHERE id = $1)',
            [cardId]
        );

        const updatedCard = await pool.query(
            'UPDATE credit_cards SET is_default = true WHERE id = $1 RETURNING id, card_holder_name, card_number_last4, is_default',
            [cardId]
        );

        if (updatedCard.rows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Karte nicht gefunden' 
            });
        }

        res.json({
            success: true,
            message: 'Standardkarte aktualisiert',
            card: updatedCard.rows[0]
        });
    } catch (error) {
        console.error('Fehler beim Aktualisieren der Standardkarte:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Serverfehler' 
        });
    }
});

router.post('/process', async (req, res) => {
    try {
        const { userEmail, cardId, amount, currency = 'EUR', paymentMethod, reservationId } = req.body;
        
        if (!userEmail || !cardId || !amount || !paymentMethod) {
            return res.status(400).json({ 
                success: false, 
                message: 'Erforderliche Informationen fehlen' 
            });
        }

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

        const card = await pool.query(
            'SELECT * FROM credit_cards WHERE id = $1 AND user_id = $2',
            [cardId, userId]
        );

        if (card.rows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Kreditkarte nicht gefunden' 
            });
        }

        const transactionId = 'TXN_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        const paymentStatus = Math.random() > 0.1 ? 'success' : 'failed'; 

        const payment = await pool.query(
            'INSERT INTO payments (reservation_id, user_id, amount, currency, payment_method, transaction_id, status, payment_gateway, gateway_response) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id, transaction_id, status, amount, created_at',
            [reservationId, userId, amount, currency, paymentMethod, transactionId, paymentStatus, 'simulated', JSON.stringify({ simulated: true })]
        );

        if (reservationId) {
            await pool.query(
                'UPDATE reservations SET payment_status = $1, payment_method = $2 WHERE id = $3',
                [paymentStatus, paymentMethod, reservationId]
            );
        }

        res.json({
            success: paymentStatus === 'success',
            message: paymentStatus === 'success' ? 'Zahlung erfolgreich' : 'Zahlung fehlgeschlagen',
            payment: payment.rows[0]
        });
    } catch (error) {
        console.error('Fehler beim Zahlungsvorgang:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Serverfehler' 
        });
    }
});

router.get('/history/:userEmail', async (req, res) => {
    try {
        const { userEmail } = req.params;

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

        const payments = await pool.query(
            'SELECT p.*, r.booking_id, r.vehicle_name FROM payments p LEFT JOIN reservations r ON p.reservation_id = r.id WHERE p.user_id = $1 ORDER BY p.created_at DESC',
            [userId]
        );

        res.json({
            success: true,
            payments: payments.rows
        });
    } catch (error) {
        console.error('Fehler beim Abrufen des Zahlungsverlaufs:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Serverfehler' 
        });
    }
});

router.post('/paypal/create-order', async (req, res) => {
    try {
        const { userEmail, amount, currency, paymentMethod, reservationData } = req.body;
        
        if (!userEmail || !amount || !currency) {
            return res.status(400).json({ 
                success: false, 
                message: 'Erforderliche Informationen fehlen' 
            });
        }

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

        const orderId = 'PAYPAL_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

        await pool.query(
            'INSERT INTO paypal_orders (order_id, user_id, amount, currency, status, reservation_data) VALUES ($1, $2, $3, $4, $5, $6)',
            [orderId, userId, amount, currency, 'created', JSON.stringify(reservationData)]
        );

        const approvalUrl = `/paypal-success?token=${orderId}&PayerID=DEMO_PAYER_${Date.now()}&paymentId=PAY_${Date.now()}`;
        
        res.json({
            success: true,
            orderId: orderId,
            approvalUrl: approvalUrl,
            message: 'PayPal order created successfully'
        });
    } catch (error) {
        console.error('PayPal order creation error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Serverfehler' 
        });
    }
});

router.post('/paypal/success', async (req, res) => {
    try {
        const { orderId, payerId, paymentId } = req.body;
        
        if (!orderId) {
            return res.status(400).json({ 
                success: false, 
                message: 'Bestell-ID erforderlich' 
            });
        }

        const order = await pool.query(
            'SELECT * FROM paypal_orders WHERE order_id = $1',
            [orderId]
        );

        if (order.rows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'PayPal-Bestellung nicht gefunden' 
            });
        }

        const orderData = order.rows[0];

        await pool.query(
            'UPDATE paypal_orders SET status = $1, payer_id = $2, payment_id = $3, completed_at = NOW() WHERE order_id = $4',
            ['completed', payerId, paymentId, orderId]
        );

        const transactionId = 'PAYPAL_TXN_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        const payment = await pool.query(
            'INSERT INTO payments (user_id, amount, currency, payment_method, transaction_id, status, payment_gateway, gateway_response) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, transaction_id, status, amount, created_at',
            [orderData.user_id, orderData.amount, orderData.currency, 'paypal', transactionId, 'success', 'paypal', JSON.stringify({ orderId, payerId, paymentId })]
        );

        res.json({
            success: true,
            message: 'PayPal payment completed successfully',
            payment: payment.rows[0],
            orderId: orderId
        });
    } catch (error) {
        console.error('PayPal success callback error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Serverfehler' 
        });
    }
});

router.post('/paypal/cancel', async (req, res) => {
    try {
        const { orderId } = req.body;
        
        if (!orderId) {
            return res.status(400).json({ 
                success: false, 
                message: 'Bestell-ID erforderlich' 
            });
        }

        await pool.query(
            'UPDATE paypal_orders SET status = $1, cancelled_at = NOW() WHERE order_id = $2',
            ['cancelled', orderId]
        );

        res.json({
            success: true,
            message: 'PayPal payment cancelled',
            orderId: orderId
        });
    } catch (error) {
        console.error('PayPal cancel callback error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Serverfehler' 
        });
    }
});

module.exports = router;