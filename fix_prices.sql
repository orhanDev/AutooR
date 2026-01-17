UPDATE cars SET daily_rate = GREATEST(daily_rate, 100);

UPDATE cars SET daily_rate = 120 WHERE make = 'Volkswagen' AND model LIKE '%Golf%';
UPDATE cars SET daily_rate = 110 WHERE make = 'Opel' AND model LIKE '%Corsa%';
UPDATE cars SET daily_rate = 115 WHERE make = 'Ford' AND model LIKE '%Fiesta%';
UPDATE cars SET daily_rate = 112 WHERE make = 'Renault' AND model LIKE '%Clio%';

UPDATE cars SET daily_rate = 180 WHERE make = 'BMW' AND model LIKE '%3 Series%';
UPDATE cars SET daily_rate = 190 WHERE make = 'Mercedes' AND model LIKE '%C-Class%';
UPDATE cars SET daily_rate = 185 WHERE make = 'Audi' AND model LIKE '%A4%';
UPDATE cars SET daily_rate = 160 WHERE make = 'Volkswagen' AND model LIKE '%Passat%';

UPDATE cars SET daily_rate = 280 WHERE make = 'BMW' AND model LIKE '%5 Series%';
UPDATE cars SET daily_rate = 290 WHERE make = 'Mercedes' AND model LIKE '%E-Class%';
UPDATE cars SET daily_rate = 285 WHERE make = 'Audi' AND model LIKE '%A6%';

UPDATE cars SET daily_rate = 250 WHERE make = 'BMW' AND model LIKE '%X3%';
UPDATE cars SET daily_rate = 260 WHERE make = 'Mercedes' AND model LIKE '%GLC%';
UPDATE cars SET daily_rate = 255 WHERE make = 'Audi' AND model LIKE '%Q5%';
UPDATE cars SET daily_rate = 220 WHERE make = 'Volkswagen' AND model LIKE '%Tiguan%';

UPDATE cars SET daily_rate = 450 WHERE make = 'BMW' AND model LIKE '%7 Series%';
UPDATE cars SET daily_rate = 480 WHERE make = 'Mercedes' AND model LIKE '%S-Class%';
UPDATE cars SET daily_rate = 470 WHERE make = 'Audi' AND model LIKE '%A8%';
UPDATE cars SET daily_rate = 650 WHERE make = 'Porsche' AND model LIKE '%911%';
UPDATE cars SET daily_rate = 850 WHERE make = 'Bentley' AND model LIKE '%Continental%';
UPDATE cars SET daily_rate = 1200 WHERE make = 'Rolls-Royce' AND model LIKE '%Phantom%';

SELECT make, model, year, daily_rate FROM cars ORDER BY daily_rate DESC LIMIT 15;