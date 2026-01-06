SELECT 
    user_id,
    email,
    LOWER(TRIM(email)) as normalized_email,
    first_name,
    last_name,
    created_at
FROM users
ORDER BY created_at DESC;

SELECT 
    user_id,
    email,
    LOWER(TRIM(email)) as normalized_email,
    first_name,
    last_name,
    created_at
FROM users
WHERE LOWER(TRIM(email)) LIKE LOWER('%orhancodes%')
ORDER BY created_at DESC;

SELECT 
    user_id,
    email,
    LOWER(TRIM(email)) as normalized_email,
    first_name,
    last_name,
    created_at
FROM users
WHERE LOWER(TRIM(email)) = LOWER(TRIM('orhancodes1@gmail.com'));

SELECT 
    user_id,
    email,
    LOWER(TRIM(email)) as normalized_email,
    first_name,
    last_name,
    created_at
FROM users
WHERE LOWER(TRIM(email)) = LOWER(TRIM('orhancodes@gmail.com'));