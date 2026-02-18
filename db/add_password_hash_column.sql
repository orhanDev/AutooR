-- Add password_hash column to users table if it doesn't exist
-- This migration is safe to run multiple times

DO $$ 
BEGIN
    -- Check if password_hash column exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'password_hash'
    ) THEN
        -- Add password_hash column
        ALTER TABLE users ADD COLUMN password_hash VARCHAR(255);
        
        RAISE NOTICE 'password_hash column added successfully';
    ELSE
        RAISE NOTICE 'password_hash column already exists';
    END IF;
END $$;

-- Verify the column was added
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'users' 
AND column_name = 'password_hash';
