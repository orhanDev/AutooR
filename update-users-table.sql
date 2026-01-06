ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(100) UNIQUE;

CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);

ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(100) UNIQUE;

CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);