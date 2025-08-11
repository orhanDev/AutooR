const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();

// Gmail SMTP ayarları
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASS || 'your-app-password'
    }
});

router.post('/', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            subject: 'Neue Kontaktanfrage von der Website',
            html: `
                <h2>Neue Kontaktanfrage</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>E-Mail:</strong> ${email}</p>
                <p><strong>Telefon:</strong> ${phone}</p>
                <p><strong>Nachricht:</strong></p>
                <p>${message}</p>
            `
        };

        await transporter.sendMail(mailOptions);

        res.json({ message: 'Nachricht erfolgreich gesendet' });

    } catch (error) {
        console.error('Email gönderilirken hata:', error);
        res.status(500).json({ error: 'Fehler beim Senden der Nachricht' });
    }
});

module.exports = router;
