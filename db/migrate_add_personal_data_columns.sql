-- Migration: Add personal data columns to users table
-- Date: 2026-01-10

DO $$ 
BEGIN
    -- Add date_of_birth column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='date_of_birth') THEN
        ALTER TABLE users ADD COLUMN date_of_birth DATE;
        RAISE NOTICE 'Added date_of_birth column to users table';
    END IF;

    -- Add city column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='city') THEN
        ALTER TABLE users ADD COLUMN city VARCHAR(100);
        RAISE NOTICE 'Added city column to users table';
    END IF;

    -- Add postal_code column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='postal_code') THEN
        ALTER TABLE users ADD COLUMN postal_code VARCHAR(10);
        RAISE NOTICE 'Added postal_code column to users table';
    END IF;

    -- Add country column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='country') THEN
        ALTER TABLE users ADD COLUMN country VARCHAR(100) DEFAULT 'Deutschland';
        RAISE NOTICE 'Added country column to users table';
    END IF;

    -- Note: gender is not stored in database, only in localStorage
END $$;
