const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { query } = require('../db/database');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Email transporter - Tüm email servislerini destekler (Gmail, SendGrid, Outlook, Yahoo, vb.)
function createEmailTransporter() {
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    const emailHost = process.env.EMAIL_HOST || 'smtp.gmail.com';
    const emailPort = process.env.EMAIL_PORT || 587;
    const emailSecure = process.env.EMAIL_SECURE === 'true' || false;
    const emailProvider = process.env.EMAIL_PROVIDER || 'auto'; // 'gmail', 'sendgrid', 'auto'
    
    if (!emailUser || !emailPass) {
        return null;
    }
    
    // SendGrid desteği - EMAIL_PROVIDER=sendgrid veya EMAIL_HOST=smtp.sendgrid.net
    if (emailProvider === 'sendgrid' || emailHost === 'smtp.sendgrid.net') {
        console.log('Using SendGrid SMTP');
        return nodemailer.createTransport({
            host: 'smtp.sendgrid.net',
            port: 587,
            secure: false, // TLS için false
            auth: {
                user: 'apikey', // SendGrid için her zaman 'apikey'
                pass: emailPass // SendGrid API Key
            },
            // Timeout ayarları
            connectionTimeout: 10000,
            greetingTimeout: 10000,
            socketTimeout: 10000,
            tls: {
                rejectUnauthorized: false
            },
            debug: process.env.NODE_ENV !== 'production',
            logger: process.env.NODE_ENV !== 'production'
        });
    }
    
    // Gmail için explicit SMTP ayarları kullan (service yerine)
    // Railway'de service kullanımı bazen sorun çıkarabiliyor
    if (emailProvider === 'gmail' || emailUser.includes('@gmail.com')) {
        // Port 465 (SSL) ile deneyelim - Railway'de daha güvenilir olabilir
        return nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true, // SSL için true
            auth: {
                user: emailUser,
                pass: emailPass
            },
            // Timeout ayarları
            connectionTimeout: 30000, // 30 saniye
            greetingTimeout: 30000, // 30 saniye
            socketTimeout: 30000, // 30 saniye
            // TLS ayarları
            tls: {
                rejectUnauthorized: false, // Railway için gerekli olabilir
                minVersion: 'TLSv1.2'
            },
            // Debug için
            debug: process.env.NODE_ENV !== 'production',
            logger: process.env.NODE_ENV !== 'production'
        });
    }
    
    // Diğer email servisleri için (Outlook, Yahoo, custom SMTP)
    return nodemailer.createTransport({
        host: emailHost,
        port: parseInt(emailPort),
        secure: emailSecure, // true for 465, false for diğer portlar
        auth: {
            user: emailUser,
            pass: emailPass
        },
        // Timeout ayarları
        connectionTimeout: 10000, // 10 saniye
        greetingTimeout: 10000, // 10 saniye
        socketTimeout: 10000, // 10 saniye
        tls: {
            rejectUnauthorized: false // Development için, production'da true olmalı
        },
        // Debug için
        debug: process.env.NODE_ENV !== 'production',
        logger: process.env.NODE_ENV !== 'production'
    });
}

