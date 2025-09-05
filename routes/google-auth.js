const express = require('express');
const { Pool } = require('pg');
const { getGoogleAuthURL, getGoogleTokens } = require('../config/google-oauth');
const router = express.Router();

// PostgreSQL bağlantı havuzu
const pool = new Pool({
    user: process.env.PGUSER || 'autor_user',
    host: process.env.PGHOST || 'localhost',
    database: process.env.PGDATABASE || 'autor_db',
    password: process.env.PGPASSWORD || 'Vekil4023.',
    port: process.env.PGPORT || 5432,
});

// Google OAuth giriş sayfası
router.get('/google', (req, res) => {
    const authURL = getGoogleAuthURL();
    res.redirect(authURL);
});

// Google OAuth callback
router.get('/google/callback', async (req, res) => {
    try {
        const { code, error } = req.query;
        
        if (error) {
            console.error('Google OAuth error:', error);
            return res.redirect('/register?error=oauth_error');
        }
        
        if (!code) {
            return res.redirect('/register?error=no_code');
        }
        
        // Google'dan kullanıcı bilgilerini al
        const googleResult = await getGoogleTokens(code);
        
        if (!googleResult.success) {
            console.error('Google token error:', googleResult.error);
            return res.redirect('/register?error=token_error');
        }
        
        const googleUser = googleResult.user;
        
        // E-posta doğrulaması kontrolü
        if (!googleUser.emailVerified) {
            return res.redirect('/register?error=email_not_verified');
        }
        
        // Kullanıcıyı veritabanında bul veya oluştur
        let user = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [googleUser.email]
        );
        
        if (user.rows.length === 0) {
            // Yeni kullanıcı oluştur
            const newUser = await pool.query(
                `INSERT INTO users (email, first_name, last_name, login_method, is_verified, google_id)
                 VALUES ($1, $2, $3, $4, $5, $6)
                 RETURNING id, email, first_name, last_name, login_method, is_verified`,
                [
                    googleUser.email,
                    googleUser.firstName,
                    googleUser.lastName,
                    'google',
                    true,
                    googleUser.googleId
                ]
            );
            user = newUser;
        } else {
            // Mevcut kullanıcıyı güncelle
            const updatedUser = await pool.query(
                `UPDATE users SET 
                    first_name = $1,
                    last_name = $2,
                    login_method = 'google',
                    is_verified = true,
                    google_id = $3,
                    updated_at = CURRENT_TIMESTAMP
                 WHERE email = $4
                 RETURNING id, email, first_name, last_name, login_method, is_verified`,
                [
                    googleUser.firstName,
                    googleUser.lastName,
                    googleUser.googleId,
                    googleUser.email
                ]
            );
            user = updatedUser;
        }
        
        const userData = user.rows[0];
        
        // Başarılı giriş - ana sayfaya yönlendir
        res.redirect(`/?login=success&user=${encodeURIComponent(JSON.stringify({
            email: userData.email,
            firstName: userData.first_name,
            lastName: userData.last_name,
            name: `${userData.first_name} ${userData.last_name}`,
            verified: userData.is_verified,
            loginMethod: userData.login_method
        }))}`);
        
    } catch (error) {
        console.error('Google OAuth callback error:', error);
        res.redirect('/register?error=server_error');
    }
});

// Google OAuth popup için endpoint
router.get('/google/popup', (req, res) => {
    res.sendFile(require('path').join(__dirname, '../public/google-oauth.html'));
});

// Google OAuth popup callback
router.post('/google/popup/callback', async (req, res) => {
    try {
        const { idToken } = req.body;
        
        if (!idToken) {
            return res.json({ success: false, message: 'Token bulunamadı' });
        }
        
        // Google token doğrulama
        const { OAuth2Client } = require('google-auth-library');
        const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
        
        const ticket = await client.verifyIdToken({
            idToken: idToken,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        
        const payload = ticket.getPayload();
        
        if (!payload.email_verified) {
            return res.json({ success: false, message: 'E-posta doğrulanmamış' });
        }
        
        // Kullanıcıyı veritabanında bul veya oluştur
        let user = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [payload.email]
        );
        
        if (user.rows.length === 0) {
            // Yeni kullanıcı oluştur
            const newUser = await pool.query(
                `INSERT INTO users (email, first_name, last_name, login_method, is_verified, google_id)
                 VALUES ($1, $2, $3, $4, $5, $6)
                 RETURNING id, email, first_name, last_name, login_method, is_verified`,
                [
                    payload.email,
                    payload.given_name,
                    payload.family_name,
                    'google',
                    true,
                    payload.sub
                ]
            );
            user = newUser;
        } else {
            // Mevcut kullanıcıyı güncelle
            const updatedUser = await pool.query(
                `UPDATE users SET 
                    first_name = $1,
                    last_name = $2,
                    login_method = 'google',
                    is_verified = true,
                    google_id = $3,
                    updated_at = CURRENT_TIMESTAMP
                 WHERE email = $4
                 RETURNING id, email, first_name, last_name, login_method, is_verified`,
                [
                    payload.given_name,
                    payload.family_name,
                    payload.sub,
                    payload.email
                ]
            );
            user = updatedUser;
        }
        
        const userData = user.rows[0];
        
        res.json({
            success: true,
            message: 'Giriş başarılı',
            user: {
                email: userData.email,
                firstName: userData.first_name,
                lastName: userData.last_name,
                name: `${userData.first_name} ${userData.last_name}`,
                verified: userData.is_verified,
                loginMethod: userData.login_method
            }
        });
        
    } catch (error) {
        console.error('Google OAuth popup callback error:', error);
        res.json({ success: false, message: 'Sunucu hatası' });
    }
});

module.exports = router;
