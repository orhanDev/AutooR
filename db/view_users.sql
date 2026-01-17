SELECT 
    user_id,
    first_name,
    last_name,
    email,
    phone_number,
    login_method,
    is_admin,
    is_verified,
    created_at,
    updated_at
FROM users
ORDER BY created_at DESC;

SELECT * FROM users WHERE LOWER(email) = LOWER('orhancodes@gmail.com');

SELECT * FROM users WHERE LOWER(email) LIKE LOWER('%orhancodes%');

SELECT user_id, email, first_name, last_name, created_at 
FROM users 
ORDER BY email;

SELECT user_id, email, LENGTH(email) as email_length, 
       first_name, last_name 
FROM users 
WHERE LOWER(email) LIKE LOWER('%orhancodes%') 
   OR LOWER(email) LIKE LOWER('%orhan%');