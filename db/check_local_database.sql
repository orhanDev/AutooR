-- Local PostgreSQL'de orhancodes@gmail.com kullanıcısını kontrol et
-- pgAdmin'de LOCAL PostgreSQL bağlantısına bağlanın (localhost, AutooR database)

-- 1. Local veritabanında orhancodes@gmail.com kullanıcısını bul
SELECT * FROM users WHERE LOWER(email) = LOWER('orhancodes@gmail.com');

-- 2. Local veritabanındaki tüm kullanıcıları listele
SELECT user_id, email, first_name, last_name, created_at 
FROM users 
ORDER BY created_at DESC;

-- 3. Local veritabanındaki kullanıcı sayısı
SELECT COUNT(*) as local_user_count FROM users;

