-- TÜM VERİLERİ SİL ve ID'leri sıfırla
TRUNCATE TABLE car_carfeatures, cars, car_features, locations RESTART IDENTITY CASCADE;

-- KONUM BİLGİLERİNİ EKLE
INSERT INTO locations (name, address, city, country) VALUES
('Berlin Hauptbahnhof', 'Europaplatz 1', 'Berlin', 'Deutschland'),
('München Zentrum', 'Marienplatz 1', 'München', 'Deutschland'),
('Hamburg City', 'Jungfernstieg 10', 'Hamburg', 'Deutschland'),
('Köln Dom', 'Domkloster 4', 'Köln', 'Deutschland'),
('Frankfurt Flughafen', 'Flughafenstraße 1', 'Frankfurt', 'Deutschland'),
('Stuttgart Hauptbahnhof', 'Arnulf-Klett-Platz 2', 'Stuttgart', 'Deutschland'),
('Düsseldorf Altstadt', 'Burgplatz 1', 'Düsseldorf', 'Deutschland'),
('Leipzig Zentrum', 'Augustusplatz 9', 'Leipzig', 'Deutschland'),
('Dortmund City', 'Friedensplatz 1', 'Dortmund', 'Deutschland'),
('Essen Hauptbahnhof', 'Am Hauptbahnhof 5', 'Essen', 'Deutschland')
ON CONFLICT DO NOTHING;

-- ARAÇ ÖZELLİKLERİNİ EKLE
INSERT INTO car_features (feature_name) VALUES
('Klimaanlage'),
('GPS'),
('Kindersitz'),
('Schiebedach'),
('Parksensoren'),
('Sitzheizung'),
('Bluetooth'),
('Allradantrieb'),
('Elektrische Fensterheber'),
('LED-Scheinwerfer'),
('Autopilot'),
('Panoramadach'),
('Massagesitze'),
('Ambientebeleuchtung'),
('Wireless Charging'),
('360° Kamera'),
('Ventilierte Sitze'),
('Head-up Display'),
('Premium Sound System'),
('Automatisches Einparken')
ON CONFLICT DO NOTHING;

