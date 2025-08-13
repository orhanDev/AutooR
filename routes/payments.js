const express = require('express');
const axios = require('axios');
require('dotenv').config();

const router = express.Router();

// Durum endpoint'i: merchant bilgilerinin yapılandırılıp yapılandırılmadığını rapor et
// Uyumlu durum endpointleri
router.get('/status', (req, res) => {
    const hasMerchantCreds = !!(process.env.KLARNA_USERNAME && process.env.KLARNA_PASSWORD);
    res.json({
        hasMerchantCreds,
        enabled: hasMerchantCreds,
        message: hasMerchantCreds 
            ? 'Klarna merchant bilgileri yapılandırıldı' 
            : 'Klarna merchant bilgileri yapılandırılmadı'
    });
});

router.get('/klarna/status', (req, res) => {
    const enabled = !!(process.env.KLARNA_USERNAME && process.env.KLARNA_PASSWORD);
    res.json({ enabled });
});

// Klarna Hosted Payment Page oturumu oluştur ve yönlendirme URL'sini döndür
router.post('/klarna/create-session', async (req, res) => {
    try {
        const { amount, currency = 'TRY', order_lines } = req.body;

        if (!amount || !order_lines) {
            return res.status(400).json({ error: 'Amount ve order_lines gerekli' });
        }

        // Burada gerçek Klarna API entegrasyonu yapılacak
        // Şimdilik demo response döndürüyoruz
        const demoRedirectUrl = `https://demo.klarna.com/pay/${Date.now()}`;

        res.json({
            redirect_url: demoRedirectUrl,
            session_id: `demo_session_${Date.now()}`,
            message: 'Demo Klarna oturumu oluşturuldu'
        });

    } catch (error) {
        console.error('Fehler beim Erstellen der Klarna-Sitzung:', error);
        res.status(500).json({ error: 'Klarna oturumu oluşturulamadı' });
    }
});

// HPP oturumu (checkout.js ile uyumlu)
router.post('/klarna/hpp/session', async (req, res) => {
    try {
        const { amount_eur, order_description } = req.body;
        const enabled = !!(process.env.KLARNA_USERNAME && process.env.KLARNA_PASSWORD);
        if (!enabled) {
            return res.status(503).json({ error: 'Klarna devre dışı' });
        }
        // Demo yanıt
        const demoRedirectUrl = `https://demo.klarna.com/pay/${Date.now()}`;
        res.json({ redirect_url: demoRedirectUrl, description: order_description || 'Mietwagen' });
    } catch (err) {
        res.status(500).json({ error: 'HPP session failed' });
    }
});

module.exports = router;


