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
    '$2b$10$ZkMG5YDyipb/o6cn8/VUD.jjkbrs1wzPLEtbv6USl2aPbzxPEtCh6',  
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

SELECT user_id, email, first_name, last_name, created_at 
FROM users 
ORDER BY created_at DESC;