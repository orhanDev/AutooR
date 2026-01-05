-- Veritabanında kayıtlı email'leri kontrol et
-- Bu sorguyu pgAdmin'de çalıştırarak hangi email'lerin kayıtlı olduğunu görebilirsiniz

-- Tüm email'leri listele (normalize edilmiş haliyle)
SELECT 
    user_id,
    email,
    LOWER(TRIM(email)) as normalized_email,
    first_name,
    last_name,
    created_at
FROM users
ORDER BY created_at DESC;

-- Belirli bir email'in kayıtlı olup olmadığını kontrol et
-- (örnek: orhancodes1@gmail.com)
SELECT 
    user_id,
    email,
    LOWER(TRIM(email)) as normalized_email,
    first_name,
    last_name
FROM users
WHERE LOWER(TRIM(email)) = LOWER(TRIM('orhancodes1@gmail.com'));

-- orhancodes ile başlayan tüm email'leri bul
SELECT 
    user_id,
    email,
    LOWER(TRIM(email)) as normalized_email,
    first_name,
    last_name
FROM users
WHERE LOWER(TRIM(email)) LIKE 'orhancodes%';

