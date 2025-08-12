-- Reservations tablosuna eksik alanları ekle
-- Bu script mevcut veritabanındaki reservations tablosunu günceller

-- Extras alanını ekle (eğer yoksa)
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS extras JSONB;

-- Rezervasyon durumlarını güncelle
UPDATE reservations SET status = 'Beklemede' WHERE status IS NULL OR status = '';

-- Örnek rezervasyon verileri ekle (test için)
INSERT INTO reservations (
    user_id, car_id, pickup_date, dropoff_date, pickup_time, dropoff_time, 
    pickup_location_id, dropoff_location_id, total_price, status, extras
) VALUES 
    (1, 1, '2025-01-15', '2025-01-17', '10:00:00', '18:00:00', 1, 1, 250.00, 'Tamamlandı', '{"insurance": true, "gps": false}'),
    (1, 2, '2025-02-01', '2025-02-03', '09:00:00', '17:00:00', 2, 2, 400.00, 'Onaylandı', '{"insurance": true, "gps": true}'),
    (1, 3, '2025-01-20', '2025-01-22', '14:00:00', '12:00:00', 3, 3, 390.00, 'Beklemede', '{"insurance": false, "gps": false}')
ON CONFLICT DO NOTHING;

-- Güncel rezervasyonları göster
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
