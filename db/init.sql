-- Veritabanı başlangıç tabloları
-- Bu dosya veritabanı kurulumu için kullanılır

-- Users tablosu
CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    address TEXT,
    payment_card_json JSONB,
    payment_paypal_json JSONB,
    payment_klarna_json JSONB,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Locations tablosu
CREATE TABLE IF NOT EXISTS locations (
    location_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    city VARCHAR(100),
    postal_code VARCHAR(10),
    country VARCHAR(100) DEFAULT 'Deutschland',
    phone VARCHAR(20),
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cars tablosu
CREATE TABLE IF NOT EXISTS cars (
    car_id SERIAL PRIMARY KEY,
    make VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INTEGER,
    transmission_type VARCHAR(50),
    fuel_type VARCHAR(50),
    seating_capacity INTEGER,
    daily_rate DECIMAL(10,2) NOT NULL,
    location_id INTEGER REFERENCES locations(location_id),
    is_available BOOLEAN DEFAULT TRUE,
    image_url TEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Car features tablosu
CREATE TABLE IF NOT EXISTS car_features (
    feature_id SERIAL PRIMARY KEY,
    feature_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Car-CarFeatures ilişki tablosu
CREATE TABLE IF NOT EXISTS car_carfeatures (
    car_id INTEGER REFERENCES cars(car_id) ON DELETE CASCADE,
    feature_id INTEGER REFERENCES car_features(feature_id) ON DELETE CASCADE,
    PRIMARY KEY (car_id, feature_id)
);

-- Reservations tablosu
CREATE TABLE IF NOT EXISTS reservations (
    reservation_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    car_id INTEGER REFERENCES cars(car_id),
    pickup_date DATE NOT NULL,
    dropoff_date DATE NOT NULL,
    pickup_time TIME NOT NULL,
    dropoff_time TIME NOT NULL,
    pickup_location_id INTEGER REFERENCES locations(location_id),
    dropoff_location_id INTEGER REFERENCES locations(location_id),
    total_price DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'Beklemede',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Örnek veriler ekle
INSERT INTO locations (name, city) VALUES 
    ('Berlin Zentrum', 'Berlin'),
    ('Hamburg Zentrum', 'Hamburg'),
    ('München Zentrum', 'München'),
    ('Köln Zentrum', 'Köln'),
    ('Frankfurt am Main Zentrum', 'Frankfurt am Main'),
    ('Stuttgart Zentrum', 'Stuttgart')
ON CONFLICT DO NOTHING;

INSERT INTO car_features (feature_name) VALUES 
    ('Klimaanlage'),
    ('Navigationssystem'),
    ('Bluetooth'),
    ('Rückfahrkamera'),
    ('Parkassistent'),
    ('Tempomat'),
    ('Ledersitze'),
    ('Allradantrieb')
ON CONFLICT DO NOTHING;

-- Test kullanıcısı oluştur (şifre: test123)
INSERT INTO users (first_name, last_name, email, password_hash, is_admin) VALUES 
    ('Test', 'User', 'test@example.com', '$2b$10$rQZ8K9vL8mN7jK6hG5fD3sA2qW1eR4tY6uI8oP9lK2jH3gF4dS5aQ6wE7rT8yU9i', false)
ON CONFLICT DO NOTHING;
