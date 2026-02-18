-- Add password_hash column to users table in ALL databases
-- Run this script in EACH database you're using (cinemor, cinemor-api, etc.)

-- Step 1: Check current database
SELECT current_database() AS current_db;

-- Step 2: Check if users table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'users'
) AS users_table_exists;

-- Step 3: Add password_hash column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'password_hash'
    ) THEN
        ALTER TABLE users ADD COLUMN password_hash VARCHAR(255);
        RAISE NOTICE 'password_hash column added successfully to database: %', current_database();
    ELSE
        RAISE NOTICE 'password_hash column already exists in database: %', current_database();
    END IF;
END $$;

-- Step 4: Verify the column was added
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    character_maximum_length
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'users' 
AND column_name = 'password_hash';

-- Step 5: Show all columns in users table for reference
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'users'
ORDER BY ordinal_position;