-- LÜKS VE POPÜLER ARAÇLARI EKLE (location_id'ler dinamik olarak alınacak şekilde)
INSERT INTO cars (
    make, model, year, license_plate, daily_rate, transmission_type,
    fuel_type, seating_capacity, color, image_url, location_id, description
) VALUES
-- TESLA
('Tesla', 'Model S Plaid', 2024, '34TES001', 180.00, 'Automatik', 'Elektro', 5, 'Midnight Silver', '/images/cars/tesla-model-s.jpg', (SELECT location_id FROM locations WHERE name='Berlin Hauptbahnhof'), 'Das schnellste Tesla-Modell mit über 1000 PS und 0-100 km/h in 2.1 Sekunden.'),
('Tesla', 'Model 3 Performance', 2024, '34TES002', 120.00, 'Automatik', 'Elektro', 5, 'Deep Blue Metallic', '/images/cars/tesla-model-3.jpg', (SELECT location_id FROM locations WHERE name='München Zentrum'), 'Sportliche Elektro-Limousine mit beeindruckender Beschleunigung und Reichweite.'),
('Tesla', 'Model X Plaid', 2024, '34TES003', 200.00, 'Automatik', 'Elektro', 7, 'Pearl White', '/images/cars/tesla-model-x.jpg', (SELECT location_id FROM locations WHERE name='Hamburg City'), 'Luxuriöser SUV mit Falcon-Türen und überragender Performance.'),
('Tesla', 'Model Y Performance', 2024, '34TES004', 140.00, 'Automatik', 'Elektro', 5, 'Red Multi-Coat', '/images/cars/tesla-model-y.jpg', (SELECT location_id FROM locations WHERE name='Köln Dom'), 'Kompakter SUV mit sportlicher Performance und praktischem Innenraum.'),
-- MERCEDES
('Mercedes-Benz', 'S-Klasse', 2024, '34MER001', 160.00, 'Automatik', 'Hybrid', 5, 'Obsidianschwarz', '/images/cars/mercedes-s-class.jpg', (SELECT location_id FROM locations WHERE name='Frankfurt Flughafen'), 'Die Luxuslimousine schlechthin mit höchstem Komfort und modernster Technologie.'),
('Mercedes-Benz', 'AMG GT', 2024, '34MER002', 220.00, 'Automatik', 'Benzin', 4, 'Selenite Grey', '/images/cars/mercedes-amg-gt.jpg', (SELECT location_id FROM locations WHERE name='Stuttgart Hauptbahnhof'), 'Sportwagen mit AMG-Performance und exklusivem Design.'),
('Mercedes-Benz', 'G-Klasse', 2024, '34MER003', 240.00, 'Automatik', 'Diesel', 5, 'Magnetit Schwarz', '/images/cars/mercedes-g-class.jpg', (SELECT location_id FROM locations WHERE name='Düsseldorf Altstadt'), 'Der legendäre Geländewagen mit unverwechselbarem Design und Offroad-Fähigkeiten.'),
-- BMW
('BMW', 'M8 Competition', 2024, '34BMW001', 180.00, 'Automatik', 'Benzin', 4, 'Frozen Black', '/images/cars/bmw-m8.jpg', (SELECT location_id FROM locations WHERE name='Leipzig Zentrum'), 'Der stärkste BMW M8 mit über 600 PS und exklusivem Design.'),
('BMW', 'iX M60', 2024, '34BMW002', 150.00, 'Automatik', 'Elektro', 5, 'Alpine White', '/images/cars/bmw-ix.jpg', (SELECT location_id FROM locations WHERE name='Dortmund City'), 'Elektrischer SUV mit M-Performance und futuristischem Design.'),
('BMW', 'X7 M60i', 2024, '34BMW003', 170.00, 'Automatik', 'Benzin', 7, 'Tanzanite Blue', '/images/cars/bmw-x7.jpg', (SELECT location_id FROM locations WHERE name='Essen Hauptbahnhof'), 'Luxuriöser 7-Sitzer SUV mit M-Performance und höchstem Komfort.'),
-- AUDI
('Audi', 'RS e-tron GT', 2024, '34AUD001', 200.00, 'Automatik', 'Elektro', 4, 'Daytona Grey', '/images/cars/audi-rs-etron.jpg', (SELECT location_id FROM locations WHERE name='Berlin Hauptbahnhof'), 'Elektrischer Sportwagen mit RS-Performance und futuristischem Design.'),
('Audi', 'A8 L', 2024, '34AUD002', 160.00, 'Automatik', 'Hybrid', 5, 'Orca Black', '/images/cars/audi-a8.jpg', (SELECT location_id FROM locations WHERE name='München Zentrum'), 'Luxuslimousine mit höchstem Komfort und modernster Technologie.'),
('Audi', 'Q8 RS', 2024, '34AUD003', 180.00, 'Automatik', 'Benzin', 5, 'Nardo Grey', '/images/cars/audi-q8-rs.jpg', (SELECT location_id FROM locations WHERE name='Hamburg City'), 'Sportlicher SUV mit RS-Performance und aggressivem Design.'),
-- PORSCHE
('Porsche', '911 GT3 RS', 2024, '34POR001', 300.00, 'Automatik', 'Benzin', 2, 'GT Silver Metallic', '/images/cars/porsche-911-gt3.jpg', (SELECT location_id FROM locations WHERE name='Köln Dom'), 'Der legendäre Sportwagen mit Rennsport-Technologie und überragender Performance.'),
('Porsche', 'Taycan Turbo S', 2024, '34POR002', 220.00, 'Automatik', 'Elektro', 4, 'Miami Blue', '/images/cars/porsche-taycan.jpg', (SELECT location_id FROM locations WHERE name='Frankfurt Flughafen'), 'Elektrischer Sportwagen mit Porsche-Performance und futuristischem Design.'),
('Porsche', 'Cayenne Turbo S', 2024, '34POR003', 190.00, 'Automatik', 'Benzin', 5, 'Moonlight Blue', '/images/cars/porsche-cayenne.jpg', (SELECT location_id FROM locations WHERE name='Stuttgart Hauptbahnhof'), 'Luxuriöser SUV mit Turbo-Performance und höchstem Komfort.'),
-- BENTLEY
('Bentley', 'Continental GT', 2024, '34BEN001', 320.00, 'Automatik', 'Benzin', 4, 'British Racing Green', '/images/cars/bentley-continental.jpg', (SELECT location_id FROM locations WHERE name='Düsseldorf Altstadt'), 'Luxuriöser Grand Tourer mit handgefertigtem Interieur und überragender Performance.'),
('Bentley', 'Bentayga', 2024, '34BEN002', 300.00, 'Automatik', 'Hybrid', 5, 'Beluga Black', '/images/cars/bentley-bentayga.jpg', (SELECT location_id FROM locations WHERE name='Leipzig Zentrum'), 'Luxuriöser SUV mit höchstem Komfort und exklusivem Design.'),
-- ROLLS-ROYCE
('Rolls-Royce', 'Phantom', 2024, '34ROL001', 400.00, 'Automatik', 'Benzin', 4, 'Arctic White', '/images/cars/rolls-royce-phantom.jpg', (SELECT location_id FROM locations WHERE name='Dortmund City'), 'Das ultimative Luxusauto mit handgefertigtem Interieur und höchstem Komfort.'),
('Rolls-Royce', 'Cullinan', 2024, '34ROL002', 380.00, 'Automatik', 'Benzin', 5, 'Darkest Tungsten', '/images/cars/rolls-royce-cullinan.jpg', (SELECT location_id FROM locations WHERE name='Essen Hauptbahnhof'), 'Luxuriöser SUV mit Rolls-Royce-Perfektion und exklusivem Design.'),
-- POPÜLER MARKALAR
('Volkswagen', 'Golf 8 R', 2024, '34VWG001', 110.00, 'Automatik', 'Benzin', 5, 'Lapiz Blue', '/images/cars/volkswagen-golf8r.jpg', (SELECT location_id FROM locations WHERE name='Berlin Hauptbahnhof'), 'Kompakt spor otomobil, yüksek performans und konfor.'),
('Volkswagen', 'ID.4 GTX', 2024, '34VWG002', 120.00, 'Automatik', 'Elektro', 5, 'Glacier White', '/images/cars/volkswagen-id4-gtx.jpg', (SELECT location_id FROM locations WHERE name='München Zentrum'), 'Elektrikli SUV, modern tasarım und uzun menzil.'),
('Toyota', 'Corolla Hybrid', 2024, '34TYT001', 100.00, 'Automatik', 'Hybrid', 5, 'Platinum White', '/images/cars/toyota-corolla-hybrid.jpg', (SELECT location_id FROM locations WHERE name='Hamburg City'), 'Hibrit motorlu, ekonomik und güvenilir sedan.'),
('Toyota', 'RAV4 Plug-in Hybrid', 2024, '34TYT002', 130.00, 'Automatik', 'Hybrid', 5, 'Emotional Red', '/images/cars/toyota-rav4-phev.jpg', (SELECT location_id FROM locations WHERE name='Köln Dom'), 'Plug-in hibrit SUV, şehir und arazi için ideal.'),
('Honda', 'Civic e:HEV', 2024, '34HND001', 105.00, 'Automatik', 'Hybrid', 5, 'Crystal Black', '/images/cars/honda-civic-ehev.jpg', (SELECT location_id FROM locations WHERE name='Frankfurt Flughafen'), 'Hibrit motorlu, sportif und ekonomik sedan.'),
('Honda', 'CR-V Hybrid', 2024, '34HND002', 125.00, 'Automatik', 'Hybrid', 5, 'Lunar Silver', '/images/cars/honda-crv-hybrid.jpg', (SELECT location_id FROM locations WHERE name='Stuttgart Hauptbahnhof'), 'Hibrit SUV, geniş iç hacim und konfor.'),
('Kia', 'EV6 GT', 2024, '34KIA001', 120.00, 'Automatik', 'Elektro', 5, 'Aurora Black', '/images/cars/kia-ev6-gt.jpg', (SELECT location_id FROM locations WHERE name='Düsseldorf Altstadt'), 'Elektrikli crossover, yüksek performans und menzil.'),
('Kia', 'Sportage Hybrid', 2024, '34KIA002', 110.00, 'Automatik', 'Hybrid', 5, 'Snow White Pearl', '/images/cars/kia-sportage-hybrid.jpg', (SELECT location_id FROM locations WHERE name='Leipzig Zentrum'), 'Hibrit SUV, modern tasarım und verimlilik.')
ON CONFLICT (license_plate) DO UPDATE SET
    make = EXCLUDED.make,
    model = EXCLUDED.model,
    year = EXCLUDED.year,
    daily_rate = EXCLUDED.daily_rate,
    transmission_type = EXCLUDED.transmission_type,
    fuel_type = EXCLUDED.fuel_type,
    seating_capacity = EXCLUDED.seating_capacity,
    color = EXCLUDED.color,
    image_url = EXCLUDED.image_url,
    location_id = EXCLUDED.location_id,
    description = EXCLUDED.description,
    is_available = TRUE;

-- ÖRNEK ARAÇ-ÖZELLİK İLİŞKİLERİ (uuid ile)
INSERT INTO car_carfeatures (car_id, feature_id) VALUES
((SELECT car_id FROM cars WHERE license_plate = '34TES001'), (SELECT feature_id FROM car_features WHERE feature_name = 'Klimaanlage')),
((SELECT car_id FROM cars WHERE license_plate = '34TES001'), (SELECT feature_id FROM car_features WHERE feature_name = 'GPS')),
((SELECT car_id FROM cars WHERE license_plate = '34TES002'), (SELECT feature_id FROM car_features WHERE feature_name = 'Klimaanlage')),
((SELECT car_id FROM cars WHERE license_plate = '34TES002'), (SELECT feature_id FROM car_features WHERE feature_name = 'Schiebedach')),
((SELECT car_id FROM cars WHERE license_plate = '34TES003'), (SELECT feature_id FROM car_features WHERE feature_name = 'GPS')),
((SELECT car_id FROM cars WHERE license_plate = '34TES003'), (SELECT feature_id FROM car_features WHERE feature_name = 'Parksensoren')),
((SELECT car_id FROM cars WHERE license_plate = '34TES004'), (SELECT feature_id FROM car_features WHERE feature_name = 'Klimaanlage')),
((SELECT car_id FROM cars WHERE license_plate = '34TES004'), (SELECT feature_id FROM car_features WHERE feature_name = 'Sitzheizung')),
((SELECT car_id FROM cars WHERE license_plate = '34MER001'), (SELECT feature_id FROM car_features WHERE feature_name = 'Bluetooth')),
((SELECT car_id FROM cars WHERE license_plate = '34MER001'), (SELECT feature_id FROM car_features WHERE feature_name = 'Allradantrieb')),
((SELECT car_id FROM cars WHERE license_plate = '34MER002'), (SELECT feature_id FROM car_features WHERE feature_name = 'Elektrische Fensterheber')),
((SELECT car_id FROM cars WHERE license_plate = '34MER002'), (SELECT feature_id FROM car_features WHERE feature_name = 'LED-Scheinwerfer')),
((SELECT car_id FROM cars WHERE license_plate = '34MER003'), (SELECT feature_id FROM car_features WHERE feature_name = 'Autopilot')),
((SELECT car_id FROM cars WHERE license_plate = '34MER003'), (SELECT feature_id FROM car_features WHERE feature_name = 'Panoramadach')),
((SELECT car_id FROM cars WHERE license_plate = '34BMW001'), (SELECT feature_id FROM car_features WHERE feature_name = 'Massagesitze')),
((SELECT car_id FROM cars WHERE license_plate = '34BMW001'), (SELECT feature_id FROM car_features WHERE feature_name = 'Ambientebeleuchtung')),
((SELECT car_id FROM cars WHERE license_plate = '34BMW002'), (SELECT feature_id FROM car_features WHERE feature_name = 'Wireless Charging')),
((SELECT car_id FROM cars WHERE license_plate = '34BMW002'), (SELECT feature_id FROM car_features WHERE feature_name = '360° Kamera')),
((SELECT car_id FROM cars WHERE license_plate = '34BMW003'), (SELECT feature_id FROM car_features WHERE feature_name = 'Ventilierte Sitze')),
((SELECT car_id FROM cars WHERE license_plate = '34BMW003'), (SELECT feature_id FROM car_features WHERE feature_name = 'Head-up Display')),
((SELECT car_id FROM cars WHERE license_plate = '34AUD001'), (SELECT feature_id FROM car_features WHERE feature_name = 'Premium Sound System')),
((SELECT car_id FROM cars WHERE license_plate = '34AUD001'), (SELECT feature_id FROM car_features WHERE feature_name = 'Automatisches Einparken'))
ON CONFLICT DO NOTHING;