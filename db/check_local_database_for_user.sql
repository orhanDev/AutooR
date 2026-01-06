SELECT 
    user_id,
    email,
    LOWER(TRIM(email)) as normalized_email,
    first_name,
    last_name,
    phone_number,
    login_method,
    is_admin,
    is_verified,
    created_at,
    updated_at
FROM users
WHERE LOWER(TRIM(email)) = LOWER(TRIM('ooorhanyilmaz35@gmail.com'));

SELECT 
    user_id,
    email,
    first_name,
    last_name,
    created_at
FROM users
WHERE LOWER(TRIM(email)) LIKE LOWER('%ooorhanyilmaz%')
   OR LOWER(TRIM(email)) LIKE LOWER('%ooorhanyilmaz35%')
ORDER BY created_at DESC;

SELECT 
    user_id,
    email,
    first_name,
    last_name,
    created_at
FROM users
ORDER BY created_at DESC
LIMIT 10;