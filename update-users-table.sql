-- Users tablosuna google_id sütunu ekle
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(100) UNIQUE;

-- Google ID için index oluştur
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
-- Users tablosuna google_id sütunu ekle
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(100) UNIQUE;

-- Google ID için index oluştur
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);