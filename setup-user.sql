-- PostgreSQL kullanıcı ve veritabanı oluşturma scripti
-- pgAdmin'de PostgreSQL sunucusuna bağlandıktan sonra bu scripti çalıştırın

-- 1. AutooR_user kullanıcısını oluştur (eğer yoksa)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'AutooR_user') THEN
        CREATE USER AutooR_user WITH PASSWORD 'Vekil4023.';
        ALTER USER AutooR_user CREATEDB;
        RAISE NOTICE 'Kullanıcı AutooR_user oluşturuldu.';
    ELSE
        RAISE NOTICE 'Kullanıcı AutooR_user zaten mevcut. Şifre güncelleniyor...';
        ALTER USER AutooR_user WITH PASSWORD 'Vekil4023.';
    END IF;
END
$$;

-- 2. AutooR_db veritabanını oluştur (eğer yoksa)
SELECT 'CREATE DATABASE AutooR_db OWNER AutooR_user'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'AutooR_db')\gexec

-- 3. AutooR_db veritabanına bağlan ve yetkileri ver
\c AutooR_db

-- AutooR_user'a tüm yetkileri ver
GRANT ALL PRIVILEGES ON DATABASE AutooR_db TO AutooR_user;
GRANT ALL ON SCHEMA public TO AutooR_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO AutooR_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO AutooR_user;

-- 4. Tabloları oluştur (init.sql'den)
\i db/init.sql

-- Başarı mesajı
SELECT 'Kullanıcı ve veritabanı başarıyla oluşturuldu!' AS message;

