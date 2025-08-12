-- Tüm araç fiyatlarını maksimum 400€ ile sınırla
-- Gerçekçi günlük kiralama fiyatları

-- Önce tüm fiyatları kontrol et
SELECT make, model, daily_rate, 
       CASE 
           WHEN daily_rate <= 100 THEN 'Ekonomi'
           WHEN daily_rate <= 150 THEN 'Kompakt'
           WHEN daily_rate <= 200 THEN 'Orta Segment'
           WHEN daily_rate <= 250 THEN 'Premium Orta'
           WHEN daily_rate <= 300 THEN 'Üst Segment'
           WHEN daily_rate <= 350 THEN 'Lüks'
           WHEN daily_rate <= 400 THEN 'Ultra Lüks'
           ELSE 'Çok Pahalı - Düzeltilmeli'
       END as segment
FROM cars 
ORDER BY daily_rate DESC;

-- 1. Ekonomi/Kompakt araçlar (€100-120)
UPDATE cars SET daily_rate = 100 WHERE make = 'Volkswagen' AND model LIKE '%Golf%';
UPDATE cars SET daily_rate = 105 WHERE make = 'Opel' AND model LIKE '%Corsa%';
UPDATE cars SET daily_rate = 108 WHERE make = 'Ford' AND model LIKE '%Fiesta%';
UPDATE cars SET daily_rate = 106 WHERE make = 'Renault' AND model LIKE '%Clio%';
UPDATE cars SET daily_rate = 110 WHERE make = 'Peugeot' AND model LIKE '%208%';
UPDATE cars SET daily_rate = 115 WHERE make = 'Toyota' AND model LIKE '%Yaris%';
UPDATE cars SET daily_rate = 118 WHERE make = 'Honda' AND model LIKE '%Jazz%';
UPDATE cars SET daily_rate = 120 WHERE make = 'Kia' AND model LIKE '%Picanto%';

-- 2. Orta segment araçlar (€130-170)
UPDATE cars SET daily_rate = 130 WHERE make = 'Volkswagen' AND model LIKE '%Passat%';
UPDATE cars SET daily_rate = 135 WHERE make = 'Opel' AND model LIKE '%Insignia%';
UPDATE cars SET daily_rate = 140 WHERE make = 'Ford' AND model LIKE '%Mondeo%';
UPDATE cars SET daily_rate = 138 WHERE make = 'Renault' AND model LIKE '%Megane%';
UPDATE cars SET daily_rate = 145 WHERE make = 'Peugeot' AND model LIKE '%508%';
UPDATE cars SET daily_rate = 150 WHERE make = 'Toyota' AND model LIKE '%Camry%';
UPDATE cars SET daily_rate = 155 WHERE make = 'Honda' AND model LIKE '%Accord%';

-- 3. Premium orta segment (€180-220)
UPDATE cars SET daily_rate = 180 WHERE make = 'BMW' AND model LIKE '%3 Series%';
UPDATE cars SET daily_rate = 185 WHERE make = 'Mercedes-Benz' AND model LIKE '%C-Class%';
UPDATE cars SET daily_rate = 178 WHERE make = 'Audi' AND model LIKE '%A4%';
UPDATE cars SET daily_rate = 190 WHERE make = 'Volvo' AND model LIKE '%S60%';
UPDATE cars SET daily_rate = 200 WHERE make = 'Lexus' AND model LIKE '%IS%';
UPDATE cars SET daily_rate = 210 WHERE make = 'Infiniti' AND model LIKE '%Q50%';

-- 4. Üst segment (€230-280)
UPDATE cars SET daily_rate = 230 WHERE make = 'BMW' AND model LIKE '%5 Series%';
UPDATE cars SET daily_rate = 235 WHERE make = 'Mercedes-Benz' AND model LIKE '%E-Class%';
UPDATE cars SET daily_rate = 232 WHERE make = 'Audi' AND model LIKE '%A6%';
UPDATE cars SET daily_rate = 240 WHERE make = 'Volvo' AND model LIKE '%S90%';
UPDATE cars SET daily_rate = 250 WHERE make = 'Lexus' AND model LIKE '%ES%';
UPDATE cars SET daily_rate = 260 WHERE make = 'Jaguar' AND model LIKE '%XF%';

-- 5. Lüks segment (€290-350)
UPDATE cars SET daily_rate = 290 WHERE make = 'BMW' AND model LIKE '%7 Series%';
UPDATE cars SET daily_rate = 300 WHERE make = 'Mercedes-Benz' AND model LIKE '%S-Class%';
UPDATE cars SET daily_rate = 295 WHERE make = 'Audi' AND model LIKE '%A8%';
UPDATE cars SET daily_rate = 310 WHERE make = 'Lexus' AND model LIKE '%LS%';
UPDATE cars SET daily_rate = 320 WHERE make = 'Maserati' AND model LIKE '%Quattroporte%';

