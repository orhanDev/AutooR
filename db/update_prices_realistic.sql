UPDATE cars SET daily_rate = GREATEST(daily_rate, 100);

UPDATE cars SET daily_rate = 110 WHERE make = 'Volkswagen' AND model LIKE '%Golf%';
UPDATE cars SET daily_rate = 105 WHERE make = 'Opel' AND model LIKE '%Corsa%';
UPDATE cars SET daily_rate = 108 WHERE make = 'Ford' AND model LIKE '%Fiesta%';
UPDATE cars SET daily_rate = 106 WHERE make = 'Renault' AND model LIKE '%Clio%';
UPDATE cars SET daily_rate = 112 WHERE make = 'Peugeot' AND model LIKE '%208%';
UPDATE cars SET daily_rate = 115 WHERE make = 'Toyota' AND model LIKE '%Yaris%';
UPDATE cars SET daily_rate = 118 WHERE make = 'Honda' AND model LIKE '%Jazz%';
UPDATE cars SET daily_rate = 120 WHERE make = 'Kia' AND model LIKE '%Picanto%';

UPDATE cars SET daily_rate = 150 WHERE make = 'Volkswagen' AND model LIKE '%Passat%';
UPDATE cars SET daily_rate = 155 WHERE make = 'Opel' AND model LIKE '%Insignia%';
UPDATE cars SET daily_rate = 160 WHERE make = 'Ford' AND model LIKE '%Mondeo%';
UPDATE cars SET daily_rate = 158 WHERE make = 'Renault' AND model LIKE '%Megane%';
UPDATE cars SET daily_rate = 165 WHERE make = 'Peugeot' AND model LIKE '%508%';
UPDATE cars SET daily_rate = 170 WHERE make = 'Toyota' AND model LIKE '%Camry%';
UPDATE cars SET daily_rate = 175 WHERE make = 'Honda' AND model LIKE '%Accord%';

UPDATE cars SET daily_rate = 190 WHERE make = 'BMW' AND model LIKE '%3 Series%';
UPDATE cars SET daily_rate = 195 WHERE make = 'Mercedes-Benz' AND model LIKE '%C-Class%';
UPDATE cars SET daily_rate = 188 WHERE make = 'Audi' AND model LIKE '%A4%';
UPDATE cars SET daily_rate = 200 WHERE make = 'Volvo' AND model LIKE '%S60%';
UPDATE cars SET daily_rate = 210 WHERE make = 'Lexus' AND model LIKE '%IS%';
UPDATE cars SET daily_rate = 220 WHERE make = 'Infiniti' AND model LIKE '%Q50%';

UPDATE cars SET daily_rate = 260 WHERE make = 'BMW' AND model LIKE '%5 Series%';
UPDATE cars SET daily_rate = 265 WHERE make = 'Mercedes-Benz' AND model LIKE '%E-Class%';
UPDATE cars SET daily_rate = 262 WHERE make = 'Audi' AND model LIKE '%A6%';
UPDATE cars SET daily_rate = 270 WHERE make = 'Volvo' AND model LIKE '%S90%';
UPDATE cars SET daily_rate = 280 WHERE make = 'Lexus' AND model LIKE '%ES%';
UPDATE cars SET daily_rate = 290 WHERE make = 'Jaguar' AND model LIKE '%XF%';

UPDATE cars SET daily_rate = 350 WHERE make = 'BMW' AND model LIKE '%7 Series%';
UPDATE cars SET daily_rate = 360 WHERE make = 'Mercedes-Benz' AND model LIKE '%S-Class%';
UPDATE cars SET daily_rate = 355 WHERE make = 'Audi' AND model LIKE '%A8%';
UPDATE cars SET daily_rate = 380 WHERE make = 'Lexus' AND model LIKE '%LS%';
UPDATE cars SET daily_rate = 400 WHERE make = 'Maserati' AND model LIKE '%Quattroporte%';

UPDATE cars SET daily_rate = 190 WHERE make = 'BMW' AND model LIKE '%X1%';
UPDATE cars SET daily_rate = 195 WHERE make = 'Mercedes-Benz' AND model LIKE '%GLA%';
UPDATE cars SET daily_rate = 188 WHERE make = 'Audi' AND model LIKE '%Q3%';
UPDATE cars SET daily_rate = 200 WHERE make = 'Volkswagen' AND model LIKE '%T-Roc%';
UPDATE cars SET daily_rate = 205 WHERE make = 'Opel' AND model LIKE '%Mokka%';
UPDATE cars SET daily_rate = 210 WHERE make = 'Ford' AND model LIKE '%Puma%';
UPDATE cars SET daily_rate = 215 WHERE make = 'Renault' AND model LIKE '%Captur%';
UPDATE cars SET daily_rate = 220 WHERE make = 'Peugeot' AND model LIKE '%2008%';

