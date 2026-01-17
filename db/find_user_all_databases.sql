SELECT 
    user_id,
    email,
    LOWER(TRIM(email)) as normalized_email,
    first_name,
    last_name,
    created_at,
    'LOCAL' as database_source
FROM users
WHERE LOWER(TRIM(email)) = LOWER(TRIM('ooorhanyilmaz35@gmail.com'));

SELECT 
    user_id,
    email,
    first_name,
    last_name,
    created_at,
    'LOCAL' as database_source
FROM users
ORDER BY created_at DESC
LIMIT 10;

SELECT 
    user_id,
    email,
    LOWER(TRIM(email)) as normalized_email,
    first_name,
    last_name,
    created_at,
    'RAILWAY' as database_source
FROM users
WHERE LOWER(TRIM(email)) = LOWER(TRIM('ooorhanyilmaz35@gmail.com'));

SELECT 
    user_id,
    email,
    first_name,
    last_name,
    created_at,
    'RAILWAY' as database_source
FROM users
ORDER BY created_at DESC
LIMIT 10;

SELECT 
    user_id,
    email,
    first_name,
    last_name,
    created_at,
    'LOCAL' as database_source
FROM users
WHERE LOWER(TRIM(email)) LIKE LOWER('%ooorhanyilmaz%')
ORDER BY created_at DESC;

SELECT 
    user_id,
    email,
    first_name,
    last_name,
    created_at,
    'RAILWAY' as database_source
FROM users
WHERE LOWER(TRIM(email)) LIKE LOWER('%ooorhanyilmaz%')
ORDER BY created_at DESC;