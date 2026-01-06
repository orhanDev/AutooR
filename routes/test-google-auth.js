const express = require('express');
const { Pool } = require('pg');
const router = express.Router();

const pool = new Pool({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT || 5432,
});

router.get('/test-google', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="de">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Test Google Anmeldung - AutooR</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
            <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css" rel="stylesheet">
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                    background: #f8f9fa;
                    margin: 0;
                    padding: 0;
                    min-height: 100vh;
                }
                
                .main-container {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    padding: 20px;
                }
                
                .oauth-container {
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    padding: 40px;
                    max-width: 400px;
                    width: 100%;
                    text-align: center;
                    border: 1px solid #e0e0e0;
                }
                
                .oauth-title {
                    font-size: 24px;
                    font-weight: 400;
                    color: #202124;
                    margin-bottom: 8px;
                }
                
                .oauth-subtitle {
                    font-size: 16px;
                    color: #5f6368;
                    margin-bottom: 32px;
                }
                
                .test-info {
                    background: #e3f2fd;
                    border: 1px solid #2196f3;
                    border-radius: 8px;
                    padding: 16px;
                    margin-bottom: 20px;
                    font-size: 14px;
                    color: #1976d2;
                }
                
                .test-info strong {
                    font-weight: 600;
                    display: block;
                    margin-bottom: 8px;
                    font-size: 16px;
                }
                
                .google-btn {
                    background: #fff;
                    border: 1px solid #dadce0;
                    border-radius: 8px;
                    color: #3c4043;
                    font-size: 14px;
                    font-weight: 500;
                    padding: 12px 24px;
                    width: 100%;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    text-decoration: none;
                    margin-bottom: 10px;
                }
                
                .google-btn:hover {
                    background: #f8f9fa;
                    border-color: #dadce0;
                    color: #3c4043;
                    text-decoration: none;
                }
                
                .google-btn:active {
                    background: #f1f3f4;
                }
                
                .loading {
                    display: none;
                    margin-top: 20px;
                }
                
                .spinner-border {
                    width: 20px;
                    height: 20px;
                }
                
                .error-message {
                    color: #e74c3c;
                    font-size: 14px;
                    margin-top: 16px;
                    display: none;
                    background: #fdf2f2;
                    padding: 12px;
                    border-radius: 8px;
                    border: 1px solid #fecaca;
                }
                
            </style>
        </head>
        <body>
            <div class="main-container">
                <div class="oauth-container">
                    <h1 class="oauth-title">AutooR</h1>
                    <p class="oauth-subtitle">Test Google Anmeldung</p>
                    
                    <div class="test-info">
                        <strong>Test-Modus:</strong>
                        Bis die Google Cloud Console-Einstellungen abgeschlossen sind, werden Test-Konten verwendet.
                    </div>
                    
                    <button class="google-btn" onclick="testLogin('orhancodes@gmail.com', 'Orhan Yılmaz')">
                        <svg width="24" height="24" viewBox="0 0 24 24" style="margin-right: 12px;">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        orhancodes@gmail.com
                    </button>
                    
                    <button class="google-btn" onclick="testLogin('test@gmail.com', 'Test Benutzer')">
                        <svg width="24" height="24" viewBox="0 0 24 24" style="margin-right: 12px;">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        test@gmail.com
                    </button>
                    
                    <div class="loading" id="loading">
                        <div class="spinner-border" role="status">
                            <span class="visually-hidden">Laden...</span>
                        </div>
                        <p class="mt-2">Anmeldung wird verarbeitet...</p>
                    </div>
                    
                    <div class="error-message" id="error-message">
                        <i class="bi bi-exclamation-triangle me-2"></i>
                        <span id="error-text"></span>
                    </div>
                </div>
            </div>
            
            <script>
                function testLogin(email, name) {
                    
                    document.getElementById('loading').style.display = 'block';
                    document.getElementById('error-message').style.display = 'none';

                    const userData = {
                        email: email,
                        firstName: name.split(' ')[0],
                        lastName: name.split(' ').slice(1).join(' ') || '',
                        name: name,
                        verified: true,
                        loginMethod: 'google'
                    };

                    if (window.opener) {
                        window.opener.postMessage({
                            type: 'GOOGLE_OAUTH_SUCCESS',
                            email: email,
                            name: name
                        }, '*');
                        window.close();
                    } else {
                        
                        setTimeout(() => {
                            window.location.href = \`/?login=success&user=\${encodeURIComponent(JSON.stringify(userData))}\`;
                        }, 1000);
                    }
                }
            </script>
        </body>
        </html>
    `);
});

router.post('/test-google/callback', async (req, res) => {
    try {
        const { email, name } = req.body;
        
        if (!email || !name) {
            return res.json({ success: false, message: 'E-Mail und Name sind erforderlich' });
        }

        let user = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );
        
        if (user.rows.length === 0) {
            
            const newUser = await pool.query(
                `INSERT INTO users (email, first_name, last_name, login_method, is_verified, google_id)
                 VALUES ($1, $2, $3, $4, $5, $6)
                 RETURNING id, email, first_name, last_name, login_method, is_verified`,
                [
                    email,
                    name.split(' ')[0],
                    name.split(' ').slice(1).join(' ') || '',
                    'google',
                    true,
                    'test_' + Date.now()
                ]
            );
            user = newUser;
        } else {
            
            const updatedUser = await pool.query(
                `UPDATE users SET 
                    first_name = $1,
                    last_name = $2,
                    login_method = 'google',
                    is_verified = true,
                    updated_at = CURRENT_TIMESTAMP
                 WHERE email = $3
                 RETURNING id, email, first_name, last_name, login_method, is_verified`,
                [
                    name.split(' ')[0],
                    name.split(' ').slice(1).join(' ') || '',
                    email
                ]
            );
            user = updatedUser;
        }
        
        const userData = user.rows[0];
        
        res.json({
            success: true,
            message: 'Test-Anmeldung erfolgreich',
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
        console.error('Test Google OAuth callback error:', error);
        res.json({ success: false, message: 'Serverfehler' });
    }
});

module.exports = router;