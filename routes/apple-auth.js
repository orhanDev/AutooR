const express = require('express');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const router = express.Router();

// PostgreSQL bağlantı havuzu
const pool = new Pool({
    user: process.env.PGUSER || 'autor_user',
    host: process.env.PGHOST || 'localhost',
    database: process.env.PGDATABASE || 'autor_db',
    password: process.env.PGPASSWORD || 'Vekil4023.',
    port: process.env.PGPORT || 5432,
});

// Apple OAuth giriş sayfası
router.get('/apple', (req, res) => {
    const APPLE_CLIENT_ID = process.env.APPLE_CLIENT_ID;
    const APPLE_CLIENT_SECRET = process.env.APPLE_CLIENT_SECRET;
    const APPLE_REDIRECT_URI = process.env.APPLE_REDIRECT_URI || 'https://localhost:3443/auth/apple/callback';
    const state = req.query.redirect || 'home';
    
    // Check if credentials are configured
    if (!APPLE_CLIENT_ID || !APPLE_CLIENT_SECRET || 
        APPLE_CLIENT_ID === 'your-apple-client-id' ||
        APPLE_CLIENT_SECRET === 'your-apple-client-secret') {
        return res.redirect('/login?error=apple_not_configured&provider=Apple');
    }
    
    // Apple Sign In için özel URL formatı
    const authURL = `https://appleid.apple.com/auth/authorize?client_id=${APPLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(APPLE_REDIRECT_URI)}&response_type=code&scope=email%20name&state=${state}&response_mode=form_post`;
    
    res.redirect(authURL);
});

// Apple OAuth callback (POST - Apple form_post kullanır)
// Not: Express urlencoded middleware gerekli
router.post('/apple/callback', async (req, res) => {
    try {
        const { code, error, state, user } = req.body;
        
        if (error) {
            console.error('Apple OAuth error:', error);
            const redirectPath = state === 'login' ? '/login?error=oauth_error' : '/register?error=oauth_error';
            return res.redirect(redirectPath);
        }
        
        if (!code) {
            const redirectPath = state === 'login' ? '/login?error=no_code' : '/register?error=no_code';
            return res.redirect(redirectPath);
        }
        
        const APPLE_CLIENT_ID = process.env.APPLE_CLIENT_ID;
        const APPLE_CLIENT_SECRET = process.env.APPLE_CLIENT_SECRET;
        const APPLE_REDIRECT_URI = process.env.APPLE_REDIRECT_URI || 'https://localhost:3443/auth/apple/callback';
        
        if (!APPLE_CLIENT_ID || !APPLE_CLIENT_SECRET || APPLE_CLIENT_ID === 'your-apple-client-id') {
            return res.redirect('/login?error=apple_not_configured');
        }
        
        // Apple token exchange (Apple özel JWT gerektirir, şimdilik basit yaklaşım)
        // Not: Apple OAuth için özel JWT client secret gerekiyor - bu production'da düzgün yapılmalı
        
        // Kullanıcı bilgilerini parse et (eğer varsa)
        let appleUser = {};
        if (user) {
            try {
                appleUser = JSON.parse(user);
            } catch (e) {
                console.error('Error parsing Apple user data:', e);
            }
        }
        
        // Apple'dan email almak için token exchange yapılmalı
        // Şimdilik placeholder - Apple OAuth tam implementasyonu için özel JWT gerekiyor
        
        // Eğer user objesi varsa ve email içeriyorsa kullan
        const email = appleUser.email || `apple_${code}@apple.local`;
        const firstName = appleUser.name?.firstName || appleUser.name?.givenName || '';
        const lastName = appleUser.name?.lastName || appleUser.name?.familyName || '';
        
        // Kullanıcıyı veritabanında bul veya oluştur
        let userQuery = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );
        
        let userData;
        
        if (userQuery.rows.length === 0) {
            // Yeni kullanıcı oluştur
            try {
                const newUser = await pool.query(
                    `INSERT INTO users (email, first_name, last_name)
                     VALUES ($1, $2, $3)
                     RETURNING user_id, email, first_name, last_name, is_admin`,
                    [
                        email,
                        firstName || 'Apple',
                        lastName || 'User'
                    ]
                );
                userData = newUser.rows[0];
            } catch (err) {
                console.error('Apple user creation error:', err);
                return res.redirect('/login?error=server_error');
            }
        } else {
            // Mevcut kullanıcıyı güncelle
            userData = userQuery.rows[0];
        }
        
        // User ID'yi al
        const userId = userData.user_id || userData.id;
        
        // JWT token oluştur
        const token = jwt.sign(
            { userId: userId, email: userData.email, is_admin: userData.is_admin || false },
            process.env.JWT_SECRET || 'your_super_secret_jwt_key_here_change_this_in_production',
            { expiresIn: '24h' }
        );
        
        // Kullanıcı bilgilerini hazırla
        const userInfo = {
            email: userData.email,
            firstName: userData.first_name,
            lastName: userData.last_name,
            name: `${userData.first_name} ${userData.last_name}`,
            verified: true,
            loginMethod: 'apple',
            id: userId,
            user_id: userId
        };
        
        // Token ve kullanıcı bilgilerini query string ile gönder
        const redirectPath = state === 'login' ? '/login' : '/';
        res.redirect(`${redirectPath}?login=success&token=${encodeURIComponent(token)}&user=${encodeURIComponent(JSON.stringify(userInfo))}`);
        
    } catch (error) {
        console.error('Apple OAuth callback error:', error);
        console.error('Error details:', error.response?.data || error.message);
        res.redirect('/login?error=server_error');
    }
});

// Apple callback GET (fallback)
router.get('/apple/callback', async (req, res) => {
    // Apple genellikle POST kullanır ama GET de desteklenebilir
    return res.redirect('/login?error=apple_use_post');
});

// Check OAuth status endpoint
router.get('/apple/status', (req, res) => {
    const APPLE_CLIENT_ID = process.env.APPLE_CLIENT_ID;
    const APPLE_CLIENT_SECRET = process.env.APPLE_CLIENT_SECRET;
    
    const isConfigured = APPLE_CLIENT_ID && APPLE_CLIENT_SECRET && 
                         APPLE_CLIENT_ID !== 'your-apple-client-id' &&
                         APPLE_CLIENT_SECRET !== 'your-apple-client-secret';
    
    res.json({ configured: isConfigured, provider: 'Apple' });
});

module.exports = router;