UPDATE cars SET daily_rate = 260 WHERE make = 'BMW' AND model LIKE '%X3%';
UPDATE cars SET daily_rate = 265 WHERE make = 'Mercedes-Benz' AND model LIKE '%GLC%';
UPDATE cars SET daily_rate = 262 WHERE make = 'Audi' AND model LIKE '%Q5%';
UPDATE cars SET daily_rate = 270 WHERE make = 'Volkswagen' AND model LIKE '%Tiguan%';
UPDATE cars SET daily_rate = 275 WHERE make = 'Opel' AND model LIKE '%Grandland%';
UPDATE cars SET daily_rate = 280 WHERE make = 'Ford' AND model LIKE '%Kuga%';
UPDATE cars SET daily_rate = 285 WHERE make = 'Renault' AND model LIKE '%Kadjar%';
UPDATE cars SET daily_rate = 290 WHERE make = 'Peugeot' AND model LIKE '%3008%';
UPDATE cars SET daily_rate = 295 WHERE make = 'Toyota' AND model LIKE '%RAV4%';
UPDATE cars SET daily_rate = 300 WHERE make = 'Honda' AND model LIKE '%CR-V%';

UPDATE cars SET daily_rate = 340 WHERE make = 'BMW' AND model LIKE '%X5%';
UPDATE cars SET daily_rate = 345 WHERE make = 'Mercedes-Benz' AND model LIKE '%GLE%';
UPDATE cars SET daily_rate = 342 WHERE make = 'Audi' AND model LIKE '%Q7%';
UPDATE cars SET daily_rate = 350 WHERE make = 'Volkswagen' AND model LIKE '%Touareg%';
UPDATE cars SET daily_rate = 360 WHERE make = 'Volvo' AND model LIKE '%XC90%';
UPDATE cars SET daily_rate = 370 WHERE make = 'Lexus' AND model LIKE '%RX%';
UPDATE cars SET daily_rate = 380 WHERE make = 'Range Rover' AND model LIKE '%Sport%';

UPDATE cars SET daily_rate = 480 WHERE make = 'BMW' AND model LIKE '%X7%';
UPDATE cars SET daily_rate = 490 WHERE make = 'Mercedes-Benz' AND model LIKE '%GLS%';
UPDATE cars SET daily_rate = 485 WHERE make = 'Audi' AND model LIKE '%Q8%';
UPDATE cars SET daily_rate = 500 WHERE make = 'Range Rover' AND model LIKE '%Vogue%';
UPDATE cars SET daily_rate = 520 WHERE make = 'Bentley' AND model LIKE '%Bentayga%';
UPDATE cars SET daily_rate = 550 WHERE make = 'Rolls-Royce' AND model LIKE '%Cullinan%';

UPDATE cars SET daily_rate = 125 WHERE make = 'Tesla' AND model LIKE '%Model 3%';
UPDATE cars SET daily_rate = 135 WHERE make = 'Tesla' AND model LIKE '%Model Y%';
UPDATE cars SET daily_rate = 150 WHERE make = 'Tesla' AND model LIKE '%Model S%';
UPDATE cars SET daily_rate = 160 WHERE make = 'Tesla' AND model LIKE '%Model X%';
UPDATE cars SET daily_rate = 130 WHERE make = 'BMW' AND model LIKE '%i3%';
UPDATE cars SET daily_rate = 140 WHERE make = 'BMW' AND model LIKE '%iX%';
UPDATE cars SET daily_rate = 135 WHERE make = 'Audi' AND model LIKE '%e-tron%';
UPDATE cars SET daily_rate = 125 WHERE make = 'Volkswagen' AND model LIKE '%ID.%';
UPDATE cars SET daily_rate = 120 WHERE make = 'Kia' AND model LIKE '%EV%';
UPDATE cars SET daily_rate = 118 WHERE make = 'Hyundai' AND model LIKE '%IONIQ%';

UPDATE cars SET daily_rate = 115 WHERE make = 'Toyota' AND model LIKE '%Prius%';
UPDATE cars SET daily_rate = 120 WHERE make = 'Toyota' AND model LIKE '%Corolla%' AND fuel_type LIKE '%Hybrid%';
UPDATE cars SET daily_rate = 125 WHERE make = 'Toyota' AND model LIKE '%RAV4%' AND fuel_type LIKE '%Hybrid%';
UPDATE cars SET daily_rate = 130 WHERE make = 'Honda' AND model LIKE '%Civic%' AND fuel_type LIKE '%Hybrid%';
UPDATE cars SET daily_rate = 135 WHERE make = 'Honda' AND model LIKE '%CR-V%' AND fuel_type LIKE '%Hybrid%';
UPDATE cars SET daily_rate = 140 WHERE make = 'BMW' AND model LIKE '%X5%' AND fuel_type LIKE '%Hybrid%';
UPDATE cars SET daily_rate = 145 WHERE make = 'Mercedes-Benz' AND model LIKE '%C-Class%' AND fuel_type LIKE '%Hybrid%';

