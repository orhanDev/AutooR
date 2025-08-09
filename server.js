require('dotenv').config();
const express = require('express');
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
app.use(express.json()); // JSON istek gövdelerini ayrıştırmak için
app.use(express.urlencoded({ extended: true })); // URL-encoded istek gövdelerini ayrıştırmak için

// Statik dosyaları sunmak için public klasörünü kullan
app.use(express.static(path.join(__dirname, 'public')));

// Images klasörünü ayrıca sun
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));

// Favicon route'ları
app.get('/favicon.svg', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'favicon.svg'));
});

app.get('/favicon.ico', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'favicon.ico'));
});

// Route'lar
app.use('/api/cars', carsRouter);
app.use('/api/locations', locationsRouter);
app.use('/api/reservations', reservationsRouter);
app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);
app.use('/api/admin-tools', adminToolsRouter);
app.use('/api/contact', contactRouter);
app.use('/api/payments', paymentsRouter);

// Admin Paneli HTML sayfaları için route'lar
app.get('/views/admin/locations.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'admin', 'locations.html'));
});

app.get('/views/admin/features.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'admin', 'features.html'));
});

// Arama Sonuçları sayfası için route
app.get('/views/search_results.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'search_results.html'));
});

// Anasayfa
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Checkout sayfası
app.get('/views/checkout.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'checkout.html'));
});

// Extras sayfası
app.get('/views/extras.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'extras.html'));
});

// Review & Book sayfası
app.get('/views/review.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'review.html'));
});

// Klarna demo sayfası
app.get('/views/klarna_demo.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'klarna_demo.html'));
});

// Sunucuyu başlat
app.listen(PORT, () => {
    console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor`);
});