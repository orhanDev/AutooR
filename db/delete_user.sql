-- Kullanıcı silme sorguları
-- Bu sorguları pgAdmin'de AutooR veritabanında çalıştırın

-- Belirli bir email adresine sahip kullanıcıyı sil
-- Örnek: DELETE FROM users WHERE email = 'orhancodes1@gmail.com';

-- Belirli bir user_id'ye sahip kullanıcıyı sil
-- Örnek: DELETE FROM users WHERE user_id = 6;

-- Tüm kullanıcıları sil (DİKKAT: Tüm veriler silinir!)
-- DELETE FROM users;

-- Test kullanıcısını sil
-- DELETE FROM users WHERE email = 'test@example.com';

-- Birden fazla email adresine sahip kullanıcıları sil
-- DELETE FROM users WHERE email IN ('email1@gmail.com', 'email2@gmail.com');

