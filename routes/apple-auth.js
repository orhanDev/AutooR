const express = require('express');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const router = express.Router();

const pool = new Pool({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT || 5432,
});

router.get('/apple', (req, res) => {
    const APPLE_CLIENT_ID = process.env.APPLE_CLIENT_ID;
    const APPLE_CLIENT_SECRET = process.env.APPLE_CLIENT_SECRET;
    const APPLE_REDIRECT_URI = process.env.APPLE_REDIRECT_URI || 'https:
    const state = req.query.redirect || 'home';

    if (!APPLE_CLIENT_ID || !APPLE_CLIENT_SECRET || 
        APPLE_CLIENT_ID === 'your-apple-client-id' ||
        APPLE_CLIENT_SECRET === 'your-apple-client-secret') {
        return res.redirect('/login?error=apple_not_configured&provider=Apple');
    }

    const authURL = `https:
    
    res.redirect(authURL);
});

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
        const APPLE_REDIRECT_URI = process.env.APPLE_REDIRECT_URI || 'https:
        
        if (!APPLE_CLIENT_ID || !APPLE_CLIENT_SECRET || APPLE_CLIENT_ID === 'your-apple-client-id') {
            return res.redirect('/login?error=apple_not_configured');
        }

        let appleUser = {};
        if (user) {
            try {
                appleUser = JSON.parse(user);
            } catch (e) {
                console.error('Error parsing Apple user data:', e);
            }
        }

        const email = appleUser.email || `apple_${code}@apple.local`;
        const firstName = appleUser.name?.firstName || appleUser.name?.givenName || '';
        const lastName = appleUser.name?.lastName || appleUser.name?.familyName || '';

        let userQuery = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );
        
        let userData;
        
        if (userQuery.rows.length === 0) {
            
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
            
            userData = userQuery.rows[0];
        }

        const userId = userData.user_id || userData.id;

        const token = jwt.sign(
            { userId: userId, email: userData.email, is_admin: userData.is_admin || false },
            process.env.JWT_SECRET || 'your_super_secret_jwt_key_here_change_this_in_production',
            { expiresIn: '24h' }
        );

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

        const redirectPath = state === 'login' ? '/login' : '/';
        res.redirect(`${redirectPath}?login=success&token=${encodeURIComponent(token)}&user=${encodeURIComponent(JSON.stringify(userInfo))}`);
        
    } catch (error) {
        console.error('Apple OAuth callback error:', error);
        console.error('Error details:', error.response?.data || error.message);
        res.redirect('/login?error=server_error');
    }
});

router.get('/apple/callback', async (req, res) => {
    
    return res.redirect('/login?error=apple_use_post');
});

router.get('/apple/status', (req, res) => {
    const APPLE_CLIENT_ID = process.env.APPLE_CLIENT_ID;
    const APPLE_CLIENT_SECRET = process.env.APPLE_CLIENT_SECRET;
    
    const isConfigured = APPLE_CLIENT_ID && APPLE_CLIENT_SECRET && 
                         APPLE_CLIENT_ID !== 'your-apple-client-id' &&
                         APPLE_CLIENT_SECRET !== 'your-apple-client-secret';
    
    res.json({ configured: isConfigured, provider: 'Apple' });
});

module.exports = router;
