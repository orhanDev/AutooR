-- pgAdmin'de PostgreSQL sunucusuna bağlandıktan sonra bu scripti çalıştırın
-- (postgres kullanıcısı ile bağlanın)

-- 1. AutooR_user kullanıcısını oluştur veya şifresini güncelle
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_user WHERE usename = 'AutooR_user') THEN
        CREATE USER AutooR_user WITH PASSWORD 'Vekil4023.';
        ALTER USER AutooR_user CREATEDB;
        RAISE NOTICE 'Kullanıcı AutooR_user oluşturuldu.';
    ELSE
        ALTER USER AutooR_user WITH PASSWORD 'Vekil4023.';
        RAISE NOTICE 'Kullanıcı AutooR_user şifresi güncellendi.';
    END IF;
END
$$;

-- 2. AutooR_db veritabanını oluştur (eğer yoksa)
SELECT 'CREATE DATABASE AutooR_db OWNER AutooR_user'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'AutooR_db')\gexec

-- 3. Yetkileri ver
GRANT ALL PRIVILEGES ON DATABASE AutooR_db TO AutooR_user;

-- Başarı mesajı
SELECT 'Kullanıcı ve veritabanı hazır!' AS durum;

