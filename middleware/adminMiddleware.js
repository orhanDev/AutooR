module.exports = function (req, res, next) {
    // req.user wird von authMiddleware gesetzt
    if (!req.user || !req.user.is_admin) {
        return res.status(403).json({ message: 'Administratorberechtigung verweigert.' });
    }
    next();
};