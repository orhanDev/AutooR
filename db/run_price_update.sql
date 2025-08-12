-- Fiyat güncelleme scriptini çalıştır
-- Bu dosya mevcut veritabanındaki araç fiyatlarını günceller

-- Önce mevcut fiyatları göster
SELECT 'MEVCUT FİYATLAR:' as durum;
SELECT make, model, year, daily_rate FROM cars ORDER BY daily_rate ASC;

-- Fiyat güncelleme scriptini çalıştır
\i update_prices_realistic.sql

-- Güncel fiyatları göster
SELECT 'GÜNCEL FİYATLAR:' as durum;
SELECT make, model, year, daily_rate FROM cars ORDER BY daily_rate ASC;
