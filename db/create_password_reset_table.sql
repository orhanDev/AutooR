-- Password Reset Tokens Tablosu
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index'ler
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_email ON password_reset_tokens(email);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);

-- Açıklama
COMMENT ON TABLE password_reset_tokens IS 'Şifre sıfırlama tokenları için tablo';
COMMENT ON COLUMN password_reset_tokens.email IS 'Şifre sıfırlama isteği yapan kullanıcının email adresi';
COMMENT ON COLUMN password_reset_tokens.token IS 'Benzersiz şifre sıfırlama tokenı';
COMMENT ON COLUMN password_reset_tokens.expires_at IS 'Token geçerlilik süresi (1 saat)';
COMMENT ON COLUMN password_reset_tokens.used IS 'Token kullanıldı mı?';

