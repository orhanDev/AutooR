-- Rename 'id' column to 'user_id' in users table
-- Run this in pgAdmin on: cinemor-db-render -> cinemor database

DO $$
BEGIN
    -- Check if 'id' column exists and 'user_id' doesn't exist
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'id'
    ) AND NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'user_id'
    ) THEN
        -- Rename the column
        ALTER TABLE users RENAME COLUMN id TO user_id;
        RAISE NOTICE 'Renamed column: id -> user_id';
    ELSIF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'user_id'
    ) THEN
        RAISE NOTICE 'Column user_id already exists';
    ELSE
        RAISE NOTICE 'Column id does not exist';
    END IF;
END $$;

-- Verify: check if user_id exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'users' 
AND column_name IN ('id', 'user_id')
ORDER BY column_name;
