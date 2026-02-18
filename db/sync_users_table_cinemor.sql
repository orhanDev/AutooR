-- Sync users table with app schema (add missing columns)
-- Run this in pgAdmin on: cinemor-db-render -> cinemor database
-- Safe to run multiple times (only adds columns that don't exist)

DO $$
BEGIN
    -- phone_number
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'phone_number') THEN
        ALTER TABLE users ADD COLUMN phone_number VARCHAR(20);
        RAISE NOTICE 'Added column: phone_number';
    END IF;
    -- address
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'address') THEN
        ALTER TABLE users ADD COLUMN address TEXT;
        RAISE NOTICE 'Added column: address';
    END IF;
    -- date_of_birth
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'date_of_birth') THEN
        ALTER TABLE users ADD COLUMN date_of_birth DATE;
        RAISE NOTICE 'Added column: date_of_birth';
    END IF;
    -- gender
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'gender') THEN
        ALTER TABLE users ADD COLUMN gender VARCHAR(20);
        RAISE NOTICE 'Added column: gender';
    END IF;
    -- city
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'city') THEN
        ALTER TABLE users ADD COLUMN city VARCHAR(100);
        RAISE NOTICE 'Added column: city';
    END IF;
    -- postal_code
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'postal_code') THEN
        ALTER TABLE users ADD COLUMN postal_code VARCHAR(10);
        RAISE NOTICE 'Added column: postal_code';
    END IF;
    -- country
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'country') THEN
        ALTER TABLE users ADD COLUMN country VARCHAR(100) DEFAULT 'Deutschland';
        RAISE NOTICE 'Added column: country';
    END IF;
    -- payment_card_json
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'payment_card_json') THEN
        ALTER TABLE users ADD COLUMN payment_card_json JSONB;
        RAISE NOTICE 'Added column: payment_card_json';
    END IF;
    -- payment_paypal_json
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'payment_paypal_json') THEN
        ALTER TABLE users ADD COLUMN payment_paypal_json JSONB;
        RAISE NOTICE 'Added column: payment_paypal_json';
    END IF;
    -- payment_klarna_json
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'payment_klarna_json') THEN
        ALTER TABLE users ADD COLUMN payment_klarna_json JSONB;
        RAISE NOTICE 'Added column: payment_klarna_json';
    END IF;
    -- is_admin
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'is_admin') THEN
        ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Added column: is_admin';
    END IF;
    -- login_method
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'login_method') THEN
        ALTER TABLE users ADD COLUMN login_method VARCHAR(50) DEFAULT 'email';
        RAISE NOTICE 'Added column: login_method';
    END IF;
    -- is_verified
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'is_verified') THEN
        ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Added column: is_verified';
    END IF;
    -- google_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'google_id') THEN
        ALTER TABLE users ADD COLUMN google_id VARCHAR(255);
        RAISE NOTICE 'Added column: google_id';
    END IF;
    -- facebook_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'facebook_id') THEN
        ALTER TABLE users ADD COLUMN facebook_id VARCHAR(255);
        RAISE NOTICE 'Added column: facebook_id';
    END IF;
    -- apple_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'apple_id') THEN
        ALTER TABLE users ADD COLUMN apple_id VARCHAR(255);
        RAISE NOTICE 'Added column: apple_id';
    END IF;
    -- created_at
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'created_at') THEN
        ALTER TABLE users ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        RAISE NOTICE 'Added column: created_at';
    END IF;
    -- updated_at
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'updated_at') THEN
        ALTER TABLE users ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        RAISE NOTICE 'Added column: updated_at';
    END IF;
    -- password_hash (in case it was missed earlier)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'password_hash') THEN
        ALTER TABLE users ADD COLUMN password_hash VARCHAR(255);
        RAISE NOTICE 'Added column: password_hash';
    END IF;

    RAISE NOTICE 'users table sync completed';
END $$;

-- Verify: list all columns in users
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'users'
ORDER BY ordinal_position;
