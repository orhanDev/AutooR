-- Railway PostgreSQL'de orhancodes@gmail.com kullanıcısını oluştur
-- pgAdmin'de Railway bağlantısına bağlanın ve bu sorguyu çalıştırın

-- ÖNCE: Kullanıcı zaten var mı kontrol edin
SELECT * FROM users WHERE LOWER(email) = LOWER('orhancodes@gmail.com');

-- Eğer kullanıcı yoksa, yeni kullanıcı oluşturun
-- Şifre: "test123" (bcrypt hash'i)
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
    '$2b$10$ZkMG5YDyipb/o6cn8/VUD.jjkbrs1wzPLEtbv6USl2aPbzxPEtCh6',  -- Vekil4021. şifresinin hash'i
    NULL,
    'email',
    false,
    false
) ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    password_hash = EXCLUDED.password_hash;

-- Kullanıcının oluşturulduğunu kontrol edin
SELECT user_id, email, first_name, last_name, created_at 
FROM users 
WHERE LOWER(email) = LOWER('orhancodes@gmail.com');

-- Tüm kullanıcıları listele
SELECT user_id, email, first_name, last_name, created_at 
FROM users 
ORDER BY created_at DESC;

