-- Tüm veritabanlarında ooorhanyilmaz35@gmail.com kullanıcısını bul
-- Bu sorguyu hem LOCAL hem de RAILWAY veritabanında çalıştırın

-- 1. LOCAL VERİTABANI İÇİN (pgAdmin'de local bağlantıya bağlanın):
--    - Server: localhost
--    - Database: AutooR
--    - User: AutooR_user

-- 2. RAILWAY VERİTABANI İÇİN (pgAdmin'de Railway bağlantısına bağlanın):
--    - Server: Railway Postgres
--    - Database: railway

-- ============================================
-- LOCAL VERİTABANI KONTROLÜ
-- ============================================
-- Local veritabanında kullanıcıyı bul
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

-- Local veritabanında tüm kullanıcıları listele
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

-- ============================================
-- RAILWAY VERİTABANI KONTROLÜ
-- ============================================
-- Railway veritabanında kullanıcıyı bul
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

-- Railway veritabanında tüm kullanıcıları listele
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

-- ============================================
-- HER İKİ VERİTABANINDA DA ARAMA
-- ============================================
-- "ooorhanyilmaz" ile başlayan tüm email'leri bul (LOCAL)
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

-- "ooorhanyilmaz" ile başlayan tüm email'leri bul (RAILWAY)
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
