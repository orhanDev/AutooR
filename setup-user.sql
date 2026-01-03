-- PostgreSQL kullanıcı ve veritabanı oluşturma scripti
-- pgAdmin'de PostgreSQL sunucusuna bağlandıktan sonra bu scripti çalıştırın

-- 1. autor_user kullanıcısını oluştur (eğer yoksa)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'autor_user') THEN
        CREATE USER autor_user WITH PASSWORD 'Vekil4023.';
        ALTER USER autor_user CREATEDB;
        RAISE NOTICE 'Kullanıcı autor_user oluşturuldu.';
    ELSE
        RAISE NOTICE 'Kullanıcı autor_user zaten mevcut. Şifre güncelleniyor...';
        ALTER USER autor_user WITH PASSWORD 'Vekil4023.';
    END IF;
END
$$;

-- 2. autor_db veritabanını oluştur (eğer yoksa)
SELECT 'CREATE DATABASE autor_db OWNER autor_user'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'autor_db')\gexec

-- 3. autor_db veritabanına bağlan ve yetkileri ver
\c autor_db

-- autor_user'a tüm yetkileri ver
GRANT ALL PRIVILEGES ON DATABASE autor_db TO autor_user;
GRANT ALL ON SCHEMA public TO autor_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO autor_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO autor_user;

-- 4. Tabloları oluştur (init.sql'den)
\i db/init.sql

-- Başarı mesajı
SELECT 'Kullanıcı ve veritabanı başarıyla oluşturuldu!' AS message;

