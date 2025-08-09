
CREATE TABLE IF NOT EXISTS users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    address TEXT,
    -- ödeme yöntemleri için alanlar
    payment_card_json JSONB,
    payment_paypal_json JSONB,
    payment_klarna_json JSONB,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS locations (
    location_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(50) NOT NULL,
    state_province VARCHAR(50),
    zip_code VARCHAR(10),
    country VARCHAR(50) NOT NULL
);


CREATE TABLE IF NOT EXISTS cars (
    car_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    make VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    year INTEGER NOT NULL,
    license_plate VARCHAR(20) UNIQUE NOT NULL,
    daily_rate DECIMAL(10, 2) NOT NULL,
    transmission_type VARCHAR(20) NOT NULL CHECK (transmission_type IN ('Otomatik', 'Manuel')),
    fuel_type VARCHAR(20) NOT NULL CHECK (fuel_type IN ('Benzin', 'Dizel', 'Elektrik', 'Hibrit')),
    seating_capacity INTEGER NOT NULL,
    color VARCHAR(30),
    image_url TEXT,
    is_available BOOLEAN DEFAULT TRUE,
    location_id UUID REFERENCES locations(location_id),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create the 'car_features' table
CREATE TABLE IF NOT EXISTS car_features (
    feature_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    feature_name VARCHAR(100) UNIQUE NOT NULL
);

-- Create the join table for 'cars' and 'car_features' (many-to-many relationship)
CREATE TABLE IF NOT EXISTS car_carfeatures (
    car_id UUID REFERENCES cars(car_id) ON DELETE CASCADE,
    feature_id UUID REFERENCES car_features(feature_id) ON DELETE CASCADE,
    PRIMARY KEY (car_id, feature_id)
);

-- Create the 'reservations' table
CREATE TABLE IF NOT EXISTS reservations (
    reservation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    car_id UUID REFERENCES cars(car_id) ON DELETE CASCADE,
    pickup_location_id UUID REFERENCES locations(location_id) ON DELETE CASCADE,
    dropoff_location_id UUID REFERENCES locations(location_id) ON DELETE CASCADE,
    pickup_date DATE NOT NULL,
    dropoff_date DATE NOT NULL,
    pickup_time TIME NOT NULL,
    dropoff_time TIME NOT NULL,
    extras JSONB,
    total_price DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'Beklemede' CHECK (status IN ('Beklemede', 'Onaylandı', 'Reddedildi', 'Tamamlandı', 'İptal Edildi')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);