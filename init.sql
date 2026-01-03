-- AutooR Database Schema
-- Kullanıcı ve ödeme bilgileri için tablolar

-- Kullanıcılar tablosu
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    date_of_birth DATE,
    address TEXT,
    city VARCHAR(100),
    postal_code VARCHAR(10),
    country VARCHAR(100) DEFAULT 'Deutschland',
    driver_license VARCHAR(50),
    driver_license_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_verified BOOLEAN DEFAULT FALSE,
    login_method VARCHAR(20) DEFAULT 'google' -- 'google', 'email'
);

-- Kredi kartları tablosu
CREATE TABLE IF NOT EXISTS credit_cards (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    card_holder_name VARCHAR(255) NOT NULL,
    card_number_encrypted TEXT NOT NULL, -- Şifrelenmiş kart numarası
    card_number_last4 VARCHAR(4) NOT NULL, -- Son 4 hane
    expiry_month INTEGER NOT NULL,
    expiry_year INTEGER NOT NULL,
    cvv_encrypted TEXT NOT NULL, -- Şifrelenmiş CVV
    card_type VARCHAR(20), -- 'visa', 'mastercard', 'amex'
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Rezervasyonlar tablosu
CREATE TABLE IF NOT EXISTS reservations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    booking_id VARCHAR(50) UNIQUE NOT NULL, -- 'AUT-2024-001' formatında
    vehicle_id VARCHAR(50) NOT NULL,
    vehicle_name VARCHAR(255) NOT NULL,
    vehicle_image TEXT,
    pickup_location VARCHAR(255) NOT NULL,
    return_location VARCHAR(255) NOT NULL,
    pickup_date DATE NOT NULL,
    return_date DATE NOT NULL,
    pickup_time TIME NOT NULL,
    return_time TIME NOT NULL,
    base_price DECIMAL(10,2) NOT NULL,
    insurance_price DECIMAL(10,2) DEFAULT 0,
    extras_price DECIMAL(10,2) DEFAULT 0,
    total_price DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'completed', 'cancelled'
    payment_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'paid', 'failed'
    payment_method VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ödeme geçmişi tablosu
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    reservation_id INTEGER REFERENCES reservations(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'EUR',
    payment_method VARCHAR(50) NOT NULL,
    transaction_id VARCHAR(255),
    status VARCHAR(20) NOT NULL, -- 'pending', 'success', 'failed', 'refunded'
    payment_gateway VARCHAR(50), -- 'stripe', 'paypal', etc.
    gateway_response TEXT, -- Gateway'den gelen yanıt
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Araçlar tablosu (mevcut araç bilgileri için)
CREATE TABLE IF NOT EXISTS vehicles (
    id SERIAL PRIMARY KEY,
    car_id VARCHAR(50) UNIQUE NOT NULL,
    make VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INTEGER NOT NULL,
    category VARCHAR(100) NOT NULL,
    transmission VARCHAR(50) NOT NULL,
    fuel_type VARCHAR(50) NOT NULL,
    seats INTEGER NOT NULL,
    price_per_day DECIMAL(10,2) NOT NULL,
    image_url TEXT,
    features TEXT[], -- Array of features
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexler
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_credit_cards_user_id ON credit_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_user_id ON reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_booking_id ON reservations(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_reservation_id ON payments(reservation_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_car_id ON vehicles(car_id);

-- Trigger fonksiyonu - updated_at otomatik güncelleme
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger'lar
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_credit_cards_updated_at BEFORE UPDATE ON credit_cards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reservations_updated_at BEFORE UPDATE ON reservations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Örnek veri ekleme
INSERT INTO users (email, first_name, last_name, phone, is_verified, login_method) VALUES
('orhancodes@gmail.com', 'Orhan', 'Yılmaz', '+49 123 456789', true, 'google'),
('max.mustermann@gmail.com', 'Max', 'Mustermann', '+49 987 654321', true, 'google')
ON CONFLICT (email) DO NOTHING;

-- Örnek araç verileri
INSERT INTO vehicles (car_id, make, model, year, category, transmission, fuel_type, seats, price_per_day, image_url, features) VALUES
('1', 'BMW', 'X5', 2023, 'SUV', 'Automatik', 'Benzin', 5, 84.99, '/images/cars/bmw-x5-suv-4d-grey-2023-JV.png', ARRAY['Klimaanlage', 'Navigation', 'Bluetooth']),
('2', 'Audi', 'A6', 2025, 'Limousine', 'Automatik', 'Benzin', 5, 79.99, '/images/cars/audi-a6-avant-stw-black-2025.png', ARRAY['Klimaanlage', 'Navigation', 'Bluetooth', 'Sitzheizung']),
('3', 'Mercedes', 'E-Klasse', 2021, 'Limousine', 'Automatik', 'Benzin', 5, 89.99, '/images/cars/mb-s-long-sedan-4d-silver-2021-JV.png', ARRAY['Klimaanlage', 'Navigation', 'Bluetooth', 'Sitzheizung', 'Lenkradheizung'])
ON CONFLICT (car_id) DO NOTHING;