// 6 haneli doğrulama kodu oluştur
function generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Email doğrulama kodu gönder
router.post('/send-verification-code', async (req, res) => {
    try {
        console.log('=== SEND VERIFICATION CODE REQUEST ===');
        const { email } = req.body;
        console.log('Email:', email);

        // Email validation
        if (!email || !email.trim()) {
            return res.status(400).json({ 
                error: 'E-Mail ist erforderlich',
                field: 'email'
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                error: 'Ungültige E-Mail-Adresse',
                field: 'email'
            });
        }

        // Email zaten kayıtlı mı kontrol et
        console.log('Checking if email exists...');
        const existingUser = await query('SELECT * FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            console.log('Email already registered');
            return res.status(400).json({ 
                error: 'E-Mail bereits registriert',
                field: 'email',
                message: 'Diese E-Mail-Adresse ist bereits registriert.'
            });
        }

        // 6 haneli kod oluştur
        const code = generateVerificationCode();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 dakika geçerli
        console.log('Generated code:', code);
        console.log('Expires at:', expiresAt);

        // Eski kodları temizle (aynı email için)
        try {
            console.log('Deleting old codes...');
            await query('DELETE FROM email_verification_codes WHERE email = $1', [email]);
            console.log('Old codes deleted');
        } catch (dbError) {
            console.error('Database error (DELETE):', dbError);
            console.error('Error code:', dbError.code);
            console.error('Error message:', dbError.message);
            // Tablo yoksa oluşturmayı dene veya devam et
            if (dbError.code === '42P01') { // Table does not exist
                console.error('Table does not exist!');
                return res.status(500).json({ 
                    error: 'Database-Tabelle fehlt',
                    message: 'Bitte führen Sie die Migration aus: db/create_email_verification_table.sql in pgAdmin',
                    details: dbError.message
                });
            }
            throw dbError;
        }

        // Yeni kodu kaydet
        try {
            console.log('Inserting new code...');
            await query(
                'INSERT INTO email_verification_codes (email, code, expires_at) VALUES ($1, $2, $3)',
                [email, code, expiresAt]
            );
            console.log('Code inserted successfully');
        } catch (dbError) {
            console.error('Database error (INSERT):', dbError);
            console.error('Error code:', dbError.code);
            console.error('Error message:', dbError.message);
            console.error('Error detail:', dbError.detail);
            if (dbError.code === '42P01') { // Table does not exist
                console.error('Table does not exist!');
                return res.status(500).json({ 
                    error: 'Database-Tabelle fehlt',
                    message: 'Bitte führen Sie die Migration aus: db/create_email_verification_table.sql in pgAdmin',
                    details: dbError.message
                });
            }
            throw dbError;
        }

        // Email gönder - Spam önleme ile
        const emailTransporter = createEmailTransporter();
        const emailUser = process.env.EMAIL_USER;
        const emailFromName = process.env.EMAIL_FROM_NAME || 'AutooR';
        // SendGrid için from email'i EMAIL_USER'dan al, yoksa noreply kullan
        const fromEmail = process.env.EMAIL_PROVIDER === 'sendgrid' 
            ? (process.env.SENDGRID_FROM_EMAIL || emailUser || 'noreply@autoor.com')
            : emailUser;
        
        if (emailTransporter && emailUser && emailUser !== 'your-email@gmail.com' && process.env.EMAIL_PASS && process.env.EMAIL_PASS !== 'your-app-password') {
            try {
                const mailOptions = {
                    from: `"${emailFromName}" <${fromEmail}>`, // Gönderen adı ve email
                    replyTo: emailUser || fromEmail, // Reply-To header
                    to: email,
                    subject: 'AutooR - E-Mail-Bestätigungscode',
                    // Text versiyonu (spam filtreleri için önemli)
                    text: `
AutooR E-Mail-Bestätigung

Vielen Dank für Ihre Registrierung bei AutooR!

Ihr Bestätigungscode lautet: ${code}

Dieser Code ist 15 Minuten gültig.

Wenn Sie sich nicht registriert haben, ignorieren Sie diese E-Mail bitte.

Mit freundlichen Grüßen,
Das AutooR Team
                    `,
                    // HTML versiyonu
                    html: `
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td style="padding: 20px 0; text-align: center;">
                <table role="presentation" style="width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <tr>
                        <td style="padding: 40px 40px 20px 40px; text-align: center; border-bottom: 2px solid #ffc107;">
                            <h1 style="margin: 0; color: #000000; font-size: 28px; font-weight: bold;">AutooR</h1>
                            <h2 style="margin: 10px 0 0 0; color: #000000; font-size: 20px; font-weight: normal;">E-Mail-Bestätigung</h2>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 30px 40px;">
                            <p style="margin: 0 0 20px 0; font-size: 16px; color: #333333; line-height: 1.6;">
                                Vielen Dank für Ihre Registrierung bei AutooR!
                            </p>
                            <p style="margin: 0 0 20px 0; font-size: 16px; color: #333333; line-height: 1.6;">
                                Ihr Bestätigungscode lautet:
                            </p>
                            <div style="background-color: #ffc107; color: #000000; padding: 25px; text-align: center; font-size: 36px; font-weight: bold; letter-spacing: 8px; border-radius: 8px; margin: 30px 0;">
                                ${code}
                            </div>
                            <p style="margin: 20px 0 0 0; font-size: 14px; color: #666666; line-height: 1.6;">
                                Dieser Code ist <strong>15 Minuten</strong> gültig.
                            </p>
                            <p style="margin: 20px 0 0 0; font-size: 14px; color: #999999; line-height: 1.6;">
                                Wenn Sie sich nicht registriert haben, ignorieren Sie diese E-Mail bitte.
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 20px 40px; background-color: #f8f9fa; border-top: 1px solid #e9ecef; text-align: center;">
                            <p style="margin: 0; font-size: 12px; color: #666666;">
                                Mit freundlichen Grüßen,<br>
                                <strong>Das AutooR Team</strong>
                            </p>
                            <p style="margin: 15px 0 0 0; font-size: 11px; color: #999999;">
                                Diese E-Mail wurde automatisch generiert. Bitte antworten Sie nicht auf diese E-Mail.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
                    `,
                    // Spam önleme için headers
                    headers: {
                        'X-Priority': '1',
                        'X-MSMail-Priority': 'High',
                        'Importance': 'high',
                        'List-Unsubscribe': `<mailto:${emailUser}?subject=unsubscribe>`,
                        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click'
                    },
                    // Message-ID ve Date otomatik eklenir
                    date: new Date()
                };

                await emailTransporter.sendMail(mailOptions);
                console.log(`✅ Verification code sent to ${email}: ${code}`);
            } catch (emailError) {
                console.error('❌ Email gönderme hatası:', emailError);
                console.error('Error details:', emailError.message);
                // Kod kaydedildi ama email gönderilemedi - development için console'a yazdır
                console.log(`\n=== DEVELOPMENT MODE ===`);
                console.log(`Email gönderilemedi, ancak kod kaydedildi:`);
                console.log(`Email: ${email}`);
                console.log(`Code: ${code}`);
                console.log(`========================\n`);
            }
        } else {
            // Email ayarları yok - development modu
            console.log(`\n=== DEVELOPMENT MODE ===`);
            console.log(`Email ayarları yapılandırılmamış. Kod konsola yazdırılıyor:`);
            console.log(`Email: ${email}`);
            console.log(`Code: ${code}`);
            console.log(`========================\n`);
        }

        res.json({
            message: 'Bestätigungscode wurde an Ihre E-Mail-Adresse gesendet',
            success: true
        });

    } catch (error) {
        console.error('=== VERIFICATION CODE SEND ERROR ===');
        console.error('Error type:', error.constructor.name);
        console.error('Error message:', error.message);
        console.error('Error code:', error.code);
        console.error('Error detail:', error.detail);
        console.error('Error stack:', error.stack);
        console.error('====================================');
        res.status(500).json({ 
            error: 'Serverfehler',
            message: 'Der Bestätigungscode konnte nicht gesendet werden.',
            details: error.message,
            code: error.code
        });
    }
});