-- 6. Kompakt SUV'lar (€140-200)
UPDATE cars SET daily_rate = 140 WHERE make = 'BMW' AND model LIKE '%X1%';
UPDATE cars SET daily_rate = 145 WHERE make = 'Mercedes-Benz' AND model LIKE '%GLA%';
UPDATE cars SET daily_rate = 138 WHERE make = 'Audi' AND model LIKE '%Q3%';
UPDATE cars SET daily_rate = 150 WHERE make = 'Volkswagen' AND model LIKE '%T-Roc%';
UPDATE cars SET daily_rate = 155 WHERE make = 'Opel' AND model LIKE '%Mokka%';
UPDATE cars SET daily_rate = 160 WHERE make = 'Ford' AND model LIKE '%Puma%';
UPDATE cars SET daily_rate = 165 WHERE make = 'Renault' AND model LIKE '%Captur%';
UPDATE cars SET daily_rate = 170 WHERE make = 'Peugeot' AND model LIKE '%2008%';

-- 7. Orta SUV'lar (€200-280)
UPDATE cars SET daily_rate = 200 WHERE make = 'BMW' AND model LIKE '%X3%';
UPDATE cars SET daily_rate = 205 WHERE make = 'Mercedes-Benz' AND model LIKE '%GLC%';
UPDATE cars SET daily_rate = 202 WHERE make = 'Audi' AND model LIKE '%Q5%';
UPDATE cars SET daily_rate = 210 WHERE make = 'Volkswagen' AND model LIKE '%Tiguan%';
UPDATE cars SET daily_rate = 215 WHERE make = 'Opel' AND model LIKE '%Grandland%';
UPDATE cars SET daily_rate = 220 WHERE make = 'Ford' AND model LIKE '%Kuga%';
UPDATE cars SET daily_rate = 225 WHERE make = 'Renault' AND model LIKE '%Kadjar%';
UPDATE cars SET daily_rate = 230 WHERE make = 'Peugeot' AND model LIKE '%3008%';
UPDATE cars SET daily_rate = 235 WHERE make = 'Toyota' AND model LIKE '%RAV4%';
UPDATE cars SET daily_rate = 240 WHERE make = 'Honda' AND model LIKE '%CR-V%';

-- 8. Büyük SUV'lar (€250-350)
UPDATE cars SET daily_rate = 250 WHERE make = 'BMW' AND model LIKE '%X5%';
UPDATE cars SET daily_rate = 255 WHERE make = 'Mercedes-Benz' AND model LIKE '%GLE%';
UPDATE cars SET daily_rate = 252 WHERE make = 'Audi' AND model LIKE '%Q7%';
UPDATE cars SET daily_rate = 260 WHERE make = 'Volkswagen' AND model LIKE '%Touareg%';
UPDATE cars SET daily_rate = 270 WHERE make = 'Volvo' AND model LIKE '%XC90%';
UPDATE cars SET daily_rate = 280 WHERE make = 'Lexus' AND model LIKE '%RX%';
UPDATE cars SET daily_rate = 290 WHERE make = 'Range Rover' AND model LIKE '%Sport%';

-- 9. Ultra lüks SUV'lar (€300-400) - Maksimum sınır
UPDATE cars SET daily_rate = 300 WHERE make = 'BMW' AND model LIKE '%X7%';
UPDATE cars SET daily_rate = 310 WHERE make = 'Mercedes-Benz' AND model LIKE '%GLS%';
UPDATE cars SET daily_rate = 305 WHERE make = 'Audi' AND model LIKE '%Q8%';
UPDATE cars SET daily_rate = 320 WHERE make = 'Range Rover' AND model LIKE '%Vogue%';
UPDATE cars SET daily_rate = 350 WHERE make = 'Bentley' AND model LIKE '%Bentayga%';
UPDATE cars SET daily_rate = 380 WHERE make = 'Rolls-Royce' AND model LIKE '%Cullinan%';

-- 10. Elektrikli araçlar (€120-200)
UPDATE cars SET daily_rate = 120 WHERE make = 'Tesla' AND model LIKE '%Model 3%';
UPDATE cars SET daily_rate = 130 WHERE make = 'Tesla' AND model LIKE '%Model Y%';
UPDATE cars SET daily_rate = 140 WHERE make = 'Tesla' AND model LIKE '%Model S%';
UPDATE cars SET daily_rate = 150 WHERE make = 'Tesla' AND model LIKE '%Model X%';
UPDATE cars SET daily_rate = 125 WHERE make = 'BMW' AND model LIKE '%i3%';
UPDATE cars SET daily_rate = 135 WHERE make = 'BMW' AND model LIKE '%iX%';
UPDATE cars SET daily_rate = 130 WHERE make = 'Audi' AND model LIKE '%e-tron%';
UPDATE cars SET daily_rate = 120 WHERE make = 'Volkswagen' AND model LIKE '%ID.%';
UPDATE cars SET daily_rate = 118 WHERE make = 'Kia' AND model LIKE '%EV%';
UPDATE cars SET daily_rate = 116 WHERE make = 'Hyundai' AND model LIKE '%IONIQ%';

