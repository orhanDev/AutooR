-- Veritabanı adını AutooR olarak değiştir
-- ÖNEMLİ: Bu işlemi yapmadan önce tüm bağlantıları kapatın!

-- 1. Önce mevcut veritabanına bağlanın (postgres veya başka bir veritabanına)
-- 2. Tüm aktif bağlantıları sonlandırın:
SELECT pg_terminate_backend(pg_stat_activity.pid)
FROM pg_stat_activity
WHERE pg_stat_activity.datname = 'autor_db'
  AND pid <> pg_backend_pid();

-- 3. Veritabanı adını değiştirin:
ALTER DATABASE autor_db RENAME TO "AutooR";

-- Not: PostgreSQL'de veritabanı adları varsayılan olarak küçük harfe dönüştürülür,
-- ama tırnak içinde yazarsanız büyük/küçük harf korunur.
-- "AutooR" şeklinde yazdığımız için büyük/küçük harf korunacak.

