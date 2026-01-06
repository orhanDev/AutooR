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

SELECT 'CREATE DATABASE AutooR_db OWNER AutooR_user'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'AutooR_db')\gexec

GRANT ALL PRIVILEGES ON DATABASE AutooR_db TO AutooR_user;

SELECT 'Kullanıcı ve veritabanı hazır!' AS durum;