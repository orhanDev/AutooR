const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// Gmail SMTP ayarları
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'orhancodes@gmail.com',
        pass: 'cghcmrozlfmwnygu'
    }
});

router.post('/', async (req, res) => {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
        return res.status(400).json({ message: 'Tüm alanlar zorunludur.' });
    }
    try {
        await transporter.sendMail({
            from: 'orhancodes@gmail.com',
            to: 'orhancodes@gmail.com',
            subject: `AutoWolfXs İletişim Formu: ${name}`,
            text: `Gönderen: ${name} <${email}>

Mesaj:
${message}`
        });
        res.json({ message: 'Mesaj başarıyla gönderildi.' });
    } catch (err) {
        console.error('E-posta gönderme hatası:', err.message);
        res.status(500).json({ message: 'Mesaj gönderilemedi.' });
    }
});

module.exports = router;
