const express = require('express');
const router = express.Router();
const db = require('../db/database');

function normalizeDailyRate(row) {
    // Eğer değer TL gibi çok yüksekse EUR görünümü için 10'a böl (geçici normalizasyon)
    // 400 üzeri değerleri TL varsayıyoruz
    const rate = Number(row.daily_rate);
    if (!Number.isFinite(rate)) return row;
    if (rate > 400) {
        row.daily_rate = Number((rate / 10).toFixed(2));
    }
    return row;
}

// Tüm araçları getir
router.get('/', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM cars');
        const rows = result.rows.map(r => normalizeDailyRate(r));
        res.json(rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Sunucu Hatası');
    }
});

// Araçları arama kriterlerine göre getir
router.get('/search', async (req, res) => {
    let { pickup_date, dropoff_date, pickup_time, dropoff_time, make, model, transmission_type, fuel_type, seating_capacity } = req.query;

    console.log('Gelen sorgu parametreleri:', req.query); // Yeni log: Gelen tüm query parametrelerini gösterir

    // Boş stringleri null'a çevir, UUID alanları için önemlidir
    // pickup_location_id = pickup_location_id === '' ? null : pickup_location_id;
    // dropoff_location_id = dropoff_location_id === '' ? null : dropoff_location_id;

    try {
        // Tarih ve saat parametrelerinin geçerli olduğundan emin olun (geçici olarak yorum satırı)
        // if (!pickup_date || !dropoff_date || !pickup_time || !dropoff_time) { // BU SATIR YORUM SATIRI YAPILDI
        //     return res.status(400).json({ message: 'Teslim alma ve teslim etme tarih/saatleri gereklidir.' }); // BU SATIR YORUM SATIRI YAPILDI
        // }

        // Tarih ve saatleri birleştirerek TIMESTAMP oluştur (geçici olarak yorum satırı)
        // const pickupDateTime = `${pickup_date} ${pickup_time}`;
        // const dropoffDateTime = `${dropoff_date} ${dropoff_time}`;

        // SQL Sorgusu: Tüm araçları getiren temel sorgu
        let query = `
            SELECT
                c.*, l.name AS location_name
            FROM
                cars c
            JOIN
                locations l ON c.location_id = l.location_id
            WHERE
                c.is_available = TRUE
            `;
        let params = [];
        let paramIndex = 1;

        // Lokasyon filtreleri
        // pickup_location_id ve dropoff_location_id filtrelenmeyecek, tüm arabalar listelenecek.

        // Tarih ve saat filtreleri
        if (pickup_date && dropoff_date && pickup_time && dropoff_time) {
            const pickupDateTime = `${pickup_date} ${pickup_time}`;
            const dropoffDateTime = `${dropoff_date} ${dropoff_time}`;

            // Rezervasyon çakışması kontrolü
            // query += ` AND c.car_id NOT IN ( // BU SATIR YORUM SATIRI YAPILDI
            //     SELECT car_id FROM reservations
            //     WHERE (pickup_date::timestamp + pickup_time::interval, dropoff_date::timestamp + dropoff_time::interval) OVERLAPS (CAST($${paramIndex++} AS TIMESTAMP), CAST($${paramIndex++} AS TIMESTAMP))
            // )`;
            // params.push(pickupDateTime, dropoffDateTime); // BU SATIR YORUM SATIRI YAPILDI
        }

        // Marka filtresi
        if (make) { // make parametresi boş değilse
            query += ` AND c.make = $${paramIndex++}`;
            params.push(make);
        }

        // Model filtresi
        if (model) { // model parametresi boş değilse
            query += ` AND c.model = $${paramIndex++}`;
            params.push(model);
        }

        // Vites tipi filtresi
        if (transmission_type) {
            query += ` AND c.transmission_type = $${paramIndex++}`;
            params.push(transmission_type);
        }

        // Yakıt tipi filtresi
        if (fuel_type) {
            query += ` AND c.fuel_type = $${paramIndex++}`;
            params.push(fuel_type);
        }

        // Koltuk kapasitesi filtresi
        if (seating_capacity) {
            query += ` AND c.seating_capacity = $${paramIndex++}`;
            params.push(parseInt(seating_capacity)); // Sayısal değere dönüştür
        }

        query += ` LIMIT 100;`; // Limit performans için 100 olarak güncellendi.

        console.log('Sorgu yürütülüyor:', query, params);

        const result = await db.query(query, params);
        result.rows = result.rows.map(r => normalizeDailyRate(r));
        console.log(`API sorgusundan ${result.rows.length} araç döndü.`); // Yeni log
        res.json(result.rows);
    } catch (err) {
        console.error('Araç arama hatası:', err.message);
        res.status(500).send('Sunucu Hatası');
    }
});

// Belirli bir aracın detaylarını ve özelliklerini getir
router.get('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Aracı ve lokasyon adını getir
        const carResult = await db.query(
            `SELECT c.*, l.name AS location_name
             FROM cars c
             JOIN locations l ON c.location_id = l.location_id
             WHERE c.car_id = $1`,
            [id]
        );

        if (carResult.rows.length === 0) {
            return res.status(404).json({ message: 'Araç bulunamadı.' });
        }

        const car = normalizeDailyRate(carResult.rows[0]);

        // Aracın özelliklerini getir
        const featuresResult = await db.query(
            `SELECT cf.feature_name
             FROM car_carfeatures ccf
             JOIN car_features cf ON ccf.feature_id = cf.feature_id
             WHERE ccf.car_id = $1`,
            [id]
        );

        car.features = featuresResult.rows.map(row => row.feature_name);

        res.json(car);
    } catch (err) {
        console.error('Araç detayı çekilirken hata:', err.message);
        res.status(500).send('Sunucu Hatası');
    }
});

module.exports = router;