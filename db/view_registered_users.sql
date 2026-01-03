-- Kayıtlı kullanıcıları görüntüle
-- Bu sorguyu pgAdmin'de AutooR veritabanında çalıştırın

-- Tüm kullanıcıları listele
SELECT 
    user_id,
    first_name,
    last_name,
    email,
    is_admin,
    is_verified,
    login_method,
    created_at
FROM users
ORDER BY created_at DESC;

-- Sadece email adreslerini görmek için:
-- SELECT email FROM users ORDER BY created_at DESC;

-- Toplam kullanıcı sayısı:
-- SELECT COUNT(*) as total_users FROM users;

-- Doğrulanmış kullanıcılar:
-- SELECT COUNT(*) as verified_users FROM users WHERE is_verified = TRUE;

-- Doğrulanmamış kullanıcılar:
-- SELECT COUNT(*) as unverified_users FROM users WHERE is_verified = FALSE;

