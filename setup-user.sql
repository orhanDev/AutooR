DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'AutooR_user') THEN
        CREATE USER AutooR_user WITH PASSWORD 'Vekil4023.';
        ALTER USER AutooR_user CREATEDB;
        RAISE NOTICE 'Benutzer AutooR_user wurde erstellt.';
    ELSE
        RAISE NOTICE 'Benutzer AutooR_user existiert bereits. Passwort wird aktualisiert...';
        ALTER USER AutooR_user WITH PASSWORD 'Vekil4023.';
    END IF;
END
$$;

SELECT 'CREATE DATABASE AutooR_db OWNER AutooR_user'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'AutooR_db')\gexec

\c AutooR_db

GRANT ALL PRIVILEGES ON DATABASE AutooR_db TO AutooR_user;
GRANT ALL ON SCHEMA public TO AutooR_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO AutooR_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO AutooR_user;

\i db/init.sql

SELECT 'Benutzer und Datenbank wurden erfolgreich erstellt!' AS message;