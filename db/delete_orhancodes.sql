-- orhancodes@gmail.com kullanıcısını sil
-- Bu scripti pgAdmin'de AutooR veritabanında çalıştırın

-- Önce kullanıcıyı kontrol et
SELECT user_id, first_name, last_name, email, created_at 
FROM users 
WHERE email = 'orhancodes@gmail.com';

-- Kullanıcıyı sil (DİKKAT: Bu işlem geri alınamaz!)
DELETE FROM users 
WHERE email = 'orhancodes@gmail.com';

-- Silme işleminin başarılı olduğunu kontrol et
SELECT COUNT(*) as remaining_users 
FROM users 
WHERE email = 'orhancodes@gmail.com';
-- Sonuç 0 olmalı

