-- Kullanıcı listesini görüntüleme sorgusu
-- pgAdmin'de Query Tool'u açın ve bu sorguyu çalıştırın

-- Tüm kullanıcıları listele (şifreler hariç)
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

-- Sadece kullanıcı sayısını görmek için:
-- SELECT COUNT(*) as total_users FROM users;

-- Belirli bir email ile kullanıcı aramak için (büyük/küçük harf duyarsız):
SELECT * FROM users WHERE LOWER(email) = LOWER('orhancodes@gmail.com');

-- Email'de "orhancodes" geçen tüm kayıtları bulmak için:
SELECT * FROM users WHERE LOWER(email) LIKE LOWER('%orhancodes%');

-- Tüm email adreslerini listelemek için:
SELECT user_id, email, first_name, last_name, created_at 
FROM users 
ORDER BY email;

-- Email adresinde boşluk veya özel karakter olup olmadığını kontrol etmek için:
SELECT user_id, email, LENGTH(email) as email_length, 
       first_name, last_name 
FROM users 
WHERE LOWER(email) LIKE LOWER('%orhancodes%') 
   OR LOWER(email) LIKE LOWER('%orhan%');

