const express = require('express');
const axios = require('axios');
require('dotenv').config();

const router = express.Router();

// Durum endpoint'i: merchant bilgilerinin yapılandırılıp yapılandırılmadığını rapor et
router.get('/status', (req, res) => {
    const hasMerchantCreds = !!(process.env.KLARNA_USERNAME && process.env.KLARNA_PASSWORD);
    res.json({
        hasMerchantCreds,
        message: hasMerchantCreds 
            ? 'Klarna merchant bilgileri yapılandırıldı' 
            : 'Klarna merchant bilgileri yapılandırılmadı'
    });
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

module.exports = router;


