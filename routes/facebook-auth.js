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

router.get('/facebook', (req, res) => {
    const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID;
    const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET;
    const FACEBOOK_REDIRECT_URI = process.env.FACEBOOK_REDIRECT_URI || 'http://localhost:3000/auth/facebook/callback';
    const state = req.query.redirect || 'home';

    if (!FACEBOOK_APP_ID || !FACEBOOK_APP_SECRET || 
        FACEBOOK_APP_ID === 'your-facebook-app-id' ||
        FACEBOOK_APP_SECRET === 'your-facebook-app-secret') {
        return res.redirect('/login?error=facebook_not_configured&provider=Facebook');
    }
    
    const authURL = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${FACEBOOK_APP_ID}&redirect_uri=${encodeURIComponent(FACEBOOK_REDIRECT_URI)}&state=${state}&scope=email,public_profile`;
    
    res.redirect(authURL);
});

router.get('/facebook/callback', async (req, res) => {
    try {
        const { code, error, state } = req.query;
        
        if (error) {
            console.error('Facebook OAuth error:', error);
            const redirectPath = state === 'login' ? '/login?error=oauth_error' : '/register?error=oauth_error';
            return res.redirect(redirectPath);
        }
        
        if (!code) {
            const redirectPath = state === 'login' ? '/login?error=no_code' : '/register?error=no_code';
            return res.redirect(redirectPath);
        }
        
        const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID;
        const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET;
        const FACEBOOK_REDIRECT_URI = process.env.FACEBOOK_REDIRECT_URI || 'http://localhost:3000/auth/facebook/callback';
        
        if (!FACEBOOK_APP_ID || !FACEBOOK_APP_SECRET || FACEBOOK_APP_ID === 'your-facebook-app-id') {
            return res.redirect('/login?error=facebook_not_configured');
        }

        const tokenResponse = await axios.get('https://graph.facebook.com/v18.0/oauth/access_token', {
            params: {
                client_id: FACEBOOK_APP_ID,
                client_secret: FACEBOOK_APP_SECRET,
                redirect_uri: FACEBOOK_REDIRECT_URI,
                code: code
            }
        });
        
        const accessToken = tokenResponse.data.access_token;

        const userResponse = await axios.get('https://graph.facebook.com/v18.0/me', {
            params: {
                fields: 'id,name,email,first_name,last_name',
                access_token: accessToken
            }
        });
        
        const facebookUser = userResponse.data;
        
        if (!facebookUser.email) {
            return res.redirect('/login?error=email_not_provided');
        }

        let user = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [facebookUser.email]
        );
        
        let userData;
        
        if (user.rows.length === 0) {
            
            try {
                const newUser = await pool.query(
                    `INSERT INTO users (email, first_name, last_name)
                     VALUES ($1, $2, $3)
                     RETURNING user_id, email, first_name, last_name, is_admin`,
                    [
                        facebookUser.email,
                        facebookUser.first_name || facebookUser.name?.split(' ')[0] || '',
                        facebookUser.last_name || facebookUser.name?.split(' ').slice(1).join(' ') || ''
                    ]
                );
                userData = newUser.rows[0];
            } catch (err) {
                console.error('Facebook user creation error:', err);
                return res.redirect('/login?error=server_error');
            }
        } else {
            
            userData = user.rows[0];
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
            loginMethod: 'facebook',
            id: userId,
            user_id: userId
        };

        const redirectPath = state === 'login' ? '/login' : '/';
        res.redirect(`${redirectPath}?login=success&token=${encodeURIComponent(token)}&user=${encodeURIComponent(JSON.stringify(userInfo))}`);
        
    } catch (error) {
        console.error('Facebook OAuth callback error:', error);
        console.error('Error details:', error.response?.data || error.message);
        res.redirect('/login?error=server_error');
    }
});

router.get('/facebook/status', (req, res) => {
    const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID;
    const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET;
    
    const isConfigured = FACEBOOK_APP_ID && FACEBOOK_APP_SECRET && 
                         FACEBOOK_APP_ID !== 'your-facebook-app-id' &&
                         FACEBOOK_APP_SECRET !== 'your-facebook-app-secret';
    
    res.json({ configured: isConfigured, provider: 'Facebook' });
});

module.exports = router;