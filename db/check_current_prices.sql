-- Mevcut fiyatları kontrol et
SELECT 'MEVCUT FİYATLAR:' as durum;
SELECT make, model, year, daily_rate FROM cars ORDER BY daily_rate ASC;

-- Fiyat istatistikleri
SELECT 
    'FİYAT İSTATİSTİKLERİ:' as durum,
    COUNT(*) as toplam_arac,
    MIN(daily_rate) as en_dusuk_fiyat,
    MAX(daily_rate) as en_yuksek_fiyat,
    AVG(daily_rate) as ortalama_fiyat,
    COUNT(CASE WHEN daily_rate < 100 THEN 1 END) as 100_alti_arac
FROM cars;
