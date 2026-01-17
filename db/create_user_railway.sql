SELECT * FROM users WHERE LOWER(email) = LOWER('orhancodes@gmail.com');

INSERT INTO users (
    first_name,
    last_name,
    email,
    password_hash,
    phone_number,
    login_method,
    is_admin,
    is_verified
) VALUES (
    'Orhan',
    'Codes',
    'orhancodes@gmail.com',
    '$2b$10$rQZ8K9vL8mN7jK6hG5fD3sA2qW1eR4tY6uI8oP9lK2jH3gF4dS5aQ6wE7rT8yU9i',  
    NULL,
    'email',
    false,
    false
) ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    password_hash = EXCLUDED.password_hash;

SELECT user_id, email, first_name, last_name, created_at 
FROM users 
WHERE LOWER(email) = LOWER('orhancodes@gmail.com');