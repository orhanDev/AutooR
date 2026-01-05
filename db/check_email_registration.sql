-- Email kayıt kontrolü sorgusu
-- pgAdmin'de Query Tool'u açın ve bu sorguyu çalıştırın

-- Tüm email adreslerini listele (normalize edilmiş haliyle)
SELECT 
    user_id,
    email,
    LOWER(TRIM(email)) as normalized_email,
    first_name,
    last_name,
    created_at
FROM users
ORDER BY created_at DESC;

-- orhancodes ile başlayan tüm email'leri bul (büyük/küçük harf duyarsız)
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

-- orhancodes1@gmail.com'u kontrol et (normalize edilmiş haliyle)
SELECT 
    user_id,
    email,
    LOWER(TRIM(email)) as normalized_email,
    first_name,
    last_name,
    created_at
FROM users
WHERE LOWER(TRIM(email)) = LOWER(TRIM('orhancodes1@gmail.com'));

-- orhancodes@gmail.com'u kontrol et (normalize edilmiş haliyle)
SELECT 
    user_id,
    email,
    LOWER(TRIM(email)) as normalized_email,
    first_name,
    last_name,
    created_at
FROM users
WHERE LOWER(TRIM(email)) = LOWER(TRIM('orhancodes@gmail.com'));

