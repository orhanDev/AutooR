-- Fix password column: make it nullable (since we use password_hash instead)
-- Run this in pgAdmin on: cinemor-db-render -> cinemor database

DO $$
BEGIN
    -- Check if password column exists
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'password'
    ) THEN
        -- Drop NOT NULL constraint if it exists
        BEGIN
            ALTER TABLE users ALTER COLUMN password DROP NOT NULL;
            RAISE NOTICE 'Removed NOT NULL constraint from password column';
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE 'password column may not have NOT NULL constraint: %', SQLERRM;
        END;
    ELSE
        RAISE NOTICE 'password column does not exist';
    END IF;
END $$;

-- Verify: check password column properties
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'users' 
AND column_name = 'password';
