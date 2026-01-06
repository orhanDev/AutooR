INSERT INTO cars (make, model, year, transmission_type, fuel_type, seating_capacity, daily_rate, location_id, is_available, description) VALUES 
    ('Tesla', 'Model 3', 2023, 'Automatic', 'Electric', 5, 125, 1, true, 'Elektrikli sedan, uzun menzil, hızlı şarj'),
    ('Porsche', '911', 2022, 'Automatic', 'Petrol', 4, 200, 2, true, 'Spor araba, yüksek performans, lüks iç mekan'),
    ('Mercedes-Benz', 'C-Class', 2021, 'Automatic', 'Diesel', 5, 195, 3, true, 'Lüks sedan, konforlu sürüş, ekonomik yakıt tüketimi'),
    ('BMW', 'X5', 2022, 'Automatic', 'Hybrid', 7, 340, 1, true, 'Lüks SUV, hibrit motor, geniş iç mekan'),
    ('Audi', 'A4', 2021, 'Automatic', 'Petrol', 5, 188, 2, true, 'Premium sedan, quattro sürüş, modern tasarım'),
    ('Volkswagen', 'Golf', 2022, 'Manual', 'Petrol', 5, 110, 3, true, 'Pratik hatchback, ekonomik, güvenilir'),
    ('BMW', '3 Series', 2022, 'Automatic', 'Petrol', 5, 190, 1, true, 'Premium sedan, sportif sürüş, lüks iç mekan'),
    ('Mercedes-Benz', 'E-Class', 2021, 'Automatic', 'Diesel', 5, 265, 2, true, 'Üst segment sedan, konforlu, lüks'),
    ('Audi', 'Q5', 2022, 'Automatic', 'Petrol', 5, 262, 3, true, 'Premium SUV, quattro sürüş, geniş bagaj'),
    ('Range Rover', 'Sport', 2021, 'Automatic', 'Diesel', 7, 380, 1, true, 'Lüks SUV, off-road yetenek, konforlu'),
    ('Toyota', 'RAV4', 2022, 'Automatic', 'Hybrid', 5, 295, 2, true, 'Hibrit SUV, ekonomik, güvenilir'),
    ('Honda', 'Civic', 2021, 'Manual', 'Petrol', 5, 115, 3, true, 'Kompakt sedan, sportif tasarım, ekonomik')
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