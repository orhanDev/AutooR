require('dotenv').config();
const express = require('express');

// JWT Secret - Üretimde environment variable kullanın
process.env.JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_here_change_this_in_production';

// Veritabanı konfigürasyonu - Üretimde environment variable kullanın
process.env.PGUSER = process.env.PGUSER || 'cinetime';
process.env.PGHOST = process.env.PGHOST || 'localhost';
process.env.PGDATABASE = process.env.PGDATABASE || 'rentacar_db';
process.env.PGPASSWORD = process.env.PGPASSWORD || 'Vekil4023.';
process.env.PGPORT = process.env.PGPORT || '5432';
const path = require('path');
const carsRouter = require('./routes/cars');
const locationsRouter = require('./routes/locations');
const reservationsRouter = require('./routes/reservations');
const authRouter = require('./routes/auth');
const adminRouter = require('./routes/admin');
const adminToolsRouter = require('./routes/admin_tools');
const contactRouter = require('./routes/contact');
const paymentsRouter = require('./routes/payments');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json()); // JSON request body parse et
app.use(express.urlencoded({ extended: true })); // URL-encoded request body parse et

// Public klasöründen statik dosyaları sun
app.use(express.static(path.join(__dirname, 'public')));

// Images klasörünü ayrı olarak sun
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));

// Favicon rotaları
app.get('/favicon.svg', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'favicon.svg'));
});

app.get('/favicon.ico', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'favicon.ico'));
});

// Rotalar
app.use('/api/cars', carsRouter);
app.use('/api/locations', locationsRouter);
app.use('/api/reservations', reservationsRouter);
app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);
app.use('/api/admin-tools', adminToolsRouter);
app.use('/api/contact', contactRouter);
app.use('/api/payments', paymentsRouter);

// Admin Panel HTML sayfa rotaları
app.get('/views/admin/locations.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'admin', 'locations.html'));
});

app.get('/views/admin/features.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'admin', 'features.html'));
});

// Arama sonuçları sayfa rotası
app.get('/views/search_results.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'search_results.html'));
});

// Ana sayfa
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Checkout sayfası
app.get('/views/checkout.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'checkout.html'));
});

// Ekstralar sayfası
app.get('/views/extras.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'extras.html'));
});

// İnceleme & Rezervasyon sayfası
app.get('/views/review.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'review.html'));
});

// Klarna Demo sayfası
app.get('/views/klarna_demo.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'klarna_demo.html'));
});

// Sunucuyu başlat
app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});