UPDATE cars SET daily_rate = 200 WHERE make = 'Porsche' AND model LIKE '%911%';
UPDATE cars SET daily_rate = 220 WHERE make = 'Porsche' AND model LIKE '%Cayman%';
UPDATE cars SET daily_rate = 240 WHERE make = 'Porsche' AND model LIKE '%Boxster%';
UPDATE cars SET daily_rate = 280 WHERE make = 'Porsche' AND model LIKE '%Cayenne%';
UPDATE cars SET daily_rate = 300 WHERE make = 'Porsche' AND model LIKE '%Panamera%';
UPDATE cars SET daily_rate = 220 WHERE make = 'Mercedes-Benz' AND model LIKE '%AMG GT%';
UPDATE cars SET daily_rate = 240 WHERE make = 'BMW' AND model LIKE '%M3%';
UPDATE cars SET daily_rate = 260 WHERE make = 'BMW' AND model LIKE '%M4%';
UPDATE cars SET daily_rate = 280 WHERE make = 'BMW' AND model LIKE '%M5%';
UPDATE cars SET daily_rate = 320 WHERE make = 'BMW' AND model LIKE '%M8%';
UPDATE cars SET daily_rate = 230 WHERE make = 'Audi' AND model LIKE '%RS%';
UPDATE cars SET daily_rate = 250 WHERE make = 'Audi' AND model LIKE '%R8%';

UPDATE cars SET daily_rate = 320 WHERE make = 'Bentley' AND model LIKE '%Continental%';
UPDATE cars SET daily_rate = 350 WHERE make = 'Bentley' AND model LIKE '%Flying Spur%';
UPDATE cars SET daily_rate = 380 WHERE make = 'Bentley' AND model LIKE '%Mulliner%';
UPDATE cars SET daily_rate = 400 WHERE make = 'Rolls-Royce' AND model LIKE '%Phantom%';
UPDATE cars SET daily_rate = 420 WHERE make = 'Rolls-Royce' AND model LIKE '%Ghost%';
UPDATE cars SET daily_rate = 450 WHERE make = 'Rolls-Royce' AND model LIKE '%Wraith%';
UPDATE cars SET daily_rate = 480 WHERE make = 'Rolls-Royce' AND model LIKE '%Dawn%';
UPDATE cars SET daily_rate = 500 WHERE make = 'Rolls-Royce' AND model LIKE '%Cullinan%';
UPDATE cars SET daily_rate = 550 WHERE make = 'Rolls-Royce' AND model LIKE '%Spectre%';

UPDATE cars SET daily_rate = 120 WHERE daily_rate < 100 AND make IN ('Fiat', 'Lancia', 'Alfa Romeo');
UPDATE cars SET daily_rate = 130 WHERE daily_rate < 100 AND make IN ('Seat', 'Skoda');
UPDATE cars SET daily_rate = 140 WHERE daily_rate < 100 AND make IN ('Mazda', 'Subaru');
UPDATE cars SET daily_rate = 150 WHERE daily_rate < 100 AND make IN ('Nissan', 'Mitsubishi');
UPDATE cars SET daily_rate = 160 WHERE daily_rate < 100 AND make IN ('Chevrolet', 'Opel');
UPDATE cars SET daily_rate = 180 WHERE daily_rate < 100 AND make IN ('Jaguar', 'Land Rover');

UPDATE cars SET daily_rate = GREATEST(daily_rate, 100);

SELECT 
    make, 
    model, 
    year, 
    fuel_type,
    daily_rate,
    CASE 
        WHEN daily_rate BETWEEN 100 AND 140 THEN 'Economy/Kompakt'
        WHEN daily_rate BETWEEN 140 AND 180 THEN 'Mittelklasse'
        WHEN daily_rate BETWEEN 180 AND 240 THEN 'Premium Mittelklasse'
        WHEN daily_rate BETWEEN 240 AND 320 THEN 'Oberklasse'
        WHEN daily_rate BETWEEN 320 AND 450 THEN 'Luxus'
        WHEN daily_rate BETWEEN 450 AND 650 THEN 'Premium Luxus'
        WHEN daily_rate BETWEEN 650 AND 1200 THEN 'Ultra Luxus'
        ELSE 'Sonstiges'
    END as segment
FROM cars 
ORDER BY daily_rate ASC;