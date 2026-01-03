-- Google OAuth için gerekli kolonları ekle
-- Bu script mevcut users tablosuna OAuth kolonlarını ekler

-- password_hash'i NULL yapılabilir hale getir (Google OAuth kullanıcıları için)
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

-- OAuth kolonlarını ekle (eğer yoksa)
DO $$ 
BEGIN
    -- login_method kolonu
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='login_method') THEN
        ALTER TABLE users ADD COLUMN login_method VARCHAR(50) DEFAULT 'email';
    END IF;
    
    -- is_verified kolonu
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='is_verified') THEN
        ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT FALSE;
    END IF;
    
    -- google_id kolonu
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='google_id') THEN
        ALTER TABLE users ADD COLUMN google_id VARCHAR(255);
    END IF;
    
    -- facebook_id kolonu
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='facebook_id') THEN
        ALTER TABLE users ADD COLUMN facebook_id VARCHAR(255);
    END IF;
    
    -- apple_id kolonu
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='apple_id') THEN
        ALTER TABLE users ADD COLUMN apple_id VARCHAR(255);
    END IF;
    
    -- updated_at kolonu
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='updated_at') THEN
        ALTER TABLE users ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;

-- Mevcut kullanıcılar için login_method'u 'email' olarak ayarla
UPDATE users SET login_method = 'email' WHERE login_method IS NULL;

-- Mevcut kullanıcılar için is_verified'ı true yap (zaten kayıt olmuşlar)
UPDATE users SET is_verified = TRUE WHERE is_verified IS NULL;

