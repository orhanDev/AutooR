const express = require('express');
const { query } = require('../db/database');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const result = await query('SELECT * FROM cars');
        res.json(result.rows);
    } catch (error) {
        console.error('Fehler beim Abrufen der Fahrzeuge:', error);
        res.status(500).json({ error: 'Serverfehler' });
    }
});

router.get('/search', async (req, res) => {
    try {
        const { 
            make, 
            model, 
            year, 
            transmission_type, 
            fuel_type, 
            seating_capacity,
            min_price,
            max_price,
            location_id,
            pickup_date,
            dropoff_date,
            sort = 'price-low'
        } = req.query;

        let sqlQuery = `
            SELECT
                c.*, l.name AS location_name
            FROM
                cars c
            JOIN
                locations l ON c.location_id = l.location_id
            WHERE
                c.is_available = TRUE
            `;

        const queryParams = [];
        let paramCount = 1;

        if (make) {
            sqlQuery += ` AND LOWER(c.make) LIKE LOWER($${paramCount})`;
            queryParams.push(`%${make}%`);
            paramCount++;
        }

        if (model) {
            sqlQuery += ` AND LOWER(c.model) LIKE LOWER($${paramCount})`;
            queryParams.push(`%${model}%`);
            paramCount++;
        }

        if (year) {
            sqlQuery += ` AND c.year = $${paramCount}`;
            queryParams.push(year);
            paramCount++;
        }

        if (transmission_type) {
            sqlQuery += ` AND c.transmission_type = $${paramCount}`;
            queryParams.push(transmission_type);
            paramCount++;
        }

        if (fuel_type) {
            sqlQuery += ` AND c.fuel_type = $${paramCount}`;
            queryParams.push(fuel_type);
            paramCount++;
        }

        if (seating_capacity) {
            sqlQuery += ` AND c.seating_capacity >= $${paramCount}`;
            queryParams.push(seating_capacity);
            paramCount++;
        }

        if (min_price) {
            sqlQuery += ` AND c.daily_rate >= $${paramCount}`;
            queryParams.push(min_price);
            paramCount++;
        }

        if (max_price) {
            sqlQuery += ` AND c.daily_rate <= $${paramCount}`;
            queryParams.push(max_price);
            paramCount++;
        }

        if (location_id) {
            sqlQuery += ` AND c.location_id = $${paramCount}`;
            queryParams.push(location_id);
            paramCount++;
        }

        if (pickup_date && dropoff_date) {
            sqlQuery += `
                AND NOT EXISTS (
                    SELECT 1 FROM reservations r
                    WHERE r.car_id = c.car_id
                    AND r.status IN ('Pending', 'Confirmed')
                    AND (
                        (r.pickup_date, r.dropoff_date) OVERLAPS (CAST($${paramCount} AS DATE), CAST($${paramCount + 1} AS DATE))
                    )
                )
            `;
            queryParams.push(pickup_date, dropoff_date);
            paramCount += 2;
        }

        switch (sort) {
            case 'price-high':
                sqlQuery += ' ORDER BY c.daily_rate DESC';
                break;
            case 'price-low':
                sqlQuery += ' ORDER BY c.daily_rate ASC';
                break;
            case 'year-new':
                sqlQuery += ' ORDER BY c.year DESC';
                break;
            case 'year-old':
                sqlQuery += ' ORDER BY c.year ASC';
                break;
            default:
                sqlQuery += ' ORDER BY c.daily_rate ASC';
        }

        sqlQuery += ' LIMIT 100;';

        const result = await query(sqlQuery, queryParams);
        console.log('API-Abfrage ergab', result.rows.length, 'Fahrzeuge.');
        res.json(result.rows);

    } catch (error) {
        console.error('Fehler bei der Fahrzeugsuche:', error);
        res.status(500).json({ error: 'Serverfehler' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const carId = req.params.id;

        const carResult = await query(`
            SELECT c.*, l.name AS location_name
             FROM cars c
             JOIN locations l ON c.location_id = l.location_id
             WHERE c.car_id = $1
        `, [carId]);

        if (carResult.rows.length === 0) {
            return res.status(404).json({ error: 'Fahrzeug nicht gefunden' });
        }

        const car = carResult.rows[0];

        const featuresResult = await query(`
            SELECT cf.feature_name
             FROM car_carfeatures ccf
             JOIN car_features cf ON ccf.feature_id = cf.feature_id
             WHERE ccf.car_id = $1
        `, [carId]);

        car.features = featuresResult.rows.map(row => row.feature_name);

        res.json(car);

    } catch (error) {
        console.error('Fehler beim Abrufen der Fahrzeugdetails:', error);
        res.status(500).json({ error: 'Serverfehler' });
    }
});

module.exports = router;