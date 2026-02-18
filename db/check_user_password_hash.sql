-- Check if user has password_hash set
SELECT 
    user_id,
    email,
    first_name,
    last_name,
    password_hash,
    login_method,
    CASE 
        WHEN password_hash IS NULL THEN 'NULL - No password set'
        WHEN password_hash = '' THEN 'EMPTY - Empty string'
        ELSE 'SET - Has password hash'
    END AS password_status
FROM users 
WHERE LOWER(TRIM(email)) = LOWER('orhancodes@gmail.com');
