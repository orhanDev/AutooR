const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    console.log('AuthMiddleware wird ausgeführt...');
    console.log('Headers:', req.headers);

    let token = req.header('x-auth-token');
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        token = req.headers.authorization.substring('Bearer '.length);
    }
    console.log('Token:', token);

    if (!token) {
        console.log('Token nicht gefunden');
        return res.status(401).json({ message: 'Token nicht gefunden, AutooRisierung verweigert.' });
    }

    try {
        console.log('JWT_SECRET:', process.env.JWT_SECRET);

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded token:', decoded);

        req.user = decoded;
        console.log('User set:', req.user);
        
        next();
    } catch (err) {
        console.error('JWT-Verifizierungsfehler:', err);
        console.error('JWT_SECRET:', process.env.JWT_SECRET);
        res.status(401).json({ message: 'Token ist ungültig.', error: err.message });
    }
};