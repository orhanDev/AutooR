# OAuth Yapılandırma Rehberi

## 1. .env Dosyası Oluşturma

Proje kök dizininde `.env` dosyası oluşturun ve aşağıdaki içeriği ekleyin:

```env
# Google OAuth 2.0 Credentials
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=https://localhost:3443/auth/google/callback

# Facebook OAuth Credentials
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
FACEBOOK_REDIRECT_URI=https://localhost:3443/auth/facebook/callback

# Apple Sign In Credentials
APPLE_CLIENT_ID=your-apple-client-id
APPLE_CLIENT_SECRET=your-apple-client-secret
APPLE_REDIRECT_URI=https://localhost:3443/auth/apple/callback

# PostgreSQL Database Configuration
PGUSER=AutooR_user
PGHOST=localhost
PGDATABASE=AutooR_db
PGPASSWORD=Vekil4023.
PGPORT=5432

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production

# Encryption Key for Credit Cards (32 karakter olmalı)
ENCRYPTION_KEY=your-32-character-secret-key-here!
```

## 2. Google OAuth Yapılandırması

### Adımlar:
1. https://console.cloud.google.com/ adresine gidin
2. Yeni bir proje oluşturun veya mevcut projeyi seçin
3. **APIs & Services** → **Credentials** bölümüne gidin
4. **Create Credentials** → **OAuth 2.0 Client ID** seçin
5. **Application type**: Web application seçin
6. **Authorized redirect URIs** kısmına şunu ekleyin:
   ```
   https://localhost:3443/auth/google/callback
   ```
7. **Client ID** ve **Client Secret** değerlerini kopyalayın
8. `.env` dosyasındaki `GOOGLE_CLIENT_ID` ve `GOOGLE_CLIENT_SECRET` değerlerini güncelleyin

## 3. Facebook OAuth Yapılandırması

### Adımlar:
1. https://developers.facebook.com/ adresine gidin
2. **My Apps** → **Create App** tıklayın
3. **Consumer** seçeneğini seçin ve devam edin
4. App adını ve iletişim e-postasını girin
5. **Facebook Login** ürününü ekleyin
6. **Settings** → **Basic** bölümünde:
   - **App ID** ve **App Secret** değerlerini kopyalayın
   - **Valid OAuth Redirect URIs** kısmına şunu ekleyin:
     ```
     https://localhost:3443/auth/facebook/callback
     ```
7. `.env` dosyasındaki `FACEBOOK_APP_ID` ve `FACEBOOK_APP_SECRET` değerlerini güncelleyin

## 4. Apple Sign In Yapılandırması

### Adımlar:
1. https://developer.apple.com/ adresine gidin
2. **Certificates, Identifiers & Profiles** bölümüne gidin
3. **Identifiers** → **Services IDs** → **+** butonuna tıklayın
4. **Services ID** seçin ve devam edin
5. Identifier ve Description girin
6. **Sign In with Apple** seçeneğini işaretleyin
7. **Configure** butonuna tıklayın
8. **Primary App ID** seçin
9. **Return URLs** kısmına şunu ekleyin:
   ```
   https://localhost:3443/auth/apple/callback
   ```
10. **Save** ve **Continue** butonlarına tıklayın
11. **Services ID** oluşturulduktan sonra, **Keys** bölümünden bir key oluşturun
12. `.env` dosyasındaki `APPLE_CLIENT_ID` ve `APPLE_CLIENT_SECRET` değerlerini güncelleyin

**Not:** Apple Sign In için özel JWT token oluşturma gereklidir. Production ortamında ek yapılandırma gerekebilir.

## 5. Sunucuyu Yeniden Başlatma

Credentials'ları ekledikten sonra sunucuyu yeniden başlatın:

```bash
# Sunucuyu durdurun (Ctrl+C)
# Sonra tekrar başlatın
node server.js
```

## 6. Test Etme

1. Login sayfasına gidin: `https://localhost:3443/login`
2. Sosyal medya butonlarını test edin
3. Credentials yapılandırılmamışsa, "Diese Anmeldemethode ist derzeit nicht verfügbar" mesajı görünecektir
4. Credentials yapılandırıldıktan sonra, ilgili provider'a yönlendirileceksiniz

## Sorun Giderme

- **"invalid_client" hatası**: Client ID veya Secret yanlış olabilir
- **"redirect_uri_mismatch" hatası**: Redirect URI'nin `.env` dosyasındaki değerle eşleştiğinden emin olun
- **"Diese Anmeldemethode ist derzeit nicht verfügbar"**: Credentials yapılandırılmamış veya yanlış yapılandırılmış

