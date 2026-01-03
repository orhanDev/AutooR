const express = require('express');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const router = express.Router();

// PostgreSQL bağlantı havuzu
const pool = new Pool({
    user: process.env.PGUSER || 'AutooR_user',
    host: process.env.PGHOST || 'localhost',
    database: process.env.PGDATABASE || 'AutooR',
    password: process.env.PGPASSWORD || 'Vekil4023.',
    port: process.env.PGPORT || 5432,
});

// Google OAuth Client oluştur (dinamik port ile)
function getGoogleClient(redirectUri) {
    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
    const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
    const GOOGLE_REDIRECT_URI = redirectUri || process.env.GOOGLE_REDIRECT_URI || 'https://localhost:3443/auth/google/callback';
    
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
        throw new Error('Google OAuth credentials not configured');
    }
    
    return new OAuth2Client(
        GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET,
        GOOGLE_REDIRECT_URI
    );
}

// Google OAuth status endpoint
router.get('/google/status', (req, res) => {
    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
    const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
    const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'https://localhost:3443/auth/google/callback';
    
    const isConfigured = GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET && 
                         GOOGLE_CLIENT_ID !== 'your-google-client-id.apps.googleusercontent.com' &&
                         GOOGLE_CLIENT_SECRET !== 'your-google-client-secret';
    
    res.json({ 
        configured: isConfigured, 
        provider: 'Google',
        clientId: GOOGLE_CLIENT_ID,
        redirectUri: GOOGLE_REDIRECT_URI,
        hasSecret: !!GOOGLE_CLIENT_SECRET
    });
});

// Google OAuth URL oluştur
router.get('/google', (req, res) => {
    try {
        const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
        const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
        
        if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || 
            GOOGLE_CLIENT_ID === 'your-google-client-id.apps.googleusercontent.com' ||
            GOOGLE_CLIENT_SECRET === 'your-google-client-secret') {
            console.error('Google OAuth not configured');
            return res.redirect('/login?error=google_not_configured');
        }
        
        const state = req.query.state || 'login';
        
        // Önce .env'deki GOOGLE_REDIRECT_URI'yi kullan, yoksa dinamik oluştur
        let GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;
        
        if (!GOOGLE_REDIRECT_URI || GOOGLE_REDIRECT_URI.includes('your-') || GOOGLE_REDIRECT_URI.includes('localhost:3000')) {
            // .env'de yoksa veya placeholder ise, request'ten dinamik oluştur
            const actualPort = process.env.ACTUAL_HTTPS_PORT || (req.get('host')?.split(':')[1]) || '3443';
            const protocol = req.protocol === 'https' ? 'https' : 'https';
            const host = `localhost:${actualPort}`;
            GOOGLE_REDIRECT_URI = `${protocol}://${host}/auth/google/callback`;
        }
        
        const googleClient = getGoogleClient(GOOGLE_REDIRECT_URI);
        
        const authURL = googleClient.generateAuthUrl({
            access_type: 'offline',
            scope: [
                'https://www.googleapis.com/auth/userinfo.email',
                'https://www.googleapis.com/auth/userinfo.profile'
            ],
            redirect_uri: GOOGLE_REDIRECT_URI,
            prompt: 'select_account',
            state: state
        });
        
        console.log('=== GOOGLE OAUTH REDIRECT ===');
        console.log('Using redirect URI:', GOOGLE_REDIRECT_URI);
        console.log('Client ID:', GOOGLE_CLIENT_ID?.substring(0, 20) + '...');
        console.log('Has Client Secret:', !!GOOGLE_CLIENT_SECRET);
        console.log('State:', state);
        console.log('Redirecting to Google OAuth:', authURL);
        console.log('=============================');
        res.redirect(authURL);
    } catch (error) {
        console.error('Google OAuth error:', error);
        res.redirect('/login?error=google_not_configured');
    }
});

