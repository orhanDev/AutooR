module.exports = function (req, res, next) {
    // req.user, authMiddleware tarafından ayarlanır
    if (!req.user || !req.user.is_admin) {
        return res.status(403).json({ message: 'Yönetici yetkisi reddedildi.' });
    }
    next();
};