INSERT INTO cars (make, model, year, transmission_type, fuel_type, seating_capacity, daily_rate, location_id, is_available, description) VALUES 
    ('Tesla', 'Model 3', 2023, 'Automatic', 'Electric', 5, 125, 1, true, 'Elektrischer Limousine, lange Reichweite, schnelles Laden'),
    ('Porsche', '911', 2022, 'Automatic', 'Benzin', 4, 200, 2, true, 'Sportwagen, hohe Leistung, luxuriöses Interieur'),
    ('Mercedes-Benz', 'C-Class', 2021, 'Automatic', 'Diesel', 5, 195, 3, true, 'Luxus-Limousine, komfortable Fahrt, sparsamer Verbrauch'),
    ('BMW', 'X5', 2022, 'Automatic', 'Hybrid', 7, 340, 1, true, 'Luxus-SUV, Hybrid-Motor, geräumiges Interieur'),
    ('Audi', 'A4', 2021, 'Automatic', 'Benzin', 5, 188, 2, true, 'Premium-Limousine, quattro Antrieb, modernes Design'),
    ('Volkswagen', 'Golf', 2022, 'Manual', 'Benzin', 5, 110, 3, true, 'Praktischer Kombi, sparsam, zuverlässig'),
    ('BMW', '3 Series', 2022, 'Automatic', 'Benzin', 5, 190, 1, true, 'Premium-Limousine, sportliche Fahrt, luxuriöses Interieur'),
    ('Mercedes-Benz', 'E-Class', 2021, 'Automatic', 'Diesel', 5, 265, 2, true, 'Oberklasse-Limousine, komfortabel, luxuriös'),
    ('Audi', 'Q5', 2022, 'Automatic', 'Benzin', 5, 262, 3, true, 'Premium-SUV, quattro Antrieb, geräumiger Kofferraum'),
    ('Range Rover', 'Sport', 2021, 'Automatic', 'Diesel', 7, 380, 1, true, 'Luxus-SUV, Geländefähigkeit, komfortabel'),
    ('Toyota', 'RAV4', 2022, 'Automatic', 'Hybrid', 5, 295, 2, true, 'Hybrid-SUV, sparsam, zuverlässig'),
    ('Honda', 'Civic', 2021, 'Manual', 'Benzin', 5, 115, 3, true, 'Kompakt-Limousine, sportliches Design, sparsam')
ON CONFLICT DO NOTHING;

INSERT INTO car_carfeatures (car_id, feature_id) VALUES 
    (1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), 
    (2, 1), (2, 2), (2, 3), (2, 7), (2, 8), 
    (3, 1), (3, 2), (3, 3), (3, 6), (3, 7), 
    (4, 1), (4, 2), (4, 3), (4, 4), (4, 5), (4, 6), (4, 7), (4, 8), 
    (5, 1), (5, 2), (5, 3), (5, 6), (5, 7), 
    (6, 1), (6, 2), (6, 3), (6, 6), 
    (7, 1), (7, 2), (7, 3), (7, 6), (7, 7), 
    (8, 1), (8, 2), (8, 3), (8, 6), (8, 7), 
    (9, 1), (9, 2), (9, 3), (9, 6), (9, 7), 
    (10, 1), (10, 2), (10, 3), (10, 4), (10, 5), (10, 6), (10, 7), (10, 8), 
    (11, 1), (11, 2), (11, 3), (11, 6), (11, 7), 
    (12, 1), (12, 2), (12, 3), (12, 6) 
ON CONFLICT DO NOTHING;