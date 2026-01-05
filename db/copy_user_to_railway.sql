-- orhancodes@gmail.com kullanıcısını Railway veritabanına kopyalamak için
-- ÖNCE: Local PostgreSQL'de bu sorguyu çalıştırın ve sonucu kopyalayın

-- 1. Local veritabanından kullanıcı bilgilerini al
SELECT 
    first_name,
    last_name,
    email,
    password_hash,
    phone_number,
    address,
    payment_card_json,
    payment_paypal_json,
    payment_klarna_json,
    is_admin,
    login_method,
    is_verified,
    google_id,
    facebook_id,
    apple_id
FROM users 
WHERE LOWER(email) = LOWER('orhancodes@gmail.com');

-- 2. Yukarıdaki sorgunun sonucunu aldıktan sonra,
--    Railway veritabanında (pgAdmin'de Railway bağlantısına geçin) şu sorguyu çalıştırın:
--    (Değerleri yukarıdaki sorgudan aldığınız değerlerle değiştirin)

/*
INSERT INTO users (
    first_name,
    last_name,
    email,
    password_hash,
    phone_number,
    address,
    payment_card_json,
    payment_paypal_json,
    payment_klarna_json,
    is_admin,
    login_method,
    is_verified,
    google_id,
    facebook_id,
    apple_id
) VALUES (
    'Orhan',  -- first_name (yukarıdaki sorgudan alın)
    'Codes',  -- last_name (yukarıdaki sorgudan alın)
    'orhancodes@gmail.com',
    '$2b$10$...',  -- password_hash (yukarıdaki sorgudan alın)
    NULL,  -- phone_number (yukarıdaki sorgudan alın veya NULL)
    NULL,  -- address (yukarıdaki sorgudan alın veya NULL)
    NULL,  -- payment_card_json (yukarıdaki sorgudan alın veya NULL)
    NULL,  -- payment_paypal_json (yukarıdaki sorgudan alın veya NULL)
    NULL,  -- payment_klarna_json (yukarıdaki sorgudan alın veya NULL)
    false,  -- is_admin (yukarıdaki sorgudan alın)
    'email',  -- login_method (yukarıdaki sorgudan alın)
    false,  -- is_verified (yukarıdaki sorgudan alın)
    NULL,  -- google_id (yukarıdaki sorgudan alın veya NULL)
    NULL,  -- facebook_id (yukarıdaki sorgudan alın veya NULL)
    NULL   -- apple_id (yukarıdaki sorgudan alın veya NULL)
) ON CONFLICT (email) DO NOTHING;
*/

