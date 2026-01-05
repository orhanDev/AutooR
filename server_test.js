require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/images', express.static(path.join(__dirname, 'public', 'images')));

app.get('/favicon.svg', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'favicon.svg'));
});

app.get('/favicon.ico', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'favicon.ico'));
});

app.get('/api/cars', (req, res) => {
    res.json([
        { id: 1, name: 'BMW X5', price: 150, image: '/images/car1.jpg' },
        { id: 2, name: 'Mercedes C-Class', price: 120, image: '/images/car2.jpg' },
        { id: 3, name: 'Audi A4', price: 100, image: '/images/car3.jpg' }
    ]);
});

app.get('/api/locations', (req, res) => {
    res.json([
        { id: 1, name: 'İstanbul Havalimanı', address: 'İstanbul' },
        { id: 2, name: 'Ankara Havalimanı', address: 'Ankara' },
        { id: 3, name: 'İzmir Havalimanı', address: 'İzmir' }
    ]);
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/views/checkout.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'checkout.html'));
});

app.get('/views/extras.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'extras.html'));
});

app.get('/views/review.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'review.html'));
});

app.get('/views/klarna_demo.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'klarna_demo.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Test Server çalışıyor: http:
  console.log(`📝 Not: Bu test sunucusu, veritabanı olmadan çalışıyor`);
  console.log(`🚗 Araçlar ve lokasyonlar test verileriyle gösteriliyor`);
});