// Google OAuth callback - SIFIRDAN BASIT VERSIYON
router.get('/google/callback', async (req, res) => {
    console.log('\n========== GOOGLE OAUTH CALLBACK BAŞLADI ==========');
    
    try {
        const { code, error, state } = req.query;
        
        console.log('Query params:', { code: code ? 'VAR' : 'YOK', error, state });
        
        // Hata kontrolü
        if (error) {
            console.error('Google OAuth error:', error);
            return res.redirect('/login?error=oauth_error');
        }
        
        if (!code) {
            console.error('Authorization code yok!');
            return res.redirect('/login?error=no_code');
        }
        
        // Google Client oluştur - Önce .env'deki GOOGLE_REDIRECT_URI'yi kullan
        let GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;
        
        if (!GOOGLE_REDIRECT_URI || GOOGLE_REDIRECT_URI.includes('your-') || GOOGLE_REDIRECT_URI.includes('localhost:3000')) {
            // .env'de yoksa veya placeholder ise, request'ten dinamik oluştur
            const actualPort = process.env.ACTUAL_HTTPS_PORT || (req.get('host')?.split(':')[1]) || '3443';
            const protocol = req.protocol === 'https' ? 'https' : 'https';
            const host = `localhost:${actualPort}`;
            GOOGLE_REDIRECT_URI = `${protocol}://${host}/auth/google/callback`;
        }
        
        const googleClient = getGoogleClient(GOOGLE_REDIRECT_URI);
        
        console.log('=== GOOGLE OAUTH CALLBACK ===');
        console.log('Using redirect URI:', GOOGLE_REDIRECT_URI);
        console.log('Authorization code received:', code ? 'YES' : 'NO');
        console.log('State:', state);
        console.log('Google token alınıyor...');
        // Token al
        const { tokens } = await googleClient.getToken(code);
        googleClient.setCredentials(tokens);
        
        console.log('Google user bilgileri alınıyor...');
        // Kullanıcı bilgilerini al
        const response = await googleClient.request({
            url: 'https://www.googleapis.com/oauth2/v2/userinfo'
        });
        
        const googleUser = {
            email: response.data.email,
            firstName: response.data.given_name || response.data.name?.split(' ')[0] || 'User',
            lastName: response.data.family_name || response.data.name?.split(' ').slice(1).join(' ') || '',
            googleId: response.data.id,
            verified: response.data.verified_email || false
        };
        
        console.log('Google user:', {
            email: googleUser.email,
            firstName: googleUser.firstName,
            lastName: googleUser.lastName
        });
        
        if (!googleUser.email) {
            console.error('Email yok!');
            return res.redirect('/login?error=email_not_provided');
        }
        
        // Database işlemleri - ÇOK BASIT
        console.log('Database sorgusu yapılıyor...');
        const userQuery = await pool.query(
            'SELECT user_id, id, email, first_name, last_name, is_admin FROM users WHERE email = $1',
            [googleUser.email]
        );
        
        let userData;
        let userId;
        
        if (userQuery.rows.length > 0) {
            // Kullanıcı mevcut
            console.log('Kullanıcı mevcut, güncelleniyor...');
            userData = userQuery.rows[0];
            userId = userData.user_id || userData.id;
            
            // Basit güncelleme
            await pool.query(
                'UPDATE users SET first_name = $1, last_name = $2 WHERE email = $3',
                [googleUser.firstName, googleUser.lastName, googleUser.email]
            );
            console.log('Kullanıcı güncellendi');
        } else {
            // Yeni kullanıcı oluştur
            console.log('Yeni kullanıcı oluşturuluyor...');
            const insertResult = await pool.query(
                'INSERT INTO users (email, first_name, last_name) VALUES ($1, $2, $3) RETURNING user_id, id, email, first_name, last_name, is_admin',
                [googleUser.email, googleUser.firstName, googleUser.lastName]
            );
            userData = insertResult.rows[0];
            userId = userData.user_id || userData.id;
            console.log('Yeni kullanıcı oluşturuldu:', userId);
        }
        
        if (!userId) {
            throw new Error('User ID alınamadı!');
        }
        
        // JWT token oluştur
        console.log('JWT token oluşturuluyor...');
        const token = jwt.sign(
            { userId: userId, email: userData.email, is_admin: userData.is_admin || false },
            process.env.JWT_SECRET || 'your_super_secret_jwt_key_here_change_this_in_production',
            { expiresIn: '24h' }
        );
        console.log('JWT token oluşturuldu');
        
        // Kullanıcı bilgilerini hazırla
        const userInfo = {
            email: userData.email,
            firstName: userData.first_name,
            lastName: userData.last_name,
            name: `${userData.first_name} ${userData.last_name}`.trim(),
            id: userId,
            user_id: userId
        };
        
        // Redirect
        const redirectPath = state === 'login' ? '/' : (state === 'register' ? '/register' : '/');
        const redirectURL = `${redirectPath}?login=success&token=${encodeURIComponent(token)}&user=${encodeURIComponent(JSON.stringify(userInfo))}`;
        
        console.log('Başarılı! Redirect ediliyor:', redirectPath);
        console.log('==================================================\n');
        
        res.redirect(redirectURL);
        
    } catch (error) {
        console.error('\n========== HATA ==========');
        console.error('Error type:', error.constructor.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        console.error('==========================\n');
        
        const redirectPath = (req.query.state === 'login') ? '/login' : '/login';
        res.redirect(`${redirectPath}?error=server_error`);
    }
});

module.exports = router;
