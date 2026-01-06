ALTER TABLE reservations ADD COLUMN IF NOT EXISTS extras JSONB;

UPDATE reservations SET status = 'Pending' WHERE status IS NULL OR status = '';

INSERT INTO reservations (
    user_id, car_id, pickup_date, dropoff_date, pickup_time, dropoff_time, 
    pickup_location_id, dropoff_location_id, total_price, status, extras
) VALUES 
    (1, 1, '2025-01-15', '2025-01-17', '10:00:00', '18:00:00', 1, 1, 250.00, 'Completed', '{"insurance": true, "gps": false}'),
    (1, 2, '2025-02-01', '2025-02-03', '09:00:00', '17:00:00', 2, 2, 400.00, 'Confirmed', '{"insurance": true, "gps": true}'),
    (1, 3, '2025-01-20', '2025-01-22', '14:00:00', '12:00:00', 3, 3, 390.00, 'Pending', '{"insurance": false, "gps": false}')
ON CONFLICT DO NOTHING;

SELECT 
    r.reservation_id,
    r.pickup_date,
    r.dropoff_date,
    r.total_price,
    r.status,
    c.make as car_make,
    c.model as car_model,
    c.year as car_year,
    l.name as pickup_location
FROM reservations r
JOIN cars c ON r.car_id = c.car_id
JOIN locations l ON r.pickup_location_id = l.location_id
ORDER BY r.created_at DESC;