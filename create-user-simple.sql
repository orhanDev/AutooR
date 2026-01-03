-- pgAdmin'de PostgreSQL sunucusuna bağlandıktan sonra bu scripti çalıştırın
-- (postgres kullanıcısı ile bağlanın)

-- 1. autor_user kullanıcısını oluştur veya şifresini güncelle
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_user WHERE usename = 'autor_user') THEN
        CREATE USER autor_user WITH PASSWORD 'Vekil4023.';
        ALTER USER autor_user CREATEDB;
        RAISE NOTICE 'Kullanıcı autor_user oluşturuldu.';
    ELSE
        ALTER USER autor_user WITH PASSWORD 'Vekil4023.';
        RAISE NOTICE 'Kullanıcı autor_user şifresi güncellendi.';
    END IF;
END
$$;

-- 2. autor_db veritabanını oluştur (eğer yoksa)
SELECT 'CREATE DATABASE autor_db OWNER autor_user'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'autor_db')\gexec

-- 3. Yetkileri ver
GRANT ALL PRIVILEGES ON DATABASE autor_db TO autor_user;

-- Başarı mesajı
SELECT 'Kullanıcı ve veritabanı hazır!' AS durum;

