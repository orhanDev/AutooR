const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    // Header'dan token'ı al
    const token = req.header('x-auth-token');

    // Token yoksa hata döndür
    if (!token) {
        return res.status(401).json({ message: 'Token nicht gefunden, Autorisierung verweigert.' });
    }

    try {
        // Token'ı doğrula
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Kullanıcıyı request objesine ekle
        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token ist ungültig.' });
    }
};