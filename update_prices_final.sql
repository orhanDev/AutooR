UPDATE cars SET daily_rate = GREATEST(daily_rate * 0.2, 15);

UPDATE cars SET daily_rate = 25 WHERE make = 'Volkswagen' AND model LIKE '%Golf%';
UPDATE cars SET daily_rate = 22 WHERE make = 'Opel' AND model LIKE '%Corsa%';
UPDATE cars SET daily_rate = 24 WHERE make = 'Ford' AND model LIKE '%Fiesta%';
UPDATE cars SET daily_rate = 23 WHERE make = 'Renault' AND model LIKE '%Clio%';

UPDATE cars SET daily_rate = 45 WHERE make = 'BMW' AND model LIKE '%3 Series%';
UPDATE cars SET daily_rate = 48 WHERE make = 'Mercedes' AND model LIKE '%C-Class%';
UPDATE cars SET daily_rate = 46 WHERE make = 'Audi' AND model LIKE '%A4%';
UPDATE cars SET daily_rate = 38 WHERE make = 'Volkswagen' AND model LIKE '%Passat%';

UPDATE cars SET daily_rate = 75 WHERE make = 'BMW' AND model LIKE '%5 Series%';
UPDATE cars SET daily_rate = 78 WHERE make = 'Mercedes' AND model LIKE '%E-Class%';
UPDATE cars SET daily_rate = 76 WHERE make = 'Audi' AND model LIKE '%A6%';

UPDATE cars SET daily_rate = 65 WHERE make = 'BMW' AND model LIKE '%X3%';
UPDATE cars SET daily_rate = 68 WHERE make = 'Mercedes' AND model LIKE '%GLC%';
UPDATE cars SET daily_rate = 64 WHERE make = 'Audi' AND model LIKE '%Q5%';
UPDATE cars SET daily_rate = 52 WHERE make = 'Volkswagen' AND model LIKE '%Tiguan%';

UPDATE cars SET daily_rate = 120 WHERE make = 'BMW' AND model LIKE '%7 Series%';
UPDATE cars SET daily_rate = 125 WHERE make = 'Mercedes' AND model LIKE '%S-Class%';
UPDATE cars SET daily_rate = 118 WHERE make = 'Audi' AND model LIKE '%A8%';
UPDATE cars SET daily_rate = 180 WHERE make = 'Porsche' AND model LIKE '%911%';
UPDATE cars SET daily_rate = 280 WHERE make = 'Bentley' AND model LIKE '%Continental%';
UPDATE cars SET daily_rate = 350 WHERE make = 'Rolls-Royce' AND model LIKE '%Phantom%';

SELECT make, model, year, daily_rate FROM cars ORDER BY daily_rate DESC LIMIT 15;