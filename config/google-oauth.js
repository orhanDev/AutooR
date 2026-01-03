const { OAuth2Client } = require('google-auth-library');

// Google OAuth 2.0 konfigürasyonu - değerleri fonksiyon içinde al
function getGoogleClient() {
    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'your-google-client-id.apps.googleusercontent.com';
    const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'your-google-client-secret';
    const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'https://localhost:3443/auth/google/callback';
    
    return new OAuth2Client(
        GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET,
        GOOGLE_REDIRECT_URI
    );
}

// Google OAuth URL oluşturma
function getGoogleAuthURL(state = 'home') {
    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'your-google-client-id.apps.googleusercontent.com';
    const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'your-google-client-secret';
    const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'https://localhost:3443/auth/google/callback';
    
    const googleClient = getGoogleClient();
    
    const scopes = [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile'
    ];
    
    return googleClient.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        redirect_uri: GOOGLE_REDIRECT_URI,
        prompt: 'select_account', // Kullanıcıyı hesap seçmeye zorla
        state: state // Redirect bilgisi
    });
}

// Google OAuth token doğrulama
async function verifyGoogleToken(token) {
    try {
        const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'your-google-client-id.apps.googleusercontent.com';
        const googleClient = getGoogleClient();
        
        const ticket = await googleClient.verifyIdToken({
            idToken: token,
            audience: GOOGLE_CLIENT_ID
        });
        
        const payload = ticket.getPayload();
        
        return {
            success: true,
            user: {
                googleId: payload.sub,
                email: payload.email,
                name: payload.name,
                firstName: payload.given_name,
                lastName: payload.family_name,
                picture: payload.picture,
                emailVerified: payload.email_verified
            }
        };
    } catch (error) {
        console.error('Google token verification error:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Google OAuth authorization code ile token alma
async function getGoogleTokens(code) {
    try {
        const googleClient = getGoogleClient();
        const { tokens } = await googleClient.getToken(code);
        
        googleClient.setCredentials(tokens);
        
        // Kullanıcı bilgilerini al
        const response = await googleClient.request({
            url: 'https://www.googleapis.com/oauth2/v2/userinfo'
        });
        
        return {
            success: true,
            user: {
                googleId: response.data.id,
                email: response.data.email,
                name: response.data.name,
                firstName: response.data.given_name || response.data.name?.split(' ')[0] || '',
                lastName: response.data.family_name || response.data.name?.split(' ').slice(1).join(' ') || '',
                picture: response.data.picture,
                emailVerified: response.data.verified_email || false
            },
            tokens: tokens
        };
    } catch (error) {
        console.error('Google tokens error:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

module.exports = {
    getGoogleAuthURL,
    verifyGoogleToken,
    getGoogleTokens,
    getGoogleClient
};