// Email doğrula ve kayıt yap
router.post('/verify-and-register', async (req, res) => {
    try {
        const { first_name, last_name, email, password, verification_code, phone_number, address } = req.body;

        // Field validation
        if (!first_name || !first_name.trim()) {
            return res.status(400).json({ 
                error: 'Vorname ist erforderlich',
                field: 'first_name'
            });
        }
        
        if (!last_name || !last_name.trim()) {
            return res.status(400).json({ 
                error: 'Nachname ist erforderlich',
                field: 'last_name'
            });
        }
        
        if (!email || !email.trim()) {
            return res.status(400).json({ 
                error: 'E-Mail ist erforderlich',
                field: 'email'
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                error: 'Ungültige E-Mail-Adresse',
                field: 'email'
            });
        }

        if (!password || !password.trim()) {
            return res.status(400).json({ 
                error: 'Passwort ist erforderlich',
                field: 'password'
            });
        }

        if (!verification_code || !verification_code.trim()) {
            return res.status(400).json({ 
                error: 'Bestätigungscode ist erforderlich',
                field: 'verification_code'
            });
        }

        // Password validation
        if (password.length < 10 || password.length > 40) {
            return res.status(400).json({ 
                error: 'Passwort-Länge ungültig',
                field: 'password'
            });
        }
        
        if (!/[a-z]/.test(password)) {
            return res.status(400).json({ 
                error: 'Passwort-Anforderung nicht erfüllt',
                field: 'password'
            });
        }
        
        if (!/[A-Z]/.test(password)) {
            return res.status(400).json({ 
                error: 'Passwort-Anforderung nicht erfüllt',
                field: 'password'
            });
        }
        
        if (!/[0-9]/.test(password)) {
            return res.status(400).json({ 
                error: 'Passwort-Anforderung nicht erfüllt',
                field: 'password'
            });
        }
        
        if (!/[-.\/',;&@#*)(_+:"~]/.test(password)) {
            return res.status(400).json({ 
                error: 'Passwort-Anforderung nicht erfüllt',
                field: 'password'
            });
        }

        // Email kontrolü
        const existingUser = await query('SELECT * FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ 
                error: 'E-Mail bereits registriert',
                field: 'email'
            });
        }

        // Doğrulama kodunu kontrol et
        const codeResult = await query(
            'SELECT * FROM email_verification_codes WHERE email = $1 AND code = $2 AND used = FALSE AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
            [email, verification_code]
        );

        if (codeResult.rows.length === 0) {
            return res.status(400).json({ 
                error: 'Ungültiger oder abgelaufener Bestätigungscode',
                field: 'verification_code'
            });
        }

        // Kodu kullanıldı olarak işaretle
        await query(
            'UPDATE email_verification_codes SET used = TRUE WHERE id = $1',
            [codeResult.rows[0].id]
        );

        // Şifre hash'leme
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Yeni kullanıcı oluşturma
        const newUser = await query(`
            INSERT INTO users (first_name, last_name, email, password_hash, phone_number, address, is_verified)
            VALUES ($1, $2, $3, $4, $5, $6, TRUE)
            RETURNING user_id, first_name, last_name, email, phone_number, address, is_admin, created_at
        `, [first_name, last_name, email, passwordHash, phone_number || null, address || null]);

        const userId = newUser.rows[0].user_id;
        const userEmail = newUser.rows[0].email;
        const isAdmin = newUser.rows[0].is_admin || false;

        // JWT token oluşturma
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
        res.status(500).json({ 
            error: 'Serverfehler',
            message: error.message || 'Ein unerwarteter Fehler ist aufgetreten.'
        });
    }
});

