const express = require('express');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const router = express.Router();

// PostgreSQL Verbindungspool
const pool = new Pool({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT || 5432,
});

// Apple OAuth Anmeldeseite
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
    
    // Spezielles URL-Format für Apple Sign In
    const authURL = `https://appleid.apple.com/auth/authorize?client_id=${APPLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(APPLE_REDIRECT_URI)}&response_type=code&scope=email%20name&state=${state}&response_mode=form_post`;
    
    res.redirect(authURL);
});

// Apple OAuth callback (POST - Apple verwendet form_post)
// Hinweis: Express urlencoded Middleware erforderlich
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
        
        // Apple token exchange (erfordert spezielles JWT, vorerst einfacher Ansatz)
        // Hinweis: Spezielles JWT Client Secret für Apple OAuth erforderlich - dies sollte in der Produktion ordnungsgemäß implementiert werden
        
        // Benutzerinformationen parsen (falls vorhanden)
        let appleUser = {};
        if (user) {
            try {
                appleUser = JSON.parse(user);
            } catch (e) {
                console.error('Error parsing Apple user data:', e);
            }
        }
        
        // Token-Austausch muss durchgeführt werden, um E-Mail von Apple zu erhalten
        // Vorerst Platzhalter - spezielles JWT für vollständige Apple OAuth-Implementierung erforderlich
        
        // Verwenden, falls user-Objekt vorhanden ist und E-Mail enthält
        const email = appleUser.email || `apple_${code}@apple.local`;
        const firstName = appleUser.name?.firstName || appleUser.name?.givenName || '';
        const lastName = appleUser.name?.lastName || appleUser.name?.familyName || '';
        
        // Benutzer in der Datenbank finden oder erstellen
        let userQuery = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );
        
        let userData;
        
        if (userQuery.rows.length === 0) {
            // Neuen Benutzer erstellen
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
            // Vorhandenen Benutzer aktualisieren
            userData = userQuery.rows[0];
        }
        
        // User ID'yi al
        const userId = userData.user_id || userData.id;
        
        // JWT Token erstellen
        const token = jwt.sign(
            { userId: userId, email: userData.email, is_admin: userData.is_admin || false },
            process.env.JWT_SECRET || 'your_super_secret_jwt_key_here_change_this_in_production',
            { expiresIn: '24h' }
        );
        
        // Benutzerinformationen vorbereiten
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
        
        // Token und Benutzerinformationen mit Query-String senden
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
    // Apple verwendet normalerweise POST, aber GET kann auch unterstützt werden
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
