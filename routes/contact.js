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

// Send contact form email
router.post('/send', async (req, res) => {
    try {
        const { firstName, lastName, email, phone, subject, message, to } = req.body;

        // Validation
        if (!firstName || !lastName || !email || !subject || !message) {
            return res.status(400).json({ error: 'Alle Pflichtfelder müssen ausgefüllt werden' });
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Ungültige E-Mail-Adresse' });
        }

        const mailOptions = {
            from: process.env.EMAIL_USER || 'noreply@autor.com',
            to: to || 'orhancode@gmail.com',
            subject: `Neue Kontaktanfrage: ${subject}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #f39c12; border-bottom: 2px solid #f39c12; padding-bottom: 10px;">
                        Neue Kontaktanfrage von AutooR Website
                    </h2>
                    
                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #2c3e50; margin-top: 0;">Kontaktdaten:</h3>
                        <p><strong>Name:</strong> ${firstName} ${lastName}</p>
                        <p><strong>E-Mail:</strong> <a href="mailto:${email}">${email}</a></p>
                        ${phone ? `<p><strong>Telefon:</strong> ${phone}</p>` : ''}
                        <p><strong>Betreff:</strong> ${subject}</p>
                    </div>
                    
                    <div style="background-color: #fff; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px;">
                        <h3 style="color: #2c3e50; margin-top: 0;">Nachricht:</h3>
                        <p style="line-height: 1.6; color: #495057;">${message.replace(/\n/g, '<br>')}</p>
                    </div>
                    
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef; color: #6c757d; font-size: 14px;">
                        <p>Diese Nachricht wurde automatisch von der AutooR Website gesendet.</p>
                        <p>Antworten Sie direkt an: <a href="mailto:${email}">${email}</a></p>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);

        // Log the contact request
        console.log(`Contact form submitted: ${firstName} ${lastName} (${email}) - ${subject}`);

        res.json({ 
            success: true,
            message: 'Ihre Nachricht wurde erfolgreich gesendet. Wir werden uns schnellstmöglich bei Ihnen melden.' 
        });

    } catch (error) {
        console.error('Email sending error:', error);
        res.status(500).json({ 
            error: 'Beim Senden der Nachricht ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.' 
        });
    }
});

// Legacy route for backward compatibility
router.post('/', async (req, res) => {
    try {
        const { name, email, subject, message, phone } = req.body;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            subject: subject || 'Neue Kontaktanfrage von der Website',
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