// Eski kayıt endpoint'i - artık kullanılmıyor (geriye dönük uyumluluk için bırakıldı)
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

        // Eski endpoint - artık email doğrulama gerekiyor
        return res.status(400).json({
            error: 'Email-Verifizierung erforderlich',
            message: 'Bitte verwenden Sie /api/auth/send-verification-code und /api/auth/verify-and-register'
        });

        // Şifre hash'leme (artık çalışmayacak)
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

// Şifre sıfırlama token'ı oluştur
function generateResetToken() {
    return crypto.randomBytes(32).toString('hex');
}

// Şifremi unuttum - Email'e sıfırlama linki gönder
router.post('/forgot-password', async (req, res) => {
    try {
        console.log('=== FORGOT PASSWORD REQUEST ===');
        const { email } = req.body;
        console.log('Email received:', email);
        
        // Email validation
        if (!email || !email.trim()) {
            console.log('Email validation failed: empty');
            return res.status(400).json({ 
                error: 'E-Mail ist erforderlich',
                field: 'email'
            });
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            console.log('Email validation failed: invalid format');
            return res.status(400).json({ 
                error: 'Ungültige E-Mail-Adresse',
                field: 'email'
            });
        }
        
        // Kullanıcıyı bul
        console.log('Checking if user exists...');
        const user = await query('SELECT * FROM users WHERE email = $1', [email]);
        console.log('User found:', user.rows.length > 0);
        
        // Güvenlik nedeniyle: Kullanıcı bulunamasa bile başarılı mesaj göster
        if (user.rows.length === 0) {
            // Gerçek uygulamada bu mesajı göster, ama email gönderme
            return res.status(200).json({ 
                message: 'Falls diese E-Mail-Adresse registriert ist, wurde ein Link zum Zurücksetzen Ihres Passworts gesendet.'
            });
        }
        
        // Token oluştur
        console.log('Generating reset token...');
        const token = generateResetToken();
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 saat geçerli
        console.log('Token generated, expires at:', expiresAt);
        
        // Eski token'ları temizle
        try {
            console.log('Deleting old tokens...');
            await query('DELETE FROM password_reset_tokens WHERE email = $1', [email]);
            console.log('Old tokens deleted');
        } catch (deleteError) {
            console.error('Error deleting old tokens:', deleteError);
            // Tablo yoksa devam et, yeni token kaydederken oluşturulabilir
        }
        
        // Yeni token kaydet
        try {
            console.log('Inserting new token...');
            await query(
                'INSERT INTO password_reset_tokens (email, token, expires_at) VALUES ($1, $2, $3)',
                [email, token, expiresAt]
            );
            console.log('Token inserted successfully');
        } catch (insertError) {
            console.error('Error inserting token:', insertError);
            console.error('Insert error details:', {
                message: insertError.message,
                code: insertError.code,
                detail: insertError.detail
            });
            // Tablo yoksa oluşturmayı dene
            if (insertError.message && insertError.message.includes('does not exist')) {
                console.log('password_reset_tokens table does not exist, attempting to create...');
                try {
                    await query(`
                        CREATE TABLE IF NOT EXISTS password_reset_tokens (
                            id SERIAL PRIMARY KEY,
                            email VARCHAR(255) NOT NULL,
                            token VARCHAR(255) NOT NULL UNIQUE,
                            expires_at TIMESTAMP NOT NULL,
                            used BOOLEAN DEFAULT FALSE,
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                        )
                    `);
                    await query(`
                        CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_email ON password_reset_tokens(email)
                    `);
                    await query(`
                        CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token)
                    `);
                    // Tekrar dene
                    await query(
                        'INSERT INTO password_reset_tokens (email, token, expires_at) VALUES ($1, $2, $3)',
                        [email, token, expiresAt]
                    );
                    console.log('password_reset_tokens table created and token inserted successfully');
                } catch (createError) {
                    console.error('Error creating password_reset_tokens table:', createError);
                    throw createError;
                }
            } else {
                throw insertError;
            }
        }
        
        // Email gönder
        const emailTransporter = createEmailTransporter();
        const emailUser = process.env.EMAIL_USER;
        const emailFromName = process.env.EMAIL_FROM_NAME || 'AutooR';
        // SendGrid için from email'i EMAIL_USER'dan al, yoksa noreply kullan
        const fromEmail = process.env.EMAIL_PROVIDER === 'sendgrid' 
            ? (process.env.SENDGRID_FROM_EMAIL || emailUser || 'noreply@autoor.com')
            : emailUser;
        // Production'da Netlify URL'i kullan, development'ta localhost
        const baseUrl = process.env.NODE_ENV === 'production' 
            ? (process.env.BASE_URL || 'https://autoor-demo.netlify.app')
            : (process.env.BASE_URL || 'https://localhost:3443');
        
        console.log('Email configuration check:', {
            hasTransporter: !!emailTransporter,
            emailUser: emailUser,
            emailPassSet: !!process.env.EMAIL_PASS,
            emailProvider: process.env.EMAIL_PROVIDER || 'auto',
            fromEmail: fromEmail,
            baseUrl: baseUrl,
            nodeEnv: process.env.NODE_ENV
        });
        
        if (emailTransporter && emailUser && emailUser !== 'your-email@gmail.com' && process.env.EMAIL_PASS && process.env.EMAIL_PASS !== 'your-app-password') {
            try {
                const resetLink = `${baseUrl}/reset-password?token=${token}`;
                console.log('Sending password reset email to:', email);
                console.log('Reset link:', resetLink);
                
                const mailOptions = {
                    from: `"${emailFromName}" <${fromEmail}>`,
                    replyTo: emailUser || fromEmail,
                    to: email,
                    subject: 'AutooR - Passwort zurücksetzen',
                    text: `
AutooR Passwort zurücksetzen

Sie haben eine Anfrage zum Zurücksetzen Ihres Passworts gestellt.

Klicken Sie auf den folgenden Link, um ein neues Passwort festzulegen:
${resetLink}

Dieser Link ist 1 Stunde gültig.

Wenn Sie diese Anfrage nicht gestellt haben, ignorieren Sie diese E-Mail bitte.

Mit freundlichen Grüßen,
Das AutooR Team
                    `,
                    html: `
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .button { display: inline-block; padding: 12px 24px; background-color: #ffc107; color: #000; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
        .button:hover { background-color: #e0a800; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <h2>Passwort zurücksetzen</h2>
        <p>Sie haben eine Anfrage zum Zurücksetzen Ihres Passworts gestellt.</p>
        <p>Klicken Sie auf den folgenden Button, um ein neues Passwort festzulegen:</p>
        <a href="${resetLink}" class="button">Passwort zurücksetzen</a>
        <p>Oder kopieren Sie diesen Link in Ihren Browser:</p>
        <p style="word-break: break-all; color: #666; font-size: 12px;">${resetLink}</p>
        <p><strong>Dieser Link ist 1 Stunde gültig.</strong></p>
        <p>Wenn Sie diese Anfrage nicht gestellt haben, ignorieren Sie diese E-Mail bitte.</p>
        <div class="footer">
            <p>Mit freundlichen Grüßen,<br>Das AutooR Team</p>
        </div>
    </div>
</body>
</html>
                    `
                };
                
                await emailTransporter.sendMail(mailOptions);
                console.log('Password reset email sent successfully to:', email);
            } catch (emailError) {
                console.error('Email gönderme hatası:', emailError);
                console.error('Email error details:', {
                    message: emailError.message,
                    code: emailError.code,
                    command: emailError.command,
                    response: emailError.response,
                    responseCode: emailError.responseCode
                });
                // Email gönderilemese bile token oluşturuldu, kullanıcıya başarılı mesaj göster
                // Ancak log'a yazıyoruz ki Railway'de görebilelim
            }
        } else {
            // Email yapılandırması eksik
            console.error('Email configuration missing or invalid:', {
                hasTransporter: !!emailTransporter,
                emailUser: emailUser,
                emailPassSet: !!process.env.EMAIL_PASS,
                emailPassValue: process.env.EMAIL_PASS ? 'SET' : 'NOT SET'
            });
            // Development mode - token'ı konsola yazdır
            console.log('=== DEVELOPMENT MODE / EMAIL NOT CONFIGURED ===');
            console.log('Password reset token:', token);
            console.log('Reset link:', `${baseUrl}/reset-password?token=${token}`);
            console.log('========================');
        }
        
        res.status(200).json({ 
            message: 'Falls diese E-Mail-Adresse registriert ist, wurde ein Link zum Zurücksetzen Ihres Passworts gesendet.'
        });
        
    } catch (error) {
        console.error('=== ŞİFRE SIFIRLAMA HATASI ===');
        console.error('Error:', error);
        console.error('Error message:', error.message);
        console.error('Error code:', error.code);
        console.error('Error detail:', error.detail);
        console.error('Error stack:', error.stack);
        
        // Daha açıklayıcı hata mesajı
        let errorMessage = 'Ein unerwarteter Fehler ist aufgetreten.';
        
        if (error.code === '42P01') {
            // Tablo yok
            errorMessage = 'Die Datenbanktabelle existiert nicht. Bitte kontaktieren Sie den Administrator.';
        } else if (error.code === '23505') {
            // Unique constraint violation (token zaten var)
            errorMessage = 'Ein Token wurde bereits erstellt. Bitte überprüfen Sie Ihr E-Mail-Postfach.';
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        res.status(500).json({ 
            error: 'Serverfehler',
            message: errorMessage
        });
    }
});

// Şifre sıfırla - Token ile yeni şifre belirle
router.post('/reset-password', async (req, res) => {
    try {
        const { token, password } = req.body;
        
        // Validation
        if (!token) {
            return res.status(400).json({ 
                error: 'Token ist erforderlich'
            });
        }
        
        if (!password) {
            return res.status(400).json({ 
                error: 'Passwort ist erforderlich',
                field: 'password'
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
        
        // Token'ı kontrol et
        const tokenResult = await query(
            'SELECT * FROM password_reset_tokens WHERE token = $1 AND used = FALSE AND expires_at > NOW()',
            [token]
        );
        
        if (tokenResult.rows.length === 0) {
            return res.status(400).json({ 
                error: 'Ungültiger oder abgelaufener Token',
                message: 'Der Token ist ungültig oder abgelaufen. Bitte fordern Sie einen neuen Link an.'
            });
        }
        
        const tokenData = tokenResult.rows[0];
        const email = tokenData.email;
        
        // Şifreyi hash'le
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);
        
        // Kullanıcının şifresini güncelle
        await query(
            'UPDATE users SET password_hash = $1 WHERE email = $2',
            [passwordHash, email]
        );
        
        // Token'ı kullanıldı olarak işaretle
        await query(
            'UPDATE password_reset_tokens SET used = TRUE WHERE token = $1',
            [token]
        );
        
        // Aynı email için diğer token'ları da geçersiz kıl
        await query(
            'UPDATE password_reset_tokens SET used = TRUE WHERE email = $1 AND token != $2',
            [email, token]
        );
        
        res.status(200).json({ 
            message: 'Ihr Passwort wurde erfolgreich zurückgesetzt.'
        });
        
    } catch (error) {
        console.error('=== ŞİFRE SIFIRLAMA HATASI ===');
        console.error('Error:', error);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        res.status(500).json({ 
            error: 'Serverfehler',
            message: error.message || 'Ein unerwarteter Fehler ist aufgetreten.'
        });
    }
});

module.exports = router;