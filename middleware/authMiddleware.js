const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    // Header'dan token'ı al
    const token = req.header('x-auth-token');

    // Token yoksa hata döndür
    if (!token) {
        return res.status(401).json({ message: 'Token bulunamadı, yetkilendirme reddedildi.' });
    }

    try {
        // Token'ı doğrula
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Request nesnesine kullanıcıyı ekle
        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token geçerli değil.' });
    }
};