-- 11. Hibrit araçlar (€110-180)
UPDATE cars SET daily_rate = 110 WHERE make = 'Toyota' AND model LIKE '%Prius%';
UPDATE cars SET daily_rate = 115 WHERE make = 'Toyota' AND model LIKE '%Corolla%' AND fuel_type LIKE '%Hybrid%';
UPDATE cars SET daily_rate = 120 WHERE make = 'Toyota' AND model LIKE '%RAV4%' AND fuel_type LIKE '%Hybrid%';
UPDATE cars SET daily_rate = 125 WHERE make = 'Honda' AND model LIKE '%Civic%' AND fuel_type LIKE '%Hybrid%';
UPDATE cars SET daily_rate = 130 WHERE make = 'Honda' AND model LIKE '%CR-V%' AND fuel_type LIKE '%Hybrid%';
UPDATE cars SET daily_rate = 135 WHERE make = 'BMW' AND model LIKE '%X5%' AND fuel_type LIKE '%Hybrid%';
UPDATE cars SET daily_rate = 140 WHERE make = 'Mercedes-Benz' AND model LIKE '%C-Class%' AND fuel_type LIKE '%Hybrid%';

-- 12. Spor araçlar (€180-350) - Maksimum sınır
UPDATE cars SET daily_rate = 180 WHERE make = 'Porsche' AND model LIKE '%911%';
UPDATE cars SET daily_rate = 200 WHERE make = 'Porsche' AND model LIKE '%Cayman%';
UPDATE cars SET daily_rate = 220 WHERE make = 'Porsche' AND model LIKE '%Boxster%';
UPDATE cars SET daily_rate = 260 WHERE make = 'Porsche' AND model LIKE '%Cayenne%';
UPDATE cars SET daily_rate = 280 WHERE make = 'Porsche' AND model LIKE '%Panamera%';
UPDATE cars SET daily_rate = 200 WHERE make = 'Mercedes-Benz' AND model LIKE '%AMG GT%';
UPDATE cars SET daily_rate = 220 WHERE make = 'BMW' AND model LIKE '%M3%';
UPDATE cars SET daily_rate = 240 WHERE make = 'BMW' AND model LIKE '%M4%';
UPDATE cars SET daily_rate = 260 WHERE make = 'BMW' AND model LIKE '%M5%';
UPDATE cars SET daily_rate = 300 WHERE make = 'BMW' AND model LIKE '%M8%';
UPDATE cars SET daily_rate = 210 WHERE make = 'Audi' AND model LIKE '%RS%';
UPDATE cars SET daily_rate = 230 WHERE make = 'Audi' AND model LIKE '%R8%';

-- 13. Ultra lüks araçlar (€300-400) - Maksimum sınır
UPDATE cars SET daily_rate = 300 WHERE make = 'Bentley' AND model LIKE '%Continental%';
UPDATE cars SET daily_rate = 320 WHERE make = 'Bentley' AND model LIKE '%Flying Spur%';
UPDATE cars SET daily_rate = 350 WHERE make = 'Rolls-Royce' AND model LIKE '%Phantom%';
UPDATE cars SET daily_rate = 380 WHERE make = 'Rolls-Royce' AND model LIKE '%Ghost%';
UPDATE cars SET daily_rate = 400 WHERE make = 'Rolls-Royce' AND model LIKE '%Wraith%';

-- 14. Tüm fiyatları maksimum 400€ ile sınırla
UPDATE cars SET daily_rate = 400 WHERE daily_rate > 400;

-- 15. Sonuçları göster
SELECT 
    make, 
    model, 
    daily_rate,
    CASE 
        WHEN daily_rate <= 100 THEN 'Ekonomi'
        WHEN daily_rate <= 150 THEN 'Kompakt'
        WHEN daily_rate <= 200 THEN 'Orta Segment'
        WHEN daily_rate <= 250 THEN 'Premium Orta'
        WHEN daily_rate <= 300 THEN 'Üst Segment'
        WHEN daily_rate <= 350 THEN 'Lüks'
        WHEN daily_rate <= 400 THEN 'Ultra Lüks'
        ELSE 'Çok Pahalı'
    END as segment
FROM cars 
ORDER BY daily_rate DESC;

-- 16. Fiyat istatistikleri
SELECT 
    COUNT(*) as toplam_arac,
    COUNT(CASE WHEN daily_rate <= 100 THEN 1 END) as "100€ altı",
    COUNT(CASE WHEN daily_rate > 100 AND daily_rate <= 200 THEN 1 END) as "100-200€",
    COUNT(CASE WHEN daily_rate > 200 AND daily_rate <= 300 THEN 1 END) as "200-300€",
    COUNT(CASE WHEN daily_rate > 300 AND daily_rate <= 400 THEN 1 END) as "300-400€",
    COUNT(CASE WHEN daily_rate > 400 THEN 1 END) as "400€ üstü",
    ROUND(AVG(daily_rate), 2) as ortalama_fiyat,
    MIN(daily_rate) as minimum_fiyat,
    MAX(daily_rate) as maksimum_fiyat
FROM cars;
