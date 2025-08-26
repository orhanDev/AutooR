const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    console.log('AuthMiddleware çalışıyor...');
    console.log('Headers:', req.headers);
    
    // Header'dan token'ı al (x-auth-token veya Authorization: Bearer)
    let token = req.header('x-auth-token');
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        token = req.headers.authorization.substring('Bearer '.length);
    }
    console.log('Token:', token);

    // Token yoksa hata döndür
    if (!token) {
        console.log('Token bulunamadı');
        return res.status(401).json({ message: 'Token nicht gefunden, AuTorisierung verweigert.' });
    }

    try {
        console.log('JWT_SECRET:', process.env.JWT_SECRET);
        
        // Token'ı doğrula
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded token:', decoded);
        
        // Kullanıcıyı request objesine ekle
        req.user = decoded;
        console.log('User set:', req.user);
        
        next();
    } catch (err) {
        console.error('JWT verification hatası:', err);
        console.error('JWT_SECRET:', process.env.JWT_SECRET);
        res.status(401).json({ message: 'Token ist ungültig.', error: err.message });
    }
};